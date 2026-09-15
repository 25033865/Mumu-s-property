import Link from "next/link";
import type { ReactNode } from "react";
import logoMark from "@/imports/PHOTO-2026-09-11-16-12-37.jpg";

export function Logo({
  variant = "dark",
  className = "",
}: {
  variant?: "dark" | "light";
  className?: string;
}) {
  const text = variant === "light" ? "text-white" : "text-navy-900";
  const sub = variant === "light" ? "text-white/50" : "text-slate-ink/70";
  return (
    <Link href="/" className={`group flex items-center gap-3 ${className}`}>
      <span className="grid h-11 w-11 shrink-0 place-items-center overflow-hidden rounded-lg bg-white shadow-sm ring-1 ring-navy-900/10">
        <img src={logoMark.src} alt="MUMUS PROPERTYS logo" className="h-full w-full object-cover" />
      </span>
      <span className="leading-none">
        <span className={`font-display block text-[15px] font-extrabold tracking-tight ${text}`}>
          MUMUS PROPERTYS
        </span>
        <span className={`font-mono block text-[9px] uppercase tracking-[0.2em] ${sub}`}>
          Pty Ltd · Reg 2026/229589/07
        </span>
      </span>
    </Link>
  );
}

type BtnProps = {
  children: ReactNode;
  to?: string;
  onClick?: () => void;
  variant?: "primary" | "gold" | "ghost" | "outline" | "dark";
  size?: "sm" | "md" | "lg";
  className?: string;
  type?: "button" | "submit";
  full?: boolean;
};

export function Button({
  children,
  to,
  onClick,
  variant = "primary",
  size = "md",
  className = "",
  type = "button",
  full,
}: BtnProps) {
  const sizes = {
    sm: "h-9 px-4 text-[13px]",
    md: "h-11 px-6 text-sm",
    lg: "h-13 px-8 text-[15px] py-3.5",
  };
  const variants = {
    primary: "bg-navy-900 text-white hover:bg-navy-800 shadow-sm hover:shadow-md",
    gold: "bg-gold-400 text-navy-900 hover:bg-gold-300 shadow-sm hover:shadow-md",
    dark: "bg-navy-950 text-white hover:bg-navy-900 ring-1 ring-white/15",
    ghost: "text-navy-900 hover:bg-navy-900/5",
    outline: "border border-navy-900/20 text-navy-900 hover:border-navy-900 hover:bg-navy-900/5",
  };
  const cls = `inline-flex items-center justify-center gap-2 rounded-lg font-semibold tracking-tight transition-all duration-200 active:scale-[.98] ${sizes[size]} ${variants[variant]} ${full ? "w-full" : ""} ${className}`;
  if (to) return (
    <Link href={to} className={cls} onClick={onClick}>
      {children}
    </Link>
  );
  return <button type={type} onClick={onClick} className={cls}>{children}</button>;
}

export function Eyebrow({ children, light }: { children: ReactNode; light?: boolean }) {
  return (
    <span className={`eyebrow inline-flex items-center gap-2 ${light ? "text-gold-300" : "text-gold-500"}`}>
      <span className="h-px w-6 bg-current opacity-60" />
      {children}
    </span>
  );
}

export function Section({
  children,
  className = "",
  id,
}: {
  children: ReactNode;
  className?: string;
  id?: string;
}) {
  return (
    <section id={id} className={`px-6 py-20 md:py-28 ${className}`}>
      <div className="mx-auto max-w-7xl">{children}</div>
    </section>
  );
}

export function Badge({
  children,
  tone = "navy",
}: {
  children: ReactNode;
  tone?: "navy" | "gold" | "green" | "blue" | "amber" | "gray" | "red" | "violet";
}) {
  const tones: Record<string, string> = {
    navy: "bg-navy-900/8 text-navy-800 ring-navy-900/10",
    gold: "bg-gold-100 text-gold-500 ring-gold-500/20",
    green: "bg-emerald-50 text-emerald-700 ring-emerald-600/20",
    blue: "bg-blue-50 text-blue-700 ring-blue-600/20",
    amber: "bg-amber-50 text-amber-700 ring-amber-600/20",
    gray: "bg-slate-100 text-slate-600 ring-slate-500/20",
    red: "bg-rose-50 text-rose-700 ring-rose-600/20",
    violet: "bg-violet-50 text-violet-700 ring-violet-600/20",
  };
  return (
    <span className={`font-mono inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-medium uppercase tracking-wider ring-1 ring-inset ${tones[tone]}`}>
      {children}
    </span>
  );
}
