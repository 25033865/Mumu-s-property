import { useState, useEffect, useRef } from "react";
import {
  Link,
  NavLink,
  Outlet,
  useLocation,
} from "react-router-dom";
import {
  Menu,
  ArrowRight,
  Phone,
  Mail,
  MapPin,
} from "lucide-react";
import { Logo, Button } from "./ui";
import { company } from "../data";

const nav = [
  { to: "/", label: "Home", end: true },
  { to: "/offerings", label: "Core Offerings" },
  { to: "/industries", label: "Target Industries" },
  { to: "/hse", label: "HSE & Quality" },
  { to: "/suppliers", label: "Supplier Categories" },
  { to: "/contact", label: "Contact / RFQ" },
  { to: "/about", label: "About Us" },
];

export default function PublicLayout() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const headerRef = useRef<HTMLElement>(null);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const loc = useLocation();

  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 20);
    h();
    window.addEventListener("scroll", h);
    return () => window.removeEventListener("scroll", h);
  }, []);

  useEffect(() => {
    setOpen(false);
    window.scrollTo(0, 0);
  }, [loc.pathname]);

  useEffect(() => {
    if (!open) return;
    const dismissOutside = (event: PointerEvent) => {
      if (!headerRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const dismissOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
        menuButtonRef.current?.focus();
      }
    };
    document.addEventListener("pointerdown", dismissOutside);
    document.addEventListener("keydown", dismissOnEscape);
    return () => {
      document.removeEventListener("pointerdown", dismissOutside);
      document.removeEventListener("keydown", dismissOnEscape);
    };
  }, [open]);

  return (
    <div className="relative min-h-screen bg-white">
      {/* main nav */}
      <header
        ref={headerRef}
        className={`sticky top-0 z-[1000] transition-all duration-300 ${
          scrolled ? "bg-white/90 shadow-[0_1px_0_rgba(0,0,0,.06)] backdrop-blur-md" : "bg-white"
        }`}
      >
        <div className="relative mx-auto flex max-w-7xl items-center justify-between gap-1 px-3 py-3 sm:gap-2 sm:px-6">
          <Logo className="max-sm:gap-2 max-sm:[&>span:last-child>span:first-child]:text-[clamp(10px,3.5vw,15px)]" />
          <nav className="hidden items-center gap-0.5 xl:flex">
            {nav.map((n) => (
              <NavLink
                key={n.to}
                to={n.to}
                end={n.end}
                className={({ isActive }) =>
                  `relative rounded-lg px-3 py-2 text-[13.5px] font-medium transition-colors ${
                    isActive ? "text-navy-900" : "text-slate-ink hover:text-navy-900"
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    {n.label}
                    {isActive && <span className="absolute inset-x-3 -bottom-0.5 h-0.5 rounded-full bg-gold-400" />}
                  </>
                )}
              </NavLink>
            ))}
          </nav>
          <div className="flex shrink-0 items-center gap-1 sm:gap-2">
            <Button to="/login" variant="gold" size="sm" className="order-2 whitespace-nowrap max-sm:px-2.5 scale-100 transition-transform hover:scale-[1.03] xl:order-1">
              Sign Up <ArrowRight className="hidden h-4 w-4 sm:block" />
            </Button>
            <button
              ref={menuButtonRef}
              onClick={() => setOpen((o) => !o)}
              className="order-1 grid h-10 w-10 place-items-center rounded-lg text-slate-ink hover:bg-navy-900/5 focus-visible:outline-2 focus-visible:outline-gold-400 xl:hidden"
              aria-label={open ? "Close navigation" : "Open navigation"}
              aria-expanded={open}
              aria-controls="mobile-navigation"
            >
              <Menu className="h-7 w-7" />
            </button>
          </div>
        {open && (
          <nav id="mobile-navigation" aria-label="Mobile navigation" className="absolute right-0 top-full w-[220px] max-w-[calc(100vw-24px)] max-h-[calc(100dvh-68px)] overflow-y-auto border-t border-hairline bg-white py-3 shadow-[0_4px_12px_rgba(0,0,0,0.10)] sm:right-6 xl:hidden">
            <div className="flex flex-col">
              {nav.map((n) => (
                <NavLink
                  key={n.to}
                  to={n.to}
                  end={n.end}
                  onClick={() => setOpen(false)}
                  className={({ isActive }) =>
                    `px-4 py-2.5 text-[15px] font-normal transition-colors hover:bg-mist focus-visible:bg-mist ${isActive ? "text-navy-900" : "text-slate-ink"}`
                  }
                >
                  {n.label}
                </NavLink>
              ))}
            </div>
          </nav>
        )}
        </div>
      </header>

      <main>
        <Outlet />
      </main>

      <Footer />
    </div>
  );
}

function Footer() {
  return (
    <footer className="bg-navy-950 pb-20 text-white">
      <div className="mx-auto grid max-w-7xl gap-12 px-6 py-16 md:grid-cols-[1.5fr_1fr_1fr_1.2fr]">
        <div>
          <div className="rounded-xl bg-white/95 p-3"><Logo /></div>
          <p className="mt-5 max-w-xs text-sm leading-relaxed text-white/55">
            {company.slogan}. A South African supplier of industrial supplies, PPE, engineering consumables, equipment and accommodation solutions.
          </p>
        </div>
        <FooterCol title="Explore" links={[["About Us", "/about"], ["Core Offerings", "/offerings"], ["Target Industries", "/industries"], ["Supplier Categories", "/suppliers"]]} />
        <FooterCol title="Access" links={[["HSE & Quality", "/hse"], ["Submit RFQ", "/contact"]]} />
        <div>
          <h4 className="font-mono text-[12px] uppercase tracking-[0.2em] text-gold-400">Get in touch</h4>
          <ul className="mt-5 space-y-3 text-sm text-white/60">
            <li className="flex gap-2.5"><MapPin className="mt-0.5 h-4 w-4 shrink-0 text-gold-400" />{company.address}</li>
            <li className="flex gap-2.5"><Phone className="mt-0.5 h-4 w-4 shrink-0 text-gold-400" />{company.phone}</li>
            <li className="flex gap-2.5"><Mail className="mt-0.5 h-4 w-4 shrink-0 text-gold-400" />{company.email}</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 px-6 py-5 text-[12px] text-white/40 sm:flex-row">
          <span>© {new Date().getFullYear()} {company.name}. All rights reserved.</span>
          <span className="font-mono tracking-wider">Proudly South African 🇿🇦</span>
        </div>
      </div>
    </footer>
  );
}

function FooterCol({ title, links }: { title: string; links: [string, string][] }) {
  return (
    <div>
      <h4 className="font-mono text-[12px] uppercase tracking-[0.2em] text-gold-400">{title}</h4>
      <ul className="mt-5 space-y-2.5 text-sm">
        {links.map(([l, to]) => (
          <li key={l}>
            <Link to={to} className="text-white/60 transition-colors hover:text-white">{l}</Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
