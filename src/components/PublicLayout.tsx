import { useState, useEffect } from "react";
import {
  Link,
  NavLink,
  Outlet,
  useLocation,
} from "react-router-dom";
import {
  Menu,
  X,
  ArrowRight,
  Phone,
  Mail,
  MapPin,
} from "lucide-react";
import { Logo, Button } from "./ui";
import { company } from "../data";

const nav = [
  { to: "/", label: "Home", end: true },
  { to: "/about", label: "About Us" },
  { to: "/offerings", label: "Core Offerings" },
  { to: "/industries", label: "Target Industries" },
  { to: "/hse", label: "HSE & Quality" },
  { to: "/suppliers", label: "Supplier Categories" },
  { to: "/contact", label: "Contact / RFQ" },
];

export default function PublicLayout() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
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

  return (
    <div className="min-h-full bg-white">
      {/* main nav */}
      <header
        className={`sticky top-0 z-50 transition-all duration-300 ${
          scrolled ? "bg-white/90 shadow-[0_1px_0_rgba(0,0,0,.06)] backdrop-blur-md" : "bg-white"
        }`}
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-3">
          <Logo />
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
          <div className="flex items-center gap-2">
            <Button to="/login" variant="gold" size="sm" className="hidden scale-100 transition-transform hover:scale-[1.03] sm:inline-flex">
              Sign Up <ArrowRight className="h-4 w-4" />
            </Button>
            <button
              onClick={() => setOpen((o) => !o)}
              className="grid h-10 w-10 place-items-center rounded-lg text-navy-900 hover:bg-navy-900/5 xl:hidden"
              aria-label="Menu"
            >
              {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
        {open && (
          <div className="border-t border-hairline bg-white px-6 py-4 xl:hidden">
            <div className="flex flex-col gap-1">
              {nav.map((n) => (
                <NavLink
                  key={n.to}
                  to={n.to}
                  end={n.end}
                  className={({ isActive }) =>
                    `rounded-lg px-3 py-2.5 text-[15px] font-medium ${isActive ? "bg-navy-900/5 text-navy-900" : "text-slate-ink"}`
                  }
                >
                  {n.label}
                </NavLink>
              ))}
              <div className="mt-3 flex flex-col gap-2">
                <Button to="/login" variant="gold" full>Sign Up</Button>
                <Button to="/contact" variant="outline" full>Submit RFQ</Button>
              </div>
            </div>
          </div>
        )}
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
