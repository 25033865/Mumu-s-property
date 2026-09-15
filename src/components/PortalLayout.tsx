import { useState, useEffect } from "react";
import { NavLink, Outlet, useLocation, useNavigate, Link } from "react-router-dom";
import {
  LayoutDashboard, FilePlus2, ClipboardList, ReceiptText, BedDouble,
  FileText, MessageSquare, Bell, LogOut, Menu, X, Search,
} from "lucide-react";
import { Logo } from "./ui";
import ViewSwitcher from "./ViewSwitcher";
import { client } from "../portalData";

const nav: { to: string; label: string; icon: typeof LayoutDashboard; end?: boolean; disabled?: boolean }[] = [
  { to: "/portal", label: "Dashboard Overview", icon: LayoutDashboard, end: true },
  { to: "/portal/new-request", label: "Submit New RFQ", icon: FilePlus2 },
  { to: "/portal/requests", label: "My Requests & Pipeline", icon: ClipboardList },
  { to: "/portal/quotes", label: "Quotes & Estimates", icon: ReceiptText },
  { to: "/portal/accommodation", label: "Accommodation Bookings", icon: BedDouble },
  { to: "/portal/documents", label: "Documents & Spec Sheets", icon: FileText },
  { to: "/portal/messages", label: "Support & Messages", icon: MessageSquare },
];

export default function PortalLayout() {
  const [open, setOpen] = useState(false);
  const loc = useLocation();
  const nav2 = useNavigate();
  useEffect(() => setOpen(false), [loc.pathname]);

  return (
    <div className="flex min-h-full bg-mist">
      {/* sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-72 flex-col bg-navy-950 text-white transition-transform lg:static lg:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between px-6 py-5">
          <Logo variant="light" />
          <button onClick={() => setOpen(false)} className="lg:hidden"><X className="h-5 w-5" /></button>
        </div>
        <nav className="flex-1 space-y-1 overflow-y-auto px-4 py-2">
          {nav.map((n, i) => (
            <NavLink
              key={i}
              to={n.to}
              end={n.end}
              onClick={(e) => n.disabled && e.preventDefault()}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-lg px-3.5 py-2.5 text-sm font-medium transition-colors ${
                  n.disabled
                    ? "cursor-default text-white/35"
                    : isActive
                    ? "bg-white/10 text-white ring-1 ring-white/10"
                    : "text-white/60 hover:bg-white/5 hover:text-white"
                }`
              }
            >
              <n.icon className="h-[18px] w-[18px]" />
              {n.label}
            </NavLink>
          ))}
        </nav>
        <div className="border-t border-white/10 p-4">
          <button
            onClick={() => nav2("/login")}
            className="flex w-full items-center gap-3 rounded-lg px-3.5 py-2.5 text-sm font-medium text-white/60 transition-colors hover:bg-rose-500/15 hover:text-rose-200"
          >
            <LogOut className="h-[18px] w-[18px]" /> Logout
          </button>
        </div>
      </aside>

      {open && <div className="fixed inset-0 z-40 bg-navy-950/50 lg:hidden" onClick={() => setOpen(false)} />}

      {/* main */}
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex items-center gap-4 border-b border-hairline bg-white/90 px-5 py-3.5 backdrop-blur-md lg:px-8">
          <button onClick={() => setOpen(true)} className="lg:hidden"><Menu className="h-5 w-5 text-navy-900" /></button>
          <div className="relative hidden max-w-md flex-1 md:block">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-ink/50" />
            <input placeholder="Search requests, quotes, documents…" className="w-full rounded-lg border border-hairline bg-mist py-2 pl-9 pr-3 text-sm outline-none focus:border-navy-900 focus:bg-white" />
          </div>
          <div className="ml-auto flex items-center gap-3">
            <button className="relative grid h-10 w-10 place-items-center rounded-lg text-slate-ink hover:bg-mist">
              <Bell className="h-5 w-5" />
              <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-gold-400 ring-2 ring-white" />
            </button>
            <Link to="/portal" className="flex items-center gap-2.5 rounded-lg py-1 pl-1 pr-3 hover:bg-mist">
              <span className="grid h-9 w-9 place-items-center rounded-full bg-navy-900 text-sm font-bold text-white">{client.initials}</span>
              <span className="hidden text-left sm:block">
                <span className="block text-[13px] font-semibold leading-tight text-navy-900">{client.name}</span>
                <span className="block text-[11px] text-slate-ink">{client.company}</span>
              </span>
            </Link>
          </div>
        </header>
        <main className="flex-1 px-5 py-6 lg:px-8 lg:py-8">
          <Outlet />
        </main>
      </div>
      <ViewSwitcher />
    </div>
  );
}
