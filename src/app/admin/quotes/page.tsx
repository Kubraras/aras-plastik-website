import { AdminHeader } from "@/components/admin-header";
import { updateQuote } from "@/app/admin/actions";
import { requireAdmin } from "@/lib/admin";

const statuses = [
  ["new", "Yeni talep"], ["reviewing", "İnceleniyor"], ["contacted", "İletişime geçildi"], ["quoted", "Teklif verildi"], ["approved", "Onaylandı"], ["completed", "Tamamlandı"], ["rejected", "Reddedildi / İptal"],
];

export default async function AdminQuotesPage({ searchParams }: { searchParams: Promise<{ status?: string; q?: string }> }) {
  const [{ status, q }, supabase] = await Promise.all([searchParams, requireAdmin()]);
  let query = supabase.from("quote_requests").select("id,order_number,product_name_snapshot,product_code_snapshot,quantity,first_name,last_name,phone,email,company_name,message,status,admin_note,created_at").order("created_at", { ascending: false }).limit(200);
  if (status && statuses.some(([key]) => key === status)) query = query.eq("status", status);
  const search = q?.slice(0, 60).replace(/[,().:*\\"'%_]/g, " ").trim();
  if (search) query = query.or(`product_name_snapshot.ilike.%${search}%,first_name.ilike.%${search}%,last_name.ilike.%${search}%,company_name.ilike.%${search}%`);
  const { data: requests } = await query;
  return <main className="admin-dashboard"><AdminHeader /><div className="admin-content"><div className="eyebrow"><span className="eyebrow-line" />MÜŞTERİ TALEPLERİ</div><h1>Teklif talepleri</h1><p>Durumları güncelleyin, not ekleyin ve müşteriye ulaşın.</p><form className="admin-filter" method="get"><input type="search" name="q" defaultValue={q} placeholder="Ürün veya müşteri ara" /><select name="status" defaultValue={status || ""}><option value="">Tüm durumlar</option>{statuses.map(([value, label]) => <option value={value} key={value}>{label}</option>)}</select><button className="button-primary" type="submit">Filtrele</button></form>
    <div className="admin-table"><div className="admin-table-scroll"><table><thead><tr><th>Talep no / tarih</th><th>Ürün</th><th>Müşteri</th><th>Miktar</th><th>İletişim</th><th>Durum / not</th><th></th></tr></thead><tbody>{requests?.map((request) => <tr key={request.id}><td><strong>{request.order_number}</strong><br />{new Date(request.created_at).toLocaleString("tr-TR")}</td><td>{request.product_name_snapshot}<br /><small>{request.product_code_snapshot || ""}</small></td><td>{request.first_name} {request.last_name}<br /><small>{request.company_name || ""}</small></td><td>{request.quantity.toLocaleString("tr-TR")}</td><td><a href={`tel:${request.phone}`}>{request.phone}</a><br /><a href={`https://wa.me/${request.phone.replace(/\D/g, "")}`} target="_blank" rel="noreferrer">WhatsApp</a></td><td colSpan={2}><form className="admin-inline-form" action={updateQuote}><input type="hidden" name="id" value={request.id} /><select name="status" defaultValue={request.status}>{statuses.map(([value, label]) => <option value={value} key={value}>{label}</option>)}</select><textarea name="admin_note" defaultValue={request.admin_note || ""} maxLength={5000} placeholder="Yönetici notu" /><button type="submit" className="admin-save">Güncelle</button></form></td></tr>)}</tbody></table></div>{!requests?.length && <p>Bu filtreyle eşleşen talep bulunamadı.</p>}</div>
  </div></main>;
}
