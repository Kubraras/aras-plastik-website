"use client";

import { useState, type FormEvent } from "react";
import { replyToContactMessage } from "@/app/admin/actions";

export function AdminMessageReply({ id, existingReply }: { id: string; existingReply: string | null }) {
  const [reply, setReply] = useState(existingReply || "");
  const [status, setStatus] = useState<{ ok: boolean; message: string; trackingUrl?: string } | null>(null);
  const [pending, setPending] = useState(false);

  async function sendReply(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!reply.trim() || pending) return;
    setPending(true);
    setStatus(null);
    try {
      const result = await replyToContactMessage(id, reply);
      setStatus(result);
    } catch {
      setStatus({ ok: false, message: "Yanıt gönderilemedi. Lütfen tekrar deneyin." });
    } finally {
      setPending(false);
    }
  }

  return (
    <form className="admin-message-reply" onSubmit={sendReply}>
      <label htmlFor={`reply-${id}`}>Site üzerinden müşteriye yanıt</label>
      <textarea
        id={`reply-${id}`}
        value={reply}
        onChange={(event) => setReply(event.target.value)}
        maxLength={5000}
        placeholder="Müşteriye göstermek istediğiniz yanıtı yazın…"
        disabled={pending}
        required
      />
      <div className="admin-message-reply-actions">
        <button type="submit" className="admin-save" disabled={!reply.trim() || pending}>{pending ? "Kaydediliyor…" : "Yanıtı müşteriye göster"}</button>
        <span>Müşteri, formu gönderdikten sonra açılan özel takip sayfasında yanıtınızı görür.</span>
      </div>
      {status && <p className={`admin-reply-status ${status.ok ? "is-success" : "is-error"}`} role="status" aria-live="polite">{status.message}</p>}
      {status?.trackingUrl && <div className="admin-generated-tracking-link"><a href={status.trackingUrl} target="_blank" rel="noreferrer">Eski müşteri için takip sayfasını aç</a><button type="button" onClick={() => void navigator.clipboard.writeText(new URL(status.trackingUrl!, window.location.origin).toString())}>Takip bağlantısını kopyala</button></div>}
    </form>
  );
}
