import { useEffect, useRef, useState } from "react";
import { Download, FileText, Image, Paperclip, Pencil, Send, Trash2, X } from "lucide-react";
import { canModifyMessage, deleteMessage, editMessage, useThread, sendMessage, formatTime, type Attachment, type Sender } from "../messaging";
import { supabase } from "../lib/supabaseClient";
import { downloadStorageFile } from "../lib/downloadFile";

export default function Chat({
  threadId,
  self,
  theme = "light",
  placeholder = "Type a message…",
}: {
  threadId: string;
  self: Sender; // whose perspective — their messages align right
  theme?: "light" | "dark";
  placeholder?: string;
}) {
  const messages = useThread(threadId);
  const [draft, setDraft] = useState("");
  const [senderId, setSenderId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingText, setEditingText] = useState("");
  const [messageError, setMessageError] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [sending, setSending] = useState(false);
  const [preview, setPreview] = useState<Attachment | null>(null);
  const [deleteCandidateId, setDeleteCandidateId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const endRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length, threadId]);

  const dark = theme === "dark";
  useEffect(() => { void supabase.auth.getUser().then(({ data }) => setSenderId(data.user?.id ?? null)); }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!senderId) return;
    setSending(true);
    setMessageError("");
    const { error } = await sendMessage(threadId, senderId, self, draft, files);
    if (error) setMessageError(error.message);
    else { setDraft(""); setFiles([]); }
    setSending(false);
  };

  const saveEdit = async () => {
    if (!editingId || !editingText.trim()) return;
    const { error } = await editMessage(editingId, editingText);
    if (error) setMessageError(error.message);
    else { setEditingId(null); setEditingText(""); }
  };

  const removeMessage = async (id: string) => {
    setDeletingId(id);
    setMessageError("");
    const { error } = await deleteMessage(id);
    if (error) setMessageError(error.message);
    else setDeleteCandidateId(null);
    setDeletingId(null);
  };

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="flex-1 space-y-3 overflow-y-auto p-5">
        {messages.length === 0 && (
          <div className={`grid h-full place-items-center text-sm ${dark ? "text-white/40" : "text-slate-ink/60"}`}>
            No messages yet — say hello.
          </div>
        )}
        {messages.map((m) => {
          const mine = m.from === self;
          const generatedAttachmentText = m.attachments.length > 0 && m.text.trim() === m.attachments.map((attachment) => attachment.fileName).join(", ");
          const displayText = generatedAttachmentText && m.attachments.every(isImageAttachment) ? "" : m.text;
          const bubble = mine
            ? "bg-navy-900 text-white rounded-br-sm"
            : dark
            ? "bg-white/10 text-white rounded-bl-sm"
            : "bg-mist text-navy-900 rounded-bl-sm";
          return (
            <div key={m.id} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
              <div className="max-w-[78%]">
                {editingId === m.id ? (
                  <div className="space-y-2">
                    <textarea value={editingText} onChange={(event) => setEditingText(event.target.value)} rows={3} className="w-full min-w-56 rounded-lg border border-gold-400/50 bg-white px-3 py-2 text-sm text-navy-900 outline-none" />
                    <div className="flex justify-end gap-2">
                      <button type="button" onClick={() => { setEditingId(null); setEditingText(""); }} className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs text-white/70"><X className="h-3 w-3" /> Cancel</button>
                      <button type="button" onClick={() => void saveEdit()} className="rounded-lg bg-gold-400 px-2 py-1 text-xs font-semibold text-navy-900">Save</button>
                    </div>
                  </div>
                ) : <div className={`rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${bubble}`}>
                  {displayText && <div>{displayText}</div>}
                  {m.attachments.length > 0 && <div className={`${displayText ? "mt-2 border-t border-white/15 pt-2" : ""} space-y-2`}>{m.attachments.map((attachment) => <AttachmentItem key={attachment.id} attachment={attachment} dark={dark} onPreview={setPreview} />)}</div>}
                </div>}
                {mine && canModifyMessage(m) && editingId !== m.id && (
                  <div className="mt-1 flex justify-end gap-2">
                    <button type="button" onClick={() => { setEditingId(m.id); setEditingText(m.text); setMessageError(""); }} className={`inline-flex items-center gap-1 text-[10px] ${dark ? "text-white/45 hover:text-white" : "text-slate-ink/50 hover:text-navy-900"}`}><Pencil className="h-3 w-3" /> Edit</button>
                    <button type="button" onClick={() => { setDeleteCandidateId(m.id); setMessageError(""); }} className={`inline-flex items-center gap-1 text-[10px] ${dark ? "text-white/45 hover:text-rose-300" : "text-slate-ink/50 hover:text-rose-600"}`}><Trash2 className="h-3 w-3" /> Delete</button>
                  </div>
                )}
                <div className={`font-mono mt-1 text-[10px] ${mine ? "text-right" : "text-left"} ${dark ? "text-white/35" : "text-slate-ink/50"}`}>
                  {m.from === "admin" ? "MUMUS Support" : "Client"} · {formatTime(m.ts)}
                </div>
              </div>
            </div>
          );
        })}
        <div ref={endRef} />
      </div>

      {messageError && <p role="alert" className={`px-3 text-xs ${dark ? "text-rose-300" : "text-rose-600"}`}>{messageError}</p>}

      {files.length > 0 && <div className={`border-t px-3 pt-3 text-xs ${dark ? "border-white/10 text-white/70" : "border-hairline text-slate-ink"}`}>
        <div className="mb-1 font-semibold">Selected files</div>
        <div className="flex flex-wrap gap-2">
          {files.map((file, index) => <span key={`${file.name}-${index}`} className="inline-flex max-w-full items-center gap-1 rounded-md bg-black/10 px-2 py-1"><span className="max-w-48 truncate">{file.name}</span><button type="button" onClick={() => setFiles((current) => current.filter((_, fileIndex) => fileIndex !== index))} aria-label={`Remove ${file.name}`}><X className="h-3 w-3" /></button></span>)}
        </div>
      </div>}
      <form onSubmit={(event) => void submit(event)} className={`flex items-center gap-2 border-t p-3 ${dark ? "border-white/10" : "border-hairline"}`}>
        <button type="button" onClick={() => fileInputRef.current?.click()} className={`grid h-11 w-11 shrink-0 place-items-center rounded-lg border ${dark ? "border-white/10 text-white/60 hover:text-white" : "border-hairline text-slate-ink/70 hover:text-navy-900"}`} title="Attach files" aria-label="Attach files">
          <Paperclip className="h-4 w-4" />
        </button>
        <input ref={fileInputRef} type="file" multiple accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.txt,.csv" className="hidden" onChange={(event) => { const selected = Array.from(event.currentTarget.files ?? []); if (selected.length > 0) setFiles((current) => [...current, ...selected]); event.currentTarget.value = ""; }} />
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder={placeholder}
          className={`min-w-0 flex-1 rounded-lg px-4 py-2.5 text-sm outline-none ${
            dark
              ? "border border-white/10 bg-white/5 text-white placeholder:text-white/40 focus:border-gold-400/50"
              : "border border-hairline bg-white text-navy-900 placeholder:text-slate-ink/50 focus:border-navy-900 focus:ring-2 focus:ring-navy-900/10"
          }`}
        />
        <button
          type="submit"
          disabled={sending || (!draft.trim() && files.length === 0)}
          className="inline-flex h-11 shrink-0 items-center gap-2 rounded-lg bg-gold-400 px-4 text-sm font-semibold text-navy-900 transition-colors hover:bg-gold-300 disabled:opacity-40"
        >
          <Send className="h-4 w-4" /> {sending ? "Sending..." : "Send"}
        </button>
      </form>
      {preview && <AttachmentViewer attachment={preview} dark={dark} onClose={() => setPreview(null)} />}
      {deleteCandidateId && (
        <DeleteConfirmDialog
          dark={dark}
          deleting={deletingId === deleteCandidateId}
          onCancel={() => setDeleteCandidateId(null)}
          onConfirm={() => void removeMessage(deleteCandidateId)}
        />
      )}
    </div>
  );
}

