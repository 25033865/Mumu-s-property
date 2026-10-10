import { useCallback, useEffect, useState } from "react";
import { supabase } from "./lib/supabaseClient";

type Ownership = { id: string; assigned_admin_id: string | null; status: "open" | "resolved" };
type Admin = { user_id: string; name: string };
export type ConversationAction = "claim" | "release" | "transfer" | "resolve" | "reopen";

export default function useConversationOwnership() {
  const [ownership, setOwnership] = useState<Record<string, Ownership>>({});
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [userId, setUserId] = useState<string | null>(null);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [refresh, setRefresh] = useState(0);

  useEffect(() => {
    let active = true;
    let sequence = 0;
    const load = async () => {
      const request = ++sequence;
      try {
        const [threads, directory, auth] = await Promise.all([
          supabase.from("message_threads").select("id, assigned_admin_id, status"),
          supabase.rpc("support_admins"),
          supabase.auth.getUser(),
        ]);
        if (!active || request !== sequence) return;
        if (threads.error || directory.error || auth.error || !auth.data.user) {
          setReady(false);
          setError("Conversation ownership is unavailable. Apply the conversation_ownership.sql migration if it has not been installed, then retry.");
          return;
        }
        setOwnership(Object.fromEntries((threads.data as Ownership[]).map((row) => [row.id, row])));
        setAdmins(directory.data as Admin[]);
        setUserId(auth.data.user.id);
        setReady(true);
        setError("");
      } catch {
        if (active && request === sequence) { setReady(false); setError("Could not load conversation ownership. Retry to reconnect."); }
      }
    };
    const channel = supabase.channel("admin-conversation-ownership")
      .on("postgres_changes", { event: "*", schema: "public", table: "message_threads" }, () => void load())
      .subscribe((status) => { if (status === "SUBSCRIBED") void load(); });
    void load();
    // Refresh after missed realtime events, tab changes, or a connection outage.
    const poll = window.setInterval(() => void load(), 10000);
    const focused = () => void load();
    window.addEventListener("focus", focused);
    window.addEventListener("profile-updated", focused);
    return () => { active = false; clearInterval(poll); window.removeEventListener("focus", focused); window.removeEventListener("profile-updated", focused); void supabase.removeChannel(channel); };
  }, [refresh]);

  const act = useCallback(async (threadId: string, action: ConversationAction, target?: string) => {
    if (!ready || busy) return;
    setBusy(true);
    setError("");
    try {
      const { data, error: actionError } = await supabase.rpc("manage_conversation", {
        p_thread_id: threadId, p_action: action,
        p_expected_owner: ownership[threadId]?.assigned_admin_id ?? null,
        p_target_admin: target ?? null,
      });
      if (actionError) setError(actionError.message);
      else if (data) setOwnership((current) => ({ ...current, [threadId]: data as Ownership }));
    } catch { setError("Could not update this conversation. Please retry."); }
    finally { setBusy(false); }
  }, [ready, busy, ownership]);

  const label = (threadId: string) => {
    const row = ownership[threadId];
    if (!ready || !row) return "Checking ownership...";
    if (row.status === "resolved") return "Resolved";
    if (!row.assigned_admin_id) return "Unassigned";
    if (row.assigned_admin_id === userId) return "Assigned to you";
    return `Handled by ${admins.find((admin) => admin.user_id === row.assigned_admin_id)?.name ?? "another admin"}`;
  };

  return { ownership, admins, userId, ready, error, busy, act, label, retry: () => setRefresh((value) => value + 1) };
}
