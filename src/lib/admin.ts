import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function requireAdmin() {
  const supabase = await createSupabaseServerClient();
  if (!supabase) redirect("/admin/login");
  const { data } = await supabase.auth.getUser();
  if (data.user?.app_metadata?.role !== "admin") redirect("/admin/login");
  return supabase;
}
