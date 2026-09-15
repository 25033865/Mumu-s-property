import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { CheckCircle2, MailCheck } from "lucide-react";
import AuthShell from "../../components/AuthShell";
import { Button } from "../../components/ui";
import { supabase } from "../../lib/supabaseClient";

export default function Verify() {
  const location = useLocation();
  const nav = useNavigate();
  const email = (location.state as { email?: string } | null)?.email;
  const [isVerified, setIsVerified] = useState(false);
  const [message, setMessage] = useState("Check your inbox and click the verification link to continue.");
  const [isChecking, setIsChecking] = useState(false);

  useEffect(() => {
    let active = true;
    const refreshVerification = async () => {
      const { data, error } = await supabase.auth.getUser();
      if (!active) return;
      if (error) {
        setMessage("We could not confirm your session. Please open the latest verification email again.");
        return;
      }
      setIsVerified(Boolean(data.user?.email_confirmed_at));
    };

    void refreshVerification();
    const { data: authListener } = supabase.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_IN" || event === "USER_UPDATED") {
        void refreshVerification();
      }
    });

    return () => {
      active = false;
      authListener.subscription.unsubscribe();
    };
  }, []);

  const continueToPortal = async () => {
    setIsChecking(true);
    const { data } = await supabase.auth.getUser();
    if (data.user?.email_confirmed_at) nav("/portal");
    else setMessage("Your email is not verified yet. Click the link in the email first.");
    setIsChecking(false);
  };

  return (
    <AuthShell title="Verify your email" subtitle={email ? `We sent a verification link to ${email}.` : "Check your inbox for the verification link."}>
      <div className="space-y-6 text-center">
        <span className={`mx-auto grid h-14 w-14 place-items-center rounded-full ${isVerified ? "bg-emerald-50 text-emerald-600" : "bg-gold-100 text-gold-500"}`}>
          {isVerified ? <CheckCircle2 className="h-7 w-7" /> : <MailCheck className="h-7 w-7" />}
        </span>
        <p className="text-sm text-slate-ink">{isVerified ? "Your email is verified." : message}</p>
        <Button type="button" variant="primary" size="lg" full onClick={() => void continueToPortal()} disabled={isChecking || !isVerified}>
          {isChecking ? "Checking..." : "Continue to portal"}
        </Button>
        <Link to="/login" className="text-sm font-semibold text-navy-900 hover:text-gold-500">Back to login</Link>
      </div>
    </AuthShell>
  );
}
