import { useNavigate, Link } from "react-router-dom";
import { LogIn } from "lucide-react";
import AuthShell, { authField, authLabel } from "../../components/AuthShell";
import { Button } from "../../components/ui";

export default function Login() {
  const nav = useNavigate();
  return (
    <AuthShell title="Client login" subtitle="Sign in to access your requests, quotes and projects.">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          nav("/portal");
        }}
        className="space-y-5"
      >
        <div>
          <label className={authLabel}>Email address</label>
          <input type="email" required defaultValue="thabo@waterbergmining.co.za" className={authField} placeholder="you@company.co.za" />
        </div>
        <div>
          <label className={authLabel}>Password</label>
          <input type="password" required defaultValue="password" className={authField} placeholder="••••••••" />
        </div>
        <div className="flex items-center justify-between text-sm">
          <label className="flex cursor-pointer items-center gap-2 text-slate-ink">
            <input type="checkbox" className="h-4 w-4 rounded border-hairline accent-navy-900" /> Remember me
          </label>
          <Link to="/forgot" className="font-semibold text-navy-900 hover:text-gold-500">Forgot password?</Link>
        </div>
        <Button type="submit" variant="primary" size="lg" full>
          Sign In <LogIn className="h-4 w-4" />
        </Button>
        <p className="text-center text-sm text-slate-ink">
          Don't have an account?{" "}
          <Link to="/register" className="font-semibold text-navy-900 hover:text-gold-500">Create account</Link>
        </p>
        <div className="rounded-xl bg-mist p-4 text-center">
          <p className="font-mono text-[11px] uppercase tracking-wider text-slate-ink">Prototype — no credentials required</p>
          <div className="mt-3 grid grid-cols-2 gap-2">
            <Button onClick={() => nav("/portal")} variant="outline" size="sm">Demo Client Portal</Button>
            <Button onClick={() => nav("/admin")} variant="dark" size="sm">Demo Admin Suite</Button>
          </div>
        </div>
      </form>
    </AuthShell>
  );
}
