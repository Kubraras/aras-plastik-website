import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { signInAdmin } from "@/app/admin/actions";
import { ADMIN_EMAIL, isAllowedAdmin } from "@/lib/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export default async function AdminLoginPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const [{ error }, supabase] = await Promise.all([searchParams, createSupabaseServerClient()]);
  if (supabase) {
    const { data } = await supabase.auth.getUser();
    if (isAllowedAdmin(data.user)) redirect("/admin");
  }
  const configured = Boolean(supabase);
  return <main className="admin-page"><section className="admin-card">
    <Link href="/tr" className="brand"><span className="brand-mark" aria-hidden="true"><span /><span /><span /></span><span className="brand-name">ARAS<span>PLASTİK</span></span></Link>
    <h1>Yönetici girişi</h1><p>Yalnızca {ADMIN_EMAIL} hesabı bu panele girebilir.</p>
    <form action={signInAdmin}>
      <div className="field"><label htmlFor="email">E-posta</label><input id="email" name="email" type="email" defaultValue={ADMIN_EMAIL} readOnly autoComplete="username" /></div>
      <div className="field"><label htmlFor="password">Şifre</label><input id="password" name="password" type="password" required autoComplete="current-password" /></div>
      <button className="button-primary" type="submit" disabled={!configured}>Giriş yap<ArrowLeft size={15} /></button>
    </form>
    {error === "credentials" && <p className="admin-error" role="alert">Giriş bilgileri doğru değil veya hesabınız yönetici olarak yetkilendirilmemiş.</p>}
    {error === "setup" && <p className="admin-error" role="alert">Supabase bağlantısı yapılandırılmamış. .env.local dosyasını kontrol edin.</p>}
    {!configured && <p className="admin-notice">Supabase henüz bağlanmamış. Proje URL&apos;si ve anahtarları eklendiğinde bu hesaptan giriş açılır.</p>}
    <p className="admin-notice">Bu e-posta için Supabase Auth kullanıcısı ve admin yetkisi tanımlanmalıdır. Kayıt olma seçeneği yoktur.</p>
    {process.env.NODE_ENV !== "production" && <Link className="admin-preview-link" href="/admin/preview">Yönetim ekranını önizle</Link>}
  </section></main>;
}
