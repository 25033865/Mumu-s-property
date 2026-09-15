import { ArrowRight } from "lucide-react";
import { Button, Eyebrow, Section } from "../components/ui";
import PageHero from "../components/PageHero";
import { industries, img } from "../data";

const imgs = [
  img("1601574465779-76d6dbb88557", 800, 600),
  img("1581092160607-ee22621dd758", 800, 600),
  img("1503387762-592deb58ef4e", 800, 600),
  img("1565043666747-69f6646db940", 800, 600),
  img("1486406146926-c627a92ad1ab", 800, 600),
];

export default function Industries() {
  return (
    <>
      <PageHero
        eyebrow="Target Industries"
        crumb="Target Industries"
        title="Built for demanding environments"
        subtitle="We understand the operational realities of the sectors we serve — uptime, compliance and safety are non-negotiable."
        image={img("1581092160607-ee22621dd758", 1600, 600)}
      />

      <Section>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {industries.map((ind, i) => (
            <div key={ind.title} className="group relative overflow-hidden rounded-2xl border border-hairline bg-white transition-all hover:-translate-y-1 hover:shadow-xl">
              <div className="relative h-48 overflow-hidden bg-navy-900">
                <img src={imgs[i]} alt={ind.title} className="h-full w-full object-cover opacity-90 transition-transform duration-500 group-hover:scale-105" />
                <div className="absolute inset-0 bg-gradient-to-t from-navy-950/70 to-transparent" />
                <span className="absolute left-4 top-4 grid h-11 w-11 place-items-center rounded-xl bg-gold-400 text-navy-900 shadow-lg">
                  <ind.icon className="h-5 w-5" />
                </span>
                <h3 className="font-display absolute bottom-4 left-4 text-xl font-bold text-white">{ind.title}</h3>
              </div>
              <div className="p-6">
                <p className="text-sm leading-relaxed text-slate-ink">{ind.desc}</p>
              </div>
            </div>
          ))}
          <div className="flex flex-col justify-center rounded-2xl bg-navy-900 p-8 text-white">
            <Eyebrow light>Local supplier focus</Eyebrow>
            <p className="mt-4 text-[15px] leading-relaxed text-white/70">
              Positioned for local procurement and enterprise development — aligned with Glencore, Anglo American and Seriti preferential procurement.
            </p>
            <div className="mt-6">
              <Button to="/contact" variant="gold">Get in Touch <ArrowRight className="h-4 w-4" /></Button>
            </div>
          </div>
        </div>
      </Section>
    </>
  );
}
