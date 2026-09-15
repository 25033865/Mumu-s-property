import { BedDouble, MapPin, CalendarRange, Plus } from "lucide-react";
import { Badge, Button } from "../../components/ui";
import { bookings, camps } from "../../portalData";

export default function Accommodation() {
  const totalBeds = bookings.filter((b) => b.status !== "Completed").reduce((s, b) => s + b.beds, 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-extrabold tracking-tight text-navy-900 md:text-3xl">Accommodation bookings</h1>
          <p className="mt-1 text-sm text-slate-ink">Active contractor and project-team accommodation across our camps.</p>
        </div>
        <Button to="/portal/new-request" variant="gold"><Plus className="h-4 w-4" /> Request Accommodation</Button>
      </div>

      {/* camp capacity */}
      <div className="grid gap-4 sm:grid-cols-3">
        {camps.map((c) => {
          const pct = Math.round((c.allocated / c.capacity) * 100);
          return (
            <div key={c.name} className="rounded-2xl border border-hairline bg-white p-5">
              <div className="flex items-center gap-2 text-navy-900">
                <MapPin className="h-4 w-4 text-gold-500" />
                <span className="font-display text-sm font-bold">{c.name}</span>
              </div>
              <div className="font-display mt-3 text-2xl font-extrabold text-navy-900">
                {c.allocated}<span className="text-base font-semibold text-slate-ink"> / {c.capacity} beds</span>
              </div>
              <div className="mt-3 h-2 overflow-hidden rounded-full bg-mist">
                <div className="h-full rounded-full bg-gold-400" style={{ width: `${pct}%` }} />
              </div>
              <div className="font-mono mt-2 text-[11px] text-slate-ink/70">{c.capacity - c.allocated} beds available</div>
            </div>
          );
        })}
      </div>

      {/* bookings table */}
      <div className="overflow-hidden rounded-2xl border border-hairline bg-white">
        <div className="flex items-center justify-between border-b border-hairline px-5 py-4">
          <h3 className="font-display text-sm font-bold text-navy-900">Your bookings</h3>
          <span className="font-mono text-[11px] uppercase tracking-wider text-slate-ink/70">{totalBeds} beds currently allocated</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="font-mono border-b border-hairline bg-mist text-[11px] uppercase tracking-wider text-slate-ink">
              <tr>
                <th className="px-5 py-3 font-medium">Ref</th>
                <th className="px-5 py-3 font-medium">Team</th>
                <th className="px-5 py-3 font-medium">Camp</th>
                <th className="px-5 py-3 font-medium">Beds</th>
                <th className="px-5 py-3 font-medium">Dates</th>
                <th className="px-5 py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-hairline">
              {bookings.map((b) => (
                <tr key={b.id} className="hover:bg-mist">
                  <td className="px-5 py-4 font-mono text-[12px] text-slate-ink">{b.id}</td>
                  <td className="px-5 py-4 font-semibold text-navy-900">
                    <span className="flex items-center gap-2"><BedDouble className="h-4 w-4 text-gold-500" />{b.guest}</span>
                  </td>
                  <td className="px-5 py-4 text-slate-ink">{b.camp}</td>
                  <td className="px-5 py-4 font-mono text-navy-900">{b.beds}</td>
                  <td className="px-5 py-4 text-slate-ink">
                    <span className="flex items-center gap-1.5 text-[13px]"><CalendarRange className="h-4 w-4 text-slate-ink/50" />{b.checkIn} → {b.checkOut}</span>
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
