import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { AdminHeader } from "@/components/admin-header";
import { AdminProductForm } from "@/components/admin-product-form";
import { requireAdmin } from "@/lib/admin";

export default async function NewProductPage() {
  const supabase = await requireAdmin();
  const { data: categories } = await supabase.from("categories").select("id,name_tr,name_en").order("sort_order");
  return <main className="admin-dashboard"><AdminHeader /><div className="admin-content"><Link className="admin-back" href="/admin/products"><ArrowLeft size={14} />Ürünlere dön</Link><div className="eyebrow"><span className="eyebrow-line" />KATALOG YÖNETİMİ</div><h1>Yeni ürün</h1><p>Ürün bilgisini girip taslak olarak kaydedebilir veya yayına alabilirsiniz.</p><AdminProductForm product={null} categories={categories ?? []} /></div></main>;
}
