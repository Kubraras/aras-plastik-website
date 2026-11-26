"use client";

import { useState, type FormEvent } from "react";
import { replyToContactMessage } from "@/app/admin/actions";

export function AdminMessageReply({ id, email, emailSendingConfigured }: { id: string; email: string | null; emailSendingConfigured: boolean }) {
  const [reply, setReply] = useState("");
  const [status, setStatus] = useState<{ ok: boolean; message: string } | null>(null);
  const [pending, setPending] = useState(false);

  async function sendReply(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!email || !reply.trim() || pending) return;
    setPending(true);
    setStatus(null);
    try {
      const result = await replyToContactMessage(id, reply);
      setStatus(result);
      if (result.ok) setReply("");
    } catch {
      setStatus({ ok: false, message: "Yanıt gönderilemedi. Lütfen tekrar deneyin." });
    } finally {
      setPending(false);
    }
  }

  return (
    <form className="admin-message-reply" onSubmit={sendReply}>
      <label htmlFor={`reply-${id}`}>Yanıtınız</label>
      <textarea
        id={`reply-${id}`}
        value={reply}
        onChange={(event) => setReply(event.target.value)}
        maxLength={5000}
        placeholder={email ? "Müşteriye göndermek istediğiniz yanıtı yazın…" : "Bu mesajda yanıt için e-posta adresi yok."}
        disabled={!email}
        required
      />
      <div className="admin-message-reply-actions">
        <button type="submit" className="admin-save" disabled={!email || !emailSendingConfigured || !reply.trim() || pending}>{pending ? "Gönderiliyor…" : "Yanıtı gönder"}</button>
        {!email && <span>Yanıtı telefonla iletebilirsiniz; müşterinin e-posta adresi paylaşılmamış.</span>}
      </div>
      {email && !emailSendingConfigured && <p className="admin-reply-help is-error">Gönderimi açmak için Vercel’de RESEND_API_KEY ve doğrulanmış RESEND_FROM_EMAIL ayarlayın.</p>}
      {status && <p className={`admin-reply-status ${status.ok ? "is-success" : "is-error"}`} role="status">{status.message}</p>}
      {email && <p className="admin-reply-help">Yanıt yalnızca bu mesajdaki müşteri adresine gönderilir.</p>}
    </form>
  );
}
