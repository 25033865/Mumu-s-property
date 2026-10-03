import { useEffect, useState } from "react";
import { BarChart3, BedDouble, ClipboardList, ReceiptText } from "lucide-react";
import { supabase } from "../../lib/supabaseClient";

type RequestRow = { category: string; status: string };

export default function AdminAnalytics() {
  const [requests, setRequests] = useState<RequestRow[]>([]);
  const [quoteCount, setQuoteCount] = useState(0);
  const [quoteValue, setQuoteValue] = useState(0);
  const [occupancy, setOccupancy] = useState({ booked: 0, capacity: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    void Promise.all([
      supabase.from("service_requests").select("category, status"),
      supabase.from("quotes").select("amount"),
      supabase.from("accommodation_camps").select("capacity, booked_rooms"),
    ]).then(([requestResult, quoteResult, campResult]) => {
      const queryError = requestResult.error ?? quoteResult.error ?? campResult.error;
      if (queryError) setError(queryError.message);
      setRequests((requestResult.data ?? []) as RequestRow[]);
      setQuoteCount(quoteResult.data?.length ?? 0);
      setQuoteValue((quoteResult.data ?? []).reduce((total, quote) => total + Number(quote.amount), 0));
      setOccupancy({ booked: (campResult.data ?? []).reduce((total, camp) => total + Number(camp.booked_rooms ?? 0), 0), capacity: (campResult.data ?? []).reduce((total, camp) => total + Number(camp.capacity ?? 0), 0) });
      setLoading(false);
    });
  }, []);

  const categories = [...new Set(requests.map((request) => request.category))].map((category) => ({ category, count: requests.filter((request) => request.category === category).length })).sort((first, second) => second.count - first.count);
  const maxCategory = Math.max(...categories.map((item) => item.count), 1);
  const occupancyPercent = occupancy.capacity > 0 ? Math.round((occupancy.booked / occupancy.capacity) * 100) : 0;

  return <div className="space-y-6 text-white"><div><h1 className="font-display text-2xl font-extrabold tracking-tight md:text-3xl">Analytics</h1><p className="mt-1 text-sm text-white/50">Operational activity across requests, quotations and accommodation.</p></div>{error && <p role="alert" className="text-sm text-rose-300">{error}</p>}<div className="grid gap-4 sm:grid-cols-3"><Metric icon={ClipboardList} label="Total requests" value={loading ? "..." : String(requests.length)} /><Metric icon={ReceiptText} label="Quotation value" value={loading ? "..." : `R ${quoteValue.toLocaleString("en-ZA")}`} /><Metric icon={BedDouble} label="Room occupancy" value={loading ? "..." : `${occupancyPercent}%`} detail={`${occupancy.booked} / ${occupancy.capacity} rooms`} /></div><div className="grid gap-6 lg:grid-cols-2"><section className="rounded-2xl border border-white/8 bg-white/[0.03] p-6"><h2 className="font-display text-sm font-bold">Requests by category</h2><div className="mt-6 space-y-4">{categories.map((item) => <div key={item.category}><div className="flex justify-between text-sm"><span className="text-white/70">{item.category}</span><span className="font-mono text-white/80">{item.count}</span></div><div className="mt-2 h-2 overflow-hidden rounded-full bg-white/8"><div className="h-full rounded-full bg-gold-400" style={{ width: `${(item.count / maxCategory) * 100}%` }} /></div></div>)}{!loading && categories.length === 0 && <p className="text-sm text-white/50">No request activity yet.</p>}</div></section><section className="rounded-2xl border border-white/8 bg-white/[0.03] p-6"><h2 className="font-display text-sm font-bold">Request status</h2><div className="mt-6 grid grid-cols-2 gap-3">{["Submitted", "Under Review", "Quotation Sent", "Approved", "In Progress", "Completed"].map((status) => <div key={status} className="rounded-xl bg-white/[0.04] p-4"><div className="font-display text-2xl font-extrabold">{requests.filter((request) => request.status === status).length}</div><div className="mt-1 text-xs text-white/50">{status}</div></div>)}</div><div className="mt-4 flex items-center gap-2 text-xs text-white/45"><BarChart3 className="h-4 w-4 text-gold-400" />{quoteCount} quotations recorded</div></section></div></div>;
}

function Metric({ icon: Icon, label, value, detail }: { icon: typeof ClipboardList; label: string; value: string; detail?: string }) {
  return <div className="rounded-2xl border border-white/8 bg-white/[0.03] p-5"><span className="grid h-11 w-11 place-items-center rounded-xl bg-gold-400/15 text-gold-400"><Icon className="h-5 w-5" /></span><div className="font-display mt-4 text-3xl font-extrabold">{value}</div><div className="mt-1 text-sm text-white/60">{label}</div>{detail && <div className="font-mono mt-2 text-[11px] text-white/35">{detail}</div>}</div>;
}
