import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { MessageSquare, ArrowLeft } from "lucide-react";
import Chat from "../../components/Chat";
import { formatTime, useConversationSummaries, type Thread } from "../../messaging";
import { supabase } from "../../lib/supabaseClient";

export default function AdminMessages() {
  const [threads, setThreads] = useState<Thread[]>([]);
  const [active, setActive] = useState<string | null>(null);
  const { summaries: previews, error: summaryError } = useConversationSummaries("admin");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [searchParams, setSearchParams] = useSearchParams();
  useEffect(() => {
    void supabase.from("message_threads").select("id, client_id").then(async ({ data, error: threadError }) => {
      if (threadError) {
        setError(threadError.message);
        setLoading(false);
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
      const requestedClientId = searchParams.get("client");
      setActive(next.find((thread) => thread.userId === requestedClientId)?.id ?? null);
      setLoading(false);
    });
  }, [searchParams]);
  const activeThread = threads.find((thread) => thread.id === active);

  return (
    <div className="flex min-h-0 min-w-0 flex-1 flex-col text-white">
      {!activeThread && <div className="messaging-intro shrink-0 border-b border-white/8 px-4 py-3 sm:px-5 sm:py-5 lg:px-8">
        <h1 className="font-display text-xl font-extrabold tracking-tight sm:text-2xl md:text-3xl">Client messages</h1>
        <p className="mt-1 hidden text-sm text-white/50 sm:block">Reply to clients directly. Messages sync live to their portal.</p>
      </div>}

      {(error || summaryError) && <p role="alert" className="shrink-0 px-4 py-3 text-sm text-rose-300">{error || summaryError}</p>}

      <div className="flex min-h-0 min-w-0 flex-1 flex-col">
        {/* conversation list */}
        {!activeThread && <div className="flex min-h-0 flex-1 flex-col overflow-hidden bg-white/[0.03]">
          <div className="border-b border-white/8 px-4 py-3">
            <span className="font-mono text-[11px] uppercase tracking-wider text-white/40">Conversations</span>
          </div>
          <div className="min-h-0 flex-1 overflow-y-auto">
            {loading && <p role="status" className="px-4 py-6 text-sm text-white/50">Loading conversations...</p>}
            {!loading && threads.length === 0 && <p className="px-4 py-6 text-sm text-white/50">No client conversations yet.</p>}
            {threads.map((t) => {
              const last = previews[t.id];
              const isActive = t.id === active;
              return (
                <button
                  key={t.id}
                  onClick={() => setActive(t.id)}
                  className={`flex w-full items-start gap-3 border-b border-white/5 px-4 py-3.5 text-left transition-colors ${
                    isActive ? "bg-gold-400/10" : "hover:bg-white/[0.03]"
                  }`}
                >
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-white/8 text-[12px] font-bold">{t.initials}</span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <span className="min-w-0 truncate text-[13px] font-semibold">{t.client}</span>
                      {last && <span className="font-mono max-w-[45%] shrink-0 truncate text-[10px] text-white/35">{formatTime(last.ts)}</span>}
                    </div>
                    <div className="mt-0.5 truncate text-[12px] text-white/60">{t.company}</div>
                    <div className="mt-1 truncate text-[12px] text-white/45">
                      {last ? `${last.from === "admin" ? "You: " : ""}${last.text}` : "No messages yet"}
                    </div>
                  </div>
                  {!!last?.unread && <span aria-label={`${last.unread} unread messages`} className="ml-auto grid h-6 min-w-6 shrink-0 place-items-center self-center rounded-full bg-gold-400 px-1 text-[11px] font-bold text-navy-900">{last.unread > 99 ? "99+" : last.unread}</span>}
                </button>
              );
            })}
          </div>
        </div>}

        {/* chat */}
        {activeThread && <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden bg-white/[0.03]">
          <div className="flex shrink-0 items-center gap-2 border-b border-white/8 px-3 py-2 sm:gap-3 sm:px-5 sm:py-4">
            <button type="button" onClick={() => { setActive(null); if (searchParams.has("client")) { const next = new URLSearchParams(searchParams); next.delete("client"); setSearchParams(next, { replace: true }); } }} aria-label="Back to client list" className="grid h-11 w-11 shrink-0 place-items-center rounded-lg text-white/60 hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-gold-400">
              <ArrowLeft className="h-5 w-5" />
            </button>
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-gold-400 text-navy-900 sm:h-11 sm:w-11">
              <MessageSquare className="h-5 w-5" />
            </span>
            <div className="min-w-0 flex-1">
              <div className="font-display truncate text-sm font-bold">{activeThread?.client ?? "Select a conversation"}</div>
              <div className="truncate text-[12px] text-white/45">{activeThread?.company ?? (activeThread ? "Company not provided" : "No client conversations yet")}</div>
            </div>
          </div>
          {activeThread && <Chat key={activeThread.id} threadId={activeThread.id} self="admin" theme="dark" placeholder="Reply to this client…" />}
        </div>}
      </div>
    </div>
  );
}
