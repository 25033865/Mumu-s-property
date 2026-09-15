import { useState } from "react";
import { FilePlus2, Search } from "lucide-react";
import { Badge, Button } from "../../components/ui";
import { requests, statusOrder, statusTone, type Status } from "../../portalData";

const filters = ["All", ...statusOrder];
const urgencyTone: Record<string, "gray" | "amber" | "red"> = { Low: "gray", Medium: "amber", High: "red" };

export default function ServiceRequests() {
  const [f, setF] = useState("All");
  const [q, setQ] = useState("");
  const rows = requests.filter(
    (r) => (f === "All" || r.status === f) && (r.service.toLowerCase().includes(q.toLowerCase()) || r.id.toLowerCase().includes(q.toLowerCase())),
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-extrabold tracking-tight text-navy-900 md:text-3xl">My service requests</h1>
          <p className="mt-1 text-sm text-slate-ink">Track the status of every request across your account.</p>
        </div>
        <Button to="/portal/new-request" variant="gold"><FilePlus2 className="h-4 w-4" /> New Request</Button>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 sm:max-w-xs">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-ink/50" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search requests…" className="w-full rounded-lg border border-hairline bg-white py-2 pl-9 pr-3 text-sm outline-none focus:border-navy-900" />
        </div>
        <div className="flex flex-wrap gap-1.5">
          {filters.map((x) => (
            <button
              key={x}
              onClick={() => setF(x)}
              className={`rounded-full px-3 py-1.5 text-[12px] font-semibold transition-colors ${f === x ? "bg-navy-900 text-white" : "border border-hairline text-slate-ink hover:bg-mist"}`}
            >
              {x}
            </button>
          ))}
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-hairline bg-white">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className="font-mono border-b border-hairline bg-mist text-[11px] uppercase tracking-wider text-slate-ink">
              <tr>
                <th className="px-5 py-3 font-medium">Ref</th>
                <th className="px-5 py-3 font-medium">Service</th>
                <th className="px-5 py-3 font-medium">Location</th>
                <th className="px-5 py-3 font-medium">Urgency</th>
                <th className="px-5 py-3 font-medium">Date</th>
                <th className="px-5 py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-hairline">
              {rows.map((r) => (
                <tr key={r.id} className="transition-colors hover:bg-mist">
                  <td className="font-mono px-5 py-4 font-medium text-navy-900">{r.id}</td>
                  <td className="px-5 py-4 font-medium text-navy-900">{r.service}</td>
                  <td className="px-5 py-4 text-slate-ink">{r.location}</td>
                  <td className="px-5 py-4"><Badge tone={urgencyTone[r.urgency]}>{r.urgency}</Badge></td>
                  <td className="font-mono px-5 py-4 text-slate-ink">{r.date}</td>
                  <td className="px-5 py-4"><Badge tone={statusTone[r.status as Status]}>{r.status}</Badge></td>
                </tr>
              ))}
              {rows.length === 0 && (
                <tr><td colSpan={6} className="px-5 py-12 text-center text-slate-ink">No requests match your filters.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
