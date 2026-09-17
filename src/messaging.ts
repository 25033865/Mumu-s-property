import { useEffect, useState } from "react";
import { supabase } from "./lib/supabaseClient";

export type Sender = "client" | "admin";

export type Message = {
  id: string;
  threadId: string;
  from: Sender;
  text: string;
  ts: number;
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

function mapMessage(row: { id: string; thread_id: string; sender_role: Sender; text: string; created_at: string }): Message {
  return { id: row.id, threadId: row.thread_id, from: row.sender_role, text: row.text, ts: new Date(row.created_at).getTime() };
}

export function useThread(threadId: string | null): Message[] {
  const [messages, setMessages] = useState<Message[]>([]);
  useEffect(() => {
    if (!threadId) return;
    let active = true;
    void supabase.from("messages").select("id, thread_id, sender_role, text, created_at").eq("thread_id", threadId).order("created_at").then(({ data }) => { if (active) setMessages((data ?? []).map(mapMessage)); });
    const channel = supabase.channel(`messages:${threadId}`).on("postgres_changes", { event: "*", schema: "public", table: "messages", filter: `thread_id=eq.${threadId}` }, (payload) => {
      if (!active) return;
      if (payload.eventType === "DELETE") {
        setMessages((current) => current.filter((message) => message.id !== (payload.old as { id: string }).id));
        return;
      }
      const mapped = mapMessage(payload.new as { id: string; thread_id: string; sender_role: Sender; text: string; created_at: string });
      setMessages((current) => current.some((message) => message.id === mapped.id) ? current.map((message) => message.id === mapped.id ? mapped : message) : [...current, mapped]);
    }).subscribe();
    return () => { active = false; void supabase.removeChannel(channel); };
  }, [threadId]);
  return messages;
}

export async function sendMessage(threadId: string, senderId: string, from: Sender, text: string) {
  const trimmed = text.trim();
  if (!trimmed) return { error: null };
  return supabase.from("messages").insert({ thread_id: threadId, sender_id: senderId, sender_role: from, text: trimmed });
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
