import { useEffect, useState } from "react";
import { Check, Save, UserRound } from "lucide-react";
import { Link } from "react-router-dom";
import { supabase } from "../../lib/supabaseClient";

export default function AdminProfile() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [companyName, setCompanyName] = useState<string | null>(null);
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(true);
  const [loaded, setLoaded] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const [retry, setRetry] = useState(0);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setLoaded(false);
    setError("");
    const load = async () => {
      try {
        const { data, error: authError } = await supabase.auth.getUser();
        if (authError || !data.user) throw new Error("Could not load your account. Please sign in again.");
        const { data: profile, error: profileError } = await supabase.from("profiles")
          .select("first_name, last_name, company_name").eq("user_id", data.user.id).single();
        if (profileError) throw profileError;
        if (!active) return;
        setFirstName(profile.first_name ?? data.user.user_metadata.first_name ?? "");
        setLastName(profile.last_name ?? data.user.user_metadata.last_name ?? "");
        setCompanyName(profile.company_name);
        setEmail(data.user.email ?? "");
        setLoaded(true);
      } catch (cause) {
        if (active) setError(cause instanceof Error ? cause.message : "Could not load your profile. Please retry.");
      } finally { if (active) setLoading(false); }
    };
    void load();
    return () => { active = false; };
  }, [retry]);

  const save = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!loaded || saving) return;
    const first = firstName.trim();
    const last = lastName.trim();
    setSaved(false);
    setError("");
    if (!first || !last) { setError("Enter your first and last name."); return; }
    setSaving(true);
    try {
      // The existing RPC updates only the authenticated user's own profile.
      const { error: profileError } = await supabase.rpc("update_my_profile", {
        p_first_name: first, p_last_name: last, p_company_name: companyName,
      });
      if (profileError) throw profileError;
      setFirstName(first);
      setLastName(last);
      window.dispatchEvent(new Event("profile-updated"));
      // Keep signup metadata consistent with the saved profile as well.
      const { error: accountError } = await supabase.auth.updateUser({ data: { first_name: first, last_name: last } });
      if (accountError) { setError("Your profile name was saved, but account sync failed. Try saving again."); return; }
      setSaved(true);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not save your profile. Please retry.");
    } finally { setSaving(false); }
  };

  const field = "mt-2 w-full rounded-lg border border-white/15 bg-white/5 px-4 py-3 text-sm font-normal text-white outline-none focus:border-gold-400 disabled:opacity-60";

  return <div className="max-w-2xl space-y-6 text-white">
    <div className="flex items-start gap-3">
      <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-gold-400/10 text-gold-300"><UserRound className="h-5 w-5" /></span>
      <div><h1 className="font-display text-2xl font-extrabold">My profile</h1><p className="mt-1 text-sm text-white/60">Save your name once so customers know who is helping them.</p></div>
    </div>
    <form onSubmit={save} className="space-y-5 rounded-2xl border border-white/10 bg-white/[0.03] p-5 sm:p-7">
      {loading ? <p role="status" className="text-sm text-white/60">Loading your profile...</p> : loaded && <>
        <div className="grid gap-5 sm:grid-cols-2">
          <label className="text-sm font-semibold">First name<input required maxLength={80} autoComplete="given-name" value={firstName} onChange={(event) => { setFirstName(event.target.value); setSaved(false); }} disabled={saving} className={field} /></label>
          <label className="text-sm font-semibold">Last name<input required maxLength={80} autoComplete="family-name" value={lastName} onChange={(event) => { setLastName(event.target.value); setSaved(false); }} disabled={saving} className={field} /></label>
        </div>
        <p className="text-xs leading-relaxed text-white/50">Customers see your first name in support chats. Your teammates see your full name.</p>
        <label className="block text-sm font-semibold">Staff email<input type="email" value={email} readOnly className={`${field} text-white/60`} /></label>
        <div className="rounded-xl border border-gold-400/15 bg-gold-400/5 p-4"><div className="text-xs font-semibold text-gold-300">Customer chat preview</div><p className="mt-2 text-sm text-white/75">{firstName.trim() ? `You're chatting with ${firstName.trim()} from MUMUS Support.` : "Enter your first name to preview how it appears."}</p></div>
      </>}
      {error && <p role="alert" className="text-sm text-rose-300">{error} {!loaded && !loading && <button type="button" onClick={() => setRetry((value) => value + 1)} className="underline">Retry</button>}</p>}
      {loaded && <div className="flex flex-wrap items-center gap-3">
        <button type="submit" disabled={saving} className="inline-flex items-center gap-2 rounded-lg bg-gold-400 px-4 py-3 text-sm font-semibold text-navy-900 hover:bg-gold-300 disabled:opacity-50"><Save className="h-4 w-4" />{saving ? "Saving..." : "Save profile"}</button>
        {saved && <span role="status" className="inline-flex items-center gap-1.5 text-sm text-emerald-300"><Check className="h-4 w-4" />Name saved</span>}
      </div>}
    </form>
    {saved && <Link to="/admin/messages" className="inline-flex rounded-lg border border-white/15 px-4 py-3 text-sm font-semibold text-white/80 hover:bg-white/5">Continue to messages</Link>}
  </div>;
}
