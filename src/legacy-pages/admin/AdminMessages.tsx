import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { MessageSquare, ArrowLeft } from "lucide-react";
import Chat from "../../components/Chat";
import { formatTime, useConversationSummaries, type Thread } from "../../messaging";
import { supabase } from "../../lib/supabaseClient";
import useConversationOwnership from "../../conversationOwnership";

export default function AdminMessages() {
  const [threads, setThreads] = useState<Thread[]>([]);
  const [active, setActive] = useState<string | null>(null);
  const { summaries: previews, error: summaryError } = useConversationSummaries("admin");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const support = useConversationOwnership();
  const [handoff, setHandoff] = useState("");
  const [searchParams, setSearchParams] = useSearchParams();
  useEffect(() => {
    let mounted = true;
    let sequence = 0;
    const load = async () => {
      const request = ++sequence;
      const { data, error: threadError } = await supabase.from("message_threads").select("id, client_id");
      if (!mounted || request !== sequence) return;
      if (threadError) {
        setError(threadError.message);
        setLoading(false);
        return;
      }
      const clientIds = (data ?? []).map((thread) => thread.client_id);
      const { data: profiles, error: profileError } = clientIds.length
        ? await supabase.from("profiles").select("user_id, first_name, last_name, company_name").in("user_id", clientIds)
        : { data: [], error: null };
      if (!mounted || request !== sequence) return;
      setError(profileError?.message ?? "");
      const profileByUser = new Map((profiles ?? []).map((profile) => [profile.user_id, profile]));
      const next = (data ?? []).map((thread) => {
        const profile = profileByUser.get(thread.client_id);
        const name = [profile?.first_name, profile?.last_name].filter(Boolean).join(" ") || "Client account";
        return { id: thread.id, userId: thread.client_id, client: name, company: profile?.company_name || "Client account", initials: name.split(" ").map((part) => part[0]).join("").slice(0, 2).toUpperCase(), sector: "Client" };
      });
      setThreads(next);
      const requestedClientId = searchParams.get("client");
      setActive((current) => requestedClientId ? next.find((thread) => thread.userId === requestedClientId)?.id ?? null : next.some((thread) => thread.id === current) ? current : null);
      setLoading(false);
    };
    const refresh = () => { void load().catch(() => { if (mounted) { setError("Could not load conversations. Refresh to retry."); setLoading(false); } }); };
    const channel = supabase.channel("admin-thread-list").on("postgres_changes", { event: "*", schema: "public", table: "message_threads" }, refresh).subscribe((status) => { if (status === "SUBSCRIBED") refresh(); });
    refresh();
    const poll = window.setInterval(refresh, 10000);
    window.addEventListener("focus", refresh);
    return () => { mounted = false; clearInterval(poll); window.removeEventListener("focus", refresh); void supabase.removeChannel(channel); };
  }, [searchParams]);
  const activeThread = threads.find((thread) => thread.id === active);
  const assignment = activeThread ? support.ownership[activeThread.id] : undefined;
  const ownsChat = support.ready && !!support.userId && assignment?.assigned_admin_id === support.userId && assignment.status === "open";
  useEffect(() => { setHandoff(""); }, [active]);

  return (
    <div className="flex min-h-0 min-w-0 flex-1 flex-col text-white">
      {!activeThread && <div className="messaging-intro shrink-0 border-b border-white/8 px-4 py-3 sm:px-5 sm:py-5 lg:px-8">
        <h1 className="font-display text-xl font-extrabold tracking-tight sm:text-2xl md:text-3xl">Client messages</h1>
        <p className="mt-1 hidden text-sm text-white/50 sm:block">Reply to clients directly. Messages sync live to their portal.</p>
      </div>}

      {(error || summaryError) && <p role="alert" className="shrink-0 px-4 py-3 text-sm text-rose-300">{error || summaryError}</p>}
      {support.error && <p role="alert" className="shrink-0 px-4 py-3 text-sm text-rose-300">{support.error} <button type="button" onClick={support.retry} className="underline">Retry</button></p>}

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
                      {last ? `${last.from === "admin" ? "Support: " : ""}${last.text}` : "No messages yet"}
                    </div>
                    <div className={`mt-2 text-[11px] font-semibold ${support.ownership[t.id]?.assigned_admin_id === support.userId && support.userId ? "text-gold-300" : "text-white/50"}`}>{support.label(t.id)}</div>
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
          <div className="flex shrink-0 flex-wrap items-center gap-2 border-b border-white/8 px-4 py-3">
            <span role="status" className="mr-auto text-xs font-semibold text-gold-300">{support.label(activeThread.id)}</span>
            {support.ready && assignment && <>
              {assignment.status === "resolved" ? <button type="button" disabled={support.busy} onClick={() => void support.act(activeThread.id, "reopen")} className="rounded-lg border border-white/15 px-3 py-2 text-xs font-semibold disabled:opacity-40">Reopen conversation</button>
                : !assignment.assigned_admin_id ? <button type="button" disabled={support.busy} onClick={() => void support.act(activeThread.id, "claim")} className="rounded-lg bg-gold-400 px-3 py-2 text-xs font-semibold text-navy-900 disabled:opacity-40">Take conversation</button>
                : ownsChat && <>
                  <select aria-label="Transfer conversation to admin" value={handoff} onChange={(event) => setHandoff(event.target.value)} disabled={support.busy} className="max-w-44 rounded-lg border border-white/15 bg-navy-900 px-2 py-2 text-xs">
                    <option value="">Transfer to...</option>
                    {support.admins.filter((admin) => admin.user_id !== support.userId).map((admin) => <option key={admin.user_id} value={admin.user_id}>{admin.name}</option>)}
                  </select>
                  {handoff && <button type="button" disabled={support.busy} onClick={() => void support.act(activeThread.id, "transfer", handoff)} className="rounded-lg border border-white/15 px-3 py-2 text-xs disabled:opacity-40">Transfer</button>}
                  <button type="button" disabled={support.busy} onClick={() => void support.act(activeThread.id, "release")} className="rounded-lg border border-white/15 px-3 py-2 text-xs disabled:opacity-40">Release</button>
                  <button type="button" disabled={support.busy} onClick={() => void support.act(activeThread.id, "resolve")} className="rounded-lg bg-emerald-500/20 px-3 py-2 text-xs font-semibold text-emerald-300 disabled:opacity-40">Resolve</button>
                </>}
            </>}
          </div>
          <Chat key={activeThread.id} threadId={activeThread.id} self="admin" theme="dark" canReply={ownsChat && !support.busy} readOnlyReason={!support.ready ? "Checking conversation ownership before you can reply." : assignment?.status === "resolved" ? "This conversation is resolved. Reopen it to continue." : !assignment?.assigned_admin_id ? "Take this conversation to reply to the customer." : `${support.label(activeThread.id)}. Only the assigned admin can reply.`} placeholder="Reply to this client..." />
        </div>}
      </div>
    </div>
  );
}
