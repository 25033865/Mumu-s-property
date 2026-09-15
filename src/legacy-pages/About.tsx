import { Target, Compass, Eye, ShieldCheck, ArrowRight, Boxes } from "lucide-react";
import { Button, Eyebrow, Section, Badge } from "../components/ui";
import PageHero from "../components/PageHero";
import { company, advantages, stats, procurement, img } from "../data";

export default function About() {
  return (
    <>
      <PageHero
        eyebrow="About Us"
        crumb="About Us"
        title="A single-source industrial supply partner"
        subtitle="MUMUS PROPERTYS (PTY) LTD supplies mining, engineering, construction and industrial clients with PPE, consumables, equipment, materials and contractor accommodation."
        image={img("1533558701576-23c65e0272fb", 1600, 600)}
      />

      {/* Who we are */}
      <Section>
        <div className="grid items-center gap-14 lg:grid-cols-2">
          <div>
            <Eyebrow>Company overview</Eyebrow>
            <h2 className="font-display mt-4 text-3xl font-extrabold tracking-tight text-navy-900 md:text-4xl">
              Reliable sourcing, based in Lephalale
            </h2>
            <div className="mt-6 space-y-4 text-slate-ink">
              <p>
                MUMUS PROPERTYS (PTY) LTD is a proudly South African supplier of industrial goods and services. We
                source and deliver PPE, engineering and mining consumables, pumps,
                valves, electric motors, electrical supplies, insulation materials and contractor accommodation.
              </p>
              <p>
                Positioned for local procurement and enterprise development, we are aligned with the preferential
                procurement frameworks of {procurement.join(", ")} — combining supplier pricing leverage, responsive
                service and direct-to-site delivery.
              </p>
            </div>
            <div className="mt-8 grid grid-cols-2 gap-6 border-t border-hairline pt-8 sm:grid-cols-4">
              {stats.map((s) => (
                <div key={s.l}>
                  <div className="font-display text-3xl font-extrabold text-navy-900">{s.n}</div>
                  <div className="font-mono mt-1 text-[10px] uppercase tracking-wider text-slate-ink">{s.l}</div>
                </div>
              ))}
            </div>
          </div>
          <div className="relative">
            <img src={img("1541888946425-d81bb19240f5", 900, 1000)} alt="Industrial site operations" className="w-full rounded-2xl bg-navy-900 object-cover shadow-xl" />
            <div className="absolute -bottom-6 -left-6 hidden rounded-2xl bg-gold-400 p-6 shadow-xl sm:block">
              <div className="font-display text-3xl font-extrabold text-navy-900">1</div>
              <div className="font-mono text-[11px] uppercase tracking-wider text-navy-900/70">Accountable vendor</div>
            </div>
          </div>
        </div>
      </Section>

      {/* Vision / Mission / Objective */}
      <section className="bg-navy-950 px-6 py-20 text-white md:py-24">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-6 md:grid-cols-3">
            {[
              { icon: Eye, t: "Our Vision", d: "To be a trusted single-source supplier of industrial goods and services across South Africa's mining and industrial heartland." },
              { icon: Compass, t: "Our Mission", d: "To deliver reliable sourcing, competitive pricing and quality solutions that keep our clients' operations running." },
              { icon: Target, t: "Our Objective", d: "To supply multiple product categories through one accountable vendor, with responsive service and dependable delivery capability." },
            ].map((c) => (
              <div key={c.t} className="glass rounded-2xl p-8">
                <span className="grid h-12 w-12 place-items-center rounded-xl bg-gold-400 text-navy-900">
                  <c.icon className="h-6 w-6" />
                </span>
                <h3 className="font-display mt-5 text-2xl font-bold">{c.t}</h3>
                <p className="mt-3 leading-relaxed text-white/65">{c.d}</p>
              </div>
            ))}
          </div>
          <div className="mt-10 rounded-2xl bg-gold-400 p-8 text-center">
            <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-navy-900/60">Our slogan</p>
            <p className="font-display mt-3 text-2xl font-extrabold text-navy-900 md:text-3xl">
              Reliable Sourcing. Competitive Pricing. Quality Solutions.
            </p>
          </div>
        </div>
      </section>

      {/* Why choose */}
      <Section>
        <div className="text-center">
          <Eyebrow>Why choose MUMUS PROPERTYS</Eyebrow>
          <h2 className="font-display mx-auto mt-4 max-w-2xl text-3xl font-extrabold tracking-tight text-navy-900 md:text-4xl">
            The advantages of a single-source vendor
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
            <div className="mt-5"><Button to="/contact" variant="gold" size="sm">Submit RFQ <ArrowRight className="h-4 w-4" /></Button></div>
          </div>
        </div>
        <div className="mt-12 flex flex-wrap items-center justify-between gap-4 rounded-2xl bg-mist p-8">
          <div className="flex items-center gap-3">
            <Badge tone="gold">Let's talk</Badge>
            <span className="text-lg font-semibold text-navy-900">Ready to work with a partner you can rely on?</span>
          </div>
          <Button to="/contact" variant="primary">Request a Quote <ArrowRight className="h-4 w-4" /></Button>
        </div>
      </Section>
    </>
  );
}
