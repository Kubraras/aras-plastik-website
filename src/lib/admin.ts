import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const ADMIN_EMAIL = "davutaras1978@gmail.com";

type AdminIdentity = {
  email?: string | null;
  app_metadata?: { role?: unknown } | null;
} | null | undefined;

export function isAllowedAdmin(user: AdminIdentity) {
  return user?.email?.trim().toLowerCase() === ADMIN_EMAIL && user.app_metadata?.role === "admin";
}

export async function requireAdmin() {
  const supabase = await createSupabaseServerClient();
  if (!supabase) redirect("/admin/login");
  const { data } = await supabase.auth.getUser();
  if (!isAllowedAdmin(data.user)) redirect("/admin/login");
  return supabase;
}
