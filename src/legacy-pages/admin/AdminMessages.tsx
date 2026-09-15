import { useState } from "react";
import { MessageSquare, ArrowLeft } from "lucide-react";
import Chat from "../../components/Chat";
import { THREADS, useAllMessages, formatTime } from "../../messaging";

export default function AdminMessages() {
  const [active, setActive] = useState(THREADS[0].id);
  const [showChat, setShowChat] = useState(false); // mobile: list vs chat
  const all = useAllMessages();

  const preview = (threadId: string) => {
    const msgs = all.filter((m) => m.threadId === threadId).sort((a, b) => a.ts - b.ts);
    return msgs[msgs.length - 1];
  };

  const activeThread = THREADS.find((t) => t.id === active)!;

  return (
    <div className="text-white">
      <div className="mb-6">
        <h1 className="font-display text-2xl font-extrabold tracking-tight md:text-3xl">Client messages</h1>
        <p className="mt-1 text-sm text-white/50">Reply to clients directly. Messages sync live to their portal.</p>
      </div>

      <div className="grid h-[72vh] gap-4 lg:grid-cols-[320px_1fr]">
        {/* conversation list */}
        <div className={`${showChat ? "hidden lg:flex" : "flex"} flex-col overflow-hidden rounded-2xl border border-white/8 bg-white/[0.03]`}>
          <div className="border-b border-white/8 px-4 py-3">
            <span className="font-mono text-[11px] uppercase tracking-wider text-white/40">Conversations</span>
          </div>
          <div className="flex-1 overflow-y-auto">
            {THREADS.map((t) => {
              const last = preview(t.id);
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
                      <span className="truncate text-[13px] font-semibold">{t.company}</span>
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
              <div className="font-display text-sm font-bold">{activeThread.company}</div>
              <div className="text-[12px] text-white/45">{activeThread.client} · {activeThread.sector}</div>
            </div>
          </div>
          <Chat threadId={active} self="admin" theme="dark" placeholder={`Reply to ${activeThread.client}…`} />
        </div>
      </div>
    </div>
  );
}
