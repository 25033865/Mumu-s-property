import { useEffect, useState } from "react";
import { MessageSquare, ArrowLeft } from "lucide-react";
import Chat from "../../components/Chat";
import { formatTime, markThreadRead, type Thread } from "../../messaging";
import { supabase } from "../../lib/supabaseClient";

export default function AdminMessages() {
  const [threads, setThreads] = useState<Thread[]>([]);
  const [active, setActive] = useState<string | null>(null);
  const [showChat, setShowChat] = useState(false); // mobile: list vs chat
  const [previews, setPreviews] = useState<Record<string, { text: string; ts: number; from: "client" | "admin" }>>({});
  const [error, setError] = useState("");
  useEffect(() => {
    void supabase.from("message_threads").select("id, client_id").then(async ({ data, error: threadError }) => {
      if (threadError) {
        setError(threadError.message);
        return;
      }
      const clientIds = (data ?? []).map((thread) => thread.client_id);
      const { data: profiles, error: profileError } = clientIds.length
        ? await supabase.from("profiles").select("user_id, first_name, last_name, company_name").in("user_id", clientIds)
        : { data: [], error: null };
      if (profileError) setError(profileError.message);
      const profileByUser = new Map((profiles ?? []).map((profile) => [profile.user_id, profile]));
      const next = (data ?? []).map((thread) => {
        const profile = profileByUser.get(thread.client_id);
        const name = [profile?.first_name, profile?.last_name].filter(Boolean).join(" ") || "Client account";
        return { id: thread.id, userId: thread.client_id, client: name, company: profile?.company_name || "Client account", initials: name.split(" ").map((part) => part[0]).join("").slice(0, 2).toUpperCase(), sector: "Client" };
      });
      setThreads(next);
      setActive(next[0]?.id ?? null);
      const messages = await supabase.from("messages").select("thread_id, text, sender_role, created_at").order("created_at", { ascending: false });
      const nextPreviews: Record<string, { text: string; ts: number; from: "client" | "admin" }> = {};
      (messages.data ?? []).forEach((message) => { if (!nextPreviews[message.thread_id]) nextPreviews[message.thread_id] = { text: message.text, ts: new Date(message.created_at).getTime(), from: message.sender_role }; });
      setPreviews(nextPreviews);
    });
  }, []);
  const activeThread = threads.find((thread) => thread.id === active);
  useEffect(() => { if (active) void markThreadRead(active); }, [active]);

  return (
    <div className="text-white">
      <div className="mb-6">
        <h1 className="font-display text-2xl font-extrabold tracking-tight md:text-3xl">Client messages</h1>
        <p className="mt-1 text-sm text-white/50">Reply to clients directly. Messages sync live to their portal.</p>
      </div>

      {error && <p role="alert" className="mb-4 text-sm text-rose-300">{error}</p>}

      <div className="grid h-[72vh] gap-4 lg:grid-cols-[320px_1fr]">
        {/* conversation list */}
        <div className={`${showChat ? "hidden lg:flex" : "flex"} flex-col overflow-hidden rounded-2xl border border-white/8 bg-white/[0.03]`}>
          <div className="border-b border-white/8 px-4 py-3">
            <span className="font-mono text-[11px] uppercase tracking-wider text-white/40">Conversations</span>
          </div>
          <div className="flex-1 overflow-y-auto">
            {threads.map((t) => {
              const last = previews[t.id];
              const isActive = t.id === active;
              return (
                <button
                  key={t.id}
                  onClick={() => { setActive(t.id); setShowChat(true); }}
                  className={`flex w-full items-start gap-3 border-b border-white/5 px-4 py-3.5 text-left transition-colors ${
                    isActive ? "bg-gold-400/10" : "hover:bg-white/[0.03]"
                  }`}
                >
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-white/8 text-[12px] font-bold">{t.initials}</span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <span className="truncate text-[13px] font-semibold">{t.client}</span>
                      {last && <span className="font-mono shrink-0 text-[10px] text-white/35">{formatTime(last.ts)}</span>}
                    </div>
                    <div className="truncate text-[12px] text-white/45">
                      {last ? `${last.from === "admin" ? "You: " : ""}${last.text}` : "No messages yet"}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* chat */}
        <div className={`${showChat ? "flex" : "hidden lg:flex"} flex-col overflow-hidden rounded-2xl border border-white/8 bg-white/[0.03]`}>
          <div className="flex items-center gap-3 border-b border-white/8 px-5 py-4">
            <button onClick={() => setShowChat(false)} className="grid h-9 w-9 shrink-0 place-items-center rounded-lg text-white/60 hover:bg-white/10 lg:hidden">
              <ArrowLeft className="h-5 w-5" />
            </button>
            <span className="grid h-11 w-11 place-items-center rounded-full bg-gold-400 text-navy-900">
              <MessageSquare className="h-5 w-5" />
            </span>
            <div className="min-w-0">
              <div className="font-display text-sm font-bold">{activeThread?.client ?? "Select a conversation"}</div>
              <div className="text-[12px] text-white/45">{activeThread?.company ?? (activeThread ? "Company not provided" : "No client conversations yet")}</div>
            </div>
          </div>
          {activeThread && <Chat threadId={activeThread.id} self="admin" theme="dark" placeholder="Reply to this client…" />}
        </div>
      </div>
    </div>
  );
}
