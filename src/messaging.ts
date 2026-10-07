import { useCallback, useEffect, useState } from "react";
import { supabase } from "./lib/supabaseClient";

export type Sender = "client" | "admin";

export type Message = {
  id: string;
  threadId: string;
  from: Sender;
  text: string;
  ts: number;
  attachments: Attachment[];
  readAt: string | null;
};

export type Attachment = {
  id: string;
  fileName: string;
  storagePath: string;
  contentType: string | null;
  sizeBytes: number | null;
};

export type Thread = {
  id: string;
  userId?: string;
  client: string;
  company: string;
  initials: string;
  sector: string;
};
export const ADMIN_NAME = "MUMUS Support";

type MessageRow = { id: string; thread_id: string; sender_role: Sender; text: string; created_at: string; read_at: string | null };
type AttachmentRow = { id: string; message_id: string; file_name: string; storage_path: string; content_type: string | null; size_bytes: number | null };

function mapMessage(row: MessageRow, attachments: AttachmentRow[] = []): Message {
  return {
    id: row.id,
    threadId: row.thread_id,
    from: row.sender_role,
    text: row.text,
    ts: new Date(row.created_at).getTime(),
    readAt: row.read_at,
    attachments: attachments.filter((attachment) => attachment.message_id === row.id).map((attachment) => ({ id: attachment.id, fileName: attachment.file_name, storagePath: attachment.storage_path, contentType: attachment.content_type, sizeBytes: attachment.size_bytes })),
  };
}

async function loadMessages(threadId: string) {
  const { data: rows, error: messageError } = await supabase.from("messages").select("id, thread_id, sender_role, text, created_at, read_at").eq("thread_id", threadId).order("created_at");
  if (messageError) return { messages: [], error: messageError };
  const messageRows = (rows ?? []) as MessageRow[];
  const ids = messageRows.map((message) => message.id);
  if (ids.length === 0) return { messages: [], error: null };
  const { data: attachmentRows, error: attachmentError } = await supabase.from("message_attachments").select("id, message_id, file_name, storage_path, content_type, size_bytes").in("message_id", ids);
  if (attachmentError) return { messages: messageRows.map((message) => mapMessage(message)), error: attachmentError };
  return { messages: messageRows.map((message) => mapMessage(message, (attachmentRows ?? []) as AttachmentRow[])), error: null };
}

function mergeMessage(current: Message[], message: Message) {
  return [...current.filter((item) => item.id !== message.id), message]
    .sort((a, b) => a.ts - b.ts || a.id.localeCompare(b.id));
}

export function useThread(threadId: string) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [error, setError] = useState("");
  const upsertMessage = useCallback((message: Message) => {
    setMessages((current) => mergeMessage(current, message));
    window.dispatchEvent(new Event("messages-changed"));
  }, []);
  useEffect(() => {
    let active = true;
    let version = 0;
    let loading = false;
    let queued = false;
    setMessages([]);
    setError("");
    const refresh = async () => {
      queued = true;
      if (loading) return;
      loading = true;
      try {
        while (active && queued) {
          queued = false;
          const started = version;
          const result = await loadMessages(threadId);
          if (!active) return;
          if (started !== version) { queued = true; continue; }
          if (result.error) setError(result.error.message);
          else { setMessages(result.messages); setError(""); }
        }
      } catch (cause) {
        if (active) setError(cause instanceof Error ? cause.message : "Could not load messages.");
      } finally { loading = false; }
    };
    const changed = () => { version++; void refresh(); };
    const focus = () => { if (document.visibilityState === "visible") changed(); };
    const channel = supabase.channel(`messages:${threadId}`).on("postgres_changes", {
      event: "*", schema: "public", table: "messages", filter: `thread_id=eq.${threadId}`,
    }, (payload) => {
      if (!active) return;
      if (payload.eventType === "DELETE") {
        setMessages((current) => current.filter((message) => message.id !== payload.old.id));
      } else {
        const row = payload.new as MessageRow;
        if (row.thread_id !== threadId) return;
        // Render the row immediately; fetch attachment metadata afterwards.
        setMessages((current) => mergeMessage(current, {
          ...mapMessage(row), attachments: current.find((message) => message.id === row.id)?.attachments ?? [],
        }));
      }
      changed();
    }).on("postgres_changes", { event: "*", schema: "public", table: "message_attachments" }, changed)
      .subscribe((status) => {
        if (!active) return;
        if (status === "SUBSCRIBED") changed();
        else if (status === "CHANNEL_ERROR" || status === "TIMED_OUT") setError("Live connection interrupted. Reconnecting...");
      });
    void refresh();
    window.addEventListener("focus", focus);
    document.addEventListener("visibilitychange", focus);
    window.addEventListener("messages-changed", changed);
    return () => {
      active = false;
      window.removeEventListener("focus", focus);
      document.removeEventListener("visibilitychange", focus);
      window.removeEventListener("messages-changed", changed);
      void supabase.removeChannel(channel);
    };
  }, [threadId]);
  return { messages, upsertMessage, error };
}

