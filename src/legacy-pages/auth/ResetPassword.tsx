import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff, LockKeyhole } from "lucide-react";
import AuthShell, { authField, authLabel } from "../../components/AuthShell";
import { Button } from "../../components/ui";
import { supabase } from "../../lib/supabaseClient";

export default function ResetPassword() {
  const nav = useNavigate();
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const mismatch = confirmation.length > 0 && password !== confirmation;
  const disabled = !password || !confirmation || mismatch || isSubmitting;

  const updatePassword = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);
    const { error: updateError } = await supabase.auth.updateUser({ password });
    if (updateError) {
      setError(updateError.message);
    } else {
      await supabase.auth.signOut();
      nav("/login", { replace: true });
    }
    setIsSubmitting(false);
  };

  return (
    <AuthShell title="Set a new password" subtitle="Choose a new password for your account.">
      <form onSubmit={(event) => void updatePassword(event)} className="space-y-5">
        <div>
          <label className={authLabel}>New password</label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              required
              minLength={6}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className={`${authField} pr-11`}
              placeholder="Enter a new password"
            />
            <button type="button" onClick={() => setShowPassword((visible) => !visible)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-ink/60 hover:text-navy-900" aria-label={showPassword ? "Hide password" : "Show password"}>
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>
        <div>
          <label className={authLabel}>Confirm new password</label>
          <div className="relative">
            <input
              type={showConfirmation ? "text" : "password"}
              required
              minLength={6}
              value={confirmation}
              onChange={(event) => setConfirmation(event.target.value)}
              aria-invalid={mismatch}
              className={`${authField} pr-11 ${mismatch ? "border-rose-500 focus:border-rose-500 focus:ring-rose-500/10" : ""}`}
              placeholder="Repeat your new password"
            />
            <button type="button" onClick={() => setShowConfirmation((visible) => !visible)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-ink/60 hover:text-navy-900" aria-label={showConfirmation ? "Hide confirmed password" : "Show confirmed password"}>
              {showConfirmation ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          {mismatch && <p className="mt-1.5 text-xs text-rose-600">Passwords do not match.</p>}
        </div>
        {error && <p role="alert" className="text-sm text-rose-600">{error}</p>}
        <Button type="submit" variant="primary" size="lg" full disabled={disabled}>
          {isSubmitting ? "Updating..." : "Update password"} {!isSubmitting && <LockKeyhole className="h-4 w-4" />}
        </Button>
        <Link to="/login" className="flex items-center justify-center text-sm font-semibold text-navy-900 hover:text-gold-500">Back to login</Link>
      </form>
    </AuthShell>
  );
}
