import { Link } from "react-router-dom";
import {
  ClipboardList, ReceiptText, Truck, CheckCircle2, ArrowUpRight,
  FilePlus2, MessageSquare, FileText, TrendingUp, BedDouble,
} from "lucide-react";
import { Badge, Button } from "../../components/ui";
import { client, requests, quotes, messages, documents, statusTone } from "../../portalData";

const overview = [
  { label: "Active RFQs", value: "4", icon: ClipboardList, tone: "text-navy-900 bg-navy-900/8", trend: "+2 this week" },
  { label: "Pending Quotations", value: "2", icon: ReceiptText, tone: "text-amber-600 bg-amber-50", trend: "R 220,700 value" },
  { label: "Active Site Deliveries", value: "3", icon: Truck, tone: "text-blue-600 bg-blue-50", trend: "On schedule" },
  { label: "Completed Orders", value: "27", icon: CheckCircle2, tone: "text-emerald-600 bg-emerald-50", trend: "+5 this quarter" },
];

export default function Dashboard() {
  return (
    <div className="space-y-6">
      {/* welcome */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-extrabold tracking-tight text-navy-900 md:text-3xl">
            Welcome back, {client.name.split(" ")[0]}
          </h1>
          <p className="mt-1 text-sm text-slate-ink">Here's what's happening across your account today.</p>
        </div>
        <Button to="/portal/new-request" variant="gold"><FilePlus2 className="h-4 w-4" /> Submit RFQ</Button>
      </div>

      {/* overview stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {overview.map((o) => (
          <div key={o.label} className="rounded-2xl border border-hairline bg-white p-5">
            <div className="flex items-start justify-between">
              <span className={`grid h-11 w-11 place-items-center rounded-xl ${o.tone}`}>
                <o.icon className="h-5 w-5" />
              </span>
              <TrendingUp className="h-4 w-4 text-emerald-500" />
            </div>
            <div className="font-display mt-4 text-3xl font-extrabold text-navy-900">{o.value}</div>
            <div className="mt-0.5 text-sm font-medium text-slate-ink">{o.label}</div>
            <div className="font-mono mt-2 text-[11px] text-slate-ink/70">{o.trend}</div>
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* recent requests */}
        <div className="rounded-2xl border border-hairline bg-white lg:col-span-2">
          <Header title="Recent RFQs" to="/portal/requests" />
          <div className="divide-y divide-hairline">
            {requests.slice(0, 4).map((r) => (
              <div key={r.id} className="flex items-center gap-4 px-5 py-3.5">
                <span className="font-mono text-[12px] font-medium text-slate-ink">{r.id}</span>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-semibold text-navy-900">{r.service}</div>
                  <div className="text-[12px] text-slate-ink">{r.location} · {r.date}</div>
                </div>
                <Badge tone={statusTone[r.status]}>{r.status}</Badge>
              </div>
            ))}
          </div>
        </div>

        {/* quote status */}
        <div className="rounded-2xl border border-hairline bg-white">
          <Header title="Quote status" to="/portal/quotes" />
          <div className="space-y-3 p-5">
            {quotes.map((q) => (
              <div key={q.id} className="rounded-xl bg-mist p-4">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[12px] text-slate-ink">{q.id}</span>
                  <Badge tone={q.tone}>{q.status}</Badge>
                </div>
                <div className="font-display mt-2 text-xl font-extrabold text-navy-900">{q.amount}</div>
                <div className="font-mono text-[11px] text-slate-ink/70">Ref {q.ref} · {q.date}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* messages */}
        <div className="rounded-2xl border border-hairline bg-white lg:col-span-2">
          <Header title="Latest messages" />
          <div className="divide-y divide-hairline">
            {messages.map((m, i) => (
              <div key={i} className="flex gap-3.5 px-5 py-3.5">
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-navy-900/8 text-navy-900">
                  <MessageSquare className="h-4.5 w-4.5" />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-navy-900">{m.from}</span>
                    {m.unread && <span className="h-2 w-2 rounded-full bg-gold-400" />}
                  </div>
                  <div className="truncate text-[13px] text-slate-ink">{m.text}</div>
                </div>
                <span className="font-mono shrink-0 text-[11px] text-slate-ink/60">{m.time}</span>
              </div>
            ))}
          </div>
        </div>

        {/* quick actions + docs */}
        <div className="space-y-6">
          <div className="rounded-2xl border border-hairline bg-white p-5">
            <h3 className="font-display text-sm font-bold text-navy-900">Quick actions</h3>
            <div className="mt-4 grid grid-cols-2 gap-3">
              {[
                { to: "/portal/new-request", icon: FilePlus2, l: "Submit RFQ" },
                { to: "/portal/quotes", icon: ReceiptText, l: "View Quotes" },
                { to: "/portal/accommodation", icon: BedDouble, l: "Accommodation" },
                { to: "/portal/requests", icon: ClipboardList, l: "Track Status" },
              ].map((a) => (
                <Link key={a.l} to={a.to} className="flex flex-col items-center gap-2 rounded-xl border border-hairline bg-mist p-4 text-center transition-colors hover:border-navy-900/20 hover:bg-white">
                  <a.icon className="h-5 w-5 text-navy-900" />
                  <span className="text-[12px] font-semibold text-navy-900">{a.l}</span>
                </Link>
              ))}
            </div>
          </div>
          <div className="rounded-2xl border border-hairline bg-white">
            <Header title="Recent documents" to="/portal/documents" />
            <div className="space-y-1 px-3 pb-3">
              {documents.slice(0, 3).map((d) => (
                <div key={d.name} className="flex items-center gap-3 rounded-lg px-2 py-2 hover:bg-mist">
                  <span className="grid h-9 w-9 place-items-center rounded-lg bg-rose-50 text-rose-600"><FileText className="h-4 w-4" /></span>
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-[13px] font-medium text-navy-900">{d.name}</div>
                    <div className="font-mono text-[11px] text-slate-ink/70">{d.size} · {d.date}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Header({ title, to }: { title: string; to?: string }) {
  return (
    <div className="flex items-center justify-between border-b border-hairline px-5 py-4">
      <h3 className="font-display text-sm font-bold text-navy-900">{title}</h3>
      {to && (
        <Link to={to} className="inline-flex items-center gap-1 text-[12px] font-semibold text-navy-900 hover:text-gold-500">
          View all <ArrowUpRight className="h-3.5 w-3.5" />
        </Link>
      )}
    </div>
  );
}
