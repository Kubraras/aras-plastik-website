import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowUpRight, Boxes, FileText, MessageSquareText, Package } from "lucide-react";
import { requireAdmin } from "@/lib/admin";
import { AdminHeader } from "@/components/admin-header";

export default async function AdminDashboard() {
  const supabase = await requireAdmin();
  const [totalProducts, publishedProducts, drafts, newQuotes, totalQuotes, newMessages] = await Promise.all([
    supabase.from("products").select("id", { count: "exact", head: true }),
    supabase.from("products").select("id", { count: "exact", head: true }).eq("is_published", true),
    supabase.from("products").select("id", { count: "exact", head: true }).eq("is_published", false),
    supabase.from("quote_requests").select("id", { count: "exact", head: true }).eq("status", "new"),
    supabase.from("quote_requests").select("id", { count: "exact", head: true }),
    supabase.from("contact_messages").select("id", { count: "exact", head: true }).eq("is_read", false),
  ]);
  const stats = [
    { label: "Toplam ürün", count: totalProducts.count ?? 0, icon: Package },
    { label: "Yayındaki ürün", count: publishedProducts.count ?? 0, icon: Boxes },
    { label: "Taslak ürün", count: drafts.count ?? 0, icon: FileText },
    { label: "Yeni teklif talebi", count: newQuotes.count ?? 0, icon: MessageSquareText },
    { label: "Toplam teklif talebi", count: totalQuotes.count ?? 0, icon: MessageSquareText },
    { label: "Yeni iletişim mesajı", count: newMessages.count ?? 0, icon: MessageSquareText },
  ];
  const { data: recentQuotes } = await supabase.from("quote_requests").select("order_number,first_name,last_name,product_name_snapshot,quantity,phone,status,created_at").order("created_at", { ascending: false }).limit(5);
  const { data: recentMessages } = await supabase.from("contact_messages").select("id,full_name,phone,message,created_at").order("created_at", { ascending: false }).limit(3);
  return <main className="admin-dashboard">
    <AdminHeader />
    <div className="admin-content"><div className="eyebrow"><span className="eyebrow-line" />GENEL BAKIŞ</div><h1>Yönetim paneli</h1><p>Ürünleri, teklif taleplerini ve site içeriklerini yönetin.</p>
      <div className="admin-stats">{stats.map(({ label, count, icon: Icon }) => <div className="admin-stat" key={label}><div className="admin-stat-label"><Icon size={16} />{label}</div><strong>{count}</strong></div>)}</div>
      <section className="admin-table"><div className="admin-section-heading"><h2>Son teklif talepleri</h2><Link href="/admin/quotes">Tüm talepler<ArrowUpRight size={14} /></Link></div>{recentQuotes?.length ? <div className="admin-table-scroll"><table><thead><tr><th>Talep no</th><th>Müşteri</th><th>Ürün</th><th>Miktar</th><th>Telefon</th><th>Durum</th><th>Tarih</th></tr></thead><tbody>{recentQuotes.map((quote) => <tr key={quote.order_number}><td>{quote.order_number}</td><td>{quote.first_name} {quote.last_name}</td><td>{quote.product_name_snapshot}</td><td>{quote.quantity}</td><td><a href={`tel:${quote.phone}`}>{quote.phone}</a></td><td>{quote.status}</td><td>{new Date(quote.created_at).toLocaleDateString("tr-TR")}</td></tr>)}</tbody></table></div> : <p>Henüz teklif talebi yok.</p>}</section>
      <section className="admin-table"><div className="admin-section-heading"><h2>Son iletişim mesajları</h2><Link href="/admin/messages">Tüm mesajlar<ArrowUpRight size={14} /></Link></div>{recentMessages?.length ? <div className="admin-table-scroll"><table><thead><tr><th>Ad soyad</th><th>Telefon</th><th>Mesaj</th><th>Tarih</th></tr></thead><tbody>{recentMessages.map((message) => <tr key={message.id}><td>{message.full_name}</td><td><a href={`tel:${message.phone}`}>{message.phone}</a></td><td>{message.message.slice(0, 90)}</td><td>{new Date(message.created_at).toLocaleDateString("tr-TR")}</td></tr>)}</tbody></table></div> : <p>Henüz iletişim mesajı yok.</p>}</section>
    </div>
  </main>;
}
