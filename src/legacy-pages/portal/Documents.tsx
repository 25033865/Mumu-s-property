import { useEffect, useState } from "react";
import { FileText, Download } from "lucide-react";
import { Badge } from "../../components/ui";
import { supabase } from "../../lib/supabaseClient";

const typeTone: Record<string, "blue" | "green" | "amber" | "navy"> = {
  Quote: "blue", Delivery: "green", Compliance: "amber", Contract: "navy",
};

export default function Documents() {
  const [documents, setDocuments] = useState<Array<{ id: string; name: string; type: string; size: string; date: string; path: string }>>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [downloading, setDownloading] = useState<string | null>(null);

  useEffect(() => {
    void supabase.from("documents").select("id, name, document_type, size_bytes, created_at, path").order("created_at", { ascending: false }).then(({ data, error: queryError }) => {
      if (queryError) setError(queryError.message);
      else setDocuments((data ?? []).map((document) => ({
        id: document.id,
        name: document.name,
        type: document.document_type,
        size: document.size_bytes ? `${Math.max(1, Math.round(document.size_bytes / 1024))} KB` : "File",
        date: new Date(document.created_at).toLocaleDateString("en-ZA"),
        path: document.path,
      })));
      setLoading(false);
    });
  }, []);

  const download = async (document: { id: string; path: string }) => {
    setDownloading(document.id);
    const { data, error: downloadError } = await supabase.storage.from("documents").createSignedUrl(document.path, 60);
    if (downloadError || !data?.signedUrl) setError(downloadError?.message ?? "Could not prepare the download.");
    else window.open(data.signedUrl, "_blank", "noopener,noreferrer");
    setDownloading(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-extrabold tracking-tight text-navy-900 md:text-3xl">Documents</h1>
          <p className="mt-1 text-sm text-slate-ink">Quotes, delivery notes, compliance certificates and contracts.</p>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-hairline bg-white">
        <div className="divide-y divide-hairline">
          {loading && <p className="p-8 text-center text-slate-ink">Loading documents...</p>}
          {!loading && error && <p role="alert" className="p-8 text-center text-rose-600">{error}</p>}
          {!loading && !error && documents.length === 0 && <p className="p-8 text-center text-slate-ink">No documents available yet.</p>}
          {!loading && !error && documents.map((d) => (
            <div key={d.name} className="flex items-center gap-4 px-5 py-4 transition-colors hover:bg-mist">
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-rose-50 text-rose-600">
                <FileText className="h-5 w-5" />
              </span>
              <div className="min-w-0 flex-1">
                <div className="truncate text-sm font-semibold text-navy-900">{d.name}</div>
                <div className="font-mono text-[11px] text-slate-ink/70">{d.size} · {d.date}</div>
              </div>
              <Badge tone={typeTone[d.type]}>{d.type}</Badge>
              <button type="button" onClick={() => void download(d)} disabled={downloading === d.id} className="inline-flex h-9 items-center justify-center gap-2 rounded-lg px-4 text-[13px] font-semibold text-navy-900 hover:bg-navy-900/5 disabled:opacity-50">
                <Download className="h-4 w-4" /> {downloading === d.id ? "Preparing..." : "Download"}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
