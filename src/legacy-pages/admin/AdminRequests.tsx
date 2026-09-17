import { useEffect, useState } from "react";
import { ChevronDown, FilePlus2, Upload, X } from "lucide-react";
import { Badge } from "../../components/ui";
import { statusOrder, statusTone, type Status } from "../../portalData";
import { supabase } from "../../lib/supabaseClient";

export default function AdminRequests() {
  const [rows, setRows] = useState<Array<{ id: string; client: string; company: string; service: string; urgency: string; status: Status; requestId: string; userId: string; quoteStatus: "Awaiting approval" | "Approved" | "Declined" | null; quoteReference: string | null }>>([]);
  const [openId, setOpenId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [quoteFor, setQuoteFor] = useState<string | null>(null);
  const [quoteAmount, setQuoteAmount] = useState("");
  const [quoteValidUntil, setQuoteValidUntil] = useState("");
  const [quoteNotes, setQuoteNotes] = useState("");
  const [quoteSubmitting, setQuoteSubmitting] = useState(false);
  const [documentFor, setDocumentFor] = useState<string | null>(null);
  const [documentType, setDocumentType] = useState("Quote");
  const [documentFile, setDocumentFile] = useState<File | null>(null);
  const [documentSubmitting, setDocumentSubmitting] = useState(false);

  useEffect(() => {
    void supabase.from("service_requests").select("id, reference, category, urgency, status, user_id, requester_name, company_name, quotes(reference, status)").order("created_at", { ascending: false }).then(({ data, error: queryError }) => {
      if (queryError) setError(queryError.message);
      else setRows((data ?? []).map((r) => ({
        id: r.reference,
        requestId: r.id,
        userId: r.user_id,
        client: r.requester_name || "Unknown client",
        company: r.company_name || "Company not provided",
        service: r.category,
        urgency: r.urgency,
        status: r.status as Status,
        quoteStatus: Array.isArray(r.quotes) && r.quotes.length > 0 ? r.quotes[r.quotes.length - 1].status : null,
        quoteReference: Array.isArray(r.quotes) && r.quotes.length > 0 ? r.quotes[r.quotes.length - 1].reference : null,
      })));
      setLoading(false);
    });
  }, []);

  const update = (id: string, status: Status) => {
    void supabase.from("service_requests").update({ status }).eq("id", id).then(({ error: updateError }) => {
      if (updateError) setError(updateError.message);
      else setRows((rs) => rs.map((r) => (r.requestId === id ? { ...r, status } : r)));
      setOpenId(null);
    });
  };

  const createQuote = async (requestId: string, userId: string) => {
    const amount = Number(quoteAmount);
    if (!amount || amount < 0) {
      setError("Enter a valid quotation amount.");
      return;
    }
    setQuoteSubmitting(true);
    const { error: quoteError } = await supabase.from("quotes").insert({
      request_id: requestId,
      user_id: userId,
      amount,
      valid_until: quoteValidUntil || null,
      notes: quoteNotes || null,
    });
    if (quoteError) setError(quoteError.message);
    else {
      await supabase.from("service_requests").update({ status: "Quotation Sent" }).eq("id", requestId);
      setRows((current) => current.map((row) => row.requestId === requestId ? { ...row, status: "Quotation Sent" } : row));
      setQuoteFor(null);
      setQuoteAmount("");
      setQuoteValidUntil("");
      setQuoteNotes("");
    }
    setQuoteSubmitting(false);
  };

  const uploadDocument = async (requestId: string, userId: string) => {
    if (!documentFile) {
      setError("Choose a document first.");
      return;
    }
    setDocumentSubmitting(true);
    const safeName = documentFile.name.replace(/[^a-zA-Z0-9._-]/g, "-");
    const path = `${userId}/${requestId}/${Date.now()}-${safeName}`;
    const { error: uploadError } = await supabase.storage.from("documents").upload(path, documentFile);
    if (uploadError) {
      setError(uploadError.message);
    } else {
      const { error: documentError } = await supabase.from("documents").insert({
        user_id: userId,
        request_id: requestId,
        name: documentFile.name,
        document_type: documentType,
        path,
        content_type: documentFile.type || null,
        size_bytes: documentFile.size,
      });
      if (documentError) setError(documentError.message);
      else {
        setDocumentFor(null);
        setDocumentFile(null);
        setDocumentType("Quote");
      }
    }
    setDocumentSubmitting(false);
  };

  return (
    <div className="space-y-6 text-white">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-extrabold tracking-tight md:text-3xl">Service requests</h1>
          <p className="mt-1 text-sm text-white/50">Review requests, update statuses and issue quotations.</p>
        </div>
      </div>

      {error && <p role="alert" className="text-sm text-rose-300">{error}</p>}
      <div className="overflow-visible rounded-2xl border border-white/8 bg-white/[0.03]">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[820px] text-left text-sm">
            <thead className="font-mono border-b border-white/8 text-[11px] uppercase tracking-wider text-white/40">
              <tr>
                <th className="px-5 py-3 font-medium">Ref</th>
                <th className="px-5 py-3 font-medium">Client</th>
                <th className="px-5 py-3 font-medium">Service</th>
                <th className="px-5 py-3 font-medium">Urgency</th>
                <th className="px-5 py-3 font-medium">Quote decision</th>
                <th className="px-5 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading && <tr><td colSpan={5} className="px-5 py-12 text-center text-white/50">Loading requests...</td></tr>}
              {!loading && rows.map((r) => (
                <tr key={r.id} className="transition-colors hover:bg-white/[0.03]">
                  <td className="font-mono px-5 py-4 text-white/70">{r.id}</td>
                  <td className="px-5 py-4">
                    <div className="font-medium text-white">{r.client}</div>
                    <div className="text-[12px] text-white/45">{r.company}</div>
                  </td>
                  <td className="px-5 py-4 text-white/60">{r.service}</td>
                  <td className="px-5 py-4">
                    <Badge tone={r.urgency === "High" ? "red" : r.urgency === "Medium" ? "amber" : "gray"}>{r.urgency}</Badge>
                  </td>
                  <td className="px-5 py-4">
                    {r.quoteStatus ? (
                      <div>
                        <Badge tone={r.quoteStatus === "Approved" ? "green" : r.quoteStatus === "Declined" ? "red" : "amber"}>{r.quoteStatus}</Badge>
                        {r.quoteReference && <div className="mt-1 font-mono text-[10px] text-white/40">{r.quoteReference}</div>}
                      </div>
                    ) : <span className="text-xs text-white/35">No quote yet</span>}
                  </td>
                  <td className="relative px-5 py-4">
                    <button
                      onClick={() => setQuoteFor(quoteFor === r.requestId ? null : r.requestId)}
                      className="mr-2 inline-flex items-center gap-2 rounded-lg bg-gold-400 px-3 py-1.5 text-xs font-semibold text-navy-900 hover:bg-gold-300"
                    >
                      <FilePlus2 className="h-3.5 w-3.5" /> Quote
                    </button>
                    <button
                      onClick={() => setDocumentFor(documentFor === r.requestId ? null : r.requestId)}
                      className="mr-2 inline-flex items-center gap-2 rounded-lg border border-white/10 px-3 py-1.5 text-xs font-semibold text-white/75 hover:bg-white/10"
                    >
                      <Upload className="h-3.5 w-3.5" /> Document
                    </button>
                    <button
                      onClick={() => setOpenId(openId === r.requestId ? null : r.requestId)}
                      className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 hover:bg-white/10"
                    >
                      <Badge tone={statusTone[r.status]}>{r.status}</Badge>
                      <ChevronDown className="h-3.5 w-3.5 text-white/50" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      {openId && (() => {
        const request = rows.find((row) => row.requestId === openId);
        if (!request) return null;
        return (
          <div
            className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 p-0 sm:items-center sm:p-6"
            role="presentation"
            onMouseDown={(event) => event.target === event.currentTarget && setOpenId(null)}
          >
            <div className="w-full rounded-t-2xl border border-white/10 bg-navy-900 p-5 shadow-2xl sm:max-w-sm sm:rounded-2xl sm:p-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="text-base font-semibold text-white">Update status</div>
                  <div className="mt-1 text-xs text-white/50">{request.id} · {request.client}</div>
                </div>
                <button type="button" onClick={() => setOpenId(null)} className="grid h-9 w-9 shrink-0 place-items-center rounded-lg text-white/60 hover:bg-white/10 hover:text-white" aria-label="Close status menu">
                  <X className="h-5 w-5" />
                </button>
              </div>
              <div className="mt-5 grid gap-2">
                {statusOrder.map((status) => (
                  <button
                    key={status}
                    type="button"
                    onClick={() => update(request.requestId, status)}
                    className={`flex w-full items-center justify-between rounded-lg border px-4 py-3 text-left text-sm transition-colors hover:bg-white/10 ${status === request.status ? "border-gold-400/50 text-gold-400" : "border-white/10 text-white/75"}`}
                  >
                    <span>{status}</span>
                    {status === request.status && <Badge tone={statusTone[status]}>{status}</Badge>}
                  </button>
                ))}
              </div>
            </div>
          </div>
        );
      })()}
      {quoteFor && (() => {
        const request = rows.find((row) => row.requestId === quoteFor);
        if (!request) return null;
        return (
          <div
            className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 p-0 sm:items-center sm:p-6"
            role="presentation"
            onMouseDown={(event) => event.target === event.currentTarget && setQuoteFor(null)}
          >
            <div className="max-h-[92vh] w-full overflow-y-auto rounded-t-2xl border border-white/10 bg-navy-900 p-5 shadow-2xl sm:max-w-lg sm:rounded-2xl sm:p-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="text-base font-semibold text-white">Create quotation</div>
                  <div className="mt-1 text-xs text-white/50">{request.id} · {request.client}</div>
                </div>
                <button type="button" onClick={() => setQuoteFor(null)} className="grid h-9 w-9 shrink-0 place-items-center rounded-lg text-white/60 hover:bg-white/10 hover:text-white" aria-label="Close quotation form">
                  <X className="h-5 w-5" />
                </button>
              </div>
              <div className="mt-5 space-y-3">
                <input type="number" min="0" step="0.01" value={quoteAmount} onChange={(event) => setQuoteAmount(event.target.value)} placeholder="Amount (R)" className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-3 text-sm text-white placeholder:text-white/40 outline-none focus:border-gold-400/60" />
                <input type="date" value={quoteValidUntil} onChange={(event) => setQuoteValidUntil(event.target.value)} className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-3 text-sm text-white outline-none focus:border-gold-400/60" />
                <textarea rows={4} value={quoteNotes} onChange={(event) => setQuoteNotes(event.target.value)} placeholder="Notes for the client" className="w-full resize-y rounded-lg border border-white/10 bg-white/5 px-3 py-3 text-sm text-white placeholder:text-white/40 outline-none focus:border-gold-400/60" />
                <button type="button" onClick={() => void createQuote(request.requestId, request.userId)} disabled={quoteSubmitting} className="w-full rounded-lg bg-gold-400 px-3 py-3 text-sm font-semibold text-navy-900 disabled:opacity-50">{quoteSubmitting ? "Sending..." : "Send quotation"}</button>
              </div>
            </div>
          </div>
        );
      })()}
      {documentFor && (() => {
        const request = rows.find((row) => row.requestId === documentFor);
        if (!request) return null;
        return (
          <div
            className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 p-0 sm:items-center sm:p-6"
            role="presentation"
            onMouseDown={(event) => event.target === event.currentTarget && setDocumentFor(null)}
          >
            <div className="w-full rounded-t-2xl border border-white/10 bg-navy-900 p-5 shadow-2xl sm:max-w-lg sm:rounded-2xl sm:p-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="text-base font-semibold text-white">Upload client document</div>
                  <div className="mt-1 text-xs text-white/50">{request.id} · {request.client}</div>
                </div>
                <button type="button" onClick={() => setDocumentFor(null)} className="grid h-9 w-9 shrink-0 place-items-center rounded-lg text-white/60 hover:bg-white/10 hover:text-white" aria-label="Close document upload">
                  <X className="h-5 w-5" />
                </button>
              </div>
              <div className="mt-5 space-y-3">
                <select value={documentType} onChange={(event) => setDocumentType(event.target.value)} className="w-full rounded-lg border border-white/10 bg-navy-950 px-3 py-3 text-sm text-white outline-none [color-scheme:dark] focus:border-gold-400/60">
                  <option className="bg-navy-950 text-white">Quote</option>
                  <option className="bg-navy-950 text-white">Delivery</option>
                  <option className="bg-navy-950 text-white">Compliance</option>
                  <option className="bg-navy-950 text-white">Contract</option>
                  <option className="bg-navy-950 text-white">Other</option>
                </select>
                <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-dashed border-white/20 bg-white/5 px-4 py-4 text-sm text-white/70 hover:border-gold-400/60">
                  <Upload className="h-5 w-5 text-gold-400" />
                  <span className="min-w-0 truncate">{documentFile?.name ?? "Choose a document"}</span>
                  <input type="file" className="hidden" onChange={(event) => setDocumentFile(event.target.files?.[0] ?? null)} />
                </label>
                <button type="button" onClick={() => void uploadDocument(request.requestId, request.userId)} disabled={documentSubmitting} className="w-full rounded-lg bg-gold-400 px-3 py-3 text-sm font-semibold text-navy-900 disabled:opacity-50">
                  {documentSubmitting ? "Uploading..." : "Upload document"}
                </button>
              </div>
            </div>
          </div>
        );
      })()}
      <p className="font-mono text-[11px] text-white/30">Tip: click a status to update it. Changes are saved to Supabase.</p>
    </div>
  );
}
