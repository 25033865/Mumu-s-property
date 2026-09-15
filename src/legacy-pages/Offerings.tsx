import { useState } from "react";
import { ChevronDown, Check, ArrowRight } from "lucide-react";
import { Button, Eyebrow } from "../components/ui";
import PageHero from "../components/PageHero";
import { offerings } from "../data";

export default function Offerings() {
  const [open, setOpen] = useState<string | null>(offerings[0].slug);
  const [filter, setFilter] = useState("All");
  const cats = ["All", ...offerings.map((o) => o.title)];
  const shown = filter === "All" ? offerings : offerings.filter((o) => o.title === filter);

  return (
    <>
      <PageHero
        eyebrow="Core Offerings — Full Product Catalog"
        crumb="Core Offerings"
        title="Everything we source and supply"
        subtitle="Six core business areas covering the complete range of industrial supplies, equipment, PPE and accommodation solutions."
      />

      <section className="px-6 py-16 md:py-20">
        <div className="mx-auto max-w-6xl">
          <div className="mb-8 flex flex-wrap gap-2">
            {cats.map((c) => (
              <button
                key={c}
                onClick={() => setFilter(c)}
                className={`rounded-full px-4 py-2 text-[13px] font-semibold transition-colors ${
                  filter === c ? "bg-navy-900 text-white" : "border border-navy-900/15 text-navy-900 hover:bg-navy-900/5"
                }`}
              >
                {c === "All" ? "All Categories" : c}
              </button>
            ))}
          </div>

          <div className="space-y-4">
            {shown.map((o) => {
              const expanded = open === o.slug || filter !== "All";
              return (
                <div key={o.slug} className="overflow-hidden rounded-2xl border border-hairline bg-white shadow-sm">
                  <button
                    onClick={() => setOpen(open === o.slug ? null : o.slug)}
                    className="flex w-full items-center gap-4 px-5 py-5 text-left transition-colors hover:bg-mist"
                  >
                    <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-navy-900 text-gold-400">
                      <o.icon className="h-6 w-6" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[12px] font-semibold text-gold-500">{o.letter}</span>
                        <h2 className="font-display text-lg font-bold text-navy-900">{o.title}</h2>
                      </div>
                      <p className="mt-0.5 truncate text-sm text-slate-ink">{o.blurb}</p>
                    </div>
                    <span className="font-mono hidden shrink-0 text-[11px] uppercase tracking-wider text-slate-ink/60 sm:block">{o.items.length} lines</span>
                    <ChevronDown className={`h-5 w-5 shrink-0 text-slate-ink transition-transform ${expanded ? "rotate-180" : ""}`} />
                  </button>
                  {expanded && (
                    <div className="grid gap-6 border-t border-hairline p-5 md:grid-cols-[1fr_1.4fr]">
                      <div className="relative h-48 overflow-hidden rounded-xl bg-navy-900 md:h-full">
                        <img src={o.image} alt={o.title} className="h-full w-full object-cover opacity-90" />
                      </div>
                      <div>
                        <ul className="grid gap-2 sm:grid-cols-2">
                          {o.items.map((it) => (
                            <li key={it} className="flex items-center gap-2 rounded-lg bg-mist px-3 py-2 text-sm text-navy-900">
                              <Check className="h-4 w-4 shrink-0 text-gold-500" /> {it}
                            </li>
                          ))}
                        </ul>
                        <div className="mt-5">
                          <Button to="/contact" variant="primary" size="sm">Request quote for this category <ArrowRight className="h-4 w-4" /></Button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div className="mt-12 flex flex-col items-center gap-4 rounded-3xl bg-navy-900 px-8 py-12 text-center">
            <Eyebrow light>Need something not listed?</Eyebrow>
            <h2 className="font-display max-w-xl text-2xl font-extrabold text-white md:text-3xl">
              We source to your approved OEM or technical specification
            </h2>
            <Button to="/contact" variant="gold" size="lg">Submit RFQ <ArrowRight className="h-5 w-5" /></Button>
          </div>
        </div>
      </section>
    </>
  );
}
