import { useState } from "react";
import { MapPin, Phone, Mail, Clock, Upload, CheckCircle2, Send } from "lucide-react";
import { Button, Eyebrow } from "../components/ui";
import PageHero from "../components/PageHero";
import { company, industries, supplierMatrix } from "../data";

const field =
  "w-full rounded-lg border border-hairline bg-white px-4 py-3 text-sm text-navy-900 outline-none transition-colors placeholder:text-slate-ink/50 focus:border-navy-900 focus:ring-2 focus:ring-navy-900/10";
const label = "font-mono mb-1.5 block text-[11px] font-medium uppercase tracking-wider text-slate-ink";

export default function Contact() {
  const [sent, setSent] = useState(false);
  const [file, setFile] = useState<string | null>(null);

  return (
    <>
      <PageHero
        eyebrow="Contact · Request for Quotation"
        crumb="Contact / RFQ"
        title="Submit a Request for Quotation"
        subtitle="Send us your line items and specifications. Our team responds rapidly — with urgent breakdown support available 24/7."
        image="https://images.unsplash.com/photo-1497366216548-37526070297c?w=1600&h=600&fit=crop&auto=format&q=80"
      />

      <section className="px-6 py-20 md:py-24">
        <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[1.4fr_1fr]">
          {/* form */}
          <div className="rounded-3xl border border-hairline bg-white p-8 shadow-sm md:p-10">
            {sent ? (
              <div className="flex flex-col items-center py-16 text-center">
                <span className="grid h-16 w-16 place-items-center rounded-full bg-emerald-50 text-emerald-600">
                  <CheckCircle2 className="h-8 w-8" />
                </span>
                <h2 className="font-display mt-6 text-2xl font-extrabold text-navy-900">RFQ received</h2>
                <p className="mt-2 max-w-sm text-slate-ink">
                  Thank you — our team will respond with a commercial quotation shortly. A reference has been generated for your records.
                </p>
                <p className="font-mono mt-4 rounded-lg bg-mist px-4 py-2 text-sm text-navy-900">REF: RFQ-2026-{Math.floor(1000 + Math.random() * 9000)}</p>
                <div className="mt-8">
                  <Button onClick={() => setSent(false)} variant="outline">Submit another RFQ</Button>
                </div>
              </div>
            ) : (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  setSent(true);
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
              >
                <Eyebrow>Request for Quotation</Eyebrow>
                <h2 className="font-display mt-3 text-2xl font-extrabold text-navy-900">Tell us what you need</h2>
                <div className="mt-8 grid gap-5 sm:grid-cols-2">
                  <div>
                    <label className={label}>Full name *</label>
                    <input required className={field} placeholder="Thabo Molefe" />
                  </div>
                  <div>
                    <label className={label}>Company name *</label>
                    <input required className={field} placeholder="Waterberg Mining Co." />
                  </div>
                  <div>
                    <label className={label}>Work email *</label>
                    <input required type="email" className={field} placeholder="you@company.co.za" />
                  </div>
                  <div>
                    <label className={label}>Phone</label>
                    <input className={field} placeholder="+27 82 000 0000" />
                  </div>
                  <div>
                    <label className={label}>Target industry *</label>
                    <select required className={field} defaultValue="">
                      <option value="" disabled>Select industry…</option>
                      {industries.map((i) => (
                        <option key={i.title}>{i.title}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className={label}>Primary supply category *</label>
                    <select required className={field} defaultValue="">
                      <option value="" disabled>Select category…</option>
                      {supplierMatrix.map(([c]) => (
                        <option key={c}>{c}</option>
                      ))}
                    </select>
                  </div>
                  <div className="sm:col-span-2">
                    <label className={label}>Line items / specifications *</label>
                    <textarea required rows={5} className={field} placeholder="List required items, quantities, OEM / technical specifications, site location and timeline…" />
                  </div>
                  <div className="sm:col-span-2">
                    <label className={label}>Supporting document</label>
                    <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-dashed border-navy-900/25 bg-mist px-4 py-4 text-sm text-slate-ink transition-colors hover:border-navy-900/50">
                      <Upload className="h-5 w-5 text-navy-900" />
                      {file || "Upload spec sheet, drawing or BOQ (PDF, XLSX, DWG)"}
                      <input type="file" className="hidden" onChange={(e) => setFile(e.target.files?.[0]?.name ?? null)} />
                    </label>
                  </div>
                </div>
                <div className="mt-8">
                  <Button type="submit" variant="gold" size="lg" full>
                    Submit RFQ <Send className="h-4 w-4" />
                  </Button>
                </div>
              </form>
            )}
          </div>

          {/* info */}
          <div className="space-y-5">
            <div className="rounded-3xl bg-navy-900 p-8 text-white">
              <h3 className="font-display text-xl font-bold">Business information</h3>
              <ul className="mt-6 space-y-5 text-sm">
                {[
                  [MapPin, "Head office", company.address],
                  [Phone, "Telephone", company.phone],
                  [Mail, "Email", company.email],
                  [Clock, "Hours", "Mon–Fri 07:30–17:00 · 24/7 call-out"],
                ].map(([Icon, k, v]: any) => (
                  <li key={k} className="flex gap-4">
                    <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-white/10 text-gold-400">
                      <Icon className="h-5 w-5" />
                    </span>
                    <div>
                      <div className="font-mono text-[11px] uppercase tracking-wider text-white/45">{k}</div>
                      <div className="mt-0.5 break-words text-white/85">{v}</div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
            {/* map placeholder */}
            <div className="relative h-64 overflow-hidden rounded-3xl border border-hairline bg-mist">
              <div className="absolute inset-0 opacity-90" style={{ backgroundImage: "linear-gradient(#e4e7ee 1px, transparent 1px), linear-gradient(90deg, #e4e7ee 1px, transparent 1px)", backgroundSize: "28px 28px" }} />
              <div className="absolute inset-0 grid place-items-center">
                <div className="flex flex-col items-center text-center">
                  <span className="grid h-12 w-12 place-items-center rounded-full bg-gold-400 text-navy-900 shadow-lg">
                    <MapPin className="h-6 w-6" />
                  </span>
                  <span className="mt-3 text-sm font-semibold text-navy-900">Lephalale, Limpopo</span>
                  <span className="font-mono text-[11px] text-slate-ink">-23.6698, 27.7411</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
