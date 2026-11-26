"use client";

import { useState, type FormEvent } from "react";

export function AdminMessageReply({ id, email, fullName }: { id: string; email: string | null; fullName: string }) {
  const [reply, setReply] = useState("");
  const [status, setStatus] = useState("");

  function openReplyEmail(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!email || !reply.trim()) return;

    const subject = "Aras Plastik mesajınıza yanıt";
    const body = `Merhaba ${fullName},\n\n${reply.trim()}\n\nİyi günler,\nAras Plastik`;
    setStatus("E-posta taslağı açılıyor. Müşteriye iletmek için e-posta uygulamanızda Gönder'e basın.");
    window.location.href = `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  }

  return (
    <form className="admin-message-reply" onSubmit={openReplyEmail}>
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
        <button type="submit" className="admin-save" disabled={!email || !reply.trim()}>Yanıtla</button>
        {!email && <span>Yanıtı telefonla iletebilirsiniz; müşterinin e-posta adresi paylaşılmamış.</span>}
      </div>
      {status && <p className="admin-reply-status" role="status">{status}</p>}
      {email && <p className="admin-reply-help">Yanıt, e-posta uygulamanızda taslak olarak açılır.</p>}
    </form>
  );
}
