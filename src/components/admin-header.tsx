import Link from "next/link";
import { Boxes, FileText, Layers3, LogOut, MessageSquareText, Settings2 } from "lucide-react";
import { signOutAdmin } from "@/app/admin/actions";

export function AdminHeader() {
  return <header className="admin-topbar"><Link href="/admin" className="brand"><span className="brand-mark" aria-hidden="true"><span /><span /><span /></span><span className="brand-name">ARAS<span>YÖNETİM</span></span></Link><nav><Link href="/admin/products"><Boxes size={14} />Ürünler</Link><Link href="/admin/categories"><Layers3 size={14} />Kategoriler</Link><Link href="/admin/quotes"><FileText size={14} />Teklif talepleri</Link><Link href="/admin/messages"><MessageSquareText size={14} />Mesajlar</Link><Link href="/admin/settings"><Settings2 size={14} />Site içerikleri</Link><form action={signOutAdmin}><button className="admin-logout" type="submit">Çıkış yap<LogOut size={14} /></button></form></nav></header>;
}
