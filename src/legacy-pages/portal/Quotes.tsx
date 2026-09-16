import { useEffect, useState } from "react";
import { Check, X } from "lucide-react";
import { Badge, Button } from "../../components/ui";
import { supabase } from "../../lib/supabaseClient";

type Quote = {
  id: string;
  reference: string;
  requestReference: string;
  amount: number;
  validUntil: string | null;
  notes: string | null;
  status: "Awaiting approval" | "Approved" | "Declined";
  createdAt: string;
};

const tone: Record<Quote["status"], "amber" | "green" | "red"> = {
  "Awaiting approval": "amber",
  Approved: "green",
  Declined: "red",
};

export default function Quotes() {
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updating, setUpdating] = useState<string | null>(null);

  useEffect(() => {
    void supabase.from("quotes").select("id, reference, amount, valid_until, notes, status, created_at, service_requests(reference)").order("created_at", { ascending: false }).then(({ data, error: queryError }) => {
      if (queryError) setError(queryError.message);
      else setQuotes((data ?? []).map((quote) => {
        const request = Array.isArray(quote.service_requests) ? quote.service_requests[0] : quote.service_requests;
        return {
          id: quote.id,
          reference: quote.reference,
          requestReference: request?.reference ?? "Unknown request",
          amount: Number(quote.amount),
          validUntil: quote.valid_until,
          notes: quote.notes,
          status: quote.status,
          createdAt: quote.created_at,
        };
      }));
      setLoading(false);
    });
  }, []);

  const decide = async (id: string, status: "Approved" | "Declined") => {
    setUpdating(id);
    const { error: updateError } = await supabase.rpc("respond_to_quote", { p_quote_id: id, p_status: status });
    if (updateError) setError(updateError.message);
    else setQuotes((current) => current.map((quote) => quote.id === id ? { ...quote, status } : quote));
    setUpdating(null);
  };

  const awaiting = quotes.filter((quote) => quote.status === "Awaiting approval");
  const approved = quotes.filter((quote) => quote.status === "Approved");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-extrabold tracking-tight text-navy-900 md:text-3xl">Quotes & estimates</h1>
        <p className="mt-1 text-sm text-slate-ink">Review, approve or download your quotations.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        {[
          { l: "Total value", v: `R ${quotes.reduce((sum, quote) => sum + quote.amount, 0).toLocaleString("en-ZA", { minimumFractionDigits: 2 })}` },
          { l: "Awaiting approval", v: String(awaiting.length) },
          { l: "Approved", v: String(approved.length) },
        ].map((s) => (
          <div key={s.l} className="rounded-2xl border border-hairline bg-white p-5">
            <div className="font-mono text-[11px] uppercase tracking-wider text-slate-ink">{s.l}</div>
            <div className="font-display mt-2 text-2xl font-extrabold text-navy-900">{s.v}</div>
          </div>
        ))}
      </div>

      <div className="space-y-4">
        {loading && <p className="rounded-2xl border border-hairline bg-white p-8 text-center text-slate-ink">Loading quotations...</p>}
        {!loading && error && <p role="alert" className="rounded-2xl border border-rose-200 bg-rose-50 p-8 text-center text-rose-700">{error}</p>}
        {!loading && !error && quotes.length === 0 && <p className="rounded-2xl border border-hairline bg-white p-8 text-center text-slate-ink">No quotations yet.</p>}
        {!loading && !error && quotes.map((q) => (
          <div key={q.id} className="flex flex-wrap items-center gap-4 rounded-2xl border border-hairline bg-white p-5">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2.5">
                <span className="font-mono text-sm font-semibold text-navy-900">{q.reference}</span>
                <Badge tone={tone[q.status]}>{q.status}</Badge>
              </div>
              <div className="font-mono mt-1 text-[12px] text-slate-ink">Against request {q.requestReference} · Issued {new Date(q.createdAt).toLocaleDateString("en-ZA")}</div>
              {q.validUntil && <div className="mt-1 text-xs text-slate-ink">Valid until {q.validUntil}</div>}
              {q.notes && <p className="mt-2 text-sm text-slate-ink">{q.notes}</p>}
            </div>
            <div className="font-display text-2xl font-extrabold text-navy-900">R {q.amount.toLocaleString("en-ZA", { minimumFractionDigits: 2 })}</div>
            <div className="flex gap-2">
              {q.status === "Awaiting approval" ? (
                <>
                  <Button variant="primary" size="sm" onClick={() => void decide(q.id, "Approved")} disabled={updating === q.id}><Check className="h-4 w-4" /> Approve</Button>
                  <Button variant="ghost" size="sm" onClick={() => void decide(q.id, "Declined")} disabled={updating === q.id}><X className="h-4 w-4" /> Decline</Button>
                </>
              ) : null}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
