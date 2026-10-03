import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Search, Mail, RefreshCw } from "lucide-react";
import { Badge } from "../../components/ui";
import { supabase } from "../../lib/supabaseClient";

type Client = {
  user_id: string;
  company_name: string;
  contact_name: string;
  email: string;
  categories: string;
  request_count: number;
  status: "Active" | "Pending";
};

export default function AdminClients() {
  const [clients, setClients] = useState<Client[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadClients = async () => {
    setLoading(true);
    setError("");
    const { data, error: queryError } = await supabase.rpc("admin_list_clients");
    if (queryError) setError(queryError.message);
    else setClients((data ?? []) as Client[]);
    setLoading(false);
  };

  useEffect(() => { void loadClients(); }, []);

  const filteredClients = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return clients;
    return clients.filter((client) => [client.company_name, client.contact_name, client.email, client.categories].some((value) => value.toLowerCase().includes(query)));
  }, [clients, search]);

  return (
    <div className="space-y-6 text-white">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-extrabold tracking-tight md:text-3xl">Clients</h1>
          <p className="mt-1 text-sm text-white/50">Manage all client accounts and relationships.</p>
        </div>
        <button type="button" onClick={() => void loadClients()} className="inline-flex items-center gap-2 rounded-lg bg-gold-400 px-4 py-2.5 text-sm font-semibold text-navy-900 transition-colors hover:bg-gold-300" disabled={loading}>
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} /> Refresh clients
        </button>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" />
        <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search clients..." className="w-full rounded-lg border border-white/10 bg-white/5 py-2 pl-9 pr-3 text-sm text-white outline-none placeholder:text-white/40 focus:border-gold-400/50" />
      </div>

      <div className="overflow-hidden rounded-2xl border border-white/8 bg-white/[0.03]">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[700px] text-left text-sm">
            <thead className="font-mono border-b border-white/8 text-[11px] uppercase tracking-wider text-white/40">
              <tr>
                <th className="px-5 py-3 font-medium">Company</th>
                <th className="px-5 py-3 font-medium">Primary contact</th>
                <th className="px-5 py-3 font-medium">Categories</th>
                <th className="px-5 py-3 font-medium">Requests</th>
                <th className="px-5 py-3 font-medium">Status</th>
                <th className="px-5 py-3 font-medium"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading && <tr><td colSpan={6} className="px-5 py-12 text-center text-white/50">Loading registered clients...</td></tr>}
              {!loading && error && <tr><td colSpan={6} className="px-5 py-12 text-center text-rose-300">{error}</td></tr>}
              {!loading && !error && filteredClients.length === 0 && <tr><td colSpan={6} className="px-5 py-12 text-center text-white/50">No registered clients found.</td></tr>}
              {!loading && !error && filteredClients.map((client) => (
                <tr key={client.user_id} className="transition-colors hover:bg-white/[0.03]">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <span className="grid h-9 w-9 place-items-center rounded-full bg-white/8 text-[12px] font-bold text-white">
                        {client.company_name.split(" ").map((word) => word[0]).slice(0, 2).join("").toUpperCase()}
                      </span>
                      <span className="font-medium text-white">{client.company_name}</span>
                    </div>
                  </td>
                  <td className="px-5 py-4"><span className="block text-white/80">{client.contact_name}</span><span className="block text-xs text-white/35">{client.email}</span></td>
                  <td className="px-5 py-4 text-white/60">{client.categories}</td>
                  <td className="font-mono px-5 py-4 text-white/80">{client.request_count}</td>
                  <td className="px-5 py-4"><Badge tone={client.status === "Active" ? "green" : "amber"}>{client.status}</Badge></td>
                  <td className="px-5 py-4 text-right">
                    <Link to={`/admin/messages?client=${client.user_id}`} className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 px-3 py-1.5 text-[12px] font-semibold text-white/70 hover:bg-white/5">
                      <Mail className="h-3.5 w-3.5" /> Message
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
