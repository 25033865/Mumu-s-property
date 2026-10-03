import { useEffect, useState } from "react";
import { Download, FileText } from "lucide-react";
import { Badge } from "../../components/ui";
import { downloadStorageFile } from "../../lib/downloadFile";
import { supabase } from "../../lib/supabaseClient";

type DocumentRow = { id: string; name: string; document_type: "Quote" | "Delivery" | "Compliance" | "Contract" | "Other"; size_bytes: number | null; created_at: string; path: string; user_id: string; service_requests: { reference?: string } | { reference?: string }[] | null };
const tones: Record<DocumentRow["document_type"], "blue" | "green" | "amber" | "navy" | "gray"> = { Quote: "blue", Delivery: "green", Compliance: "amber", Contract: "navy", Other: "gray" };

export default function AdminDocuments() {
  const [documents, setDocuments] = useState<DocumentRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState<string | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    void supabase.from("documents").select("id, name, document_type, size_bytes, created_at, path, user_id, service_requests(reference)").order("created_at", { ascending: false }).then(({ data, error: queryError }) => {
      if (queryError) setError(queryError.message);
      else setDocuments((data ?? []) as DocumentRow[]);
      setLoading(false);
    });
  }, []);

  const download = async (document: DocumentRow) => {
    setDownloading(document.id);
    const { error: downloadError } = await downloadStorageFile("documents", document.path, document.name).then(() => ({ error: null })).catch((downloadFailure) => ({ error: downloadFailure instanceof Error ? downloadFailure.message : "Could not download the document." }));
    if (downloadError) setError(downloadError);
    setDownloading(null);
  };

  const requestReference = (document: DocumentRow) => {
    const relation = Array.isArray(document.service_requests) ? document.service_requests[0] : document.service_requests;
    return relation?.reference ?? "General document";
  };

  return (
    <div className="space-y-6 text-white"><div><h1 className="font-display text-2xl font-extrabold tracking-tight md:text-3xl">Documents</h1><p className="mt-1 text-sm text-white/50">Client documents, quotes and compliance files.</p></div>{error && <p role="alert" className="text-sm text-rose-300">{error}</p>}<div className="overflow-hidden rounded-2xl border border-white/8 bg-white/[0.03]"><div className="divide-y divide-white/5">{loading && <p className="p-8 text-center text-white/50">Loading documents...</p>}{!loading && !error && documents.length === 0 && <p className="p-8 text-center text-white/50">No documents uploaded yet.</p>}{!loading && documents.map((document) => <div key={document.id} className="flex flex-wrap items-center gap-4 px-5 py-4 hover:bg-white/[0.03]"><span className="grid h-10 w-10 place-items-center rounded-xl bg-white/8 text-gold-400"><FileText className="h-5 w-5" /></span><div className="min-w-0 flex-1"><div className="truncate text-sm font-semibold">{document.name}</div><div className="text-xs text-white/40">{requestReference(document)} · {document.size_bytes ? `${Math.max(1, Math.round(document.size_bytes / 1024))} KB` : "File"}</div></div><Badge tone={tones[document.document_type]}>{document.document_type}</Badge><button type="button" onClick={() => void download(document)} disabled={downloading === document.id} className="inline-flex items-center gap-2 rounded-lg border border-white/10 px-3 py-2 text-xs font-semibold text-white/75 hover:bg-white/5 disabled:opacity-50"><Download className="h-4 w-4" />{downloading === document.id ? "Saving..." : "Download"}</button></div>)}</div></div></div>
  );
}
