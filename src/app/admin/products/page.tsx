import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, Plus } from "lucide-react";
import { AdminDeleteButton } from "@/components/admin-delete-button";
import { AdminHeader } from "@/components/admin-header";
import { deleteProduct } from "@/app/admin/actions";
import { requireAdmin } from "@/lib/admin";

export default async function AdminProductsPage() {
  const supabase = await requireAdmin();
  const { data: products } = await supabase.from("products").select("id,name_tr,slug,product_code,cover_image,is_published,is_featured,created_at,category:categories(name_tr)").order("created_at", { ascending: false }).limit(200);
  return <main className="admin-dashboard"><AdminHeader /><div className="admin-content"><div className="admin-page-heading"><div><div className="eyebrow"><span className="eyebrow-line" />KATALOG YÖNETİMİ</div><h1>Ürünler</h1><p>Yayındaki ve taslak ürünleri yönetin.</p></div><Link href="/admin/products/new" className="button-primary"><Plus size={15} />Yeni ürün</Link></div>
    <div className="admin-table"><div className="admin-table-scroll"><table><thead><tr><th>Ürün</th><th>Ürün kodu</th><th>Kategori</th><th>Durum</th><th>Öne çıkan</th><th>Oluşturulma</th><th>İşlemler</th></tr></thead><tbody>{products?.map((product) => <tr key={product.id}><td><div className="admin-product-name">{product.cover_image && <Image src={product.cover_image} alt="" width={44} height={40} />}<span>{product.name_tr}</span></div></td><td>{product.product_code || "—"}</td><td>{(product.category as unknown as { name_tr: string } | null)?.name_tr || "—"}</td><td><span className={product.is_published ? "status-pill is-published" : "status-pill"}>{product.is_published ? "Yayında" : "Taslak"}</span></td><td>{product.is_featured ? "Evet" : "—"}</td><td>{new Date(product.created_at).toLocaleDateString("tr-TR")}</td><td><div className="admin-row-actions"><Link href={`/admin/products/${product.id}`} className="admin-edit">Düzenle<ArrowUpRight size={13} /></Link><form action={deleteProduct}><input type="hidden" name="id" value={product.id} /><AdminDeleteButton /></form></div></td></tr>)}</tbody></table></div>{!products?.length && <p>Henüz ürün eklenmedi.</p>}</div>
  </div></main>;
}
