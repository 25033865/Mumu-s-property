import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import { Eyebrow } from "./ui";
import { img } from "../data";

export default function PageHero({
  eyebrow,
  title,
  subtitle,
  crumb,
  image = img("1513828583688-c52646db42da", 1600, 600),
  overlay = "dark",
}: {
  eyebrow: string;
  title: ReactNode;
  subtitle: string;
  crumb: string;
  image?: string;
  overlay?: "dark" | "soft";
}) {
  return (
    <section className="relative overflow-hidden bg-navy-950 text-white">
      <div className="absolute inset-0">
        <img src={image} alt="" className={`h-full w-full object-cover ${overlay === "soft" ? "opacity-70" : "opacity-25"}`} />
        <div className={`absolute inset-0 bg-gradient-to-r ${overlay === "soft" ? "from-navy-950/90 via-navy-950/75 to-navy-900/45" : "from-navy-950 via-navy-950/90 to-navy-900/60"}`} />
      </div>
      <div className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 md:py-24">
        <nav className="font-mono flex items-center gap-1.5 text-[12px] text-white/45">
          <Link to="/" className="hover:text-white">Home</Link>
          <ChevronRight className="h-3.5 w-3.5" />
          <span className="text-gold-300">{crumb}</span>
        </nav>
        <div className="mt-6 max-w-3xl animate-fade-up">
          <Eyebrow light>{eyebrow}</Eyebrow>
          <h1 className="font-display mt-4 max-w-4xl text-4xl font-extrabold leading-[1.02] tracking-tight md:text-6xl">{title}</h1>
          <p className="mt-5 max-w-2xl text-base leading-relaxed text-white/65 sm:text-lg">{subtitle}</p>
        </div>
      </div>
    </section>
  );
}
