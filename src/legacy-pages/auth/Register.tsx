import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Eye, EyeOff, UserPlus } from "lucide-react";
import AuthShell, { authField, authLabel } from "../../components/AuthShell";
import { Button } from "../../components/ui";

export default function Register() {
  const nav = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isFormComplete, setIsFormComplete] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const passwordMismatch = confirmPassword.length > 0 && password !== confirmPassword;
  return (
    <AuthShell title="Create an account" subtitle="Register to submit requests and track your quotes online.">
      <form
        onSubmit={(e) => { e.preventDefault(); nav("/verify"); }}
        onInput={(e) => setIsFormComplete(e.currentTarget.checkValidity())}
        className="space-y-5"
      >
        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label className={authLabel}>First name</label>
            <input required className={authField} placeholder="Thabo" />
          </div>
          <div>
            <label className={authLabel}>Last name</label>
            <input required className={authField} placeholder="Molefe" />
          </div>
        </div>
        <div>
          <label className={authLabel}>Company</label>
          <input required className={authField} placeholder="Waterberg Mining Co." />
        </div>
        <div>
          <label className={authLabel}>Work email</label>
          <input type="email" required className={authField} placeholder="you@company.co.za" />
        </div>
        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label className={authLabel}>Password</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={`${authField} pr-11`}
                placeholder="••••••••"
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
          <div>
            <label className={authLabel}>Confirm password</label>
            <div className="relative">
              <input
                type={showConfirmPassword ? "text" : "password"}
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                aria-invalid={passwordMismatch}
                className={`${authField} pr-11 ${passwordMismatch ? "border-rose-500 focus:border-rose-500 focus:ring-rose-500/10" : ""}`}
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword((visible) => !visible)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-ink/60 hover:text-navy-900"
                aria-label={showConfirmPassword ? "Hide confirmed password" : "Show confirmed password"}
              >
                {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {passwordMismatch && <p className="mt-1.5 text-xs text-rose-600">Passwords do not match.</p>}
          </div>
        </div>
        <label className="flex cursor-pointer items-start gap-2 text-sm text-slate-ink">
          <input
            type="checkbox"
            required
            className="mt-0.5 h-4 w-4 rounded border-hairline accent-navy-900"
          />
          I agree to the Terms of Service and Privacy Policy.
        </label>
        <Button type="submit" variant="primary" size="lg" full disabled={!isFormComplete || passwordMismatch}>
          Create Account <UserPlus className="h-4 w-4" />
        </Button>
        <p className="text-center text-sm text-slate-ink">
          Already registered?{" "}
          <Link to="/login" className="font-semibold text-navy-900 hover:text-gold-500">Sign in</Link>
        </p>
      </form>
    </AuthShell>
  );
}
