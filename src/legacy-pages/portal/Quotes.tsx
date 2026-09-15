import { Download, Check, X } from "lucide-react";
import { Badge, Button } from "../../components/ui";
import { quotes } from "../../portalData";

export default function Quotes() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-extrabold tracking-tight text-navy-900 md:text-3xl">Quotes & estimates</h1>
        <p className="mt-1 text-sm text-slate-ink">Review, approve or download your quotations.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        {[
          { l: "Total value", v: "R 706,700" },
          { l: "Awaiting approval", v: "1" },
          { l: "Approved this month", v: "1" },
        ].map((s) => (
          <div key={s.l} className="rounded-2xl border border-hairline bg-white p-5">
            <div className="font-mono text-[11px] uppercase tracking-wider text-slate-ink">{s.l}</div>
            <div className="font-display mt-2 text-2xl font-extrabold text-navy-900">{s.v}</div>
          </div>
        ))}
      </div>

      <div className="space-y-4">
        {quotes.map((q) => (
          <div key={q.id} className="flex flex-wrap items-center gap-4 rounded-2xl border border-hairline bg-white p-5">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2.5">
                <span className="font-mono text-sm font-semibold text-navy-900">{q.id}</span>
                <Badge tone={q.tone}>{q.status}</Badge>
              </div>
              <div className="font-mono mt-1 text-[12px] text-slate-ink">Against request {q.ref} · Issued {q.date}</div>
            </div>
            <div className="font-display text-2xl font-extrabold text-navy-900">{q.amount}</div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm"><Download className="h-4 w-4" /> PDF</Button>
              {q.status === "Awaiting approval" ? (
                <>
                  <Button variant="primary" size="sm"><Check className="h-4 w-4" /> Approve</Button>
                  <Button variant="ghost" size="sm"><X className="h-4 w-4" /> Decline</Button>
                </>
              ) : (
                <Button variant="ghost" size="sm">View details</Button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
