import { useEffect, useRef, useState } from "react";
import { Send } from "lucide-react";
import { useThread, sendMessage, formatTime, type Sender } from "../messaging";

export default function Chat({
  threadId,
  self,
  theme = "light",
  placeholder = "Type a message…",
}: {
  threadId: string;
  self: Sender; // whose perspective — their messages align right
  theme?: "light" | "dark";
  placeholder?: string;
}) {
  const messages = useThread(threadId);
  const [draft, setDraft] = useState("");
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length, threadId]);

  const dark = theme === "dark";

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(threadId, self, draft);
    setDraft("");
  };

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="flex-1 space-y-3 overflow-y-auto p-5">
        {messages.length === 0 && (
          <div className={`grid h-full place-items-center text-sm ${dark ? "text-white/40" : "text-slate-ink/60"}`}>
            No messages yet — say hello.
          </div>
        )}
        {messages.map((m) => {
          const mine = m.from === self;
          const bubble = mine
            ? "bg-navy-900 text-white rounded-br-sm"
            : dark
            ? "bg-white/10 text-white rounded-bl-sm"
            : "bg-mist text-navy-900 rounded-bl-sm";
          return (
            <div key={m.id} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
              <div className="max-w-[78%]">
                <div className={`rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${bubble}`}>{m.text}</div>
                <div className={`font-mono mt-1 text-[10px] ${mine ? "text-right" : "text-left"} ${dark ? "text-white/35" : "text-slate-ink/50"}`}>
                  {m.from === "admin" ? "MUMUS Support" : "Client"} · {formatTime(m.ts)}
                </div>
              </div>
            </div>
          );
        })}
        <div ref={endRef} />
      </div>

      <form onSubmit={submit} className={`flex items-center gap-2 border-t p-3 ${dark ? "border-white/10" : "border-hairline"}`}>
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder={placeholder}
          className={`min-w-0 flex-1 rounded-lg px-4 py-2.5 text-sm outline-none ${
            dark
              ? "border border-white/10 bg-white/5 text-white placeholder:text-white/40 focus:border-gold-400/50"
              : "border border-hairline bg-white text-navy-900 placeholder:text-slate-ink/50 focus:border-navy-900 focus:ring-2 focus:ring-navy-900/10"
          }`}
        />
        <button
          type="submit"
          disabled={!draft.trim()}
          className="inline-flex h-11 shrink-0 items-center gap-2 rounded-lg bg-gold-400 px-4 text-sm font-semibold text-navy-900 transition-colors hover:bg-gold-300 disabled:opacity-40"
        >
          <Send className="h-4 w-4" /> Send
        </button>
      </form>
    </div>
  );
}