export type ConversationSummary = { text: string; ts: number; from: Sender; unread: number; unreadIds: string[] };

async function loadConversationSummaries() {
  const rows: MessageRow[] = [];
  // Supabase caps individual responses. Include every page so old unread
  // messages are counted even when newer messages fill the first page.
  const pageSize = 1000;
  for (let offset = 0; ; offset += pageSize) {
    const result = await supabase.from("messages")
      .select("id, thread_id, text, sender_role, created_at, read_at")
      .order("created_at", { ascending: false }).order("id", { ascending: false })
      .range(offset, offset + pageSize - 1);
    if (result.error) return { data: [], error: result.error };
    rows.push(...(result.data ?? []) as MessageRow[]);
    if ((result.data?.length ?? 0) < pageSize) return { data: rows, error: null };
  }
}

export function useConversationSummaries(self: Sender) {
  const [summaries, setSummaries] = useState<Record<string, ConversationSummary>>({});
  const [error, setError] = useState("");
  useEffect(() => {
    let active = true;
    let loading = false;
    let queued = false;
    let version = 0;
    const refresh = async () => {
      queued = true;
      if (loading) return;
      loading = true;
      try {
        while (active && queued) {
          queued = false;
          const started = version;
          const result = await loadConversationSummaries();
          if (!active) return;
          if (started !== version) { queued = true; continue; }
          if (result.error) { setError(result.error.message); continue; }
          const next: Record<string, ConversationSummary> = {};
          for (const row of result.data ?? []) {
            next[row.thread_id] ??= { text: row.text, ts: new Date(row.created_at).getTime(), from: row.sender_role, unread: 0, unreadIds: [] };
            if (row.sender_role !== self && row.read_at === null) { next[row.thread_id].unread++; next[row.thread_id].unreadIds.push(row.id); }
          }
          setSummaries(next);
          setError("");
        }
      } catch (cause) {
        if (active) setError(cause instanceof Error ? cause.message : "Could not load unread messages.");
      } finally { loading = false; }
    };
    const changed = () => { version++; void refresh(); };
    const focus = () => { if (document.visibilityState === "visible") changed(); };
    const read = (event: Event) => {
      const { threadId, messageIds } = (event as CustomEvent<{ threadId: string; messageIds?: string[] }>).detail;
      setSummaries((current) => {
        const summary = current[threadId];
        if (!summary) return current;
        const readIds = new Set(messageIds);
        const unreadIds = messageIds ? summary.unreadIds.filter((id) => !readIds.has(id)) : [];
        return { ...current, [threadId]: { ...summary, unreadIds, unread: unreadIds.length } };
      });
      changed();
    };
    const channel = supabase.channel(`conversation-summaries:${self}`).on("postgres_changes", {
      event: "*", schema: "public", table: "messages",
    }, changed).subscribe((status) => { if (status === "SUBSCRIBED" && active) changed(); });
    void refresh();
    window.addEventListener("messages-changed", changed);
    window.addEventListener("messages-read", read);
    window.addEventListener("focus", focus);
    document.addEventListener("visibilitychange", focus);
    return () => {
      active = false;
      window.removeEventListener("messages-changed", changed);
      window.removeEventListener("messages-read", read);
      window.removeEventListener("focus", focus);
      document.removeEventListener("visibilitychange", focus);
      void supabase.removeChannel(channel);
    };
  }, [self]);
  return { summaries, error };
}

