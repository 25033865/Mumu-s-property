import { FileText, Download, Upload } from "lucide-react";
import { Badge, Button } from "../../components/ui";
import { documents } from "../../portalData";

const typeTone: Record<string, "blue" | "green" | "amber" | "navy"> = {
  Quote: "blue", Delivery: "green", Compliance: "amber", Contract: "navy",
};

export default function Documents() {
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-extrabold tracking-tight text-navy-900 md:text-3xl">Documents</h1>
          <p className="mt-1 text-sm text-slate-ink">Quotes, delivery notes, compliance certificates and contracts.</p>
        </div>
        <Button variant="gold"><Upload className="h-4 w-4" /> Upload document</Button>
      </div>

      <div className="overflow-hidden rounded-2xl border border-hairline bg-white">
        <div className="divide-y divide-hairline">
          {documents.map((d) => (
            <div key={d.name} className="flex items-center gap-4 px-5 py-4 transition-colors hover:bg-mist">
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-rose-50 text-rose-600">
                <FileText className="h-5 w-5" />
              </span>
              <div className="min-w-0 flex-1">
                <div className="truncate text-sm font-semibold text-navy-900">{d.name}</div>
                <div className="font-mono text-[11px] text-slate-ink/70">{d.size} · {d.date}</div>
              </div>
              <Badge tone={typeTone[d.type]}>{d.type}</Badge>
              <Button variant="ghost" size="sm"><Download className="h-4 w-4" /> Download</Button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