function DeleteConfirmDialog({ dark, deleting, onCancel, onConfirm }: { dark: boolean; deleting: boolean; onCancel: () => void; onConfirm: () => void }) {
  return <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/55 p-4" role="dialog" aria-modal="true" aria-label="Confirm message deletion">
    <div className={`w-full max-w-sm rounded-xl border p-4 shadow-xl ${dark ? "border-white/10 bg-navy-950 text-white" : "border-hairline bg-white text-navy-900"}`}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold">Delete message?</h2>
          <p className={`mt-1 text-sm ${dark ? "text-white/60" : "text-slate-ink"}`}>This message will be removed from the chat.</p>
        </div>
        <button type="button" onClick={onCancel} disabled={deleting} className="grid h-8 w-8 shrink-0 place-items-center rounded-lg hover:bg-black/10 disabled:opacity-50" aria-label="Cancel delete">
          <X className="h-4 w-4" />
        </button>
      </div>
      <div className="mt-5 flex justify-end gap-2">
        <button type="button" onClick={onCancel} disabled={deleting} className={`rounded-lg px-3 py-2 text-sm font-semibold disabled:opacity-50 ${dark ? "text-white/70 hover:bg-white/10" : "text-slate-ink hover:bg-navy-900/5"}`}>Cancel</button>
        <button type="button" onClick={onConfirm} disabled={deleting} className="inline-flex items-center gap-2 rounded-lg bg-rose-600 px-3 py-2 text-sm font-semibold text-white hover:bg-rose-500 disabled:opacity-50">
          <Trash2 className="h-4 w-4" /> {deleting ? "Deleting..." : "Delete"}
        </button>
      </div>
    </div>
  </div>;
}

