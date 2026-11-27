import { AdminHeader } from "@/components/admin-header";
import { AdminMessageReply } from "@/components/admin-message-reply";
import { markMessageRead } from "@/app/admin/actions";
import { requireAdmin } from "@/lib/admin";
import { formatTurkishPhone } from "@/lib/site-copy";

export default async function AdminMessagesPage() {
  const supabase = await requireAdmin();
  const { data: messages } = await supabase.from("contact_messages").select("id,full_name,phone,email,company_name,message,reply_text,is_read,created_at").order("created_at", { ascending: false }).limit(200);
  return <main className="admin-dashboard"><AdminHeader /><div className="admin-content"><div className="eyebrow"><span className="eyebrow-line" />MÜŞTERİ İLETİŞİMİ</div><h1>İletişim mesajları</h1><p>Form üzerinden iletilen müşteri mesajları.</p><div className="admin-message-list">{messages?.map((message) => <article className={`admin-message ${message.is_read ? "is-read" : "is-unread"}`} key={message.id}><div className="admin-message-top"><div><strong>{message.full_name}</strong><span>{new Date(message.created_at).toLocaleString("tr-TR")}</span></div><form action={markMessageRead}><input type="hidden" name="id" value={message.id} /><input type="hidden" name="isRead" value={String(!message.is_read)} /><button type="submit" className="admin-save">{message.is_read ? "Okunmadı işaretle" : "Okundu işaretle"}</button></form></div><p>{message.message}</p><div className="admin-message-contacts"><a href={`tel:${message.phone.replace(/[^\d+]/g, "")}`}>{formatTurkishPhone(message.phone)}</a>{message.email && <a href={`mailto:${message.email}`}>{message.email}</a>}{message.company_name && <span>{message.company_name}</span>}</div><AdminMessageReply id={message.id} phone={message.phone} existingReply={message.reply_text} /></article>)}</div>{!messages?.length && <div className="admin-table"><p>Henüz iletişim mesajı yok.</p></div>}</div></main>;
}