// A retry uses the same primary key and file IDs, including after a lost response.
export async function sendMessage(threadId: string, senderId: string, from: Sender, text: string, files: File[] = [], id = crypto.randomUUID(), fileIds = files.map(() => crypto.randomUUID())) {
  try {
    const messageText = text.trim() || files.map((file) => file.name).join(", ");
    const columns = "id, thread_id, sender_id, sender_role, text, created_at, read_at";
    let result = await supabase.from("messages").insert({ id, thread_id: threadId, sender_id: senderId, sender_role: from, text: messageText }).select(columns).single();
    if (result.error?.code === "23505") {
      result = await supabase.from("messages").select(columns).eq("id", id).eq("sender_id", senderId).eq("thread_id", threadId).single();
    }
    if (result.error) return { error: result.error, message: null };
    if (!result.data) throw new Error("Message was not confirmed. Please retry.");
    const row = result.data as MessageRow;
    for (const [index, file] of files.entries()) {
      const attachmentId = fileIds[index];
      const existing = await supabase.from("message_attachments").select("id").eq("id", attachmentId).maybeSingle();
      if (existing.error) return { error: existing.error, message: null };
      if (existing.data) continue;
      const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
      const storagePath = `${threadId}/${id}-${attachmentId}-${safeName}`;
      const { error: uploadError } = await supabase.storage.from("message-attachments").upload(storagePath, file, { contentType: file.type || "application/octet-stream", upsert: false });
      // The previous attempt may have uploaded the object before losing its response.
      if (uploadError && !("statusCode" in uploadError && String(uploadError.statusCode) === "409")) return { error: uploadError, message: null };
      const { error } = await supabase.from("message_attachments").insert({ id: attachmentId, message_id: id, file_name: file.name, storage_path: storagePath, content_type: file.type || null, size_bytes: file.size });
      if (error && error.code !== "23505") return { error, message: null };
    }
    const attachments = await supabase.from("message_attachments").select("id, message_id, file_name, storage_path, content_type, size_bytes").eq("message_id", id);
    if (attachments.error) return { error: attachments.error, message: null };
    return { error: null, message: mapMessage(row, attachments.data ?? []) };
  } catch (cause) {
    return { error: { message: cause instanceof Error ? cause.message : "Could not send message." }, message: null };
  }
}

export function canModifyMessage(message: Message) {
  return Date.now() - message.ts < 5 * 60 * 1000;
}

export async function editMessage(id: string, text: string) {
  return supabase.rpc("edit_message", { p_message_id: id, p_text: text.trim() });
}

export async function deleteMessage(id: string) {
  return supabase.rpc("delete_message", { p_message_id: id });
}

export async function markThreadRead(threadId: string, messageIds?: string[]) {
  // Mark the incoming rows actually displayed, rather than any message that
  // arrives after the user has already left the conversation. RLS enforces
  // that only incoming messages belonging to this account can be updated.
  if (messageIds) {
    for (let offset = 0; offset < messageIds.length; offset += 100) {
      const result = await supabase.from("messages").update({ read_at: new Date().toISOString() })
        .eq("thread_id", threadId).in("id", messageIds.slice(offset, offset + 100)).is("read_at", null);
      if (result.error) return result;
    }
  } else {
    const result = await supabase.rpc("mark_thread_read", { p_thread_id: threadId });
    if (result.error) return result;
  }
  window.dispatchEvent(new CustomEvent("messages-read", { detail: { threadId, messageIds } }));
  window.dispatchEvent(new Event("messages-changed"));
  return { error: null };
}

export function formatTime(ts: number): string {
  return new Date(ts).toLocaleTimeString("en-ZA", { hour: "2-digit", minute: "2-digit" });
}
