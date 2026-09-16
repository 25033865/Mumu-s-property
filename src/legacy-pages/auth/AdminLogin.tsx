import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff, LogIn } from "lucide-react";
import AuthShell, { authField, authLabel } from "../../components/AuthShell";
import { Button } from "../../components/ui";
import { getCurrentUserRole, supabase } from "../../lib/supabaseClient";

export default function AdminLogin() {
const nav = useNavigate();
const [showPassword, setShowPassword] = useState(false);
const [isFormComplete, setIsFormComplete] = useState(false);
const [error, setError] = useState("");
const [isSubmitting, setIsSubmitting] = useState(false);

return (
    <AuthShell
    eyebrow="Admin Console"
    title="Admin login"
    subtitle="Sign in with your MUMUS staff account."
    heroTitle="Keep every client request moving forward."
    indicators={[
        "Review RFQs and manage the service pipeline",
        "Prepare quotations and coordinate delivery",
        "Support clients across every project",
    ]}
    securityText="Secure, encrypted staff access"
    >
    <form
        onSubmit={(event) => {
        event.preventDefault();
        const formData = new FormData(event.currentTarget);
        const email = String(formData.get("email") ?? "");
        const password = String(formData.get("password") ?? "");
        setError("");
        setIsSubmitting(true);

        void supabase.auth
            .signInWithPassword({ email, password })
            .then(async ({ error: signInError }) => {
            if (signInError) {
                setError(
                signInError.message === "Email not confirmed"
                    ? "Please verify your email before signing in."
                    : signInError.message,
                );
                return;
            }

            const { role, error: roleError } = await getCurrentUserRole();
            if (roleError || role !== "admin") {
                await supabase.auth.signOut();
                setError("This account does not have admin access.");
                return;
            }

            nav("/admin");
            })
            .finally(() => setIsSubmitting(false));
        }}
        onInput={(event) =>
        setIsFormComplete(event.currentTarget.checkValidity())
        }
        className="space-y-5"
    >
        <div>
        <label className={authLabel}>Staff email</label>
        <input
            name="email"
            type="email"
            required
            className={authField}
            placeholder="name@mumus.co.za"
        />
        </div>
        <div>
        <label className={authLabel}>Password</label>
        <div className="relative">
            <input
            type={showPassword ? "text" : "password"}
            required
            name="password"
            className={`${authField} pr-11`}
            placeholder="Enter your password"
            />
            <button
            type="button"
            onClick={() => setShowPassword((visible) => !visible)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-ink/60 hover:text-navy-900"
            aria-label={showPassword ? "Hide password" : "Show password"}
            >
            {showPassword ? (
                <EyeOff className="h-4 w-4" />
            ) : (
                <Eye className="h-4 w-4" />
            )}
            </button>
        </div>
        </div>
        {error && (
        <p role="alert" className="text-sm text-rose-600">
            {error}
        </p>
        )}
        <Button
        type="submit"
        variant="primary"
        size="lg"
        full
        disabled={!isFormComplete || isSubmitting}
        >
        {isSubmitting ? "Signing in..." : "Sign In"}{" "}
        {!isSubmitting && <LogIn className="h-4 w-4" />}
        </Button>
        <Link
        to="/login"
        className="block text-center text-sm font-semibold text-navy-900 hover:text-gold-500"
        >
        Back to client login
        </Link>
    </form>
    </AuthShell>
);
}
