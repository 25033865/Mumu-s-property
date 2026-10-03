import { useState } from "react";
import { AlertTriangle, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "../../components/ui";
import { supabase } from "../../lib/supabaseClient";

export default function DeleteAccount() {
  const navigate = useNavigate();
  const [confirmation, setConfirmation] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");
  const isConfirmed = confirmation === "DELETE";

  const deleteAccount = async () => {
    if (!isConfirmed) return;
    setDeleting(true);
    setError("");
    const { error: deleteError } = await supabase.rpc("delete_my_account");
    if (deleteError) {
      setError(deleteError.message);
      setDeleting(false);
      return;
    }
    await supabase.auth.signOut();
    navigate("/", { replace: true });
  };

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <div className="flex items-center gap-3">
          <span className="grid h-11 w-11 place-items-center rounded-xl bg-rose-50 text-rose-600"><Trash2 className="h-5 w-5" /></span>
          <div>
            <h1 className="font-display text-2xl font-extrabold tracking-tight text-navy-900 md:text-3xl">Delete account</h1>
            <p className="mt-1 text-sm text-slate-ink">Permanently remove your MUMUS PROPERTYS account and account data.</p>
          </div>
        </div>
      </div>
      <div className="rounded-2xl border border-rose-200 bg-white p-6 shadow-sm md:p-8">
        <div className="flex gap-3 rounded-xl bg-rose-50 p-4 text-sm text-rose-800">
          <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" />
          <p>This action cannot be undone. Your requests, bookings, messages and profile will be deleted.</p>
        </div>
        <label className="mt-6 block text-sm font-semibold text-navy-900">Type DELETE to confirm<input value={confirmation} onChange={(event) => setConfirmation(event.target.value)} className="mt-1.5 w-full rounded-lg border border-hairline px-4 py-3 font-mono uppercase outline-none focus:border-rose-500" placeholder="DELETE" /></label>
        {error && <p role="alert" className="mt-4 text-sm text-rose-600">{error}</p>}
        <Button type="button" variant="outline" disabled={!isConfirmed || deleting} onClick={() => void deleteAccount()} className="mt-6 border-rose-300 text-rose-700 hover:border-rose-500 hover:bg-rose-50">{deleting ? "Deleting account..." : "Delete my account"} <Trash2 className="h-4 w-4" /></Button>
      </div>
    </div>
  );
}
