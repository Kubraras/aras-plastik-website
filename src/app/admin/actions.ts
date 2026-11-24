"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { ADMIN_EMAIL, isAllowedAdmin, requireAdmin } from "@/lib/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { SocialPost } from "@/lib/types";

const httpsUrl = z.string().url().refine((value) => new URL(value).protocol === "https:").max(2048);

export async function signInAdmin(formData: FormData) {
  const email = String(formData.get("email") || "").trim().toLowerCase();
  const password = String(formData.get("password") || "");
  if (email !== ADMIN_EMAIL || !password || password.length > 200) redirect("/admin/login?error=credentials");
  const supabase = await createSupabaseServerClient();
  if (!supabase) redirect("/admin/login?error=setup");
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error || !isAllowedAdmin(data.user)) {
    if (data.user) await supabase.auth.signOut();
    redirect("/admin/login?error=credentials");
  }
  redirect("/admin");
}

export async function signOutAdmin() {
  const supabase = await createSupabaseServerClient();
  if (supabase) await supabase.auth.signOut();
  redirect("/admin/login");
}

export async function deleteProduct(formData: FormData) {
  const id = z.string().uuid().safeParse(String(formData.get("id") || ""));
  if (!id.success) return;
  const supabase = await requireAdmin();
  await supabase.from("products").delete().eq("id", id.data);
  revalidatePath("/admin/products");
  revalidatePath("/tr/products");
}

export async function updateQuote(formData: FormData) {
  const input = z.object({
    id: z.string().uuid(),
    status: z.enum(["new", "reviewing", "contacted", "quoted", "approved", "completed", "rejected"]),
    admin_note: z.string().max(5000),
  }).safeParse({ id: formData.get("id"), status: formData.get("status"), admin_note: formData.get("admin_note") || "" });
  if (!input.success) return;
  const supabase = await requireAdmin();
  await supabase.from("quote_requests").update({ status: input.data.status, admin_note: input.data.admin_note || null }).eq("id", input.data.id);
  revalidatePath("/admin");
  revalidatePath("/admin/quotes");
}

export async function markMessageRead(formData: FormData) {
  const input = z.object({ id: z.string().uuid(), isRead: z.enum(["true", "false"]) }).safeParse({ id: formData.get("id"), isRead: formData.get("isRead") });
  if (!input.success) return;
  const supabase = await requireAdmin();
  await supabase.from("contact_messages").update({ is_read: input.data.isRead === "true" }).eq("id", input.data.id);
  revalidatePath("/admin");
  revalidatePath("/admin/messages");
}

export async function saveSiteSettings(formData: FormData) {
  const input = z.object({
    company_name: z.string().trim().min(1).max(120),
    company_description_tr: z.string().max(5000),
    company_description_en: z.string().max(5000),
    contact_person_1_name: z.string().trim().max(120), contact_person_1_phone: z.string().trim().max(40),
    contact_person_2_name: z.string().trim().max(120), contact_person_2_phone: z.string().trim().max(40),
    phone: z.string().max(40), email: z.union([z.literal(""), z.string().email().max(254)]), whatsapp: z.string().max(40),
    address_tr: z.string().max(500), address_en: z.string().max(500),
    map_url: z.union([z.literal(""), httpsUrl]),
    instagram: z.union([z.literal(""), httpsUrl]),
    linkedin: z.union([z.literal(""), httpsUrl]),
    logo_url: z.union([z.literal(""), httpsUrl]),
    favicon_url: z.union([z.literal(""), httpsUrl]),
  }).safeParse(Object.fromEntries(formData));
  if (!input.success) redirect("/admin/settings?error=validation");
  const supabase = await requireAdmin();
  const { error } = await supabase.from("site_settings").update(input.data).eq("id", 1);
  if (error) redirect("/admin/settings?error=save");
  revalidatePath("/", "layout");
  redirect("/admin/settings?saved=1");
}

export async function createCategory(formData: FormData) {
  const input = z.object({ name_tr: z.string().trim().min(1).max(120), name_en: z.string().trim().max(120), slug: z.string().trim().max(120) }).safeParse({ name_tr: formData.get("name_tr"), name_en: formData.get("name_en") || "", slug: formData.get("slug") });
  if (!input.success) redirect("/admin/categories?error=validation");
  const slug = input.data.slug.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  const supabase = await requireAdmin();
  const { error } = await supabase.from("categories").insert({ name_tr: input.data.name_tr, name_en: input.data.name_en || null, slug });
  if (error) redirect("/admin/categories?error=save");
  revalidatePath("/admin/categories");
  redirect("/admin/categories?saved=1");
}

