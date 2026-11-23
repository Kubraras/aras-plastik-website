import { AdminHeader } from "@/components/admin-header";
import { AdminDeleteButton } from "@/components/admin-delete-button";
import { createCategory, deleteCategory } from "@/app/admin/actions";
import { requireAdmin } from "@/lib/admin";

export default async function AdminCategoriesPage({ searchParams }: { searchParams: Promise<{ saved?: string; error?: string }> }) {
  const [{ saved, error }, supabase] = await Promise.all([searchParams, requireAdmin()]);
  const { data: categories } = await supabase.from("categories").select("id,name_tr,name_en,slug,is_active,sort_order,created_at").order("sort_order").order("name_tr");
  return <main className="admin-dashboard"><AdminHeader /><div className="admin-content"><div className="eyebrow"><span className="eyebrow-line" />KATALOG YÖNETİMİ</div><h1>Kategoriler</h1><p>Ürün kataloğunda kullanılacak kategorileri yönetin.</p>{saved && <p className="admin-success">Kategori oluşturuldu.</p>}{error && <p className="admin-error">Kategori eklenemedi. Alanları ve benzersiz slug bilgisini kontrol edin.</p>}
    <form className="admin-category-form" action={createCategory}><label className="field"><span>Kategori adı (TR)</span><input name="name_tr" required maxLength={120} /></label><label className="field"><span>Category name (EN)</span><input name="name_en" maxLength={120} /></label><label className="field"><span>Slug</span><input name="slug" required pattern="[a-z0-9]+(-[a-z0-9]+)*" maxLength={120} placeholder="orn-urun-grubu" /></label><button className="button-primary" type="submit">Kategori ekle</button></form>
    <div className="admin-table"><div className="admin-table-scroll"><table><thead><tr><th>Ad (TR)</th><th>Name (EN)</th><th>Slug</th><th>Durum</th><th></th></tr></thead><tbody>{categories?.map((category) => <tr key={category.id}><td>{category.name_tr}</td><td>{category.name_en || "—"}</td><td>{category.slug}</td><td>{category.is_active ? "Aktif" : "Pasif"}</td><td><form action={deleteCategory}><input type="hidden" name="id" value={category.id} /><AdminDeleteButton label="Sil" /></form></td></tr>)}</tbody></table></div>{!categories?.length && <p>Henüz kategori eklenmedi.</p>}</div>
  </div></main>;
}
