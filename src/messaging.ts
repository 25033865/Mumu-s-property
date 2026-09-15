import { useSyncExternalStore } from "react";

export type Sender = "client" | "admin";

export type Message = {
  id: string;
  threadId: string;
  from: Sender;
  text: string;
  ts: number;
};

export type Thread = {
  id: string;
  client: string;
  company: string;
  initials: string;
  sector: string;
};

// Prototype conversations — one thread per client. The logged-in client in the
// portal maps to THREADS[0]; the admin sees and can reply to all of them.
export const THREADS: Thread[] = [
  { id: "waterberg", client: "Thabo Molefe", company: "Waterberg Mining Co.", initials: "TM", sector: "Mining" },
  { id: "limpopo-civils", client: "Anele Dube", company: "Limpopo Civils (Pty) Ltd", initials: "AD", sector: "Construction" },
  { id: "grootegeluk", client: "Riaan Botha", company: "Grootegeluk Processing", initials: "RB", sector: "Manufacturing" },
];

export const CLIENT_THREAD_ID = THREADS[0].id;
export const ADMIN_NAME = "MUMUS Support · Naledi K.";

const STORAGE_KEY = "mumus_messages_v1";

const seed = (): Message[] => {
  const now = Date.now();
  const min = 60_000;
  return [
    { id: "m1", threadId: "waterberg", from: "admin", text: "Good morning Thabo — your RFQ RFQ-2041 for pumps has been received. We'll have a quotation to you shortly.", ts: now - 90 * min },
    { id: "m2", threadId: "waterberg", from: "client", text: "Thanks Naledi. Can you confirm delivery to Grootegeluk Plant is included?", ts: now - 84 * min },
    { id: "m3", threadId: "waterberg", from: "admin", text: "Yes — direct-to-site delivery is included at no extra cost. Targeting Friday 12 Sept.", ts: now - 80 * min },
    { id: "m4", threadId: "limpopo-civils", from: "client", text: "Hi, do you stock reflective vests in bulk (500+ units)?", ts: now - 40 * min },
    { id: "m5", threadId: "grootegeluk", from: "admin", text: "Riaan, the revised quotation QT-1174 is attached for your approval.", ts: now - 20 * min },
  ];
};

function load(): Message[] {
  if (typeof window === "undefined") return seed();
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      const s = seed();
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(s));
      return s;
    }
    return JSON.parse(raw) as Message[];
  } catch {
    return seed();
  }
}

let messages: Message[] = load();
const listeners = new Set<() => void>();

function emit() {
  for (const l of listeners) l();
}

function persist() {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
  } catch {
    /* ignore quota / private-mode errors */
  }
}

if (typeof window !== "undefined") {
  // Cross-tab sync: pick up sends made in the other view.
  window.addEventListener("storage", (e) => {
    if (e.key === STORAGE_KEY && e.newValue) {
      try {
        messages = JSON.parse(e.newValue) as Message[];
        emit();
      } catch {
        /* ignore */
      }
    }
  });
}

export function sendMessage(threadId: string, from: Sender, text: string) {
  const trimmed = text.trim();
  if (!trimmed) return;
  messages = [
    ...messages,
    { id: `m${Date.now()}-${Math.random().toString(36).slice(2, 6)}`, threadId, from, text: trimmed, ts: Date.now() },
  ];
  persist();
  emit();
}

function subscribe(cb: () => void) {
  listeners.add(cb);
  return () => listeners.delete(cb);
}

export function useThread(threadId: string): Message[] {
  const all = useSyncExternalStore(subscribe, () => messages, () => messages);
  return all.filter((m) => m.threadId === threadId).sort((a, b) => a.ts - b.ts);
}

export function useAllMessages(): Message[] {
  return useSyncExternalStore(subscribe, () => messages, () => messages);
}

export function formatTime(ts: number): string {
  return new Date(ts).toLocaleTimeString("en-ZA", { hour: "2-digit", minute: "2-digit" });
}
