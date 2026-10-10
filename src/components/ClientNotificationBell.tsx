import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Bell, BedDouble, ClipboardList, FileText, MessageSquare, ReceiptText, X } from "lucide-react";
import useClientNotifications, { type ClientNotification } from "../clientNotifications";

const icons = { message: MessageSquare, quote: ReceiptText, request: ClipboardList, booking: BedDouble, document: FileText };
const allowedPaths = new Set(["/portal/messages", "/portal/quotes", "/portal/requests", "/portal/accommodation", "/portal/documents"]);

export default function ClientNotificationBell() {
  const { items, unread, loading, busy, error, reload, markRead } = useClientNotifications();
  const [open, setOpen] = useState(false);
  const wrapper = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const closeButton = useRef<HTMLButtonElement>(null);
  const navigate = useNavigate();
  const location = useLocation();
  useEffect(() => { setOpen(false); }, [location.pathname]);
  useEffect(() => {
    if (!open) return;
    closeButton.current?.focus();
    const outside = (event: PointerEvent) => { if (!wrapper.current?.contains(event.target as Node)) setOpen(false); };
    const escape = (event: KeyboardEvent) => { if (event.key === "Escape") { setOpen(false); trigger.current?.focus(); } };
    document.addEventListener("pointerdown", outside);
    document.addEventListener("keydown", escape);
    return () => { document.removeEventListener("pointerdown", outside); document.removeEventListener("keydown", escape); };
  }, [open]);

  const visit = async (item: ClientNotification) => {
    if (!allowedPaths.has(item.target_path)) return;
    if (!item.read_at && !await markRead(item.id)) return;
    setOpen(false);
    navigate(item.target_path);
  };

  return <div ref={wrapper} className="relative" onBlur={(event) => { if (event.relatedTarget && !event.currentTarget.contains(event.relatedTarget as Node)) setOpen(false); }}>
    <button ref={trigger} type="button" aria-label={`Notifications${unread ? `, ${unread} unread` : ""}`} aria-expanded={open} aria-haspopup="dialog" aria-controls="client-notifications" onClick={() => { setOpen((value) => !value); if (!open) void reload(); }} className="relative grid h-10 w-10 place-items-center rounded-lg text-slate-ink hover:bg-mist focus-visible:outline-2 focus-visible:outline-navy-900">
      <Bell className="h-5 w-5" />
      {unread > 0 && <span className="absolute -right-1 -top-1 grid min-h-4 min-w-4 place-items-center rounded-full bg-gold-400 px-1 text-[10px] font-bold text-navy-900 ring-2 ring-white">{unread > 99 ? "99+" : unread}</span>}
    </button>
    {open && <section id="client-notifications" role="dialog" aria-labelledby="notifications-title" className="fixed right-4 top-[4.5rem] z-50 flex max-h-[min(70svh,36rem)] w-[min(24rem,calc(100vw-2rem))] flex-col overflow-hidden rounded-2xl border border-hairline bg-white text-navy-900 shadow-xl sm:absolute sm:right-0 sm:top-full sm:mt-3">
      <div className="flex shrink-0 items-center justify-between gap-2 border-b border-hairline px-4 py-3"><h2 id="notifications-title" className="font-display text-sm font-bold">Notifications {unread > 0 && <span className="ml-1 text-xs font-normal text-slate-ink">({unread} unread)</span>}</h2><button ref={closeButton} type="button" aria-label="Close notifications" onClick={() => { setOpen(false); trigger.current?.focus(); }} className="grid h-8 w-8 place-items-center rounded-lg hover:bg-mist"><X className="h-4 w-4" /></button></div>
      {unread > 0 && <div className="shrink-0 border-b border-hairline px-4 py-2"><button type="button" disabled={busy || loading || !items.length} onClick={() => void markRead()} className="text-xs font-semibold text-navy-900 underline disabled:opacity-40">{busy ? "Updating..." : "Mark all as read"}</button></div>}
      {error && <p role="alert" className="shrink-0 border-b border-hairline px-4 py-3 text-xs text-rose-600">{error} <button type="button" onClick={() => void reload()} className="font-semibold underline">Retry</button></p>}
      <div className="min-h-0 overflow-y-auto overscroll-contain">
        {loading ? <p role="status" className="px-4 py-8 text-center text-sm text-slate-ink">Loading notifications...</p> : !items.length && !error ? <div className="px-6 py-8 text-center"><Bell className="mx-auto mb-3 h-7 w-7 text-slate-ink/40" /><p className="text-sm font-semibold">You're all caught up</p><p className="mt-1 text-xs text-slate-ink">Replies, quotes, booking updates and documents will appear here.</p></div> : items.map((item) => {
          const Icon = icons[item.kind] ?? Bell;
          return <button key={item.id} type="button" disabled={busy} onClick={() => void visit(item)} className={`flex w-full items-start gap-3 border-b border-hairline px-4 py-3 text-left transition-colors hover:bg-mist focus-visible:outline-2 focus-visible:outline-inset focus-visible:outline-navy-900 disabled:opacity-60 ${!item.read_at ? "bg-gold-50/60" : "bg-white"}`}>
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-navy-900/5 text-navy-900"><Icon className="h-4 w-4" /></span>
            <span className="min-w-0 flex-1"><span className="flex items-center gap-2"><span className="text-xs font-semibold">{item.title}</span>{!item.read_at && <span aria-label="Unread" className="h-1.5 w-1.5 shrink-0 rounded-full bg-gold-500" />}</span><span className="mt-1 block break-words text-xs leading-relaxed text-slate-ink">{item.body}</span><time dateTime={item.created_at} className="mt-1.5 block text-[10px] text-slate-ink/70">{new Date(item.created_at).toLocaleString("en-ZA", { timeZone: "Africa/Johannesburg", day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}</time></span>
          </button>;
        })}
      </div>
      {items.length === 50 && <p className="shrink-0 border-t border-hairline px-4 py-2 text-[10px] text-slate-ink">Showing your 50 most recent notifications.</p>}
    </section>}
  </div>;
}
