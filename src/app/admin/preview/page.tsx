import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { AdminSocialPostComposer } from "@/components/admin-social-post-composer";

export const dynamic = "force-dynamic";

export default function AdminPreviewPage() {
  if (process.env.NODE_ENV === "production") notFound();
  return <main className="admin-dashboard">
    <header className="admin-topbar"><Link href="/admin/login" className="admin-preview-back"><ArrowLeft size={15} />Yönetici girişine dön</Link><span className="admin-preview-badge">YEREL ÖNİZLEME</span></header>
    <div className="admin-content"><div className="eyebrow"><span className="eyebrow-line" />ARAS PLASTİK · PAYLAŞIMLAR</div><h1>Paylaşım oluştur</h1><p>Instagram’daki gibi bir fotoğraf veya video seçip altına açıklama yaz.</p><AdminSocialPostComposer previewOnly /></div>
  </main>;
}
