"use client";

import { useState, type FormEvent } from "react";
import { replyToContactMessage } from "@/app/admin/actions";

export function AdminMessageReply({ id, phone, existingReply }: { id: string; phone: string; existingReply: string | null }) {
  const [reply, setReply] = useState(existingReply || "");
  const [status, setStatus] = useState<{ ok: boolean; message: string } | null>(null);
  const [whatsAppUrl, setWhatsAppUrl] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  function getWhatsAppNumber(value: string) {
    const digits = value.replace(/\D/g, "");
    if (digits.startsWith("00")) return digits.slice(2);
    if (digits.startsWith("90")) return digits;
    if (digits.length === 11 && digits.startsWith("0")) return `90${digits.slice(1)}`;
    if (digits.length === 10) return `90${digits}`;
    return digits;
  }

  async function sendReply(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!reply.trim() || pending) return;
    const whatsappNumber = getWhatsAppNumber(phone);
    if (whatsappNumber.length < 8 || whatsappNumber.length > 15) {
      setStatus({ ok: false, message: "Müşterinin telefon numarası WhatsApp için uygun görünmüyor. Numarayı kontrol edin." });
      return;
    }

    const popup = window.open("about:blank", "_blank");
    if (popup) popup.opener = null;
    setPending(true);
    setStatus(null);
    setWhatsAppUrl(null);
    try {
      const result = await replyToContactMessage(id, reply);
      setStatus(result);
      if (result.ok) {
        const url = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(reply.trim())}`;
        if (popup) popup.location.href = url;
        else setWhatsAppUrl(url);
      } else {
        popup?.close();
      }
    } catch {
      popup?.close();
      setStatus({ ok: false, message: "Yanıt gönderilemedi. Lütfen tekrar deneyin." });
    } finally {
      setPending(false);
    }
  }

  return (
    <form className="admin-message-reply" onSubmit={sendReply}>
      <label htmlFor={`reply-${id}`}>WhatsApp ile müşteriye yanıt</label>
      <textarea
        id={`reply-${id}`}
        value={reply}
        onChange={(event) => setReply(event.target.value)}
        maxLength={5000}
        placeholder="Müşteriye WhatsApp'tan göndermek istediğiniz yanıtı yazın…"
        disabled={pending}
        required
      />
      <div className="admin-message-reply-actions">
        <button type="submit" className="admin-save" disabled={!reply.trim() || pending}>{pending ? "Hazırlanıyor…" : "Yanıtla ve WhatsApp'ı aç"}</button>
        <span>Bağlantı, açık olan WhatsApp hesabınızı kullanır. WhatsApp Business hesabınızdan göndermek için orada oturum açın; müşteriye ulaşması için Gönder’e basın.</span>
      </div>
      {status && <p className={`admin-reply-status ${status.ok ? "is-success" : "is-error"}`} role="status" aria-live="polite">{status.message}</p>}
      {whatsAppUrl && <p><a className="admin-save" href={whatsAppUrl} target="_blank" rel="noreferrer">WhatsApp’ı aç</a></p>}
    </form>
  );
}
