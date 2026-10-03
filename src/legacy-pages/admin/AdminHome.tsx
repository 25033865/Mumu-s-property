import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { BedDouble, ClipboardList, ReceiptText, Users, ArrowUpRight } from "lucide-react";
import { Badge } from "../../components/ui";
import { supabase } from "../../lib/supabaseClient";

type RequestRow = { id: string; reference: string; category: string; location: string; status: string; created_at: string };
type ClientRow = { user_id: string; company_name: string; contact_name: string; request_count: number; status: "Active" | "Pending" };
type ChartPoint = { label: string; value: number };

const requestStatuses = ["Submitted", "Under Review", "Quotation Sent", "Approved", "In Progress", "Completed"];
const statusTone: Record<string, "gray" | "amber" | "blue" | "violet" | "gold" | "green"> = {
  Submitted: "gray", "Under Review": "amber", "Quotation Sent": "blue", Approved: "violet", "In Progress": "gold", Completed: "green",
};

function money(value: number) {
  return new Intl.NumberFormat("en-ZA", { style: "currency", currency: "ZAR", notation: "compact", maximumFractionDigits: 1 }).format(value);
}

function buildChart(
  requests: Array<{ created_at: string }>,
  quotes: Array<{ created_at: string }>,
  bookings: Array<{ created_at: string }>,
): ChartPoint[] {
  const now = new Date();
  return Array.from({ length: 6 }, (_, index) => {
    const month = new Date(now.getFullYear(), now.getMonth() - 5 + index, 1);
    const activityRows = [...requests, ...quotes, ...bookings];
    const value = activityRows.filter((activity) => {
      const date = new Date(activity.created_at);
      return date.getFullYear() === month.getFullYear() && date.getMonth() === month.getMonth();
    }).length;
    return { label: month.toLocaleDateString("en-ZA", { month: "short" }), value };
  });
}