function AttachmentItem({ attachment, dark, onPreview }: { attachment: Attachment; dark: boolean; onPreview: (attachment: Attachment) => void }) {
  const [url, setUrl] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");
  useEffect(() => { void supabase.storage.from("message-attachments").createSignedUrl(attachment.storagePath, 60 * 60).then(({ data }) => setUrl(data?.signedUrl ?? null)); }, [attachment.storagePath]);
  const image = isImageAttachment(attachment);
  const save = async () => {
    setSaving(true);
    setSaveError("");
    try {
      await downloadStorageFile("message-attachments", attachment.storagePath, attachment.fileName);
    } catch (error) {
      setSaveError(error instanceof Error ? error.message : "Could not save the file.");
    } finally {
      setSaving(false);
    }
  };
  if (image) {
    return <div>
      <div className={`relative overflow-hidden rounded-xl ${dark ? "bg-black/25" : "bg-white/70"}`}>
        <button type="button" onClick={() => onPreview(attachment)} className="block w-full text-left" aria-label={`View ${attachment.fileName}`}>
          {url ? (
            <img src={url} alt={attachment.fileName} className="block h-auto max-h-[360px] max-w-[min(72vw,420px)] rounded-xl object-contain" />
          ) : (
            <span className={`grid h-56 w-[min(72vw,420px)] max-w-full place-items-center rounded-xl ${dark ? "bg-white/10 text-white/60" : "bg-slate-900/10 text-slate-ink/60"}`}>
              <Image className="h-8 w-8" />
            </span>
          )}
        </button>
        <button type="button" onClick={() => void save()} disabled={saving} className="absolute right-2 top-2 grid h-9 w-9 place-items-center rounded-full bg-black/55 text-white shadow-sm backdrop-blur hover:bg-black/70 disabled:opacity-50" aria-label={`Save ${attachment.fileName} to device`} title="Save to device">
          <Download className="h-4 w-4" />
        </button>
      </div>
      {saveError && <p className={`mt-1 text-[10px] ${dark ? "text-rose-300" : "text-rose-600"}`}>{saveError}</p>}
    </div>;
  }
  return <div>
    <div className={`flex items-center gap-2 rounded-lg px-2 py-1.5 ${dark ? "bg-black/15" : "bg-white/60"}`}>
      <button type="button" onClick={() => onPreview(attachment)} className="flex min-w-0 flex-1 items-center gap-2 text-left" aria-label={`View ${attachment.fileName}`}>
        <span className={`grid h-10 w-10 shrink-0 place-items-center rounded ${dark ? "bg-white/10" : "bg-slate-900/10"}`}><FileText className="h-4 w-4" /></span>
        <span className="min-w-0 flex-1 truncate text-xs">{attachment.fileName}</span>
      </button>
      <button type="button" onClick={() => void save()} disabled={saving} className="grid h-8 w-8 shrink-0 place-items-center rounded-md hover:bg-white/10 disabled:opacity-50" aria-label={`Save ${attachment.fileName} to device`} title="Save to device">
        <Download className="h-4 w-4" />
      </button>
    </div>
    {saveError && <p className={`mt-1 text-[10px] ${dark ? "text-rose-300" : "text-rose-600"}`}>{saveError}</p>}
  </div>;
}

