import { useState, useEffect } from "react";
import {
  Link,
  NavLink,
  Outlet,
  useLocation,
  useNavigate,
} from "react-router-dom";
import {
  LayoutGrid, Users, ClipboardList, ReceiptText, BedDouble, FileText,
  MessageSquare, BarChart3, LogOut, Menu, X, Search, ShieldCheck,
} from "lucide-react";
import { Logo } from "./ui";
import { getCurrentUserRole, supabase } from "../lib/supabaseClient";

const nav = [
  { to: "/admin", label: "Overview", icon: LayoutGrid, end: true },
  { to: "/admin/clients", label: "Clients", icon: Users },
  { to: "/admin/requests", label: "RFQ Pipeline", icon: ClipboardList },
  { to: "/admin/roster", label: "Accommodation Roster", icon: BedDouble },
  { to: "/admin/requests", label: "Quotations", icon: ReceiptText, disabled: true },
  { to: "/admin/messages", label: "Messages", icon: MessageSquare },
  { to: "/admin", label: "Documents", icon: FileText, disabled: true },
  { to: "/admin", label: "Analytics", icon: BarChart3, disabled: true },
];

export default function AdminLayout() {
  const [open, setOpen] = useState(false);
  const [authChecking, setAuthChecking] = useState(true);
  const [unreadMessages, setUnreadMessages] = useState(0);
  const loc = useLocation();
  const nav2 = useNavigate();
  useEffect(() => setOpen(false), [loc.pathname]);
  useEffect(() => {
    let active = true;
    const loadUnread = async () => {
      const { data } = await supabase
        .from("messages")
        .select("thread_id")
        .eq("sender_role", "client")
        .is("read_at", null);
      const uniqueThreads = new Set((data ?? []).map((message) => message.thread_id));
      if (active) setUnreadMessages(uniqueThreads.size);
    };
    void loadUnread();
    const channel = supabase.channel("admin-unread-messages").on("postgres_changes", { event: "*", schema: "public", table: "messages" }, () => void loadUnread()).subscribe();
    return () => { active = false; void supabase.removeChannel(channel); };
  }, []);
  useEffect(() => {
    let active = true;
    void supabase.auth.getUser().then(async ({ data }) => {
      if (!data.user?.email_confirmed_at) {
        nav2("/admin-login", { replace: true });
        return;
      }
      const { role } = await getCurrentUserRole();
      if (role !== "admin") {
        nav2("/admin-login", { replace: true });
        return;
      }
      if (active) setAuthChecking(false);
    });
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session?.user.email_confirmed_at) nav2("/admin-login", { replace: true });
    });
    return () => {
      active = false;
      listener.subscription.unsubscribe();
    };
  }, [nav2]);

  if (authChecking) return <div className="grid min-h-screen place-items-center bg-[#0a1020] text-sm text-white/60">Checking your account...</div>;

  return (
    <div className="flex min-h-full bg-[#0a1020]">
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-white/5 bg-navy-950 text-white transition-transform lg:static lg:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between px-5 py-5">
          <Logo variant="light" />
          <button onClick={() => setOpen(false)} className="lg:hidden"><X className="h-5 w-5" /></button>
        </div>
        <div className="mx-4 mb-4 flex items-center gap-2 rounded-lg bg-gold-400/10 px-3 py-2 ring-1 ring-gold-400/20">
          <ShieldCheck className="h-4 w-4 text-gold-400" />
          <span className="font-mono text-[11px] uppercase tracking-wider text-gold-300">Admin console</span>
        </div>
        <nav className="flex-1 space-y-1 overflow-y-auto px-3">
          {nav.map((n, i) => (
            <NavLink
              key={i}
              to={n.to}
              end={n.end}
              onClick={(e) => n.disabled && e.preventDefault()}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-lg px-3.5 py-2.5 text-sm font-medium transition-colors ${
                  n.disabled ? "cursor-default text-white/30" : isActive ? "bg-gold-400 text-navy-900" : "text-white/60 hover:bg-white/5 hover:text-white"
                }`
              }
            >
              <n.icon className="h-[18px] w-[18px]" /> {n.label}
              {n.label === "Messages" && unreadMessages > 0 && <span className="ml-auto rounded-full bg-gold-400 px-2 py-0.5 text-[10px] font-bold text-navy-900">{unreadMessages > 99 ? "99+" : unreadMessages}</span>}
            </NavLink>
          ))}
        </nav>
        <div className="border-t border-white/10 p-3">
          <button onClick={() => { void supabase.auth.signOut().then(() => nav2("/admin-login")); }} className="flex w-full items-center gap-3 rounded-lg px-3.5 py-2.5 text-sm font-medium text-white/60 hover:bg-rose-500/15 hover:text-rose-200">
            <LogOut className="h-[18px] w-[18px]" /> Sign out
          </button>
        </div>
      </aside>

      {open && <div className="fixed inset-0 z-40 bg-black/50 lg:hidden" onClick={() => setOpen(false)} />}

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex items-center gap-4 border-b border-white/5 bg-navy-950/80 px-5 py-3.5 backdrop-blur-md lg:px-8">
          <button onClick={() => setOpen(true)} className="lg:hidden"><Menu className="h-5 w-5 text-white" /></button>
          <div className="relative hidden max-w-md flex-1 md:block">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" />
            <input placeholder="Search clients, requests, quotes…" className="w-full rounded-lg border border-white/10 bg-white/5 py-2 pl-9 pr-3 text-sm text-white outline-none placeholder:text-white/40 focus:border-gold-400/50" />
          </div>
          <div className="ml-auto flex items-center gap-3">
            <span className="font-mono hidden text-[11px] uppercase tracking-wider text-white/40 sm:block">MUMUS Staff Portal</span>
            <span className="grid h-9 w-9 place-items-center rounded-full bg-gold-400 text-sm font-bold text-navy-900">NK</span>
          </div>
        </header>
        <main className="flex-1 px-5 py-6 lg:px-8 lg:py-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