export default function AdminHome() {
  const [requests, setRequests] = useState<RequestRow[]>([]);
  const [clients, setClients] = useState<ClientRow[]>([]);
  const [pipeline, setPipeline] = useState<Record<string, number>>({});
  const [chart, setChart] = useState<ChartPoint[]>([]);
  const [quoteValue, setQuoteValue] = useState(0);
  const [clientCount, setClientCount] = useState(0);
  const [openRequests, setOpenRequests] = useState(0);
  const [occupancy, setOccupancy] = useState({ booked: 0, capacity: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    const load = async () => {
      setLoading(true);
      const [requestResult, quoteResult, clientResult, campResult, bookingResult] = await Promise.all([
        supabase.from("service_requests").select("id, reference, category, location, status, created_at").order("created_at", { ascending: false }),
        supabase.from("quotes").select("amount, created_at"),
        supabase.rpc("admin_list_clients"),
        supabase.from("accommodation_camps").select("capacity, booked_rooms"),
        supabase.from("accommodation_bookings").select("created_at"),
      ]);
      if (!active) return;
      const errors = [requestResult.error, quoteResult.error, clientResult.error, campResult.error, bookingResult.error].filter(Boolean);
      if (errors.length > 0) setError(errors[0]?.message ?? "Could not load dashboard data.");
      const requestRows = (requestResult.data ?? []) as RequestRow[];
      const quoteRows = (quoteResult.data ?? []) as Array<{ amount: number; created_at: string }>;
      const bookingRows = (bookingResult.data ?? []) as Array<{ created_at: string }>;
      const clientRows = (clientResult.data ?? []) as ClientRow[];
      const nextPipeline = Object.fromEntries(requestStatuses.map((status) => [status, requestRows.filter((request) => request.status === status).length]));
      setRequests(requestRows.slice(0, 5));
      setClients(clientRows.sort((first, second) => second.request_count - first.request_count).slice(0, 4));
      setPipeline(nextPipeline);
      setChart(buildChart(requestRows, quoteRows, bookingRows));
      setQuoteValue(quoteRows.reduce((total, quote) => total + Number(quote.amount), 0));
      setClientCount(clientRows.length);
      setOpenRequests(requestRows.filter((request) => request.status !== "Completed").length);
      setOccupancy({
        booked: (campResult.data ?? []).reduce((total, camp) => total + Number(camp.booked_rooms ?? 0), 0),
        capacity: (campResult.data ?? []).reduce((total, camp) => total + Number(camp.capacity ?? 0), 0),
      });
      setLoading(false);
    };
    void load();
    return () => { active = false; };
  }, []);

  const maxChart = Math.max(...chart.map((point) => point.value), 1);
  const maxPipeline = Math.max(...Object.values(pipeline), 1);
  const occupancyPercent = occupancy.capacity > 0 ? Math.round((occupancy.booked / occupancy.capacity) * 100) : 0;
  const kpis = [
    { label: "Quoted value", value: money(quoteValue), detail: "All submitted quotes", icon: ReceiptText },
    { label: "Registered clients", value: String(clientCount), detail: "Live client accounts", icon: Users },
    { label: "Open requests", value: String(openRequests), detail: "Not yet completed", icon: ClipboardList },
    { label: "Accommodation occupancy", value: `${occupancyPercent}%`, detail: `${occupancy.booked} of ${occupancy.capacity} rooms`, icon: BedDouble },
  ];

  return (
    <div className="space-y-6 text-white">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div><h1 className="font-display text-2xl font-extrabold tracking-tight md:text-3xl">Business overview</h1><p className="mt-1 text-sm text-white/50">Live MUMUS PROPERTYS operations</p></div>
        <span className="font-mono text-[12px] text-white/40">Updated {new Date().toLocaleDateString("en-ZA", { day: "numeric", month: "short", year: "numeric" })}</span>
      </div>
      {error && <p role="alert" className="text-sm text-rose-300">{error}</p>}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {kpis.map((kpi) => <div key={kpi.label} className="rounded-2xl border border-white/8 bg-white/[0.03] p-5"><div className="flex items-center justify-between"><span className="grid h-11 w-11 place-items-center rounded-xl bg-gold-400/15 text-gold-400"><kpi.icon className="h-5 w-5" /></span><ArrowUpRight className="h-4 w-4 text-emerald-400" /></div><div className="font-display mt-4 text-3xl font-extrabold">{loading ? "..." : kpi.value}</div><div className="mt-0.5 text-sm text-white/60">{kpi.label}</div><div className="font-mono mt-2 text-[11px] text-white/35">{kpi.detail}</div></div>)}
      </div>
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="rounded-2xl border border-white/8 bg-white/[0.03] p-6 lg:col-span-2"><div className="flex items-center justify-between"><h3 className="font-display text-sm font-bold">Monthly activity</h3><Badge tone="green">Requests, quotes, bookings</Badge></div><div className="mt-8 flex h-52 items-end gap-4">{chart.map((point) => <div key={point.label} className="flex flex-1 flex-col items-center gap-2"><div className="flex h-full w-full items-end"><div className="w-full rounded-t-md bg-gradient-to-t from-navy-600 to-gold-400 transition-all" style={{ height: `${Math.max((point.value / maxChart) * 100, point.value ? 4 : 0)}%` }} title={`${point.value} activities`} /></div><span className="font-mono text-[11px] text-white/40">{point.label}</span></div>)}</div></div>
        <div className="rounded-2xl border border-white/8 bg-white/[0.03] p-6"><h3 className="font-display text-sm font-bold">Request pipeline</h3><div className="mt-6 space-y-3.5">{requestStatuses.map((status) => <div key={status}><div className="flex justify-between text-[12px]"><span className="text-white/60">{status}</span><span className="font-mono text-white/80">{pipeline[status] ?? 0}</span></div><div className="mt-1.5 h-2 overflow-hidden rounded-full bg-white/8"><div className="h-full rounded-full bg-gold-400" style={{ width: `${((pipeline[status] ?? 0) / maxPipeline) * 100}%` }} /></div></div>)}</div></div>
      </div>
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="rounded-2xl border border-white/8 bg-white/[0.03] lg:col-span-2"><div className="flex items-center justify-between border-b border-white/8 px-5 py-4"><h3 className="font-display text-sm font-bold">Latest RFQs</h3><Link to="/admin/requests" className="inline-flex items-center gap-1 text-[12px] font-semibold text-gold-400 hover:text-gold-300">Manage <ArrowUpRight className="h-3.5 w-3.5" /></Link></div><div className="divide-y divide-white/5">{requests.map((request) => <div key={request.id} className="flex items-center gap-4 px-5 py-3.5"><span className="font-mono text-[12px] text-white/40">{request.reference}</span><div className="min-w-0 flex-1"><div className="truncate text-sm font-medium">{request.category}</div><div className="text-[12px] text-white/40">{request.location}</div></div><Badge tone={statusTone[request.status] ?? "gray"}>{request.status}</Badge></div>)}{!loading && requests.length === 0 && <p className="px-5 py-8 text-sm text-white/50">No requests yet.</p>}</div></div>
        <div className="rounded-2xl border border-white/8 bg-white/[0.03]"><div className="flex items-center justify-between border-b border-white/8 px-5 py-4"><h3 className="font-display text-sm font-bold">Top clients</h3><Link to="/admin/clients" className="text-[12px] font-semibold text-gold-400 hover:text-gold-300">All</Link></div><div className="divide-y divide-white/5">{clients.map((client) => <div key={client.user_id} className="flex items-center gap-3 px-5 py-3.5"><span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-white/8 text-[12px] font-bold">{client.company_name.split(" ").map((word) => word[0]).slice(0, 2).join("").toUpperCase()}</span><div className="min-w-0 flex-1"><div className="truncate text-[13px] font-medium">{client.company_name}</div><div className="text-[11px] text-white/40">{client.contact_name}</div></div><span className="font-mono text-[12px] text-white/60">{client.request_count}</span></div>)}{!loading && clients.length === 0 && <p className="px-5 py-8 text-sm text-white/50">No clients yet.</p>}</div></div>
      </div>
    </div>
  );
}
