import { createHash } from "node:crypto";
import { createSupabaseServiceClient } from "@/lib/supabase/service";

export async function checkFormLimit(request: Request, action: "contact" | "quote") {
  const client = createSupabaseServiceClient();
  if (!client) return { client: null, allowed: false, error: null };
  const forwardedFor = request.headers.get("x-forwarded-for")
    ?.split(",")
    .map((value) => value.trim())
    .filter(Boolean)
    .at(-1);
  const ip = request.headers.get("x-real-ip") || forwardedFor || "unknown";
  const salt = process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || "aras-plastik";
  const key = createHash("sha256").update(`${salt}:${ip}`).digest("hex");
  const { data, error } = await client.rpc("consume_form_rate_limit", { p_key: key, p_action: action, p_limit: action === "quote" ? 4 : 10, p_window_seconds: 900 });
  return { client, allowed: !error && data === true, error };
}

export function createOrderNumber(submissionToken: string) {
  const date = new Date().toISOString().slice(2, 10).replaceAll("-", "");
  const tokenPart = submissionToken.replaceAll("-", "").slice(0, 16).toUpperCase();
  return `AP-${date}-${tokenPart}`;
}
