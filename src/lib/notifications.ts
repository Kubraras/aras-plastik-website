import { createHash } from "node:crypto";

type Notification = { kind: "contact" | "quote"; id: string; name: string; phone: string };
type CustomerReply = { id: string; recipient: string; name: string; reply: string };

function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[character] || character);
}

export async function sendAdminNotification(notification: Notification) {
  const apiKey = process.env.RESEND_API_KEY;
  const to = process.env.ADMIN_NOTIFICATION_EMAIL;
  if (!apiKey || !to) return;
  const from = process.env.RESEND_FROM_EMAIL || "Aras Plastik Web <onboarding@resend.dev>";
  const title = notification.kind === "quote" ? "Yeni teklif talebi" : "Yeni iletişim mesajı";
  try {
    await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from, to: [to], subject: `${title} · ${notification.id}`,
        html: `<p>${title}</p><p>Talep / mesaj no: <b>${escapeHtml(notification.id)}</b></p><p>Ad: ${escapeHtml(notification.name)}</p><p>Telefon: ${escapeHtml(notification.phone)}</p>`,
      }),
      signal: AbortSignal.timeout(5000),
    });
  } catch {
    // Notification delivery must never affect the database submission.
  }
}

export async function sendCustomerReply({ id, recipient, name, reply }: CustomerReply): Promise<{ ok: true } | { ok: false; reason: "not-configured" | "delivery-failed" }> {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM_EMAIL?.trim();
  if (!apiKey || !from) return { ok: false, reason: "not-configured" };

  const safeName = escapeHtml(name);
  const safeReply = escapeHtml(reply);
  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "Idempotency-Key": `contact-reply/${createHash("sha256").update(`${id}\0${reply}`).digest("hex")}`,
      },
      body: JSON.stringify({
        from,
        to: [recipient],
        subject: "Aras Plastik mesajınıza yanıt",
        text: `Merhaba ${name},\n\n${reply}\n\nİyi günler,\nAras Plastik`,
        html: `<p>Merhaba ${safeName},</p><p style="white-space:pre-wrap">${safeReply}</p><p>İyi günler,<br>Aras Plastik</p>`,
      }),
      signal: AbortSignal.timeout(10000),
    });
    if (!response.ok) {
      console.error("Customer reply email was rejected by the email provider:", response.status);
      return { ok: false, reason: "delivery-failed" };
    }
    return { ok: true };
  } catch {
    return { ok: false, reason: "delivery-failed" };
  }
}
