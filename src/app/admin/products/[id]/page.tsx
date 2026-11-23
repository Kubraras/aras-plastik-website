import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { AdminHeader } from "@/components/admin-header";
import { AdminProductForm } from "@/components/admin-product-form";
import { requireAdmin } from "@/lib/admin";
import type { Product } from "@/lib/types";

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await requireAdmin();
  const [productResult, categoryResult] = await Promise.all([
    supabase.from("products").select("*, product_images(id,product_id,image_url,alt_text_tr,alt_text_en,sort_order)").eq("id", id).maybeSingle(),
    supabase.from("categories").select("id,name_tr,name_en").order("sort_order"),
  ]);
  if (!productResult.data) notFound();
  return <main className="admin-dashboard"><AdminHeader /><div className="admin-content"><Link className="admin-back" href="/admin/products"><ArrowLeft size={14} />Ürünlere dön</Link><div className="eyebrow"><span className="eyebrow-line" />KATALOG YÖNETİMİ</div><h1>Ürünü düzenle</h1><p>{productResult.data.name_tr}</p><AdminProductForm product={productResult.data as unknown as Product} categories={categoryResult.data ?? []} /></div></main>;
}
