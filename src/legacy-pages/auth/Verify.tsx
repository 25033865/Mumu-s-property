import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { MailCheck } from "lucide-react";
import AuthShell from "../../components/AuthShell";
import { Button } from "../../components/ui";

export default function Verify() {
  const nav = useNavigate();
  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const refs = useRef<(HTMLInputElement | null)[]>([]);

  const set = (i: number, v: string) => {
    if (!/^\d?$/.test(v)) return;
    const next = [...code];
    next[i] = v;
    setCode(next);
    if (v && i < 5) refs.current[i + 1]?.focus();
  };

  return (
    <AuthShell title="Verify your email" subtitle="We've sent a 6-digit verification code to your inbox.">
      <form onSubmit={(e) => { e.preventDefault(); nav("/portal"); }} className="space-y-6">
        <div className="flex items-center justify-center gap-2.5">
          <span className="grid h-11 w-11 place-items-center rounded-xl bg-gold-100 text-gold-500">
            <MailCheck className="h-6 w-6" />
          </span>
        </div>
        <div className="flex justify-center gap-2.5">
          {code.map((c, i) => (
            <input
              key={i}
              ref={(el) => { refs.current[i] = el; }}
              value={c}
              onChange={(e) => set(i, e.target.value)}
              onKeyDown={(e) => { if (e.key === "Backspace" && !c && i > 0) refs.current[i - 1]?.focus(); }}
              inputMode="numeric"
              maxLength={1}
              className="font-display h-14 w-12 rounded-xl border border-hairline bg-white text-center text-2xl font-bold text-navy-900 outline-none focus:border-navy-900 focus:ring-2 focus:ring-navy-900/10"
            />
          ))}
        </div>
        <Button type="submit" variant="primary" size="lg" full>Verify & Continue</Button>
        <p className="text-center text-sm text-slate-ink">
          Didn't get it? <button type="button" className="font-semibold text-navy-900 hover:text-gold-500">Resend code</button>
        </p>
      </form>
    </AuthShell>
  );
}
