type Notification = { kind: "contact" | "quote"; id: string; name: string; phone: string };

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
