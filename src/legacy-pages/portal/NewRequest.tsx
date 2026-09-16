import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Upload, Send, CheckCircle2, AlertTriangle, Clock } from "lucide-react";
import { Button, Badge } from "../../components/ui";
import { offerings } from "../../data";
import { statusOrder, statusTone } from "../../portalData";
import { supabase } from "../../lib/supabaseClient";

const field =
  "w-full rounded-lg border border-hairline bg-white px-4 py-3 text-sm text-navy-900 outline-none transition-colors placeholder:text-slate-ink/50 focus:border-navy-900 focus:ring-2 focus:ring-navy-900/10";
const label = "font-mono mb-1.5 block text-[11px] font-medium uppercase tracking-wider text-slate-ink";

const urgencies = [
  { v: "Low", icon: Clock, tone: "gray" as const },
  { v: "Medium", icon: Clock, tone: "amber" as const },
  { v: "High", icon: AlertTriangle, tone: "red" as const },
];

export default function NewRequest() {
  const nav = useNavigate();
  const [urg, setUrg] = useState("Medium");
  const [files, setFiles] = useState<string[]>([]);
  const [done, setDone] = useState(false);
  const [reference, setReference] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (done) {
    return (
      <div className="mx-auto max-w-2xl">
        <div className="rounded-2xl border border-hairline bg-white p-8 text-center">
          <span className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-emerald-50 text-emerald-600">
            <CheckCircle2 className="h-8 w-8" />
          </span>
          <h1 className="font-display mt-6 text-2xl font-extrabold text-navy-900">RFQ submitted</h1>
          <p className="mt-2 text-slate-ink">Your request for quotation has been logged and is now being reviewed.</p>
          <p className="font-mono mt-4 inline-block rounded-lg bg-mist px-4 py-2 text-sm font-semibold text-navy-900">{reference}</p>

          <div className="mt-8 text-left">
            <div className="font-mono mb-3 text-[11px] uppercase tracking-wider text-slate-ink">Track request status</div>
            <div className="flex flex-wrap items-center gap-2">
              {statusOrder.map((s, i) => (
                <div key={s} className="flex items-center gap-2">
                  <span className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[11px] font-semibold ${i === 0 ? "bg-navy-900 text-white" : "bg-mist text-slate-ink/60"}`}>
                    {i === 0 && <span className="h-1.5 w-1.5 rounded-full bg-gold-400" />}{s}
                  </span>
                  {i < statusOrder.length - 1 && <span className="h-px w-3 bg-hairline" />}
                </div>
              ))}
            </div>
          </div>

          <div className="mt-8 flex justify-center gap-3">
            <Button to="/portal/requests" variant="primary">Track my requests</Button>
            <Button onClick={() => setDone(false)} variant="outline">New request</Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="font-display text-2xl font-extrabold tracking-tight text-navy-900 md:text-3xl">Submit a new RFQ</h1>
      <p className="mt-1 text-sm text-slate-ink">Provide the details below and our team will respond with a commercial quotation.</p>

      {/* status legend */}
      <div className="mt-6 flex flex-wrap gap-2 rounded-xl border border-hairline bg-white p-4">
        {statusOrder.map((s) => (
          <Badge key={s} tone={statusTone[s]}>{s}</Badge>
        ))}
      </div>

      <form
        onSubmit={(event) => {
          event.preventDefault();
          const form = event.currentTarget;
          const formData = new FormData(form);
          const selectedFiles = formData.getAll("files").filter((file): file is File => file instanceof File && file.size > 0);
          setError("");
          setIsSubmitting(true);
          void (async () => {
            const { data: userData, error: userError } = await supabase.auth.getUser();
            if (userError || !userData.user) throw new Error("Please sign in again before submitting an RFQ.");

            const { data: request, error: requestError } = await supabase
              .from("service_requests")
              .insert({
                user_id: userData.user.id,
                requester_name: [userData.user.user_metadata?.first_name, userData.user.user_metadata?.last_name].filter(Boolean).join(" ") || userData.user.email,
                company_name: userData.user.user_metadata?.company ?? null,
                category: formData.get("category"),
                requirements: formData.get("requirements"),
                location: formData.get("location"),
                required_by: formData.get("requiredBy") || null,
                urgency: urg,
              })
              .select("id, reference")
              .single();
            if (requestError || !request) throw new Error(requestError?.message ?? "Could not submit your RFQ.");

            for (const file of selectedFiles) {
              const path = `${userData.user.id}/${request.id}/${file.name}`;
              const { error: uploadError } = await supabase.storage.from("service-request-files").upload(path, file);
              if (uploadError) throw new Error(uploadError.message);
              const { error: fileError } = await supabase.from("service_request_files").insert({
                request_id: request.id,
                user_id: userData.user.id,
                path,
                file_name: file.name,
                content_type: file.type || null,
                size_bytes: file.size,
              });
              if (fileError) throw new Error(fileError.message);
            }

            setReference(request.reference);
            setDone(true);
            window.scrollTo({ top: 0 });
          })().catch((submissionError: Error) => setError(submissionError.message)).finally(() => setIsSubmitting(false));
        }}
        className="mt-6 space-y-6 rounded-2xl border border-hairline bg-white p-6 md:p-8"
      >
        <div>
          <label className={label}>Supply category *</label>
            <select name="category" required className={field} defaultValue="">
            <option value="" disabled>Select a supply category…</option>
            {offerings.map((s) => <option key={s.slug}>{s.title}</option>)}
          </select>
        </div>

        <div>
          <label className={label}>Describe your requirements *</label>
          <textarea name="requirements" required rows={5} className={field} placeholder="Include quantities, specifications, part numbers and timelines…" />
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label className={label}>Site / location *</label>
            <input name="location" required className={field} placeholder="e.g. Grootegeluk Plant, Lephalale" />
          </div>
          <div>
            <label className={label}>Required by</label>
            <input name="requiredBy" type="date" className={field} />
          </div>
        </div>

        <div>
          <label className={label}>Urgency *</label>
          <div className="grid grid-cols-3 gap-3">
            {urgencies.map((u) => (
              <button
                type="button"
                key={u.v}
                onClick={() => setUrg(u.v)}
                className={`flex items-center justify-center gap-2 rounded-lg border px-4 py-3 text-sm font-semibold transition-colors ${
                  urg === u.v ? "border-navy-900 bg-navy-900 text-white" : "border-hairline text-slate-ink hover:border-navy-900/30"
                }`}
              >
                <u.icon className="h-4 w-4" /> {u.v}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className={label}>Supporting documents</label>
          <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-dashed border-navy-900/25 bg-mist px-4 py-4 text-sm text-slate-ink transition-colors hover:border-navy-900/50">
            <Upload className="h-5 w-5 text-navy-900" />
            Attach specs, drawings or a BOQ
            <input name="files" type="file" multiple className="hidden" onChange={(e) => setFiles(Array.from(e.target.files ?? []).map((f) => f.name))} />
          </label>
          {files.length > 0 && (
            <ul className="mt-2 space-y-1">
              {files.map((f) => (
                <li key={f} className="font-mono flex items-center gap-2 text-[12px] text-navy-900"><CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" /> {f}</li>
              ))}
            </ul>
          )}
        </div>

        {error && <p role="alert" className="text-sm text-rose-600">{error}</p>}
        <Button type="submit" variant="gold" size="lg" full disabled={isSubmitting}>
          {isSubmitting ? "Submitting..." : "Submit Request"} {!isSubmitting && <Send className="h-4 w-4" />}
        </Button>
      </form>
    </div>
  );
}
