import { useState } from "react";
import { ChevronDown, Upload, Send } from "lucide-react";
import { Badge } from "../../components/ui";
import { requests as seed, statusOrder, statusTone, clients, type Status } from "../../portalData";

export default function AdminRequests() {
  const [rows, setRows] = useState(
    seed.map((r, i) => ({ ...r, client: clients[i % clients.length].name })),
  );
  const [openId, setOpenId] = useState<string | null>(null);

  const update = (id: string, status: Status) => {
    setRows((rs) => rs.map((r) => (r.id === id ? { ...r, status } : r)));
    setOpenId(null);
  };

  return (
    <div className="space-y-6 text-white">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-extrabold tracking-tight md:text-3xl">Service requests</h1>
          <p className="mt-1 text-sm text-white/50">Review requests, update statuses and issue quotations.</p>
        </div>
        <div className="flex gap-2">
          <button className="inline-flex items-center gap-2 rounded-lg border border-white/10 px-4 py-2.5 text-sm font-semibold text-white/70 hover:bg-white/5"><Upload className="h-4 w-4" /> Upload doc</button>
          <button className="inline-flex items-center gap-2 rounded-lg bg-gold-400 px-4 py-2.5 text-sm font-semibold text-navy-900 hover:bg-gold-300"><Send className="h-4 w-4" /> Send quote</button>
        </div>
      </div>

      <div className="overflow-visible rounded-2xl border border-white/8 bg-white/[0.03]">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[820px] text-left text-sm">
            <thead className="font-mono border-b border-white/8 text-[11px] uppercase tracking-wider text-white/40">
              <tr>
                <th className="px-5 py-3 font-medium">Ref</th>
                <th className="px-5 py-3 font-medium">Client</th>
                <th className="px-5 py-3 font-medium">Service</th>
                <th className="px-5 py-3 font-medium">Urgency</th>
                <th className="px-5 py-3 font-medium">Update status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {rows.map((r) => (
                <tr key={r.id} className="transition-colors hover:bg-white/[0.03]">
                  <td className="font-mono px-5 py-4 text-white/70">{r.id}</td>
                  <td className="px-5 py-4 font-medium text-white">{r.client}</td>
                  <td className="px-5 py-4 text-white/60">{r.service}</td>
                  <td className="px-5 py-4">
                    <Badge tone={r.urgency === "High" ? "red" : r.urgency === "Medium" ? "amber" : "gray"}>{r.urgency}</Badge>
                  </td>
                  <td className="relative px-5 py-4">
                    <button
                      onClick={() => setOpenId(openId === r.id ? null : r.id)}
                      className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 hover:bg-white/10"
                    >
                      <Badge tone={statusTone[r.status]}>{r.status}</Badge>
                      <ChevronDown className="h-3.5 w-3.5 text-white/50" />
                    </button>
                    {openId === r.id && (
                      <div className="absolute left-5 z-20 mt-2 w-52 overflow-hidden rounded-xl border border-white/10 bg-navy-900 shadow-2xl">
                        {statusOrder.map((s) => (
                          <button
                            key={s}
                            onClick={() => update(r.id, s)}
                            className={`flex w-full items-center px-4 py-2.5 text-left text-[13px] transition-colors hover:bg-white/10 ${s === r.status ? "text-gold-400" : "text-white/70"}`}
                          >
                            {s}
                          </button>
                        ))}
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <p className="font-mono text-[11px] text-white/30">Tip: click a status to update it — changes reflect instantly in this prototype.</p>
    </div>
  );
}
