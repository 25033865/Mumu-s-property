import { Link } from "react-router-dom";
import { ArrowRight, ArrowUpRight, Check, BadgeCheck, ShieldCheck, Boxes, Clock } from "lucide-react";
import { Button, Eyebrow, Section, Badge } from "../components/ui";
import { HERO_IMG, offerings, industries, advantages, stats, trustIndicators, procurement } from "../data";

const tiIcons = [BadgeCheck, ShieldCheck, Clock];

export default function Home() {
  return (
    <>
      {/* HERO */}
      <section className="relative overflow-hidden bg-navy-950 text-white">
        <div className="absolute inset-0">
          <img src={HERO_IMG} alt="Mining and industrial operation" className="h-full w-full object-cover opacity-40" />
          <div className="absolute inset-0 bg-gradient-to-r from-navy-950 via-navy-950/85 to-navy-950/30" />
          <div className="absolute inset-0 bg-gradient-to-t from-navy-950 via-transparent to-transparent" />
        </div>
        <div className="relative mx-auto grid max-w-7xl gap-14 px-6 pb-24 pt-20 lg:grid-cols-[1.15fr_.85fr] lg:pt-24">
          <div className="animate-fade-up">
            <Eyebrow light>Mining · Engineering · Maintenance · PPE · Industrial Supplies</Eyebrow>
            <h1 className="font-display mt-6 text-4xl font-extrabold leading-[1.02] tracking-tight sm:text-5xl lg:text-6xl">
              Reliable Sourcing.
              <span className="block text-gold-400">Competitive Pricing. Quality Solutions.</span>
            </h1>
            <p className="mt-7 max-w-xl text-lg leading-relaxed text-white/70">
              Empowering South Africa's mining, engineering, construction and commercial sectors with complete industrial supplies, equipment, PPE and contractor accommodation solutions.
            </p>
            <div className="mt-9 flex flex-wrap items-center gap-3">
              <Button to="/contact" variant="gold" size="lg">Submit RFQ <ArrowRight className="h-5 w-5" /></Button>
              <Button to="/portal" size="lg" className="bg-white/10 text-white ring-1 ring-white/20 hover:bg-white/15">Access Client Portal</Button>
            </div>
            <div className="mt-12 grid max-w-lg grid-cols-2 gap-x-8 gap-y-5 border-t border-white/10 pt-8 sm:grid-cols-4">
              {stats.map((s) => (
                <div key={s.l}>
                  <div className="font-display text-3xl font-extrabold text-white">{s.n}</div>
                  <div className="font-mono mt-1 text-[10px] uppercase tracking-wider text-white/45">{s.l}</div>
                </div>
              ))}
            </div>
          </div>

          {/* glass trust card */}
          <div className="animate-fade-up self-end" style={{ animationDelay: "120ms" }}>
            <div className="glass rounded-2xl p-6 shadow-2xl">
              <span className="eyebrow text-gold-300">Trust Indicators</span>
              <div className="mt-5 space-y-3">
                {trustIndicators.map((t, i) => {
                  const Icon = tiIcons[i];
                  return (
                    <div key={t} className="flex items-start gap-3.5 rounded-xl bg-white/5 p-3.5 ring-1 ring-white/10">
                      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-gold-400 text-navy-900">
                        <Icon className="h-5 w-5" />
                      </span>
                      <div className="text-[13px] font-medium leading-snug text-white/85">{t}</div>
                    </div>
                  );
                })}
              </div>
              <div className="mt-5 flex flex-wrap gap-2 border-t border-white/10 pt-4">
                {procurement.map((p) => (
                  <span key={p} className="font-mono inline-flex items-center gap-1 rounded-full bg-white/5 px-2.5 py-1 text-[10px] text-gold-300 ring-1 ring-white/10">
                    <BadgeCheck className="h-3 w-3" /> {p}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CORE OFFERINGS */}
      <Section>
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div className="max-w-2xl">
            <Eyebrow>Core business areas</Eyebrow>
            <h2 className="font-display mt-4 text-3xl font-extrabold tracking-tight text-navy-900 md:text-5xl">
              A single-source industrial supplier
            </h2>
            <p className="mt-4 text-lg text-slate-ink">
              Six catalog areas — from PPE to pumps, electrical, insulation and accommodation — all through one accountable vendor.
            </p>
          </div>
          <Button to="/offerings" variant="outline">Full Catalog <ArrowRight className="h-4 w-4" /></Button>
        </div>

        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {offerings.map((s) => (
            <Link
              key={s.slug}
              to="/offerings"
              className="group relative flex flex-col overflow-hidden rounded-2xl border border-hairline bg-white transition-all duration-300 hover:-translate-y-1 hover:border-navy-900/20 hover:shadow-xl"
            >
              <div className="relative h-44 overflow-hidden bg-navy-900">
                <img src={s.image} alt={s.title} className="h-full w-full object-cover opacity-90 transition-transform duration-500 group-hover:scale-105" />
                <span className="absolute left-4 top-4 grid h-11 w-11 place-items-center rounded-xl bg-white/95 text-navy-900 shadow-lg backdrop-blur">
                  <s.icon className="h-5 w-5" />
                </span>
                <span className="font-mono absolute right-4 top-4 rounded-md bg-navy-950/70 px-2 py-1 text-[11px] font-semibold text-gold-300">{s.letter}</span>
              </div>
              <div className="flex flex-1 flex-col p-6">
                <h3 className="font-display text-lg font-bold leading-snug text-navy-900">{s.title}</h3>
                <p className="mt-2 flex-1 text-sm leading-relaxed text-slate-ink">{s.blurb}</p>
                <span className="font-mono mt-4 text-[11px] uppercase tracking-wider text-slate-ink/60">{s.items.length} product lines</span>
                <span className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-navy-900 transition-colors group-hover:text-gold-500">
                  View Details <ArrowUpRight className="h-4 w-4" />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </Section>

      {/* INDUSTRIES */}
      <section className="bg-mist px-6 py-20 md:py-24">
        <div className="mx-auto max-w-7xl">
          <div className="text-center">
            <Eyebrow>Industries served</Eyebrow>
            <h2 className="font-display mx-auto mt-4 max-w-2xl text-3xl font-extrabold tracking-tight text-navy-900 md:text-4xl">
              Trusted across South African industry
            </h2>
          </div>
          <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {industries.map((ind) => (
              <div key={ind.title} className="group rounded-2xl border border-hairline bg-white p-6 transition-all hover:border-navy-900/20 hover:shadow-lg">
                <span className="grid h-12 w-12 place-items-center rounded-xl bg-navy-900 text-gold-400 transition-colors group-hover:bg-navy-800">
                  <ind.icon className="h-6 w-6" />
                </span>
                <h3 className="font-display mt-4 text-[15px] font-bold leading-snug text-navy-900">{ind.title}</h3>
                <p className="mt-2 text-[13px] leading-snug text-slate-ink">{ind.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* WHY CHOOSE */}
      <Section>
        <div className="text-center">
          <Eyebrow>Why choose us</Eyebrow>
          <h2 className="font-display mx-auto mt-4 max-w-2xl text-3xl font-extrabold tracking-tight text-navy-900 md:text-4xl">
            Seven reasons clients single-source with MUMUS
          </h2>
        </div>
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {advantages.map((a) => (
            <div key={a.title} className="rounded-2xl border border-hairline bg-white p-7 transition-all hover:shadow-lg">
              <span className="grid h-12 w-12 place-items-center rounded-xl bg-gold-100 text-gold-500">
                <a.icon className="h-6 w-6" />
              </span>
              <h3 className="font-display mt-5 text-lg font-bold text-navy-900">{a.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-ink">{a.desc}</p>
            </div>
          ))}
          <div className="flex flex-col justify-center rounded-2xl bg-navy-900 p-7 text-white">
            <Boxes className="h-8 w-8 text-gold-400" />
            <p className="mt-4 text-lg font-semibold leading-snug">One supplier. Every category.</p>
            <p className="mt-2 text-sm text-white/60">PPE, consumables, equipment and materials — sourced, quoted and delivered.</p>
            <div className="mt-5"><Button to="/contact" variant="gold" size="sm">Submit RFQ <ArrowRight className="h-4 w-4" /></Button></div>
          </div>
        </div>
      </Section>

      {/* CTA */}
      <section className="px-6 pb-24">
        <div className="mx-auto max-w-7xl overflow-hidden rounded-3xl bg-navy-900 px-8 py-16 md:px-16">
          <div className="grid items-center gap-8 md:grid-cols-[1.5fr_1fr]">
            <div>
              <h2 className="font-display text-3xl font-extrabold leading-tight text-white md:text-4xl">
                Ready to source with confidence?
              </h2>
              <p className="mt-4 max-w-xl text-white/60">
                Submit a Request for Quotation and our team will respond rapidly — with urgent breakdown support available 24/7.
              </p>
              <ul className="mt-6 flex flex-wrap gap-x-6 gap-y-2 text-sm text-white/70">
                {["SABS-sourced quality", "Direct-to-site delivery", "OEM specification sourcing"].map((t) => (
                  <li key={t} className="flex items-center gap-2"><Check className="h-4 w-4 text-gold-400" />{t}</li>
                ))}
              </ul>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row md:justify-end">
              <Button to="/contact" variant="gold" size="lg">Submit RFQ</Button>
              <Button to="/portal" size="lg" className="bg-white/10 text-white ring-1 ring-white/20 hover:bg-white/15">Client Portal</Button>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
