import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { ShieldCheck, CheckCircle2 } from "lucide-react";
import { Logo } from "./ui";
import { HERO_IMG, trustIndicators } from "../data";

export const authField =
  "w-full rounded-lg border border-hairline bg-white px-4 py-3 text-sm text-navy-900 outline-none transition-colors placeholder:text-slate-ink/50 focus:border-navy-900 focus:ring-2 focus:ring-navy-900/10";
export const authLabel = "font-mono mb-1.5 block text-[11px] font-medium uppercase tracking-wider text-slate-ink";

export default function AuthShell({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: ReactNode;
}) {
  return (
    <div className="grid min-h-full lg:grid-cols-2">
      {/* brand side */}
      <div className="relative hidden overflow-hidden bg-navy-950 p-12 text-white lg:flex lg:flex-col">
        <img src={HERO_IMG} alt="" className="absolute inset-0 h-full w-full object-cover opacity-25" />
        <div className="absolute inset-0 bg-gradient-to-b from-navy-950/70 via-navy-950/85 to-navy-950" />
        <div className="relative flex h-full flex-col">
          <Logo variant="light" />
          <div className="my-auto max-w-md">
            <span className="eyebrow text-gold-300">Client Portal</span>
            <h2 className="font-display mt-4 text-4xl font-extrabold leading-tight">
              Manage requests, quotes and projects in one place.
            </h2>
            <div className="mt-8 space-y-3">
              {trustIndicators.map((t) => (
                <div key={t} className="flex items-center gap-3 text-white/70">
                  <CheckCircle2 className="h-5 w-5 shrink-0 text-gold-400" />
                  <span className="text-sm">{t}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="relative flex items-center gap-2 text-[12px] text-white/45">
            <ShieldCheck className="h-4 w-4 text-gold-400" /> Secure, encrypted client access
          </div>
        </div>
      </div>

      {/* form side */}
      <div className="flex flex-col bg-white">
        <div className="flex items-center justify-between px-6 py-5 lg:px-12">
          <div className="lg:hidden"><Logo /></div>
          <Link to="/" className="font-mono ml-auto text-[12px] uppercase tracking-wider text-slate-ink hover:text-navy-900">← Back to site</Link>
        </div>
        <div className="flex flex-1 items-center justify-center px-6 pb-12 lg:px-12">
          <div className="w-full max-w-md">
            <h1 className="font-display text-3xl font-extrabold tracking-tight text-navy-900">{title}</h1>
            <p className="mt-2 text-slate-ink">{subtitle}</p>
            <div className="mt-8">{children}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
