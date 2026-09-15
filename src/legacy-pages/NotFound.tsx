import { Home, ArrowLeft } from "lucide-react";
import { Button } from "../components/ui";

export default function NotFound() {
  return (
    <section className="grid min-h-[70vh] place-items-center px-6 py-24">
      <div className="max-w-md text-center">
        <span className="font-mono text-[11px] uppercase tracking-[0.3em] text-gold-500">Error 404</span>
        <h1 className="font-display mt-4 text-6xl font-extrabold tracking-tight text-navy-900">Page not found</h1>
        <p className="mt-4 text-slate-ink">
          The page you're looking for doesn't exist or may have moved. Let's get you back on track.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Button to="/" variant="primary"><Home className="h-4 w-4" /> Back to home</Button>
          <Button to="/offerings" variant="outline"><ArrowLeft className="h-4 w-4" /> View offerings</Button>
        </div>
      </div>
    </section>
  );
}
