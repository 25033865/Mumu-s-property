import { useEffect, useState } from "react";
import { BedDouble, MapPin, CalendarRange, Plus, X } from "lucide-react";
import { Badge, Button } from "../../components/ui";
import { supabase } from "../../lib/supabaseClient";

type Booking = { id: string; bookingId: string; guest: string; camp: string; beds: number; checkIn: string; checkOut: string; status: "Requested" | "Approved" | "Declined" | "Active" | "Completed" | "Cancellation Requested" | "Change Requested" | "Cancelled" };
type Camp = { id: string; name: string; capacity: number; allocated: number };

export default function Accommodation() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [camps, setCamps] = useState<Camp[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [guestName, setGuestName] = useState("");
  const [campId, setCampId] = useState("");
  const [beds, setBeds] = useState("1");
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [editingBooking, setEditingBooking] = useState<Booking | null>(null);
  const [newCheckOut, setNewCheckOut] = useState("");

  const load = async () => {
    const [{ data: campRows, error: campError }, { data: bookingRows, error: bookingError }] = await Promise.all([
      supabase.from("accommodation_camps").select("id, name, capacity").order("name"),
      supabase.from("accommodation_bookings").select("id, reference, guest_name, beds, check_in, check_out, status, accommodation_camps(name)").order("created_at", { ascending: false }),
    ]);
    if (campError || bookingError) setError(campError?.message ?? bookingError?.message ?? "Could not load accommodation.");
    else {
      const activeBookings = (bookingRows ?? []).filter((booking) => booking.status !== "Declined" && booking.status !== "Completed");
      setCamps((campRows ?? []).map((camp) => ({ ...camp, allocated: activeBookings.filter((booking) => {
        const campRelation = booking.accommodation_camps as { name?: string } | { name?: string }[] | null;
        const campName = Array.isArray(campRelation) ? campRelation[0]?.name : campRelation?.name;
        return campName === camp.name;
      }).reduce((sum, booking) => sum + booking.beds, 0) })));
      setBookings((bookingRows ?? []).map((booking) => ({
        id: booking.reference,
        bookingId: booking.id,
        guest: booking.guest_name,
        camp: (() => {
          const campRelation = booking.accommodation_camps as { name?: string } | { name?: string }[] | null;
          return (Array.isArray(campRelation) ? campRelation[0]?.name : campRelation?.name) ?? "Unknown camp";
        })(),
        beds: booking.beds,
        checkIn: booking.check_in,
        checkOut: booking.check_out,
        status: booking.status,
      })));
    }
    setLoading(false);
  };

  useEffect(() => { void load(); }, []);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSubmitting(true);
    setError("");
    const { data: userData } = await supabase.auth.getUser();
    const { error: insertError } = await supabase.from("accommodation_bookings").insert({ user_id: userData.user?.id, camp_id: campId, guest_name: guestName, beds: Number(beds), check_in: checkIn, check_out: checkOut });
    if (insertError) setError(insertError.message);
    else { setShowForm(false); setGuestName(""); setBeds("1"); setCheckIn(""); setCheckOut(""); await load(); }
    setSubmitting(false);
  };

  const totalBeds = bookings.filter((b) => b.status !== "Completed" && b.status !== "Declined").reduce((s, b) => s + b.beds, 0);

  const requestChange = async (action: "cancel" | "extend") => {
    if (!editingBooking) return;
    const { error: changeError } = await supabase.rpc("request_accommodation_change", { p_booking_id: editingBooking.bookingId, p_action: action, p_requested_check_out: action === "extend" ? newCheckOut : null });
    if (changeError) setError(changeError.message);
    else { setEditingBooking(null); setNewCheckOut(""); await load(); }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-extrabold tracking-tight text-navy-900 md:text-3xl">Accommodation bookings</h1>
          <p className="mt-1 text-sm text-slate-ink">Active contractor and project-team accommodation across our camps.</p>
        </div>
        <Button variant="gold" onClick={() => setShowForm(true)}><Plus className="h-4 w-4" /> Request Accommodation</Button>
      </div>

      {/* camp capacity */}
      <div className="grid gap-4 sm:grid-cols-3">
        {camps.map((c) => {
          const pct = Math.round((c.allocated / c.capacity) * 100);
          return (
            <div key={c.name} className="rounded-2xl border border-hairline bg-white p-5">
              <div className="flex items-center gap-2 text-navy-900">
                <MapPin className="h-4 w-4 text-gold-500" />
                <span className="font-display text-sm font-bold">{c.name}</span>
              </div>
              <div className="font-display mt-3 text-2xl font-extrabold text-navy-900">
                {c.allocated}<span className="text-base font-semibold text-slate-ink"> / {c.capacity} beds</span>
              </div>
              <div className="mt-3 h-2 overflow-hidden rounded-full bg-mist">
                <div className="h-full rounded-full bg-gold-400" style={{ width: `${pct}%` }} />
              </div>
              <div className="font-mono mt-2 text-[11px] text-slate-ink/70">{c.capacity - c.allocated} beds available</div>
            </div>
          );
        })}
      </div>

      {/* bookings table */}
      <div className="overflow-hidden rounded-2xl border border-hairline bg-white">
        <div className="flex items-center justify-between border-b border-hairline px-5 py-4">
          <h3 className="font-display text-sm font-bold text-navy-900">Your bookings</h3>
          <span className="font-mono text-[11px] uppercase tracking-wider text-slate-ink/70">{totalBeds} beds currently allocated</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="font-mono border-b border-hairline bg-mist text-[11px] uppercase tracking-wider text-slate-ink">
              <tr>
                <th className="px-5 py-3 font-medium">Ref</th>
                <th className="px-5 py-3 font-medium">Team</th>
                <th className="px-5 py-3 font-medium">Camp</th>
                <th className="px-5 py-3 font-medium">Beds</th>
                <th className="px-5 py-3 font-medium">Dates</th>
                <th className="px-5 py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-hairline">
              {loading && <tr><td colSpan={6} className="px-5 py-12 text-center text-slate-ink">Loading bookings...</td></tr>}
              {!loading && bookings.map((b) => (
                <tr key={b.id} className="hover:bg-mist">
                  <td className="px-5 py-4 font-mono text-[12px] text-slate-ink">{b.id}</td>
                  <td className="px-5 py-4 font-semibold text-navy-900">
                    <span className="flex items-center gap-2"><BedDouble className="h-4 w-4 text-gold-500" />{b.guest}</span>
                  </td>
                  <td className="px-5 py-4 text-slate-ink">{b.camp}</td>
                  <td className="px-5 py-4 font-mono text-navy-900">{b.beds}</td>
                  <td className="px-5 py-4 text-slate-ink">
                    <span className="flex items-center gap-1.5 text-[13px]"><CalendarRange className="h-4 w-4 text-slate-ink/50" />{b.checkIn} → {b.checkOut}</span>
                  </td>
                  <td className="px-5 py-4"><div className="flex flex-wrap items-center gap-2"><Badge tone={b.status === "Approved" || b.status === "Active" ? "green" : b.status.includes("Requested") ? "amber" : b.status === "Declined" || b.status === "Cancelled" ? "red" : "gray"}>{b.status}</Badge>{["Requested", "Approved", "Change Requested"].includes(b.status) && <button type="button" onClick={() => setEditingBooking(b)} className="text-xs font-semibold text-navy-900 underline underline-offset-2">Manage</button>}</div></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      {error && <p role="alert" className="text-sm text-rose-600">{error}</p>}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-0 sm:items-center sm:p-6">
          <form onSubmit={submit} className="w-full rounded-t-2xl bg-white p-6 shadow-2xl sm:max-w-lg sm:rounded-2xl">
            <div className="flex items-start justify-between"><div><h2 className="font-display text-xl font-bold text-navy-900">Request accommodation</h2><p className="mt-1 text-sm text-slate-ink">Tell us about your project team.</p></div><button type="button" onClick={() => setShowForm(false)} aria-label="Close"><X className="h-5 w-5 text-slate-ink" /></button></div>
            <div className="mt-5 space-y-3">
              <input required value={guestName} onChange={(event) => setGuestName(event.target.value)} placeholder="Team or guest name" className="w-full rounded-lg border border-hairline px-4 py-3 text-sm outline-none focus:border-navy-900" />
              <select required value={campId} onChange={(event) => setCampId(event.target.value)} className="w-full rounded-lg border border-hairline bg-white px-4 py-3 text-sm outline-none focus:border-navy-900"><option value="">Select a camp</option>{camps.map((camp) => <option key={camp.id} value={camp.id}>{camp.name} ({camp.capacity - camp.allocated} beds available)</option>)}</select>
              <div className="grid gap-3 sm:grid-cols-3">
                <label className="space-y-1.5 text-sm font-semibold text-navy-900">
                  <span>Number of beds</span>
                  <input required min="1" type="number" value={beds} onChange={(event) => setBeds(event.target.value)} placeholder="e.g. 12" className="w-full rounded-lg border border-hairline px-4 py-3 text-sm font-normal outline-none focus:border-navy-900" />
                </label>
                <label className="space-y-1.5 text-sm font-semibold text-navy-900">
                  <span>Check-in date</span>
                  <input required type="date" value={checkIn} onChange={(event) => setCheckIn(event.target.value)} className="w-full rounded-lg border border-hairline px-4 py-3 text-sm font-normal outline-none focus:border-navy-900" />
                </label>
                <label className="space-y-1.5 text-sm font-semibold text-navy-900">
                  <span>Check-out date</span>
                  <input required type="date" value={checkOut} onChange={(event) => setCheckOut(event.target.value)} className="w-full rounded-lg border border-hairline px-4 py-3 text-sm font-normal outline-none focus:border-navy-900" />
                </label>
              </div>
              <Button type="submit" variant="gold" full disabled={submitting}>{submitting ? "Submitting..." : "Submit booking request"}</Button>
            </div>
          </form>
        </div>
      )}
      {editingBooking && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-0 sm:items-center sm:p-6">
          <div className="w-full rounded-t-2xl bg-white p-6 shadow-2xl sm:max-w-md sm:rounded-2xl">
            <div className="flex items-start justify-between"><div><h2 className="font-display text-xl font-bold text-navy-900">Manage booking</h2><p className="mt-1 text-sm text-slate-ink">{editingBooking.id} · {editingBooking.guest}</p></div><button type="button" onClick={() => setEditingBooking(null)} aria-label="Close"><X className="h-5 w-5 text-slate-ink" /></button></div>
            <div className="mt-5 space-y-4"><label className="block text-sm font-semibold text-navy-900">New check-out date<input required type="date" min={editingBooking.checkOut} value={newCheckOut} onChange={(event) => setNewCheckOut(event.target.value)} className="mt-1.5 w-full rounded-lg border border-hairline px-4 py-3 font-normal outline-none focus:border-navy-900" /></label><Button type="button" variant="primary" full disabled={!newCheckOut} onClick={() => void requestChange("extend")}>Request date change</Button><button type="button" onClick={() => void requestChange("cancel")} className="w-full rounded-lg border border-rose-200 px-4 py-3 text-sm font-semibold text-rose-600 hover:bg-rose-50">Request cancellation</button></div>
          </div>
        </div>
      )}
    </div>
  );
}
