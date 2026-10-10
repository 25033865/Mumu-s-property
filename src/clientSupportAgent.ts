import { useEffect, useRef, useState } from "react";
import { supabase } from "./lib/supabaseClient";

type Agent = { status: "open" | "resolved"; is_assigned: boolean; first_name: string | null };

export default function useClientSupportAgent(threadId: string | null) {
  const [agent, setAgent] = useState<Agent | null>(null);
  const [error, setError] = useState("");
  const [handoff, setHandoff] = useState("");
  const [refresh, setRefresh] = useState(0);
  const previous = useRef<Agent | null>(null);
  const previousThread = useRef<string | null>(null);

  useEffect(() => {
    if (previousThread.current !== threadId) {
      previousThread.current = threadId;
      previous.current = null;
      setAgent(null);
      setHandoff("");
    }
    setError("");
    if (!threadId) return;
    let active = true;
    let sequence = 0;
    const load = async () => {
      const request = ++sequence;
      try {
        const { data, error: queryError } = await supabase.rpc("client_support_agent", { p_thread_id: threadId });
        if (!active || request !== sequence) return;
        const next = (data as Agent[] | null)?.[0];
        if (queryError || !next) {
          setAgent(null);
          setHandoff("");
          setError("Support details are unavailable right now. Your messages are still available below.");
          return;
        }
        const before = previous.current;
        if (next.status === "resolved" || !next.is_assigned) setHandoff("");
        else if (before?.is_assigned && before.first_name !== next.first_name) {
          setHandoff(`${next.first_name ?? "A support agent"} is now helping you.`);
        }
        previous.current = next;
        setAgent(next);
        setError("");
      } catch {
        if (active && request === sequence) {
          setAgent(null);
          setHandoff("");
          setError("Could not refresh support details. Please retry.");
        }
      }
    };
    const channel = supabase.channel(`client-support-agent:${threadId}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "message_threads", filter: `id=eq.${threadId}` }, () => void load())
      .subscribe((status) => { if (status === "SUBSCRIBED") void load(); });
    void load();
    const poll = window.setInterval(() => void load(), 10000);
    const focused = () => void load();
    window.addEventListener("focus", focused);
    return () => { active = false; clearInterval(poll); window.removeEventListener("focus", focused); void supabase.removeChannel(channel); };
  }, [threadId, refresh]);

  return { agent, error, handoff, retry: () => setRefresh((value) => value + 1) };
}
