import { useEffect, useState } from "react";
import { Check, KeyRound, Mail, Save, ShieldCheck, UserRound, X } from "lucide-react";
import { Button } from "../../components/ui";
import { supabase } from "../../lib/supabaseClient";

type SecurityChange = "email" | "password";

export default function PersonalDetails() {
  const [email, setEmail] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const [pendingChange, setPendingChange] = useState<SecurityChange | null>(null);
  const [activeChange, setActiveChange] = useState<SecurityChange | null>(null);
  const [newEmail, setNewEmail] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [securityBusy, setSecurityBusy] = useState(false);
  const [securityMessage, setSecurityMessage] = useState("");

  useEffect(() => {
    void supabase.auth.getUser().then(async ({ data, error: userError }) => {
      if (userError || !data.user) {
        setError(userError?.message ?? "Could not load your account.");
        setLoading(false);
        return;
      }
      setEmail(data.user.email ?? "");
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("first_name, last_name, company_name")
        .eq("user_id", data.user.id)
        .maybeSingle();
      if (profileError) setError(profileError.message);
      setFirstName(profile?.first_name ?? data.user.user_metadata.first_name ?? "");
      setLastName(profile?.last_name ?? data.user.user_metadata.last_name ?? "");
      setCompanyName(profile?.company_name ?? data.user.user_metadata.company ?? "");
      setLoading(false);
    });
  }, []);

  const save = async (event: React.FormEvent) => {
    event.preventDefault();
    setSaving(true);
    setSaved(false);
    setError("");
    const { error: profileError } = await supabase.rpc("update_my_profile", {
      p_first_name: firstName,
      p_last_name: lastName,
      p_company_name: companyName,
    });
    if (!profileError) {
      const { error: authError } = await supabase.auth.updateUser({
        data: { first_name: firstName, last_name: lastName, company: companyName },
      });
      if (authError) setError(authError.message);
      else {
        window.dispatchEvent(new Event("profile-updated"));
        setSaved(true);
      }
    } else setError(profileError.message);
    setSaving(false);
  };

  const beginSecurityChange = (change: SecurityChange) => {
    setError("");
    setSecurityMessage("");
    setPendingChange(change);
  };

  const cancelSecurityChange = () => {
    setPendingChange(null);
    setActiveChange(null);
    setNewEmail("");
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
  };

  const changeEmail = async (event: React.FormEvent) => {
    event.preventDefault();
    setSecurityBusy(true);
    setError("");
    setSecurityMessage("");
    const { error: emailError } = await supabase.auth.updateUser({ email: newEmail.trim() });
    if (emailError) setError(emailError.message);
    else {
      setSecurityMessage("Confirmation links were sent to your old and new email addresses.");
      setNewEmail("");
      setActiveChange(null);
    }
    setSecurityBusy(false);
  };

  const changePassword = async (event: React.FormEvent) => {
    event.preventDefault();
    if (newPassword !== confirmPassword) {
      setError("The new passwords do not match.");
      return;
    }
    setSecurityBusy(true);
    setError("");
    setSecurityMessage("");
    const { data: userData, error: userError } = await supabase.auth.getUser();
    if (userError || !userData.user?.email) {
      setError(userError?.message ?? "Could not verify your account.");
    } else {
      const { error: verificationError } = await supabase.auth.signInWithPassword({ email: userData.user.email, password: currentPassword });
      if (verificationError) setError("Your current password could not be verified.");
      else {
        const { error: passwordError } = await supabase.auth.updateUser({ password: newPassword });
        if (passwordError) setError(passwordError.message);
        else {
          setSecurityMessage("Your password has been changed.");
          cancelSecurityChange();
        }
      }
    }
    setSecurityBusy(false);
  };

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <div className="flex items-center gap-3">
          <span className="grid h-11 w-11 place-items-center rounded-xl bg-navy-900 text-gold-400"><UserRound className="h-5 w-5" /></span>
          <div>
            <h1 className="font-display text-2xl font-extrabold tracking-tight text-navy-900 md:text-3xl">Personal details</h1>
            <p className="mt-1 text-sm text-slate-ink">Keep your contact and company information up to date.</p>
          </div>
        </div>
      </div>
      <form onSubmit={save} className="rounded-2xl border border-hairline bg-white p-6 shadow-sm md:p-8">
        {loading ? <p className="text-sm text-slate-ink">Loading your details...</p> : <div className="space-y-5">
          <div className="grid gap-5 sm:grid-cols-2">
            <label className="space-y-1.5 text-sm font-semibold text-navy-900">First name<input required value={firstName} onChange={(event) => setFirstName(event.target.value)} className="mt-1.5 w-full rounded-lg border border-hairline px-4 py-3 font-normal outline-none focus:border-navy-900" /></label>
            <label className="space-y-1.5 text-sm font-semibold text-navy-900">Last name<input required value={lastName} onChange={(event) => setLastName(event.target.value)} className="mt-1.5 w-full rounded-lg border border-hairline px-4 py-3 font-normal outline-none focus:border-navy-900" /></label>
          </div>
          <label className="block space-y-1.5 text-sm font-semibold text-navy-900">Company<input required value={companyName} onChange={(event) => setCompanyName(event.target.value)} className="mt-1.5 w-full rounded-lg border border-hairline px-4 py-3 font-normal outline-none focus:border-navy-900" /></label>
          <label className="block space-y-1.5 text-sm font-semibold text-navy-900">Email address<input value={email} readOnly className="mt-1.5 w-full rounded-lg border border-hairline bg-mist px-4 py-3 font-normal text-slate-ink outline-none" /></label>
          {error && <p role="alert" className="text-sm text-rose-600">{error}</p>}
          <div className="flex flex-wrap items-center gap-3">
            <Button type="submit" variant="gold" disabled={saving}>{saving ? "Saving..." : "Save changes"} {!saving && <Save className="h-4 w-4" />}</Button>
            {saved && <span className="flex items-center gap-1.5 text-sm font-medium text-emerald-700"><Check className="h-4 w-4" /> Saved</span>}
          </div>
        </div>}
      </form>
      <section className="rounded-2xl border border-hairline bg-white p-6 shadow-sm md:p-8">
        <div className="flex items-start gap-3">
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-navy-900 text-gold-400"><ShieldCheck className="h-5 w-5" /></span>
          <div>
            <h2 className="font-display text-lg font-bold text-navy-900">Login and security</h2>
            <p className="mt-1 text-sm text-slate-ink">Confirm your choice before changing your email or password.</p>
          </div>
        </div>
        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          <button type="button" onClick={() => beginSecurityChange("email")} className="flex items-center gap-3 rounded-xl border border-hairline p-4 text-left transition-colors hover:border-navy-900/30 hover:bg-mist"><Mail className="h-5 w-5 text-navy-900" /><span><span className="block text-sm font-semibold text-navy-900">Change email</span><span className="block text-xs text-slate-ink">Requires email confirmation</span></span></button>
          <button type="button" onClick={() => beginSecurityChange("password")} className="flex items-center gap-3 rounded-xl border border-hairline p-4 text-left transition-colors hover:border-navy-900/30 hover:bg-mist"><KeyRound className="h-5 w-5 text-navy-900" /><span><span className="block text-sm font-semibold text-navy-900">Change password</span><span className="block text-xs text-slate-ink">Current password required</span></span></button>
        </div>
        {pendingChange && !activeChange && <div className="mt-5 rounded-xl border border-gold-200 bg-gold-50 p-4"><p className="text-sm font-semibold text-navy-900">Do you want to change your {pendingChange}?</p><p className="mt-1 text-sm text-slate-ink">You will need to complete one more verification step.</p><div className="mt-4 flex flex-wrap gap-2"><Button type="button" variant="gold" onClick={() => { setActiveChange(pendingChange); setPendingChange(null); }}>{pendingChange === "email" ? "Continue to email change" : "Continue to password change"}</Button><Button type="button" variant="outline" onClick={cancelSecurityChange}>Cancel</Button></div></div>}
        {activeChange === "email" && <form onSubmit={changeEmail} className="mt-5 rounded-xl border border-hairline bg-mist p-4"><div className="flex items-center justify-between"><h3 className="text-sm font-bold text-navy-900">Change email address</h3><button type="button" onClick={cancelSecurityChange} aria-label="Cancel email change"><X className="h-4 w-4 text-slate-ink" /></button></div><label className="mt-4 block text-sm font-semibold text-navy-900">New email address<input required type="email" value={newEmail} onChange={(event) => setNewEmail(event.target.value)} className="mt-1.5 w-full rounded-lg border border-hairline bg-white px-4 py-3 font-normal outline-none focus:border-navy-900" /></label><Button type="submit" variant="gold" disabled={securityBusy} className="mt-4">{securityBusy ? "Sending confirmation..." : "Send confirmation"} <Mail className="h-4 w-4" /></Button></form>}
        {activeChange === "password" && <form onSubmit={changePassword} className="mt-5 rounded-xl border border-hairline bg-mist p-4"><div className="flex items-center justify-between"><h3 className="text-sm font-bold text-navy-900">Change password</h3><button type="button" onClick={cancelSecurityChange} aria-label="Cancel password change"><X className="h-4 w-4 text-slate-ink" /></button></div><div className="mt-4 space-y-3"><label className="block text-sm font-semibold text-navy-900">Current password<input required type="password" value={currentPassword} onChange={(event) => setCurrentPassword(event.target.value)} className="mt-1.5 w-full rounded-lg border border-hairline bg-white px-4 py-3 font-normal outline-none focus:border-navy-900" /></label><label className="block text-sm font-semibold text-navy-900">New password<input required minLength={8} type="password" value={newPassword} onChange={(event) => setNewPassword(event.target.value)} className="mt-1.5 w-full rounded-lg border border-hairline bg-white px-4 py-3 font-normal outline-none focus:border-navy-900" /></label><label className="block text-sm font-semibold text-navy-900">Confirm new password<input required minLength={8} type="password" value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} className="mt-1.5 w-full rounded-lg border border-hairline bg-white px-4 py-3 font-normal outline-none focus:border-navy-900" /></label></div><Button type="submit" variant="gold" disabled={securityBusy} className="mt-4">{securityBusy ? "Changing password..." : "Change password"} <KeyRound className="h-4 w-4" /></Button></form>}
        {securityMessage && <p className="mt-4 flex items-center gap-1.5 text-sm font-medium text-emerald-700"><Check className="h-4 w-4" /> {securityMessage}</p>}
        {error && <p role="alert" className="mt-4 text-sm text-rose-600">{error}</p>}
      </section>
    </div>
  );
}
