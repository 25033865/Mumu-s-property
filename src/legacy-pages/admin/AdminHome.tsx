import { Link } from "react-router-dom";
import { Pickaxe, ReceiptText, TrendingUp, PackageX, ArrowUpRight, CheckCircle2 } from "lucide-react";
import { requests, clients, statusOrder, statusTone } from "../../portalData";
import { Badge } from "../../components/ui";

const kpis = [
  { l: "Total quotations", v: "R 1.42M", d: "11 awaiting approval", icon: ReceiptText },
  { l: "Active mining clients", v: "23", d: "+4 this month", icon: Pickaxe },
  { l: "Revenue (QTD)", v: "R 8.9M", d: "+18% vs last quarter", icon: TrendingUp },
  { l: "Inventory reorder alerts", v: "7", d: "3 critical PPE lines", icon: PackageX },
];

const revenue = [
  { m: "Apr", v: 62 }, { m: "May", v: 71 }, { m: "Jun", v: 58 },
  { m: "Jul", v: 84 }, { m: "Aug", v: 92 }, { m: "Sep", v: 78 },
];

const pipeline = statusOrder.map((s, i) => ({ s, n: [6, 5, 4, 3, 5, 3][i] }));
const maxPipe = Math.max(...pipeline.map((p) => p.n));

export default function AdminHome() {
  return (
    <div className="space-y-6 text-white">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-extrabold tracking-tight md:text-3xl">Business overview</h1>
          <p className="mt-1 text-sm text-white/50">Enterprise management console · MUMUS PROPERTYS operations</p>
        </div>
        <span className="font-mono text-[12px] text-white/40">Updated {new Date().toLocaleDateString("en-ZA", { day: "numeric", month: "short", year: "numeric" })}</span>
      </div>

      {/* KPIs */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {kpis.map((k) => (
          <div key={k.l} className="rounded-2xl border border-white/8 bg-white/[0.03] p-5">
            <div className="flex items-center justify-between">
              <span className="grid h-11 w-11 place-items-center rounded-xl bg-gold-400/15 text-gold-400"><k.icon className="h-5 w-5" /></span>
              <ArrowUpRight className="h-4 w-4 text-emerald-400" />
            </div>
            <div className="font-display mt-4 text-3xl font-extrabold">{k.v}</div>
            <div className="mt-0.5 text-sm text-white/60">{k.l}</div>
            <div className="font-mono mt-2 text-[11px] text-white/35">{k.d}</div>
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* revenue chart */}
        <div className="rounded-2xl border border-white/8 bg-white/[0.03] p-6 lg:col-span-2">
          <div className="flex items-center justify-between">
            <h3 className="font-display text-sm font-bold">Monthly revenue</h3>
            <Badge tone="green">+18% QoQ</Badge>
          </div>
          <div className="mt-8 flex h-52 items-end gap-4">
            {revenue.map((r) => (
              <div key={r.m} className="flex flex-1 flex-col items-center gap-2">
                <div className="flex w-full flex-1 items-end">
                  <div
                    className="w-full rounded-t-md bg-gradient-to-t from-navy-600 to-gold-400 transition-all duration-500 hover:opacity-80"
                    style={{ height: `${r.v}%` }}
                    title={`R ${(r.v / 10).toFixed(1)}M`}
                  />
                </div>
                <span className="font-mono text-[11px] text-white/40">{r.m}</span>
              </div>
            ))}
          </div>
        </div>

        {/* pipeline */}
        <div className="rounded-2xl border border-white/8 bg-white/[0.03] p-6">
          <h3 className="font-display text-sm font-bold">Request pipeline</h3>
          <div className="mt-6 space-y-3.5">
            {pipeline.map((p) => (
              <div key={p.s}>
                <div className="flex justify-between text-[12px]">
                  <span className="text-white/60">{p.s}</span>
                  <span className="font-mono text-white/80">{p.n}</span>
                </div>
                <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-white/8">
                  <div className="h-full rounded-full bg-gold-400" style={{ width: `${(p.n / maxPipe) * 100}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* recent requests */}
        <div className="rounded-2xl border border-white/8 bg-white/[0.03] lg:col-span-2">
          <div className="flex items-center justify-between border-b border-white/8 px-5 py-4">
            <h3 className="font-display text-sm font-bold">Latest RFQs</h3>
            <Link to="/admin/requests" className="inline-flex items-center gap-1 text-[12px] font-semibold text-gold-400 hover:text-gold-300">Manage <ArrowUpRight className="h-3.5 w-3.5" /></Link>
          </div>
          <div className="divide-y divide-white/5">
            {requests.slice(0, 5).map((r) => (
              <div key={r.id} className="flex items-center gap-4 px-5 py-3.5">
                <span className="font-mono text-[12px] text-white/40">{r.id}</span>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-medium">{r.service}</div>
                  <div className="text-[12px] text-white/40">{r.location}</div>
                </div>
                <Badge tone={statusTone[r.status]}>{r.status}</Badge>
              </div>
            ))}
          </div>
        </div>

        {/* top clients */}
        <div className="rounded-2xl border border-white/8 bg-white/[0.03]">
          <div className="flex items-center justify-between border-b border-white/8 px-5 py-4">
            <h3 className="font-display text-sm font-bold">Top clients</h3>
            <Link to="/admin/clients" className="text-[12px] font-semibold text-gold-400 hover:text-gold-300">All</Link>
          </div>
          <div className="divide-y divide-white/5">
            {clients.slice(0, 4).map((c) => (
              <div key={c.name} className="flex items-center gap-3 px-5 py-3.5">
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-white/8 text-[12px] font-bold">
                  {c.name.split(" ").map((w) => w[0]).slice(0, 2).join("")}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-[13px] font-medium">{c.name}</div>
                  <div className="text-[11px] text-white/40">{c.sector}</div>
                </div>
                <span className="font-mono text-[12px] text-white/60">{c.requests}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3 rounded-2xl border border-white/8 bg-white/[0.03] p-5 text-sm text-white/60">
        <CheckCircle2 className="h-5 w-5 text-emerald-400" />
        All systems operational · 0 overdue requests · SLA compliance 98.2%
      </div>
    </div>
  );
}
