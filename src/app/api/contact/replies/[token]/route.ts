import { createHash } from "node:crypto";
import { createSupabaseServiceClient } from "@/lib/supabase/service";

export const runtime = "nodejs";

const privateHeaders = {
  "Cache-Control": "private, no-store, max-age=0",
  "X-Robots-Tag": "noindex, nofollow",
  "Referrer-Policy": "no-referrer",
};

export async function GET(request: Request) {
  const token = new URL(request.url).pathname.split("/").at(-1) || "";
  if (!/^[A-Za-z0-9_-]{43}$/.test(token)) {
    return Response.json({ error: "Mesaj bulunamadı." }, { status: 404, headers: privateHeaders });
  }

  const supabase = createSupabaseServiceClient();
  if (!supabase) return Response.json({ error: "Mesaj hizmeti şu anda kullanılamıyor." }, { status: 503, headers: privateHeaders });

  const tokenHash = createHash("sha256").update(token).digest("hex");
  const { data, error } = await supabase
    .from("contact_messages")
    .select("full_name,message,created_at,reply_text,reply_updated_at")
    .eq("tracking_token_hash", tokenHash)
    .maybeSingle();

  if (error) {
    console.error("Customer message lookup failed:", error.message);
    return Response.json({ error: "Mesaj şu anda açılamadı." }, { status: 503, headers: privateHeaders });
  }
  if (!data) return Response.json({ error: "Bu takip bağlantısı geçersiz." }, { status: 404, headers: privateHeaders });

  return Response.json({ message: data }, { headers: privateHeaders });
}
