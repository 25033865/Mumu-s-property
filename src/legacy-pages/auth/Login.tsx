import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Eye, EyeOff, LogIn } from "lucide-react";
import AuthShell, { authField, authLabel } from "../../components/AuthShell";
import { Button } from "../../components/ui";

export default function Login() {
  const nav = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [isFormComplete, setIsFormComplete] = useState(false);
  return (
    <AuthShell title="Login" subtitle="Sign in to access your requests, quotes and projects.">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          nav("/portal");
        }}
        onInput={(e) => setIsFormComplete(e.currentTarget.checkValidity())}
        className="space-y-5"
      >
        <div>
          <label className={authLabel}>Email address</label>
          <input type="email" required defaultValue="" className={authField} placeholder="you@company.co.za" />
        </div>
        <div>
          <label className={authLabel}>Password</label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              required
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
        <div className="flex items-center justify-between text-sm">
          <label className="flex cursor-pointer items-center gap-2 text-slate-ink">
            <input type="checkbox" className="h-4 w-4 rounded border-hairline accent-navy-900" /> Remember me
          </label>
          <Link to="/forgot" className="font-semibold text-navy-900 hover:text-gold-500">Forgot password?</Link>
        </div>
        <Button type="submit" variant="primary" size="lg" full disabled={!isFormComplete}>
          Sign In <LogIn className="h-4 w-4" />
        </Button>
        <p className="text-center text-sm text-slate-ink">
          Don't have an account?{" "}
          <Link to="/register" className="font-semibold text-navy-900 hover:text-gold-500">Create account</Link>
        </p>
      </form>
    </AuthShell>
  );
}
