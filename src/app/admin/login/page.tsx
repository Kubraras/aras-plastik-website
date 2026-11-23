import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { signInAdmin } from "@/app/admin/actions";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export default async function AdminLoginPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const [{ error }, supabase] = await Promise.all([searchParams, createSupabaseServerClient()]);
  if (supabase) {
    const { data } = await supabase.auth.getUser();
    if (data.user?.app_metadata?.role === "admin") redirect("/admin");
  }
  const configured = Boolean(supabase);
  return <main className="admin-page"><section className="admin-card">
    <Link href="/tr" className="brand"><span className="brand-mark" aria-hidden="true"><span /><span /><span /></span><span className="brand-name">ARAS<span>PLASTİK</span></span></Link>
    <h1>Yönetici girişi</h1><p>Yönetim paneline erişmek için yetkili hesabınızla giriş yapın.</p>
    <form action={signInAdmin}>
      <div className="field"><label htmlFor="email">E-posta</label><input id="email" name="email" type="email" required autoComplete="username" /></div>
      <div className="field"><label htmlFor="password">Şifre</label><input id="password" name="password" type="password" required autoComplete="current-password" /></div>
      <button className="button-primary" type="submit" disabled={!configured}>Giriş yap<ArrowLeft size={15} /></button>
    </form>
    {error === "credentials" && <p className="admin-error" role="alert">Giriş bilgileri doğru değil veya hesabınız yönetici olarak yetkilendirilmemiş.</p>}
    {error === "setup" && <p className="admin-error" role="alert">Supabase bağlantısı yapılandırılmamış. .env.local dosyasını kontrol edin.</p>}
    {!configured && <p className="admin-notice">Giriş ekranı hazır. Supabase ortam değişkenleri eklendiğinde yetkili hesapla kullanılabilir.</p>}
    <p className="admin-notice">Genel kayıt oluşturma açık değildir. Yönetici hesabı Supabase Auth panelinden tanımlanmalıdır.</p>
  </section></main>;
}
