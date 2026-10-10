import { Headset } from "lucide-react";
import Chat from "../../components/Chat";
import { ADMIN_NAME } from "../../messaging";
import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import useClientSupportAgent from "../../clientSupportAgent";

export default function Messages() {
  const [threadId, setThreadId] = useState<string | null>(null);
  const { agent, error: agentError, handoff, retry } = useClientSupportAgent(threadId);
  useEffect(() => {
    void supabase.auth.getUser().then(async ({ data }) => {
      if (!data.user) return;
      const existing = await supabase.from("message_threads").select("id").eq("client_id", data.user.id).maybeSingle();
      if (existing.data) setThreadId(existing.data.id);
      else {
        const created = await supabase.from("message_threads").insert({ client_id: data.user.id }).select("id").single();
        setThreadId(created.data?.id ?? null);
      }
    });
  }, []);
  return (
    <div className="flex min-h-0 min-w-0 flex-1 flex-col">
      <div className="messaging-intro shrink-0 border-b border-hairline px-4 py-3 sm:px-5 sm:py-5 lg:px-8">
        <h1 className="font-display text-xl font-extrabold tracking-tight text-navy-900 sm:text-2xl md:text-3xl">Support & messages</h1>
        <p className="mt-1 hidden text-sm text-slate-ink sm:block">Direct line to the MUMUS PROPERTYS team about your RFQs, quotes and deliveries.</p>
      </div>

      <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden bg-white">
        <div className="flex shrink-0 items-center gap-3 border-b border-hairline px-3 py-2 sm:px-5 sm:py-4">
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-navy-900 text-gold-400 sm:h-11 sm:w-11">
            <Headset className="h-5 w-5" />
          </span>
          <div className="min-w-0 flex-1">
            <div className="font-display truncate text-sm font-bold text-navy-900">{ADMIN_NAME}</div>
            <div role="status" aria-live="polite" className={`mt-0.5 text-[12px] ${agent?.is_assigned && agent.status === "open" ? "text-emerald-600" : "text-slate-ink/70"}`}>
              {!agent ? agentError ? "Support messages" : "Checking support details..." : agent.status === "resolved" ? "Conversation resolved. Send a message if you need more help." : agent.is_assigned ? `You're chatting with ${agent.first_name ?? "a support agent"} from MUMUS Support.` : "Waiting for a support agent."}
            </div>
          </div>
        </div>
        {handoff && <p role="status" aria-live="polite" className="shrink-0 border-b border-emerald-100 bg-emerald-50 px-4 py-2 text-xs text-emerald-700">{handoff}</p>}
        {agentError && <p role="alert" className="shrink-0 px-4 py-2 text-xs text-slate-ink">{agentError} <button type="button" onClick={retry} className="font-semibold underline">Retry</button></p>}
        {threadId ? <Chat key={threadId} threadId={threadId} self="client" theme="light" placeholder="Message the MUMUS team…" /> : <div className="grid flex-1 place-items-center text-sm text-slate-ink/60">Loading conversation...</div>}
      </div>
    </div>
  );
}
