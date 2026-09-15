import { Search, Mail, Plus } from "lucide-react";
import { Badge } from "../../components/ui";
import { clients } from "../../portalData";

export default function AdminClients() {
  return (
    <div className="space-y-6 text-white">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-extrabold tracking-tight md:text-3xl">Clients</h1>
          <p className="mt-1 text-sm text-white/50">Manage all client accounts and relationships.</p>
        </div>
        <button className="inline-flex items-center gap-2 rounded-lg bg-gold-400 px-4 py-2.5 text-sm font-semibold text-navy-900 transition-colors hover:bg-gold-300">
          <Plus className="h-4 w-4" /> Add client
        </button>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" />
        <input placeholder="Search clients…" className="w-full rounded-lg border border-white/10 bg-white/5 py-2 pl-9 pr-3 text-sm text-white outline-none placeholder:text-white/40 focus:border-gold-400/50" />
      </div>

      <div className="overflow-hidden rounded-2xl border border-white/8 bg-white/[0.03]">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[700px] text-left text-sm">
            <thead className="font-mono border-b border-white/8 text-[11px] uppercase tracking-wider text-white/40">
              <tr>
                <th className="px-5 py-3 font-medium">Company</th>
                <th className="px-5 py-3 font-medium">Primary contact</th>
                <th className="px-5 py-3 font-medium">Sector</th>
                <th className="px-5 py-3 font-medium">Requests</th>
                <th className="px-5 py-3 font-medium">Status</th>
                <th className="px-5 py-3 font-medium"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {clients.map((c) => (
                <tr key={c.name} className="transition-colors hover:bg-white/[0.03]">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <span className="grid h-9 w-9 place-items-center rounded-full bg-white/8 text-[12px] font-bold text-white">
                        {c.name.split(" ").map((w) => w[0]).slice(0, 2).join("")}
                      </span>
                      <span className="font-medium text-white">{c.name}</span>
                    </div>
                  </td>
                  <td className="px-5 py-4 text-white/60">{c.contact}</td>
                  <td className="px-5 py-4 text-white/60">{c.sector}</td>
                  <td className="font-mono px-5 py-4 text-white/80">{c.requests}</td>
                  <td className="px-5 py-4"><Badge tone={c.status === "Active" ? "green" : "amber"}>{c.status}</Badge></td>
                  <td className="px-5 py-4 text-right">
                    <button className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 px-3 py-1.5 text-[12px] font-semibold text-white/70 hover:bg-white/5">
                      <Mail className="h-3.5 w-3.5" /> Message
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
