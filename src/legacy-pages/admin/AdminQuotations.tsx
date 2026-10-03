import { useEffect, useState } from "react";
import { Badge } from "../../components/ui";
import { supabase } from "../../lib/supabaseClient";

type Quote = { id: string; reference: string; amount: number; status: "Awaiting approval" | "Approved" | "Declined"; valid_until: string | null; created_at: string; service_requests: { reference?: string; category?: string } | { reference?: string; category?: string }[] | null };

export default function AdminQuotations() {
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    void supabase.from("quotes").select("id, reference, amount, status, valid_until, created_at, service_requests(reference, category)").order("created_at", { ascending: false }).then(({ data, error: queryError }) => {
      if (queryError) setError(queryError.message);
      else setQuotes((data ?? []) as Quote[]);
      setLoading(false);
    });
  }, []);

  const totalValue = quotes.reduce((total, quote) => total + Number(quote.amount), 0);
  const serviceName = (quote: Quote) => {
    const relation = Array.isArray(quote.service_requests) ? quote.service_requests[0] : quote.service_requests;
    return relation?.category ?? "Service request";
  };

  return (
    <div className="space-y-6 text-white">
      <div><h1 className="font-display text-2xl font-extrabold tracking-tight md:text-3xl">Quotations</h1><p className="mt-1 text-sm text-white/50">Review every quote issued to clients.</p></div>
      <div className="grid gap-4 sm:grid-cols-3"><div className="rounded-2xl border border-white/8 bg-white/[0.03] p-5"><div className="font-display text-3xl font-extrabold">{quotes.length}</div><div className="mt-1 text-sm text-white/55">Total quotations</div></div><div className="rounded-2xl border border-white/8 bg-white/[0.03] p-5"><div className="font-display text-3xl font-extrabold">R {totalValue.toLocaleString("en-ZA")}</div><div className="mt-1 text-sm text-white/55">Quoted value</div></div><div className="rounded-2xl border border-white/8 bg-white/[0.03] p-5"><div className="font-display text-3xl font-extrabold">{quotes.filter((quote) => quote.status === "Awaiting approval").length}</div><div className="mt-1 text-sm text-white/55">Awaiting approval</div></div></div>
      {error && <p role="alert" className="text-sm text-rose-300">{error}</p>}
      <div className="overflow-hidden rounded-2xl border border-white/8 bg-white/[0.03]"><div className="overflow-x-auto"><table className="w-full min-w-[760px] text-left text-sm"><thead className="font-mono border-b border-white/8 text-[11px] uppercase tracking-wider text-white/40"><tr><th className="px-5 py-3 font-medium">Reference</th><th className="px-5 py-3 font-medium">Service</th><th className="px-5 py-3 font-medium">Amount</th><th className="px-5 py-3 font-medium">Valid until</th><th className="px-5 py-3 font-medium">Status</th></tr></thead><tbody className="divide-y divide-white/5">{loading && <tr><td colSpan={5} className="px-5 py-12 text-center text-white/50">Loading quotations...</td></tr>}{!loading && !error && quotes.length === 0 && <tr><td colSpan={5} className="px-5 py-12 text-center text-white/50">No quotations yet.</td></tr>}{!loading && quotes.map((quote) => <tr key={quote.id} className="hover:bg-white/[0.03]"><td className="px-5 py-4 font-mono text-white/75">{quote.reference}</td><td className="px-5 py-4 text-white/70">{serviceName(quote)}</td><td className="px-5 py-4 font-mono">R {Number(quote.amount).toLocaleString("en-ZA")}</td><td className="px-5 py-4 text-white/55">{quote.valid_until ?? "No expiry"}</td><td className="px-5 py-4"><Badge tone={quote.status === "Approved" ? "green" : quote.status === "Declined" ? "red" : "amber"}>{quote.status}</Badge></td></tr>)}</tbody></table></div></div>
    </div>
  );
}