function AttachmentViewer({ attachment, dark, onClose }: { attachment: Attachment; dark: boolean; onClose: () => void }) {
  const [url, setUrl] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");
  const image = isImageAttachment(attachment);
  useEffect(() => { void supabase.storage.from("message-attachments").createSignedUrl(attachment.storagePath, 60 * 60).then(({ data }) => setUrl(data?.signedUrl ?? null)); }, [attachment.storagePath]);
  const save = async () => {
    setSaving(true);
    setSaveError("");
    try {
      await downloadStorageFile("message-attachments", attachment.storagePath, attachment.fileName);
    } catch (error) {
      setSaveError(error instanceof Error ? error.message : "Could not save the file.");
    } finally {
      setSaving(false);
    }
  };
  return <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/75 p-4" role="dialog" aria-modal="true" aria-label={attachment.fileName}>
    <div className={`relative flex max-h-[92vh] w-full max-w-4xl flex-col overflow-hidden rounded-xl ${dark ? "bg-navy-950" : "bg-white"}`}>
      <div className={`flex items-center justify-between border-b px-4 py-3 ${dark ? "border-white/10 text-white" : "border-hairline text-navy-900"}`}>
        <span className="min-w-0 truncate text-sm font-semibold">{attachment.fileName}</span>
        <button type="button" onClick={onClose} className="grid h-9 w-9 shrink-0 place-items-center rounded-lg hover:bg-black/10" aria-label="Close viewer" title="Close"><X className="h-5 w-5" /></button>
      </div>
      <div className="flex min-h-64 flex-1 items-center justify-center overflow-auto p-4">
        {url && image ? <img src={url} alt={attachment.fileName} className="max-h-[70vh] max-w-full object-contain" /> : url ? <iframe src={url} title={attachment.fileName} className="h-[70vh] w-full border-0" /> : <span className={dark ? "text-white/60" : "text-slate-ink/60"}>Loading file...</span>}
      </div>
      <div className={`flex flex-wrap items-center justify-between gap-3 border-t px-4 py-3 ${dark ? "border-white/10" : "border-hairline"}`}>
        {saveError ? <p className={`text-xs ${dark ? "text-rose-300" : "text-rose-600"}`}>{saveError}</p> : <span />}
        <button type="button" onClick={() => void save()} disabled={saving} className="inline-flex items-center gap-2 rounded-lg bg-gold-400 px-4 py-2 text-sm font-semibold text-navy-900 hover:bg-gold-300 disabled:opacity-50"><Download className="h-4 w-4" /> {saving ? "Saving..." : "Save to device"}</button>
      </div>
    </div>
  </div>;
}

function isImageAttachment(attachment: Attachment) {
  return attachment.contentType?.startsWith("image/") || /\.(avif|gif|jpe?g|png|webp)$/i.test(attachment.fileName);
}
