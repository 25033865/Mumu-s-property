import { useState } from "react";
import { ShieldCheck, FileText, CheckCircle2, Download } from "lucide-react";
import { Button, Eyebrow, Section } from "../components/ui";
import PageHero from "../components/PageHero";
import { hsePillars, img } from "../data";

export default function Hse() {
  const [requested, setRequested] = useState(false);
  return (
    <>
      <PageHero
        eyebrow="HSE & Quality Commitment"
        crumb="HSE & Quality"
        title="Health, safety, environment & quality first"
        subtitle="We recognise that HSE and quality are fundamental when operating within mining, construction and industrial environments."
        image={img("1504328345606-18bbc8c9d7d1", 1600, 600)}
      />

      <Section>
        <div className="grid gap-12 lg:grid-cols-[1.3fr_1fr]">
          <div>
            <Eyebrow>Our commitments</Eyebrow>
            <h2 className="font-display mt-4 text-3xl font-extrabold tracking-tight text-navy-900">Nine commitment pillars</h2>
            <div className="mt-8 grid gap-3 sm:grid-cols-2">
              {hsePillars.map((p, i) => (
                <div key={p} className="flex items-center gap-3 rounded-xl border border-hairline bg-white p-4">
                  <span className="font-mono grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-navy-900 text-[12px] font-bold text-gold-400">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="text-sm font-medium text-navy-900">{p}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="lg:sticky lg:top-28 lg:self-start">
            <div className="rounded-3xl bg-navy-900 p-8 text-white">
              <span className="grid h-14 w-14 place-items-center rounded-2xl bg-gold-400 text-navy-900">
                <ShieldCheck className="h-7 w-7" />
              </span>
              <h3 className="font-display mt-5 text-xl font-bold">HSE Documentation</h3>
              <p className="mt-3 text-sm leading-relaxed text-white/60">
                Where required by a client, MUMUS PROPERTYS will provide relevant HSE, quality, product and supplier documentation during the qualification process.
              </p>
              {requested ? (
                <div className="mt-6 flex items-center gap-2 rounded-xl bg-emerald-500/15 px-4 py-3 text-sm text-emerald-200 ring-1 ring-emerald-400/20">
                  <CheckCircle2 className="h-5 w-5" /> Request received — our team will be in touch.
                </div>
              ) : (
                <button
                  onClick={() => setRequested(true)}
                  className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-gold-400 px-5 py-3 text-sm font-semibold text-navy-900 transition-colors hover:bg-gold-300"
                >
                  <FileText className="h-4 w-4" /> Request HSE Documentation
                </button>
              )}
              <Button to="/contact" size="sm" className="mt-3 w-full bg-white/10 text-white ring-1 ring-white/20 hover:bg-white/15">
                <Download className="h-4 w-4" /> Contact Compliance
              </Button>
            </div>
          </div>
        </div>
      </Section>
    </>
  );
}