export async function deleteCategory(formData: FormData) {
  const id = z.string().uuid().safeParse(String(formData.get("id") || ""));
  if (!id.success) return;
  const supabase = await requireAdmin();
  await supabase.from("categories").delete().eq("id", id.data);
  revalidatePath("/admin/categories");
}

export async function savePageContent(formData: FormData) {
  const key = z.enum(["home", "about"]).safeParse(formData.get("content_key"));
  if (!key.success) redirect("/admin/settings?error=content");
  const keys = key.data === "home"
    ? ["hero_title_tr", "hero_title_en", "hero_description_tr", "hero_description_en", "home_about_tr", "home_about_en", "hero_image_url", "home_about_image_url"]
    : ["heading_tr", "heading_en", "body_tr", "body_en", "image_url"];
  const value: Record<string, string> = {};
  for (const item of keys) {
    const schema = item.endsWith("_image_url") || item === "image_url" ? z.union([z.literal(""), httpsUrl]) : z.string().max(5000);
    const parsed = schema.safeParse(formData.get(item) ?? "");
    if (!parsed.success) redirect("/admin/settings?error=content");
    value[item] = parsed.data;
  }
  const supabase = await requireAdmin();
  const { error } = await supabase.from("site_content").upsert({ content_key: key.data, value, is_public: true });
  if (error) redirect("/admin/settings?error=content");
  revalidatePath("/", "layout");
  redirect("/admin/settings?saved=content");
}

export async function createSocialPost(formData: FormData): Promise<{ ok: true } | { ok: false; error: string }> {
  const input = z.object({
    id: z.string().uuid(),
    caption: z.string().trim().max(2200),
    media_url: z.string().url().max(2048),
    media_type: z.enum(["image", "video"]),
  }).safeParse({
    id: formData.get("id"),
    caption: formData.get("caption") || "",
    media_url: formData.get("media_url"),
    media_type: formData.get("media_type"),
  });
  if (!input.success) return { ok: false, error: "Paylaşım bilgileri kontrol edilemedi." };
  const storagePrefix = `${process.env.NEXT_PUBLIC_SUPABASE_URL?.replace(/\/$/, "")}/storage/v1/object/public/social-posts/`;
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !input.data.media_url.startsWith(storagePrefix)) {
    return { ok: false, error: "Önce geçerli bir fotoğraf veya video yükleyin." };
  }

  const supabase = await requireAdmin();
  const { data: current, error: readError } = await supabase.from("site_content").select("value").eq("content_key", "social").maybeSingle();
  if (readError) return { ok: false, error: "Paylaşımlar alınamadı." };
  const value = current?.value && typeof current.value === "object" && !Array.isArray(current.value) ? current.value as { posts?: unknown } : {};
  const posts = Array.isArray(value.posts) ? value.posts as SocialPost[] : [];
  const post: SocialPost = { ...input.data, created_at: new Date().toISOString() };
  const { error } = await supabase.from("site_content").upsert({ content_key: "social", value: { posts: [post, ...posts].slice(0, 60) }, is_public: true });
  if (error) return { ok: false, error: "Paylaşım kaydedilemedi. Tekrar deneyin." };
  revalidatePath("/admin/posts");
  revalidatePath("/tr/updates");
  revalidatePath("/en/updates");
  revalidatePath("/tr");
  revalidatePath("/en");
  return { ok: true };
}

export async function deleteSocialPost(formData: FormData) {
  const parsedId = z.string().uuid().safeParse(formData.get("id"));
  if (!parsedId.success) return;
  const supabase = await requireAdmin();
  const { data: current, error: readError } = await supabase.from("site_content").select("value").eq("content_key", "social").maybeSingle();
  if (readError || !current?.value || typeof current.value !== "object" || Array.isArray(current.value)) return;
  const value = current.value as { posts?: unknown };
  const posts = Array.isArray(value.posts) ? value.posts as SocialPost[] : [];
  const post = posts.find((item) => item.id === parsedId.data);
  if (!post) return;
  const marker = "/storage/v1/object/public/social-posts/";
  const path = post.media_url.includes(marker) ? decodeURIComponent(post.media_url.split(marker)[1]) : null;
  if (path) await supabase.storage.from("social-posts").remove([path]);
  const { error } = await supabase.from("site_content").upsert({ content_key: "social", value: { posts: posts.filter((item) => item.id !== parsedId.data) }, is_public: true });
  if (error) return;
  revalidatePath("/admin/posts");
  revalidatePath("/tr/updates");
  revalidatePath("/en/updates");
  revalidatePath("/tr");
  revalidatePath("/en");
}
