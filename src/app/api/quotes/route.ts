import { checkFormLimit, createOrderNumber } from "@/lib/forms";
import { quoteSchema } from "@/lib/validation";
import { sendAdminNotification } from "@/lib/notifications";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const english = request.headers.get("x-site-locale") === "en";
  if (Number(request.headers.get("content-length") || 0) > 12288) return Response.json({ error: english ? "Form data is too large." : "Form verisi çok büyük." }, { status: 413 });
  let body: unknown;
  try { body = await request.json(); } catch { return Response.json({ error: english ? "Invalid form data." : "Geçersiz form verisi." }, { status: 400 }); }
  const parsed = quoteSchema.safeParse(body);
  if (!parsed.success) return Response.json({ error: english ? "Please check the required fields, phone number and quantity." : "Lütfen zorunlu alanları, telefon numarasını ve miktarı kontrol edin." }, { status: 400 });
  const values = parsed.data;
  if (values.website) return Response.json({ success: true, orderNumber: "AP-00000000" });

  const { client, allowed } = await checkFormLimit(request, "quote");
  if (!client) return Response.json({ error: english ? "The request service is not configured yet. Please try again later." : "Talep hizmeti henüz yapılandırılmadı. Lütfen daha sonra tekrar deneyin." }, { status: 503 });
  if (!allowed) return Response.json({ error: english ? "Too many attempts. Please try again shortly." : "Çok sık deneme yapıldı. Lütfen biraz sonra tekrar deneyin." }, { status: 429 });

  const { data: product, error: productError } = await client.from("products").select("id,name_tr,name_en,product_code").eq("id", values.productId).eq("is_published", true).maybeSingle();
  if (productError || !product) return Response.json({ error: english ? "A request cannot be created for this product." : "Bu ürün için talep oluşturulamıyor." }, { status: 404 });
  const orderNumber = createOrderNumber(values.submissionToken);
  const { error } = await client.from("quote_requests").insert({
    order_number: orderNumber,
    submission_token: values.submissionToken,
    product_id: product.id,
    product_name_snapshot: product.name_tr,
    product_code_snapshot: product.product_code,
    quantity: values.quantity,
    first_name: values.firstName,
    last_name: values.lastName,
    phone: values.phone,
    email: values.email || null,
    company_name: values.companyName || null,
    message: values.message || null,
    privacy_consent: true,
    status: "new",
  });
  if (error?.code === "23505") return Response.json({ success: true, orderNumber });
  if (error) return Response.json({ error: english ? "Your request could not be saved. Please try again later." : "Talebiniz kaydedilemedi. Lütfen daha sonra tekrar deneyin." }, { status: 503 });
  await sendAdminNotification({ kind: "quote", id: orderNumber, name: `${values.firstName} ${values.lastName}`, phone: values.phone });
  return Response.json({ success: true, orderNumber });
}
