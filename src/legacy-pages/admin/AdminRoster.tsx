import { useEffect, useState } from "react";
import { BedDouble, Users, CalendarRange, ArrowUpRight, Bell } from "lucide-react";
import { Link } from "react-router-dom";
import { Badge } from "../../components/ui";
import { supabase } from "../../lib/supabaseClient";

type Booking = { id: string; guest: string; camp: string; beds: number; checkIn: string; checkOut: string; requestedCheckOut: string | null; status: "Requested" | "Approved" | "Declined" | "Active" | "Completed" | "Cancellation Requested" | "Change Requested" | "Cancelled"; bookingId: string };
type Camp = { id: string; name: string; capacity: number; allocated: number };

export default function AdminRoster() {
  const [camps, setCamps] = useState<Camp[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notifications, setNotifications] = useState<Array<{ id: string; bookingId: string; message: string }>>([]);
  useEffect(() => { void Promise.all([supabase.from("accommodation_camps").select("id, name, capacity").order("name"), supabase.from("accommodation_bookings").select("id, reference, guest_name, beds, check_in, check_out, status, requested_check_out, accommodation_camps(name)").order("created_at", { ascending: false }), supabase.from("notifications").select("id, booking_id, message").is("read_at", null).order("created_at", { ascending: false })]).then(([campResult, bookingResult, notificationResult]) => {
    if (campResult.error || bookingResult.error) setError(campResult.error?.message ?? bookingResult.error?.message ?? "Could not load roster.");
    const rows = bookingResult.data ?? [];
    const active = rows.filter((booking) => booking.status !== "Declined" && booking.status !== "Completed");
    setCamps((campResult.data ?? []).map((camp) => ({ ...camp, allocated: active.filter((booking) => {
      const campRelation = booking.accommodation_camps as { name?: string } | { name?: string }[] | null;
      const campName = Array.isArray(campRelation) ? campRelation[0]?.name : campRelation?.name;
      return campName === camp.name;
    }).reduce((sum, booking) => sum + booking.beds, 0) })));
    setBookings(rows.map((booking) => ({
      bookingId: booking.id,
      id: booking.reference,
      guest: booking.guest_name,
      camp: (() => {
        const campRelation = booking.accommodation_camps as { name?: string } | { name?: string }[] | null;
        return (Array.isArray(campRelation) ? campRelation[0]?.name : campRelation?.name) ?? "Unknown camp";
      })(),
      beds: booking.beds,
      checkIn: booking.check_in,
      checkOut: booking.check_out,
      requestedCheckOut: booking.requested_check_out,
      status: booking.status,
    })));
    setNotifications((notificationResult.data ?? []).map((notification) => ({ id: notification.id, bookingId: notification.booking_id, message: notification.message })));
    setLoading(false);
  }); }, []);
  const updateStatus = async (id: string, status: Booking["status"]) => { const { error: updateError } = await supabase.from("accommodation_bookings").update({ status }).eq("id", id); if (updateError) setError(updateError.message); else { setBookings((rows) => rows.map((row) => row.bookingId === id ? { ...row, status } : row)); const notification = notifications.find((item) => item.bookingId === id); if (notification) { await supabase.from("notifications").update({ read_at: new Date().toISOString() }).eq("id", notification.id); setNotifications((items) => items.filter((item) => item.id !== notification.id)); } } };
  const resolveRequest = async (booking: Booking, approved: boolean) => {
    const nextStatus = booking.status === "Cancellation Requested" ? (approved ? "Cancelled" : "Approved") : (approved ? "Active" : "Approved");
    const updates = booking.status === "Change Requested" && approved ? { status: nextStatus, check_out: booking.requestedCheckOut } : { status: nextStatus };
    const { error: updateError } = await supabase.from("accommodation_bookings").update(updates).eq("id", booking.bookingId);
    if (updateError) setError(updateError.message);
    else {
      setBookings((rows) => rows.map((row) => row.bookingId === booking.bookingId ? { ...row, status: nextStatus, checkOut: approved && booking.status === "Change Requested" ? booking.requestedCheckOut ?? row.checkOut : row.checkOut } : row));
      const notification = notifications.find((item) => item.bookingId === booking.bookingId);
      if (notification) { await supabase.from("notifications").update({ read_at: new Date().toISOString() }).eq("id", notification.id); setNotifications((items) => items.filter((item) => item.id !== notification.id)); }
    }
  };
  const totalCapacity = camps.reduce((s, c) => s + c.capacity, 0);
  const totalAllocated = camps.reduce((s, c) => s + c.allocated, 0);
  const util = Math.round((totalAllocated / totalCapacity) * 100);

  const summary = [
    { l: "Total capacity", v: `${totalCapacity} beds`, icon: BedDouble },
    { l: "Allocated", v: `${totalAllocated} beds`, icon: Users },
    { l: "Available", v: `${totalCapacity - totalAllocated} beds`, icon: BedDouble },
    { l: "Utilisation", v: `${util}%`, icon: ArrowUpRight },
  ];

  return (
    <div className="space-y-6 text-white">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-extrabold tracking-tight md:text-3xl">Accommodation roster</h1>
          <p className="mt-1 text-sm text-white/50">Allocated beds vs available capacity across all camps.</p>
        </div>
        <Link to="/admin/requests" className="inline-flex items-center gap-1 text-[12px] font-semibold text-gold-400 hover:text-gold-300">RFQ pipeline <ArrowUpRight className="h-3.5 w-3.5" /></Link>
      </div>

      {notifications.length > 0 && <div className="rounded-2xl border border-gold-400/30 bg-gold-400/10 p-5"><div className="flex items-center gap-2 text-gold-300"><Bell className="h-4 w-4" /><h3 className="font-display text-sm font-bold">Booking requests ({notifications.length})</h3></div><div className="mt-3 space-y-3">{notifications.map((notification) => { const booking = bookings.find((row) => row.bookingId === notification.bookingId); return <div key={notification.id} className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-white/10 bg-black/10 p-3"><div className="text-sm text-white/75">{notification.message}</div>{booking && <div className="flex gap-2"><button type="button" onClick={() => void resolveRequest(booking, true)} className="rounded-lg bg-emerald-500 px-3 py-2 text-xs font-semibold text-white hover:bg-emerald-400">Approve</button><button type="button" onClick={() => void resolveRequest(booking, false)} className="rounded-lg border border-rose-300/30 px-3 py-2 text-xs font-semibold text-rose-200 hover:bg-rose-500/15">Decline</button></div>}</div>; })}</div></div>}

      {/* summary */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {summary.map((s) => (
          <div key={s.l} className="rounded-2xl border border-white/8 bg-white/[0.03] p-5">
            <span className="grid h-11 w-11 place-items-center rounded-xl bg-gold-400/15 text-gold-400"><s.icon className="h-5 w-5" /></span>
            <div className="font-display mt-4 text-3xl font-extrabold">{s.v}</div>
            <div className="mt-0.5 text-sm text-white/60">{s.l}</div>
          </div>
        ))}
      </div>

      {/* camp utilisation */}
      <div className="rounded-2xl border border-white/8 bg-white/[0.03] p-6">
        <h3 className="font-display text-sm font-bold">Camp utilisation</h3>
        <div className="mt-6 space-y-5">
          {camps.map((c) => {
            const pct = Math.round((c.allocated / c.capacity) * 100);
            return (
              <div key={c.name}>
                <div className="flex justify-between text-[13px]">
                  <span className="font-medium text-white/80">{c.name}</span>
                  <span className="font-mono text-white/60">{c.allocated}/{c.capacity} · {pct}%</span>
                </div>
                <div className="mt-2 h-2.5 overflow-hidden rounded-full bg-white/8">
                  <div className={`h-full rounded-full ${pct > 80 ? "bg-rose-400" : "bg-gold-400"}`} style={{ width: `${pct}%` }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* allocations table */}
      <div className="overflow-hidden rounded-2xl border border-white/8 bg-white/[0.03]">
        <div className="border-b border-white/8 px-5 py-4">
          <h3 className="font-display text-sm font-bold">Current allocations</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="font-mono border-b border-white/8 text-[11px] uppercase tracking-wider text-white/40">
              <tr>
                <th className="px-5 py-3 font-medium">Ref</th>
                <th className="px-5 py-3 font-medium">Team</th>
                <th className="px-5 py-3 font-medium">Camp</th>
                <th className="px-5 py-3 font-medium">Beds</th>
                <th className="px-5 py-3 font-medium">Dates</th>
                <th className="px-5 py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading && <tr><td colSpan={6} className="px-5 py-12 text-center text-white/50">Loading bookings...</td></tr>}
              {!loading && bookings.map((b) => (
                <tr key={b.id} className="hover:bg-white/[0.02]">
                  <td className="px-5 py-4 font-mono text-[12px] text-white/40">{b.id}</td>
                  <td className="px-5 py-4 font-medium">{b.guest}</td>
                  <td className="px-5 py-4 text-white/60">{b.camp}</td>
                  <td className="px-5 py-4 font-mono">{b.beds}</td>
                  <td className="px-5 py-4 text-white/60">
                    <span className="flex items-center gap-1.5 text-[13px]"><CalendarRange className="h-4 w-4 text-white/30" />{b.checkIn} → {b.checkOut}</span>
                  </td>
                  <td className="px-5 py-4"><select value={b.status} onChange={(event) => void updateStatus(b.bookingId, event.target.value as Booking["status"])} className="rounded-lg border border-white/10 bg-navy-950 px-3 py-2 text-xs text-white [color-scheme:dark]"><option>Requested</option><option>Approved</option><option>Declined</option><option>Active</option><option>Completed</option></select></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
