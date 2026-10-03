import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { BedDouble, CheckCircle2, ClipboardList, FileText, MessageSquare, ReceiptText, TrendingUp } from "lucide-react";
import { Badge, Button } from "../../components/ui";
import { supabase } from "../../lib/supabaseClient";

type RequestRow = { id: string; reference: string; category: string; location: string; status: string; created_at: string };
type QuoteRow = { id: string; reference: string; amount: number; status: string; created_at: string; service_requests: { reference?: string } | { reference?: string }[] | null };
type BookingRow = { id: string; guest_name: string; Rooms: number; check_in: string; check_out: string; status: string; accommodation_camps: { name?: string } | { name?: string }[] | null };
type DocumentRow = { id: string; name: string; document_type: string; size_bytes: number | null; created_at: string };

const activeBookingStatuses = new Set(["Requested", "Approved", "Active", "Cancellation Requested", "Change Requested"]);
const statusTones: Record<string, "gray" | "amber" | "blue" | "violet" | "gold" | "green" | "red"> = { Submitted: "gray", "Under Review": "amber", "Quotation Sent": "blue", Approved: "violet", "In Progress": "gold", Completed: "green", "Awaiting approval": "amber", Declined: "red" };

export default function Dashboard() {
  const [name, setName] = useState("there");
  const [requests, setRequests] = useState<RequestRow[]>([]);
  const [quotes, setQuotes] = useState<QuoteRow[]>([]);
  const [bookings, setBookings] = useState<BookingRow[]>([]);
  const [documents, setDocuments] = useState<DocumentRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    void supabase.auth.getUser().then(async ({ data, error: userError }) => {
      if (userError || !data.user) {
        setError(userError?.message ?? "Could not load your dashboard.");
        setLoading(false);
        return;
      }
      const [profileResult, requestResult, quoteResult, bookingResult, documentResult] = await Promise.all([
        supabase.from("profiles").select("first_name").eq("user_id", data.user.id).maybeSingle(),
        supabase.from("service_requests").select("id, reference, category, location, status, created_at").eq("user_id", data.user.id).order("created_at", { ascending: false }),
        supabase.from("quotes").select("id, reference, amount, status, created_at, service_requests(reference)").eq("user_id", data.user.id).order("created_at", { ascending: false }),
        supabase.from("accommodation_bookings").select('id, guest_name, "Rooms", check_in, check_out, status, accommodation_camps(name)').eq("user_id", data.user.id).order("created_at", { ascending: false }),
        supabase.from("documents").select("id, name, document_type, size_bytes, created_at").eq("user_id", data.user.id).order("created_at", { ascending: false }),
      ]);
      const queryError = profileResult.error ?? requestResult.error ?? quoteResult.error ?? bookingResult.error ?? documentResult.error;
      if (queryError) setError(queryError.message);
      const firstName = profileResult.data?.first_name ?? data.user.user_metadata.first_name ?? data.user.email?.split("@")[0] ?? "there";
      setName(firstName);
      setRequests((requestResult.data ?? []) as RequestRow[]);
      setQuotes((quoteResult.data ?? []) as QuoteRow[]);
      setBookings((bookingResult.data ?? []) as BookingRow[]);
      setDocuments((documentResult.data ?? []) as DocumentRow[]);
      setLoading(false);
    });
  }, []);

  const openRequests = requests.filter((request) => request.status !== "Completed").length;
  const pendingQuotes = quotes.filter((quote) => quote.status === "Awaiting approval").length;
  const activeBookings = bookings.filter((booking) => activeBookingStatuses.has(booking.status));
  const completedRequests = requests.filter((request) => request.status === "Completed").length;
  const quotedValue = quotes.reduce((total, quote) => total + Number(quote.amount), 0);
  const kpis = [
    { label: "Open RFQs", value: openRequests, detail: `${requests.length} total requests`, icon: ClipboardList, tone: "text-navy-900 bg-navy-900/8" },
    { label: "Pending quotations", value: pendingQuotes, detail: `R ${quotedValue.toLocaleString("en-ZA")} quoted`, icon: ReceiptText, tone: "text-amber-600 bg-amber-50" },
    { label: "Active accommodation", value: activeBookings.reduce((total, booking) => total + booking.Rooms, 0), detail: `${activeBookings.length} active bookings`, icon: BedDouble, tone: "text-blue-600 bg-blue-50" },
    { label: "Completed requests", value: completedRequests, detail: `${documents.length} documents available`, icon: CheckCircle2, tone: "text-emerald-600 bg-emerald-50" },
  ];

  const campName = (booking: BookingRow) => {
    const relation = Array.isArray(booking.accommodation_camps) ? booking.accommodation_camps[0] : booking.accommodation_camps;
    return relation?.name ?? "Accommodation";
  };
  const requestReference = (quote: QuoteRow) => {
    const relation = Array.isArray(quote.service_requests) ? quote.service_requests[0] : quote.service_requests;
    return relation?.reference ?? "Request";
  };

  return <div className="space-y-6"><div className="flex flex-wrap items-center justify-between gap-4"><div><h1 className="font-display text-2xl font-extrabold tracking-tight text-navy-900 md:text-3xl">Welcome back, {name}</h1><p className="mt-1 text-sm text-slate-ink">Here is what is happening across your account today.</p></div><Button to="/portal/new-request" variant="gold"><ClipboardList className="h-4 w-4" /> Submit RFQ</Button></div>{error && <p role="alert" className="text-sm text-rose-600">{error}</p>}<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{kpis.map((kpi) => <div key={kpi.label} className="rounded-2xl border border-hairline bg-white p-5"><div className="flex items-start justify-between"><span className={`grid h-11 w-11 place-items-center rounded-xl ${kpi.tone}`}><kpi.icon className="h-5 w-5" /></span><TrendingUp className="h-4 w-4 text-emerald-500" /></div><div className="font-display mt-4 text-3xl font-extrabold text-navy-900">{loading ? "..." : kpi.value}</div><div className="mt-0.5 text-sm font-medium text-slate-ink">{kpi.label}</div><div className="font-mono mt-2 text-[11px] text-slate-ink/70">{kpi.detail}</div></div>)}</div><div className="grid gap-6 lg:grid-cols-3"><div className="rounded-2xl border border-hairline bg-white lg:col-span-2"><div className="flex items-center justify-between border-b border-hairline px-5 py-4"><h3 className="font-display text-sm font-bold text-navy-900">Recent RFQs</h3><Link to="/portal/requests" className="text-[12px] font-semibold text-navy-900 hover:text-gold-500">View all</Link></div><div className="divide-y divide-hairline">{requests.slice(0, 5).map((request) => <div key={request.id} className="flex items-center gap-4 px-5 py-3.5"><span className="font-mono text-[12px] font-medium text-slate-ink">{request.reference}</span><div className="min-w-0 flex-1"><div className="truncate text-sm font-semibold text-navy-900">{request.category}</div><div className="text-[12px] text-slate-ink">{request.location} · {request.created_at.slice(0, 10)}</div></div><Badge tone={statusTones[request.status] ?? "gray"}>{request.status}</Badge></div>)}{!loading && requests.length === 0 && <p className="p-8 text-center text-sm text-slate-ink">No requests yet.</p>}</div></div><div className="rounded-2xl border border-hairline bg-white"><div className="flex items-center justify-between border-b border-hairline px-5 py-4"><h3 className="font-display text-sm font-bold text-navy-900">Quote status</h3><Link to="/portal/quotes" className="text-[12px] font-semibold text-navy-900 hover:text-gold-500">View all</Link></div><div className="space-y-3 p-5">{quotes.slice(0, 3).map((quote) => <div key={quote.id} className="rounded-xl bg-mist p-4"><div className="flex items-center justify-between"><span className="font-mono text-[12px] text-slate-ink">{quote.reference}</span><Badge tone={statusTones[quote.status] ?? "gray"}>{quote.status}</Badge></div><div className="font-display mt-2 text-xl font-extrabold text-navy-900">R {Number(quote.amount).toLocaleString("en-ZA")}</div><div className="font-mono text-[11px] text-slate-ink/70">Ref {requestReference(quote)} · {quote.created_at.slice(0, 10)}</div></div>)}{!loading && quotes.length === 0 && <p className="py-4 text-sm text-slate-ink">No quotations yet.</p>}</div></div></div><div className="grid gap-6 lg:grid-cols-3"><div className="rounded-2xl border border-hairline bg-white lg:col-span-2"><div className="flex items-center justify-between border-b border-hairline px-5 py-4"><h3 className="font-display text-sm font-bold text-navy-900">Accommodation</h3><Link to="/portal/accommodation" className="text-[12px] font-semibold text-navy-900 hover:text-gold-500">Manage</Link></div><div className="divide-y divide-hairline">{bookings.slice(0, 4).map((booking) => <div key={booking.id} className="flex items-center gap-4 px-5 py-3.5"><span className="grid h-10 w-10 place-items-center rounded-full bg-navy-900/8 text-navy-900"><BedDouble className="h-4 w-4" /></span><div className="min-w-0 flex-1"><div className="truncate text-sm font-semibold text-navy-900">{booking.guest_name}</div><div className="text-[12px] text-slate-ink">{campName(booking)} · {booking.check_in} to {booking.check_out} · {booking.Rooms} rooms</div></div><Badge tone={statusTones[booking.status] ?? "gray"}>{booking.status}</Badge></div>)}{!loading && bookings.length === 0 && <p className="p-8 text-center text-sm text-slate-ink">No accommodation bookings yet.</p>}</div></div><div className="rounded-2xl border border-hairline bg-white"><div className="flex items-center justify-between border-b border-hairline px-5 py-4"><h3 className="font-display text-sm font-bold text-navy-900">Recent documents</h3><Link to="/portal/documents" className="text-[12px] font-semibold text-navy-900 hover:text-gold-500">View all</Link></div><div className="divide-y divide-hairline">{documents.slice(0, 4).map((document) => <div key={document.id} className="flex items-center gap-3 px-4 py-3"><span className="grid h-9 w-9 place-items-center rounded-lg bg-rose-50 text-rose-600"><FileText className="h-4 w-4" /></span><div className="min-w-0 flex-1"><div className="truncate text-[13px] font-medium text-navy-900">{document.name}</div><div className="font-mono text-[11px] text-slate-ink/70">{document.document_type} · {document.size_bytes ? `${Math.max(1, Math.round(document.size_bytes / 1024))} KB` : "File"}</div></div></div>)}{!loading && documents.length === 0 && <p className="p-5 text-sm text-slate-ink">No documents yet.</p>}</div></div></div><Link to="/portal/messages" className="flex items-center gap-3 rounded-2xl border border-hairline bg-white p-5 text-sm font-semibold text-navy-900 transition-colors hover:border-navy-900/20 hover:bg-mist"><MessageSquare className="h-5 w-5 text-gold-500" /> Contact MUMUS Support</Link></div>;
}
