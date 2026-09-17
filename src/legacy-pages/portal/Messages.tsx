import { Headset, Circle } from "lucide-react";
import Chat from "../../components/Chat";
import { ADMIN_NAME, markThreadRead } from "../../messaging";
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
  useEffect(() => { if (threadId) void markThreadRead(threadId); }, [threadId]);
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-extrabold tracking-tight text-navy-900 md:text-3xl">Support & messages</h1>
        <p className="mt-1 text-sm text-slate-ink">Direct line to the MUMUS PROPERTYS team about your RFQs, quotes and deliveries.</p>
      </div>

      <div className="flex h-[70vh] flex-col overflow-hidden rounded-2xl border border-hairline bg-white shadow-sm">
        <div className="flex items-center gap-3 border-b border-hairline px-5 py-4">
          <span className="grid h-11 w-11 place-items-center rounded-full bg-navy-900 text-gold-400">
            <Headset className="h-5 w-5" />
          </span>
          <div className="min-w-0 flex-1">
            <div className="font-display text-sm font-bold text-navy-900">{ADMIN_NAME}</div>
            <div className="flex items-center gap-1.5 text-[12px] text-emerald-600">
              <Circle className="h-2 w-2 fill-current" /> Online · replies within minutes
            </div>
          </div>
        </div>
        {threadId ? <Chat threadId={threadId} self="client" theme="light" placeholder="Message the MUMUS team…" /> : <div className="grid flex-1 place-items-center text-sm text-slate-ink/60">Loading conversation...</div>}
      </div>
    </div>
  );
}
