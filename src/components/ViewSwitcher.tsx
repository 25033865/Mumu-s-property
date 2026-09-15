import { Link, useLocation } from "react-router-dom";
import { Globe, LayoutDashboard, ShieldCheck } from "lucide-react";

const views = [
  { to: "/", label: "Public Website", icon: Globe, match: (p: string) => !p.startsWith("/portal") && !p.startsWith("/admin") },
  { to: "/portal", label: "Client Portal", icon: LayoutDashboard, match: (p: string) => p.startsWith("/portal") },
  { to: "/admin", label: "Admin Suite", icon: ShieldCheck, match: (p: string) => p.startsWith("/admin") },
];

export default function ViewSwitcher() {
  const { pathname } = useLocation();
  return (
    <div className="fixed bottom-4 left-1/2 z-[60] -translate-x-1/2">
      <div className="flex items-center gap-1 rounded-full border border-white/10 bg-navy-950/90 p-1 shadow-2xl backdrop-blur-md ring-1 ring-black/5">
        <span className="font-mono hidden px-2 text-[10px] uppercase tracking-wider text-white/40 sm:block">View</span>
        {views.map((v) => {
          const active = v.match(pathname);
          return (
            <Link
              key={v.to}
              to={v.to}
              className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[12px] font-semibold transition-colors ${
                active ? "bg-gold-400 text-navy-900" : "text-white/60 hover:bg-white/10 hover:text-white"
              }`}
            >
              <v.icon className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">{v.label}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
