import { useEffect, useState } from "react";
import { supabase } from "./lib/supabaseClient";

export type Sender = "client" | "admin";

export type Message = {
  id: string;
  threadId: string;
  from: Sender;
  text: string;
  ts: number;
  attachments: Attachment[];
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

type MessageRow = { id: string; thread_id: string; sender_role: Sender; text: string; created_at: string };
type AttachmentRow = { id: string; message_id: string; file_name: string; storage_path: string; content_type: string | null; size_bytes: number | null };

function mapMessage(row: MessageRow, attachments: AttachmentRow[] = []): Message {
  return {
    id: row.id,
    threadId: row.thread_id,
    from: row.sender_role,
    text: row.text,
    ts: new Date(row.created_at).getTime(),
    attachments: attachments.filter((attachment) => attachment.message_id === row.id).map((attachment) => ({ id: attachment.id, fileName: attachment.file_name, storagePath: attachment.storage_path, contentType: attachment.content_type, sizeBytes: attachment.size_bytes })),
  };
}

async function loadMessages(threadId: string) {
  const { data: rows, error: messageError } = await supabase.from("messages").select("id, thread_id, sender_role, text, created_at").eq("thread_id", threadId).order("created_at");
  if (messageError) return { messages: [], error: messageError };
  const messageRows = (rows ?? []) as MessageRow[];
  const ids = messageRows.map((message) => message.id);
  if (ids.length === 0) return { messages: [], error: null };
  const { data: attachmentRows, error: attachmentError } = await supabase.from("message_attachments").select("id, message_id, file_name, storage_path, content_type, size_bytes").in("message_id", ids);
  if (attachmentError) return { messages: messageRows.map((message) => mapMessage(message)), error: attachmentError };
  return { messages: messageRows.map((message) => mapMessage(message, (attachmentRows ?? []) as AttachmentRow[])), error: null };
}

export function useThread(threadId: string | null): Message[] {
  const [messages, setMessages] = useState<Message[]>([]);
  useEffect(() => {
    if (!threadId) return;
    let active = true;
    const refreshMessage = async (messageId: string) => {
      const { data: row } = await supabase.from("messages").select("id, thread_id, sender_role, text, created_at").eq("id", messageId).single();
      if (!active || !row) return;
      const { data: attachmentRows } = await supabase.from("message_attachments").select("id, message_id, file_name, storage_path, content_type, size_bytes").eq("message_id", messageId);
      if (!active) return;
      const mapped = mapMessage(row as MessageRow, (attachmentRows ?? []) as AttachmentRow[]);
        if (mapped.threadId !== threadId) return;
        setMessages((current) => current.some((message) => message.id === mapped.id) ? current.map((message) => message.id === mapped.id ? mapped : message) : [...current, mapped]);
    };
    void loadMessages(threadId).then(({ messages: loadedMessages }) => { if (active) setMessages(loadedMessages); });
    const channel = supabase.channel(`messages:${threadId}`).on("postgres_changes", { event: "*", schema: "public", table: "messages", filter: `thread_id=eq.${threadId}` }, (payload) => {
      if (!active) return;
      if (payload.eventType === "DELETE") {
        setMessages((current) => current.filter((message) => message.id !== (payload.old as { id: string }).id));
        return;
      }
      refreshMessage((payload.new as { id: string }).id);
    }).on("postgres_changes", { event: "INSERT", schema: "public", table: "message_attachments" }, (payload) => {
      if (!active) return;
      refreshMessage((payload.new as { message_id: string }).message_id);
    }).subscribe();
    return () => { active = false; void supabase.removeChannel(channel); };
  }, [threadId]);
  return messages;
}

export async function sendMessage(threadId: string, senderId: string, from: Sender, text: string, files: File[] = []) {
  const trimmed = text.trim();
  if (!trimmed && files.length === 0) return { error: null };
  const messageText = trimmed || files.map((file) => file.name).join(", ");
  const { data: message, error: messageError } = await supabase.from("messages").insert({ thread_id: threadId, sender_id: senderId, sender_role: from, text: messageText }).select("id").single();
  if (messageError || !message) return { error: messageError };

  const uploaded: Attachment[] = [];
  for (const file of files) {
    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
    const storagePath = `${threadId}/${message.id}-${crypto.randomUUID()}-${safeName}`;
    const { error: uploadError } = await supabase.storage.from("message-attachments").upload(storagePath, file, { contentType: file.type || "application/octet-stream", upsert: false });
    if (uploadError) return { error: uploadError };
    uploaded.push({ id: crypto.randomUUID(), fileName: file.name, storagePath, contentType: file.type || null, sizeBytes: file.size });
  }
  if (uploaded.length > 0) {
    const { error: attachmentError } = await supabase.from("message_attachments").insert(uploaded.map((attachment) => ({ id: attachment.id, message_id: message.id, file_name: attachment.fileName, storage_path: attachment.storagePath, content_type: attachment.contentType, size_bytes: attachment.sizeBytes })));
    if (attachmentError) return { error: attachmentError };
  }
  return { error: null };
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

export async function markThreadRead(threadId: string) {
  return supabase.rpc("mark_thread_read", { p_thread_id: threadId });
}

export function formatTime(ts: number): string {
  return new Date(ts).toLocaleTimeString("en-ZA", { hour: "2-digit", minute: "2-digit" });
}
