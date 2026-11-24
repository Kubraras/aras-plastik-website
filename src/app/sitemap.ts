import type { MetadataRoute } from "next";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { siteOrigin } from "@/lib/seo";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const origin = siteOrigin();
  const paths = ["", "/products", "/about", "/updates", "/contact", "/privacy"];
  const entries: MetadataRoute.Sitemap = paths.flatMap((path) => {
    const tr = `${origin}/tr${path}`;
    const en = `${origin}/en${path}`;
    return [
      { url: tr, alternates: { languages: { tr, en } }, changeFrequency: path === "/products" ? "daily" : "monthly", priority: path === "" ? 1 : path === "/products" ? .9 : .6 },
      { url: en, alternates: { languages: { tr, en } }, changeFrequency: path === "/products" ? "daily" : "monthly", priority: path === "" ? .8 : path === "/products" ? .7 : .5 },
    ];
  });
  const supabase = await createSupabaseServerClient();
  if (!supabase) return entries;
  let from = 0;
  const batchSize = 1000;
  while (true) {
    const { data } = await supabase.from("products").select("slug,updated_at").eq("is_published", true).order("created_at", { ascending: false }).range(from, from + batchSize - 1);
    if (!data?.length) break;
    for (const product of data) {
      const tr = `${origin}/tr/products/${product.slug}`;
      const en = `${origin}/en/products/${product.slug}`;
      entries.push({ url: tr, lastModified: new Date(product.updated_at), changeFrequency: "weekly", priority: .7, alternates: { languages: { tr, en } } });
      entries.push({ url: en, lastModified: new Date(product.updated_at), changeFrequency: "weekly", priority: .6, alternates: { languages: { tr, en } } });
    }
    if (data.length < batchSize) break;
    from += batchSize;
  }
  return entries;
}
