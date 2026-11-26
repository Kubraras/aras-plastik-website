import { contactSchema } from "@/lib/validation";
import { checkFormLimit } from "@/lib/forms";
import { sendAdminNotification } from "@/lib/notifications";
import { createHash, randomBytes, randomUUID } from "node:crypto";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const english = request.headers.get("x-site-locale") === "en";
  if (Number(request.headers.get("content-length") || 0) > 16384) return Response.json({ error: english ? "Form data is too large." : "Form verisi çok büyük." }, { status: 413 });
  let body: unknown;
  try { body = await request.json(); } catch { return Response.json({ error: english ? "Invalid form data." : "Geçersiz form verisi." }, { status: 400 }); }
  const parsed = contactSchema.safeParse(body);
  if (!parsed.success) return Response.json({ error: english ? "Please check the required fields and phone number." : "Lütfen zorunlu alanları ve telefon numarasını kontrol edin." }, { status: 400 });
  const values = parsed.data;
  if (values.website) return Response.json({ success: true });

  const { client, allowed, error: rateLimitError } = await checkFormLimit(request, "contact");
  if (!client) return Response.json({ error: english ? "The form service is not configured yet. Please try again later." : "Form hizmeti henüz yapılandırılmadı. Lütfen daha sonra tekrar deneyin." }, { status: 503 });
  if (rateLimitError) {
    console.error("Contact form rate limit check failed:", rateLimitError.message);
    return Response.json({ error: english ? "The form service is temporarily unavailable. Please try again later." : "Form hizmeti geçici olarak kullanılamıyor. Lütfen daha sonra tekrar deneyin." }, { status: 503 });
  }
  if (!allowed) return Response.json({ error: english ? "Too many attempts. Please try again in a few minutes." : "Çok fazla deneme yapıldı. Lütfen birkaç dakika sonra tekrar deneyin." }, { status: 429, headers: { "Retry-After": "900" } });

  const messageId = randomUUID();
  const trackingToken = randomBytes(32).toString("base64url");
  const trackingTokenHash = createHash("sha256").update(trackingToken).digest("hex");
  const { error } = await client.from("contact_messages").insert({
    id: messageId,
    full_name: values.fullName,
    phone: values.phone,
    email: values.email || null,
    company_name: values.companyName || null,
    message: values.message,
    privacy_consent: true,
    tracking_token_hash: trackingTokenHash,
  });
  if (error) return Response.json({ error: english ? "Your message could not be saved. Please try again later." : "Mesaj kaydedilemedi. Lütfen daha sonra tekrar deneyin." }, { status: 503 });
  await sendAdminNotification({ kind: "contact", id: messageId, name: values.fullName, phone: values.phone });
  return Response.json({ success: true, trackingUrl: `/${english ? "en" : "tr"}/messages/${trackingToken}` }, { headers: { "Cache-Control": "no-store" } });
}
