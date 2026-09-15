import { useNavigate, Link } from "react-router-dom";
import { UserPlus } from "lucide-react";
import AuthShell, { authField, authLabel } from "../../components/AuthShell";
import { Button } from "../../components/ui";

export default function Register() {
  const nav = useNavigate();
  return (
    <AuthShell title="Create an account" subtitle="Register to submit requests and track your quotes online.">
      <form onSubmit={(e) => { e.preventDefault(); nav("/verify"); }} className="space-y-5">
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
          <input className={authField} placeholder="Waterberg Mining Co." />
        </div>
        <div>
          <label className={authLabel}>Work email</label>
          <input type="email" required className={authField} placeholder="you@company.co.za" />
        </div>
        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label className={authLabel}>Password</label>
            <input type="password" required className={authField} placeholder="••••••••" />
          </div>
          <div>
            <label className={authLabel}>Confirm password</label>
            <input type="password" required className={authField} placeholder="••••••••" />
          </div>
        </div>
        <label className="flex cursor-pointer items-start gap-2 text-sm text-slate-ink">
          <input type="checkbox" required className="mt-0.5 h-4 w-4 rounded border-hairline accent-navy-900" />
          I agree to the Terms of Service and Privacy Policy.
        </label>
        <Button type="submit" variant="primary" size="lg" full>
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
