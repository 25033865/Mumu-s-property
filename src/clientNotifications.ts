import { useCallback, useEffect, useRef, useState } from "react";
import { supabase } from "./lib/supabaseClient";

export type ClientNotification = {
  id: string; kind: "message" | "quote" | "request" | "booking" | "document";
  title: string; body: string; target_path: string; read_at: string | null; created_at: string;
};

export default function useClientNotifications() {
  const [items, setItems] = useState<ClientNotification[]>([]);
  const [unread, setUnread] = useState(0);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const mounted = useRef(false);
  const sequence = useRef(0);
  const mutating = useRef(false);

  const load = useCallback(async () => {
    const request = ++sequence.current;
    try {
      const { data: auth, error: authError } = await supabase.auth.getUser();
      if (authError || !auth.user) throw new Error("Sign in to view notifications.");
      const [feed, count] = await Promise.all([
        supabase.from("client_notifications").select("id, kind, title, body, target_path, read_at, created_at")
          .eq("user_id", auth.user.id).order("created_at", { ascending: false }).order("id", { ascending: false }).limit(50),
        supabase.from("client_notifications").select("id", { count: "exact", head: true })
          .eq("user_id", auth.user.id).is("read_at", null),
      ]);
      if (!mounted.current || request !== sequence.current) return;
      if (feed.error || count.error) throw new Error("Could not load notifications. Please retry.");
      setItems(feed.data as ClientNotification[]);
      setUnread(count.count ?? 0);
      setError("");
    } catch {
      if (mounted.current && request === sequence.current) setError("Could not load notifications. Please retry.");
    } finally { if (mounted.current && request === sequence.current) setLoading(false); }
  }, []);

  useEffect(() => {
    mounted.current = true;
    const refresh = () => void load();
    const channel = supabase.channel("client-notification-inbox")
      .on("postgres_changes", { event: "*", schema: "public", table: "client_notifications" }, refresh)
      .subscribe((status) => { if (status === "SUBSCRIBED") refresh(); });
    refresh();
    const poll = window.setInterval(refresh, 15000);
    window.addEventListener("focus", refresh);
    return () => { mounted.current = false; ++sequence.current; clearInterval(poll); window.removeEventListener("focus", refresh); void supabase.removeChannel(channel); };
  }, [load]);

  const markRead = async (id?: string) => {
    if (mutating.current || (!id && !items.length)) return false;
    mutating.current = true;
    setBusy(true);
    // Invalidate any fetch that started before this read operation.
    ++sequence.current;
    try {
      const { error: readError } = await supabase.rpc("mark_client_notification_read", {
        p_notification_id: id ?? null,
        p_before: id ? null : items[0].created_at,
      });
      if (readError) throw readError;
      await load();
      return true;
    } catch {
      if (mounted.current) setError("Could not mark notifications as read. Please retry.");
      return false;
    } finally { mutating.current = false; if (mounted.current) setBusy(false); }
  };

  return { items, unread, loading, busy, error, reload: load, markRead };
}
