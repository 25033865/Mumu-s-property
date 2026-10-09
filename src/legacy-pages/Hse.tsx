import { useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ShieldCheck, FileText, CheckCircle2, Download } from "lucide-react";
import { Button, Eyebrow, Section } from "../components/ui";
import PageHero from "../components/PageHero";
import { hsePillars } from "../data";
import requestHseDocuments from "../lib/requestHseDocuments";

export default function Hse() {
  const [reference, setReference] = useState("");
  const [requesting, setRequesting] = useState(false);
  const [error, setError] = useState("");
  const inFlight = useRef(false);
  const navigate = useNavigate();
  const requestDocuments = async () => {
    if (inFlight.current || reference) return;
    inFlight.current = true;
    setRequesting(true);
    setError("");
    try {
      const result = await requestHseDocuments();
      if (result.requiresSignIn) {
        navigate("/login", { state: { returnTo: "/hse" } });
      } else setReference(result.reference);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not send your request. Please try again.");
    } finally {
      inFlight.current = false;
      setRequesting(false);
    }
  };
  return (
    <>
      <PageHero
        eyebrow="HSE & Quality Commitment"
        crumb="HSE & Quality"
        title="Health, safety, environment & quality first"
        subtitle="We recognise that HSE and quality are fundamental when operating within mining, construction and industrial environments."
        image="https://ihpbniqzqrrucnbzdnit.supabase.co/storage/v1/object/public/images/hse%20and%20qual.jpg"
        overlay="soft"
      />

      <Section>
        <div className="grid items-start gap-8 lg:grid-cols-[1.3fr_1fr] lg:gap-x-12">
          <div className="lg:col-span-2">
            <Eyebrow>Our commitments</Eyebrow>
            <h2 className="font-display mt-4 text-3xl font-extrabold tracking-tight text-navy-900">Nine commitment pillars</h2>
          </div>
          <div className="grid min-w-0 gap-3 sm:grid-cols-2">
              {hsePillars.map((p, i) => (
                <div key={p} className="flex items-center gap-3 rounded-xl border border-hairline bg-white p-4">
                  <span className="font-mono grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-navy-900 text-[12px] font-bold text-gold-400">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="text-sm font-medium text-navy-900">{p}</span>
                </div>
              ))}
          </div>

          <div className="min-w-0">
            <div className="rounded-3xl bg-navy-900 p-8 text-white">
              <span className="grid h-14 w-14 place-items-center rounded-2xl bg-gold-400 text-navy-900">
                <ShieldCheck className="h-7 w-7" />
              </span>
              <h3 className="font-display mt-5 text-xl font-bold">HSE Documentation</h3>
              <p className="mt-3 text-sm leading-relaxed text-white/60">
                Where required by a client, MUMUS PROPERTYS will provide relevant HSE, quality, product and supplier documentation during the qualification process.
              </p>
              {reference ? (
                <div role="status" className="mt-6 rounded-xl bg-emerald-500/15 px-4 py-3 text-sm text-emerald-200 ring-1 ring-emerald-400/20">
                  <div className="flex items-start gap-2"><CheckCircle2 className="h-5 w-5 shrink-0" /> Request received — our team will review your documentation request.</div>
                  <p className="font-mono mt-2 break-words text-xs">Reference: {reference}</p>
                  <div className="mt-2 flex flex-wrap gap-x-4 gap-y-2">
                    <Link to="/portal/requests" className="font-semibold underline">Track request</Link>
                    <Link to="/portal/documents" className="font-semibold underline">View documents</Link>
                  </div>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => void requestDocuments()}
                  disabled={requesting}
                  className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-gold-400 px-5 py-3 text-sm font-semibold text-navy-900 transition-colors hover:bg-gold-300 disabled:cursor-wait disabled:opacity-60"
                >
                  <FileText className="h-4 w-4 shrink-0" /> {requesting ? "Sending request..." : "Request HSE Documentation"}
                </button>
              )}
              {!reference && <p className="mt-2 text-xs leading-relaxed text-white/50">Sign in to request documents and track the response in your client portal.</p>}
              {error && <p role="alert" className="mt-3 break-words text-sm text-rose-300">{error}</p>}
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
