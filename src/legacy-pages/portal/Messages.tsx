import { Headset, Circle } from "lucide-react";
import Chat from "../../components/Chat";
import { ADMIN_NAME } from "../../messaging";
import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";

export default function Messages() {
  const [threadId, setThreadId] = useState<string | null>(null);
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
            <div className="flex flex-wrap items-center gap-1.5 text-[12px] text-emerald-600">
              <Circle className="h-2 w-2 shrink-0 fill-current" /> Online <span className="hidden sm:inline">· replies within minutes</span>
            </div>
          </div>
        </div>
        {threadId ? <Chat key={threadId} threadId={threadId} self="client" theme="light" placeholder="Message the MUMUS team…" /> : <div className="grid flex-1 place-items-center text-sm text-slate-ink/60">Loading conversation...</div>}
      </div>
    </div>
  );
}
