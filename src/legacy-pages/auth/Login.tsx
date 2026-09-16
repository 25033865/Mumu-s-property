import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Eye, EyeOff, LogIn, ShieldCheck } from "lucide-react";
import AuthShell, { authField, authLabel } from "../../components/AuthShell";
import { Button } from "../../components/ui";
import { supabase } from "../../lib/supabaseClient";

export default function Login() {
  const nav = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [isFormComplete, setIsFormComplete] = useState(false);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  return (
    <AuthShell title="Login" subtitle="Sign in to access your requests, quotes and projects.">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          const formData = new FormData(e.currentTarget);
          const email = String(formData.get("email") ?? "");
          const password = String(formData.get("password") ?? "");
          setError("");
          setIsSubmitting(true);
          void supabase.auth.signInWithPassword({ email, password }).then(({ error: signInError }) => {
            if (signInError) {
              setError(signInError.message === "Email not confirmed" ? "Please verify your email before signing in." : signInError.message);
              return;
            }
            nav("/portal");
          }).finally(() => setIsSubmitting(false));
        }}
        onInput={(e) => setIsFormComplete(e.currentTarget.checkValidity())}
        className="space-y-5"
      >
        <div>
          <label className={authLabel}>Email address</label>
          <input name="email" type="email" required defaultValue="" className={authField} placeholder="you@company.co.za" />
        </div>
        <div>
          <label className={authLabel}>Password</label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              required
              name="password"
              defaultValue=""
              className={`${authField} pr-11`}
              placeholder="Enter your password"
            />
            <button
              type="button"
              onClick={() => setShowPassword((visible) => !visible)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-ink/60 hover:text-navy-900"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>
        {error && <p role="alert" className="text-sm text-rose-600">{error}</p>}
        <div className="flex items-center justify-between text-sm">
          <label className="flex cursor-pointer items-center gap-2 text-slate-ink">
            <input type="checkbox" className="h-4 w-4 rounded border-hairline accent-navy-900" /> Remember me
          </label>
          <Link to="/forgot" className="font-semibold text-navy-900 hover:text-gold-500">Forgot password?</Link>
        </div>
        <Button type="submit" variant="primary" size="lg" full disabled={!isFormComplete || isSubmitting}>
          {isSubmitting ? "Signing in..." : "Sign In"} {!isSubmitting && <LogIn className="h-4 w-4" />}
        </Button>
        <p className="text-center text-sm text-slate-ink">
          Don't have an account?{" "}
          <Link to="/register" className="font-semibold text-navy-900 hover:text-gold-500">Create account</Link>
        </p>
        <div className="border-t border-hairline pt-5 text-center">
          <p className="text-xs text-slate-ink">Are you a MUMUS team member?</p>
          <Button to="/admin-login" type="button" variant="outline" size="md" full className="mt-3">
            <ShieldCheck className="h-4 w-4" /> Admin Login
          </Button>
        </div>
      </form>
    </AuthShell>
  );
}
