import { useState } from "react";
import { Search, ArrowRight } from "lucide-react";
import { Button, Eyebrow } from "../components/ui";
import PageHero from "../components/PageHero";
import { supplierMatrix } from "../data";

export default function Suppliers() {
  const [q, setQ] = useState("");
  const rows = supplierMatrix.filter(
    ([c, p]) => c.toLowerCase().includes(q.toLowerCase()) || p.toLowerCase().includes(q.toLowerCase()),
  );

  return (
    <>
      <PageHero
        eyebrow="Supplier Category Matrix"
        crumb="Supplier Categories"
        title="Twelve categories, one supplier"
        subtitle="A quick reference to everything MUMUS PROPERTYS can procure and deliver across your operation."
      />

      <section className="px-6 py-16 md:py-20">
        <div className="mx-auto max-w-5xl">
          <div className="relative mb-6 max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-ink/50" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search categories or products…"
              className="w-full rounded-lg border border-hairline bg-white py-2.5 pl-9 pr-3 text-sm outline-none focus:border-navy-900 focus:ring-2 focus:ring-navy-900/10"
            />
          </div>

          <div className="overflow-x-auto rounded-2xl border border-hairline bg-white shadow-sm">
            <table className="w-full min-w-[520px] text-left text-sm">
              <thead className="font-mono border-b border-hairline bg-navy-900 text-[11px] uppercase tracking-wider text-white">
                <tr>
                  <th className="px-5 py-3.5 font-medium">Category</th>
                  <th className="px-5 py-3.5 font-medium">Products / Services</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-hairline">
                {rows.map(([c, p]) => (
                  <tr key={c} className="transition-colors hover:bg-mist">
                    <td className="px-5 py-4 align-top">
                      <span className="font-display font-bold text-navy-900">{c}</span>
                    </td>
                    <td className="px-5 py-4 text-slate-ink">{p}</td>
                  </tr>
                ))}
                {rows.length === 0 && (
                  <tr><td colSpan={2} className="px-5 py-12 text-center text-slate-ink">No categories match "{q}".</td></tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="mt-10 flex flex-wrap items-center justify-between gap-4 rounded-2xl bg-mist p-6">
            <div>
              <Eyebrow>Single-source convenience</Eyebrow>
              <p className="mt-2 text-lg font-semibold text-navy-900">Procurement and delivery of goods, coordinated end-to-end.</p>
            </div>
            <Button to="/contact" variant="primary">Submit RFQ <ArrowRight className="h-4 w-4" /></Button>
          </div>
        </div>
      </section>
    </>
  );
}
