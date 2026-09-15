import { BedDouble, Users, CalendarRange, ArrowUpRight } from "lucide-react";
import { Link } from "react-router-dom";
import { Badge } from "../../components/ui";
import { bookings, camps } from "../../portalData";

export default function AdminRoster() {
  const totalCapacity = camps.reduce((s, c) => s + c.capacity, 0);
  const totalAllocated = camps.reduce((s, c) => s + c.allocated, 0);
  const util = Math.round((totalAllocated / totalCapacity) * 100);

  const summary = [
    { l: "Total capacity", v: `${totalCapacity} beds`, icon: BedDouble },
    { l: "Allocated", v: `${totalAllocated} beds`, icon: Users },
    { l: "Available", v: `${totalCapacity - totalAllocated} beds`, icon: BedDouble },
    { l: "Utilisation", v: `${util}%`, icon: ArrowUpRight },
  ];

  return (
    <div className="space-y-6 text-white">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-extrabold tracking-tight md:text-3xl">Accommodation roster</h1>
          <p className="mt-1 text-sm text-white/50">Allocated beds vs available capacity across all camps.</p>
        </div>
        <Link to="/admin/requests" className="inline-flex items-center gap-1 text-[12px] font-semibold text-gold-400 hover:text-gold-300">RFQ pipeline <ArrowUpRight className="h-3.5 w-3.5" /></Link>
      </div>

      {/* summary */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {summary.map((s) => (
          <div key={s.l} className="rounded-2xl border border-white/8 bg-white/[0.03] p-5">
            <span className="grid h-11 w-11 place-items-center rounded-xl bg-gold-400/15 text-gold-400"><s.icon className="h-5 w-5" /></span>
            <div className="font-display mt-4 text-3xl font-extrabold">{s.v}</div>
            <div className="mt-0.5 text-sm text-white/60">{s.l}</div>
          </div>
        ))}
      </div>

      {/* camp utilisation */}
      <div className="rounded-2xl border border-white/8 bg-white/[0.03] p-6">
        <h3 className="font-display text-sm font-bold">Camp utilisation</h3>
        <div className="mt-6 space-y-5">
          {camps.map((c) => {
            const pct = Math.round((c.allocated / c.capacity) * 100);
            return (
              <div key={c.name}>
                <div className="flex justify-between text-[13px]">
                  <span className="font-medium text-white/80">{c.name}</span>
                  <span className="font-mono text-white/60">{c.allocated}/{c.capacity} · {pct}%</span>
                </div>
                <div className="mt-2 h-2.5 overflow-hidden rounded-full bg-white/8">
                  <div className={`h-full rounded-full ${pct > 80 ? "bg-rose-400" : "bg-gold-400"}`} style={{ width: `${pct}%` }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* allocations table */}
      <div className="overflow-hidden rounded-2xl border border-white/8 bg-white/[0.03]">
        <div className="border-b border-white/8 px-5 py-4">
          <h3 className="font-display text-sm font-bold">Current allocations</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="font-mono border-b border-white/8 text-[11px] uppercase tracking-wider text-white/40">
              <tr>
                <th className="px-5 py-3 font-medium">Ref</th>
                <th className="px-5 py-3 font-medium">Team</th>
                <th className="px-5 py-3 font-medium">Camp</th>
                <th className="px-5 py-3 font-medium">Beds</th>
                <th className="px-5 py-3 font-medium">Dates</th>
                <th className="px-5 py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {bookings.map((b) => (
                <tr key={b.id} className="hover:bg-white/[0.02]">
                  <td className="px-5 py-4 font-mono text-[12px] text-white/40">{b.id}</td>
                  <td className="px-5 py-4 font-medium">{b.guest}</td>
                  <td className="px-5 py-4 text-white/60">{b.camp}</td>
                  <td className="px-5 py-4 font-mono">{b.beds}</td>
                  <td className="px-5 py-4 text-white/60">
                    <span className="flex items-center gap-1.5 text-[13px]"><CalendarRange className="h-4 w-4 text-white/30" />{b.checkIn} → {b.checkOut}</span>
                  </td>
                  <td className="px-5 py-4"><Badge tone={b.tone}>{b.status}</Badge></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
