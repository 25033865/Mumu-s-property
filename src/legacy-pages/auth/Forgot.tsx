import { useState } from "react";
import { Link } from "react-router-dom";
import { Mail, ArrowLeft, CheckCircle2 } from "lucide-react";
import AuthShell, { authField, authLabel } from "../../components/AuthShell";
import { Button } from "../../components/ui";
import { supabase } from "../../lib/supabaseClient";

export default function Forgot() {
  const [sent, setSent] = useState(false);
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  return (
    <AuthShell title="Reset password" subtitle="Enter your email and we'll send you a secure reset link.">
      {sent ? (
        <div className="rounded-2xl border border-hairline bg-mist p-8 text-center">
          <span className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-emerald-50 text-emerald-600">
            <CheckCircle2 className="h-7 w-7" />
          </span>
          <h3 className="font-display mt-5 text-xl font-bold text-navy-900">Check your inbox</h3>
          <p className="mt-2 text-sm text-slate-ink">If an account exists for that email, we've sent a password reset link. It expires in 30 minutes.</p>
          <Link to="/login" className="mt-6 inline-flex items-center gap-1.5 text-sm font-semibold text-navy-900 hover:text-gold-500">
            <ArrowLeft className="h-4 w-4" /> Back to login
          </Link>
        </div>
      ) : (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            setError("");
            setIsSubmitting(true);
            void supabase.auth.resetPasswordForEmail(email, {
              redirectTo: `${window.location.origin}/reset-password`,
            }).then(({ error: resetError }) => {
              if (resetError) {
                setError(resetError.message);
                return;
              }
              setSent(true);
            }).finally(() => setIsSubmitting(false));
          }}
          className="space-y-5"
        >
          <div>
            <label className={authLabel}>Email address</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={authField}
              placeholder="you@company.co.za"
            />
          </div>
          {error && <p role="alert" className="text-sm text-rose-600">{error}</p>}
          <Button type="submit" variant="primary" size="lg" full disabled={isSubmitting}>
            {isSubmitting ? "Sending..." : "Send Reset Link"} {!isSubmitting && <Mail className="h-4 w-4" />}
          </Button>
          <Link to="/login" className="flex items-center justify-center gap-1.5 text-sm font-semibold text-navy-900 hover:text-gold-500">
            <ArrowLeft className="h-4 w-4" /> Back to login
          </Link>
        </form>
      )}
    </AuthShell>
  );
}
