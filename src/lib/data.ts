import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { Product, SiteContent, SiteSettings, SocialPost } from "@/lib/types";
import { emptySettings } from "@/lib/types";

const productColumns = "*, category:categories(name_tr,name_en,slug), product_images(id,product_id,image_url,alt_text_tr,alt_text_en,sort_order)";

export async function getSiteSettings(): Promise<SiteSettings> {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return emptySettings;
  const { data } = await supabase.from("site_settings").select("*").limit(1).maybeSingle();
  return { ...emptySettings, ...(data ?? {}) } as SiteSettings;
}

export async function getSiteContent(contentKey: "home" | "about"): Promise<SiteContent> {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return {};
  const { data } = await supabase.from("site_content").select("value").eq("content_key", contentKey).maybeSingle();
  return (data?.value as SiteContent | undefined) ?? {};
}

export async function getSocialPosts(): Promise<SocialPost[]> {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return [];
  const { data, error } = await supabase.from("site_content").select("value").eq("content_key", "social").maybeSingle();
  if (error || !data?.value || typeof data.value !== "object" || Array.isArray(data.value)) return [];
  const posts = (data.value as { posts?: unknown }).posts;
  if (!Array.isArray(posts)) return [];
  return posts.filter((post): post is SocialPost => {
    if (!post || typeof post !== "object") return false;
    const value = post as Partial<SocialPost>;
    return typeof value.id === "string" && typeof value.caption === "string" && typeof value.media_url === "string" && (value.media_type === "image" || value.media_type === "video") && typeof value.created_at === "string";
  }).slice(0, 60);
}

export async function getProducts(options: { featured?: boolean; category?: string; search?: string } = {}): Promise<Product[]> {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return [];
  let query = supabase.from("products").select(productColumns).eq("is_published", true).order("created_at", { ascending: false }).limit(60);
  if (options.featured) query = query.eq("is_featured", true);
  if (options.category) query = query.eq("category_id", options.category);
  const search = safeSearch(options.search);
  if (search) query = query.or(`name_tr.ilike.%${search}%,name_en.ilike.%${search}%,product_code.ilike.%${search}%`);
  const { data, error } = await query;
  if (error) return [];
  return (data ?? []) as unknown as Product[];
}

export async function getProductsPage(options: { category?: string; search?: string; page?: number; pageSize?: number } = {}) {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return { products: [] as Product[], total: 0 };
  const pageSize = Math.min(Math.max(options.pageSize ?? 24, 1), 60);
  const page = Math.max(options.page ?? 1, 1);
  let query = supabase.from("products").select(productColumns, { count: "exact" }).eq("is_published", true).order("created_at", { ascending: false });
  if (options.category) query = query.eq("category_id", options.category);
  const search = safeSearch(options.search);
  if (search) query = query.or(`name_tr.ilike.%${search}%,name_en.ilike.%${search}%,product_code.ilike.%${search}%`);
  const { data, error, count } = await query.range((page - 1) * pageSize, page * pageSize - 1);
  if (error) return { products: [] as Product[], total: 0 };
  return { products: (data ?? []) as unknown as Product[], total: count ?? 0 };
}

function safeSearch(value?: string) {
  return value?.slice(0, 60).replace(/[,().:*\\"']/g, " ").replace(/[%_]/g, "").trim() || "";
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return null;
  const { data } = await supabase.from("products").select(productColumns).eq("slug", slug).eq("is_published", true).maybeSingle();
  return (data as unknown as Product | null) ?? null;
}

export async function getCategories() {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return [];
  const { data } = await supabase.from("categories").select("id,name_tr,name_en,slug").eq("is_active", true).order("sort_order");
  return data ?? [];
}
