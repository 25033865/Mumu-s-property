import { useEffect, useState } from "react";
import { BedDouble, Users, CalendarRange, ArrowUpRight, Bell } from "lucide-react";
import { Link } from "react-router-dom";
import { supabase } from "../../lib/supabaseClient";

type Booking = { id: string; guest: string; camp: string; rooms: number; checkIn: string; checkOut: string; requestedCheckOut: string | null; status: "Requested" | "Approved" | "Declined" | "Active" | "Completed" | "Cancellation Requested" | "Change Requested" | "Cancelled"; bookingId: string };
type Camp = { id: string; name: string; capacity: number; bookedRooms: number; availableRooms: number };

const reservedBookingStatuses = new Set<Booking["status"]>(["Requested", "Approved", "Active", "Cancellation Requested", "Change Requested"]);

export default function AdminRoster() {
  const [camps, setCamps] = useState<Camp[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notifications, setNotifications] = useState<Array<{ id: string; bookingId: string; message: string }>>([]);
  const load = async () => {
    setLoading(true);
    await supabase.rpc("release_due_accommodation_bookings");
    let campResult = await supabase.from("accommodation_camps").select("id, name, capacity, booked_rooms, available_rooms").order("name");
    if (campResult.error) {
      const fallbackCampResult = await supabase.from("accommodation_camps").select("id, name, capacity").order("name");
      campResult = { ...campResult, data: fallbackCampResult.data as typeof campResult.data };
    }
    const [bookingResult, notificationResult] = await Promise.all([
      supabase.from("accommodation_bookings").select('id, reference, guest_name, "Rooms", check_in, check_out, status, requested_check_out, accommodation_camps(name)').order("created_at", { ascending: false }),
      supabase.from("notifications").select("id, booking_id, message").is("read_at", null).order("created_at", { ascending: false }),
    ]);
    if (campResult.error || bookingResult.error) setError(campResult.error?.message ?? bookingResult.error?.message ?? "Could not load roster.");
    const rows = bookingResult.data ?? [];
    const today = new Date().toISOString().slice(0, 10);
    const active = rows.filter((booking) => reservedBookingStatuses.has(booking.status) && booking.check_out > today);
    setCamps((campResult.data ?? []).map((camp) => {
      const fallbackBooked = active.filter((booking) => {
        const campRelation = booking.accommodation_camps as { name?: string } | { name?: string }[] | null;
        const campName = Array.isArray(campRelation) ? campRelation[0]?.name : campRelation?.name;
        return campName === camp.name;
      }).reduce((sum, booking) => sum + booking.Rooms, 0);
      const bookedRooms = Number(camp.booked_rooms ?? fallbackBooked);
      const availableRooms = Number(camp.available_rooms ?? Math.max(camp.capacity - bookedRooms, 0));
      return { id: camp.id, name: camp.name, capacity: camp.capacity, bookedRooms, availableRooms };
    }));
    setBookings(rows.map((booking) => ({
      bookingId: booking.id,
      id: booking.reference,
      guest: booking.guest_name,
      camp: (() => {
        const campRelation = booking.accommodation_camps as { name?: string } | { name?: string }[] | null;
        return (Array.isArray(campRelation) ? campRelation[0]?.name : campRelation?.name) ?? "Unknown camp";
      })(),
      rooms: booking.Rooms,
      checkIn: booking.check_in,
      checkOut: booking.check_out,
      requestedCheckOut: booking.requested_check_out,
      status: booking.status,
    })));
    setNotifications((notificationResult.data ?? []).map((notification) => ({ id: notification.id, bookingId: notification.booking_id, message: notification.message })));
    setLoading(false);
  };
  useEffect(() => { void load(); }, []);
  const updateStatus = async (id: string, status: Booking["status"]) => { const { error: updateError } = await supabase.rpc("admin_update_accommodation_booking_status", { p_booking_id: id, p_status: status }); if (updateError) setError(updateError.message); else await load(); };
  const resolveRequest = async (booking: Booking, approved: boolean) => {
    const { error: updateError } = await supabase.rpc("review_accommodation_change", { p_booking_id: booking.bookingId, p_approved: approved });
    if (updateError) setError(updateError.message);
    else await load();
  };
  const totalCapacity = camps.reduce((s, c) => s + c.capacity, 0);
  const totalAllocated = camps.reduce((s, c) => s + Math.min(c.bookedRooms, c.capacity), 0);
  const totalAvailable = camps.reduce((s, c) => s + c.availableRooms, 0);
  const util = totalCapacity > 0 ? Math.min(100, Math.round((totalAllocated / totalCapacity) * 100)) : 0;
  const summary = [
    { l: "Total capacity", v: `${totalCapacity} rooms`, icon: BedDouble },
    { l: "Allocated", v: `${totalAllocated} rooms`, icon: Users },
    { l: "Available", v: `${totalAvailable} rooms`, icon: BedDouble },
    { l: "Utilisation", v: `${util}%`, icon: ArrowUpRight },
  ];

  return (
    <div className="space-y-6 text-white">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-extrabold tracking-tight md:text-3xl">Accommodation roster</h1>
          <p className="mt-1 text-sm text-white/50">Allocated rooms vs available capacity across all camps.</p>
        </div>
        <Link to="/admin/requests" className="inline-flex items-center gap-1 text-[12px] font-semibold text-gold-400 hover:text-gold-300">RFQ pipeline <ArrowUpRight className="h-3.5 w-3.5" /></Link>
      </div>

      {notifications.length > 0 && <div className="rounded-2xl border border-gold-400/30 bg-gold-400/10 p-5"><div className="flex items-center gap-2 text-gold-300"><Bell className="h-4 w-4" /><h3 className="font-display text-sm font-bold">Booking requests ({notifications.length})</h3></div><div className="mt-3 space-y-3">{notifications.map((notification) => { const booking = bookings.find((row) => row.bookingId === notification.bookingId); return <div key={notification.id} className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-white/10 bg-black/10 p-3"><div className="text-sm text-white/75">{notification.message}</div>{booking && <div className="flex gap-2"><button type="button" onClick={() => void resolveRequest(booking, true)} className="rounded-lg bg-emerald-500 px-3 py-2 text-xs font-semibold text-white hover:bg-emerald-400">Approve</button><button type="button" onClick={() => void resolveRequest(booking, false)} className="rounded-lg border border-rose-300/30 px-3 py-2 text-xs font-semibold text-rose-200 hover:bg-rose-500/15">Decline</button></div>}</div>; })}</div></div>}

      {/* summary */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {summary.map((s) => (
          <div key={s.l} className="rounded-2xl border border-white/8 bg-white/3 p-5">
            <span className="grid h-11 w-11 place-items-center rounded-xl bg-gold-400/15 text-gold-400"><s.icon className="h-5 w-5" /></span>
            <div className="font-display mt-4 text-3xl font-extrabold">{s.v}</div>
            <div className="mt-0.5 text-sm text-white/60">{s.l}</div>
          </div>
        ))}
      </div>

      {/* camp utilisation */}
      <div className="rounded-2xl border border-white/8 bg-white/3 p-6">
        <h3 className="font-display text-sm font-bold">Camp utilisation</h3>
        <div className="mt-6 space-y-5">
          {camps.map((c) => {
            const displayBooked = Math.min(c.bookedRooms, c.capacity);
            const pct = c.capacity > 0 ? Math.min(100, Math.round((displayBooked / c.capacity) * 100)) : 0;
            return (
              <div key={c.name}>
                <div className="flex justify-between text-[13px]">
                  <span className="font-medium text-white/80">{c.name}</span>
                  <span className="font-mono text-white/60">{displayBooked}/{c.capacity} · {pct}%</span>
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
      <div className="overflow-hidden rounded-2xl border border-white/8 bg-white/3">
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
                <th className="px-5 py-3 font-medium">Rooms</th>
                <th className="px-5 py-3 font-medium">Dates</th>
                <th className="px-5 py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading && <tr><td colSpan={6} className="px-5 py-12 text-center text-white/50">Loading bookings...</td></tr>}
              {!loading && bookings.map((b) => (
                <tr key={b.id} className="hover:bg-white/2">
                  <td className="px-5 py-4 font-mono text-[12px] text-white/40">{b.id}</td>
                  <td className="px-5 py-4 font-medium">{b.guest}</td>
                  <td className="px-5 py-4 text-white/60">{b.camp}</td>
                  <td className="px-5 py-4 font-mono">{b.rooms}</td>
                  <td className="px-5 py-4 text-white/60">
                    <span className="flex items-center gap-1.5 text-[13px]"><CalendarRange className="h-4 w-4 text-white/30" />{b.checkIn} → {b.checkOut}</span>
                  </td>
                  <td className="px-5 py-4"><select value={b.status} onChange={(event) => void updateStatus(b.bookingId, event.target.value as Booking["status"])} className="rounded-lg border border-white/10 bg-navy-950 px-3 py-2 text-xs text-white scheme-dark"><option>Requested</option><option>Approved</option><option>Declined</option><option>Active</option><option>Completed</option></select></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
