import { Headset, Circle } from "lucide-react";
import Chat from "../../components/Chat";
import { CLIENT_THREAD_ID, ADMIN_NAME } from "../../messaging";

export default function Messages() {
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
        <Chat threadId={CLIENT_THREAD_ID} self="client" theme="light" placeholder="Message the MUMUS team…" />
      </div>
    </div>
  );
}
