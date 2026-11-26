import { AdminHeader } from "@/components/admin-header";
import { savePageContent, saveSiteSettings } from "@/app/admin/actions";
import { requireAdmin } from "@/lib/admin";
import { AdminImageInput } from "@/components/admin-image-input";
import { DEFAULT_ABOUT_SERVICES_TR, DEFAULT_BUSINESS_ADDRESS, DEFAULT_HOME_HERO_DESCRIPTION_TR, DEFAULT_HOME_HERO_TITLE_TR, googleMapsSearchUrl } from "@/lib/site-copy";

export default async function AdminSettingsPage({ searchParams }: { searchParams: Promise<{ saved?: string; error?: string }> }) {
  const [{ saved, error }, supabase] = await Promise.all([searchParams, requireAdmin()]);
  const [settingsResult, contentResult] = await Promise.all([
    supabase.from("site_settings").select("*").eq("id", 1).single(),
    supabase.from("site_content").select("content_key,value").in("content_key", ["home", "about"]),
  ]);
  const data = settingsResult.data;
  const settingsAddress = data?.address_tr?.trim() || DEFAULT_BUSINESS_ADDRESS;
  const contentByKey = Object.fromEntries((contentResult.data ?? []).map((row) => [row.content_key, row.value as Record<string, string>]));
  const home = contentByKey.home ?? {};
  const about = contentByKey.about ?? {};
  return <main className="admin-dashboard"><AdminHeader /><div className="admin-content"><div className="eyebrow"><span className="eyebrow-line" />SİTE YÖNETİMİ</div><h1>Site içerikleri</h1><p>Public site ve iletişim alanlarında görünen bilgileri düzenleyin.</p>{saved && <p className="admin-success">Bilgiler kaydedildi.</p>}{error && <p className="admin-error">Form alanlarını kontrol edip tekrar deneyin.</p>}
    <form className="admin-settings-form" action={saveSiteSettings}><div className="admin-form-section"><h2>Firma bilgileri</h2><div className="admin-form-grid">
      <label className="field"><span>Firma adı</span><input name="company_name" defaultValue={data?.company_name || "Aras Plastik"} required maxLength={120} /></label>
      <label className="field"><span>Telefon</span><input name="phone" type="tel" defaultValue={data?.phone || ""} maxLength={40} /></label>
      <label className="field"><span>İletişim kişisi 1</span><input name="contact_person_1_name" defaultValue={data?.contact_person_1_name || "Davut Aras"} maxLength={120} /></label>
      <label className="field"><span>Telefon 1</span><input name="contact_person_1_phone" type="tel" defaultValue={data?.contact_person_1_phone || "05363548037"} maxLength={40} /></label>
      <label className="field"><span>İletişim kişisi 2</span><input name="contact_person_2_name" defaultValue={data?.contact_person_2_name || "Muhammed Yusuf Aras"} maxLength={120} /></label>
      <label className="field"><span>Telefon 2</span><input name="contact_person_2_phone" type="tel" defaultValue={data?.contact_person_2_phone || "05453558037"} maxLength={40} /></label>
      <label className="field"><span>E-posta</span><input name="email" type="email" defaultValue={data?.email || ""} maxLength={254} /></label>
      <label className="field"><span>WhatsApp numarası</span><input name="whatsapp" defaultValue={data?.whatsapp || ""} maxLength={40} placeholder="Ülke koduyla, ör. 90…" /></label>
      <label className="field"><span>Adres (TR)</span><textarea name="address_tr" defaultValue={data?.address_tr || DEFAULT_BUSINESS_ADDRESS} rows={3} maxLength={500} /></label>
      <label className="field"><span>Address (EN)</span><textarea name="address_en" defaultValue={data?.address_en || DEFAULT_BUSINESS_ADDRESS} rows={3} maxLength={500} /></label>
      <label className="field admin-area"><span>Kısa tanıtım (TR)</span><textarea name="company_description_tr" defaultValue={data?.company_description_tr || ""} rows={5} maxLength={5000} /></label>
      <label className="field admin-area"><span>Company overview (EN)</span><textarea name="company_description_en" defaultValue={data?.company_description_en || ""} rows={5} maxLength={5000} /></label>
      <label className="field"><span>Google Maps bağlantısı</span><input name="map_url" type="url" defaultValue={data?.map_url || googleMapsSearchUrl(settingsAddress)} maxLength={2048} /></label>
      <label className="field"><span>Instagram URL</span><input name="instagram" type="url" defaultValue={data?.instagram || ""} maxLength={2048} /></label>
      <label className="field"><span>LinkedIn URL</span><input name="linkedin" type="url" defaultValue={data?.linkedin || ""} maxLength={2048} /></label>
      <AdminImageInput name="logo_url" label="Firma logosu" initialValue={data?.logo_url || ""} />
      <AdminImageInput name="favicon_url" label="Favicon görseli" initialValue={data?.favicon_url || ""} />
    </div></div><div className="admin-form-actions"><button className="button-primary" type="submit">Firma bilgilerini kaydet</button></div></form>
    <form className="admin-settings-form" action={savePageContent}><input type="hidden" name="content_key" value="home" /><div className="admin-form-section"><h2>Ana sayfa içerikleri</h2><p>Boş bırakılan alanlarda varsayılan metinler gösterilir.</p><div className="admin-form-grid">
      <label className="field admin-area"><span>Hero başlığı (TR)</span><textarea name="hero_title_tr" defaultValue={home.hero_title_tr || DEFAULT_HOME_HERO_TITLE_TR} rows={2} maxLength={500} /></label>
      <label className="field admin-area"><span>Hero title (EN)</span><textarea name="hero_title_en" defaultValue={home.hero_title_en || ""} rows={2} maxLength={500} /></label>
      <label className="field admin-area"><span>Hero açıklaması (TR)</span><textarea name="hero_description_tr" defaultValue={home.hero_description_tr || DEFAULT_HOME_HERO_DESCRIPTION_TR} rows={3} maxLength={1500} /></label>
      <label className="field admin-area"><span>Hero description (EN)</span><textarea name="hero_description_en" defaultValue={home.hero_description_en || ""} rows={3} maxLength={1500} /></label>
      <label className="field admin-area"><span>Ana sayfa firma tanıtımı (TR)</span><textarea name="home_about_tr" defaultValue={home.home_about_tr || ""} rows={3} maxLength={1500} /></label>
      <label className="field admin-area"><span>Homepage overview (EN)</span><textarea name="home_about_en" defaultValue={home.home_about_en || ""} rows={3} maxLength={1500} /></label>
      <AdminImageInput name="hero_image_url" label="Hero görseli" initialValue={home.hero_image_url || ""} />
      <AdminImageInput name="home_about_image_url" label="Ana sayfa firma görseli" initialValue={home.home_about_image_url || ""} />
    </div></div><div className="admin-form-actions"><button className="button-primary" type="submit">Ana sayfa içeriklerini kaydet</button></div></form>
    <form className="admin-settings-form" action={savePageContent}><input type="hidden" name="content_key" value="about" /><div className="admin-form-section"><h2>Hakkımızda sayfası</h2><div className="admin-form-grid">
      <label className="field admin-area"><span>Açıklayıcı başlık (TR)</span><textarea name="heading_tr" defaultValue={about.heading_tr || ""} rows={2} maxLength={500} /></label>
      <label className="field admin-area"><span>Page intro (EN)</span><textarea name="heading_en" defaultValue={about.heading_en || ""} rows={2} maxLength={500} /></label>
      <label className="field admin-area"><span>Firma tanıtımı / tarihçe (TR)</span><textarea name="body_tr" defaultValue={about.body_tr || DEFAULT_ABOUT_SERVICES_TR.join("\n")} rows={6} maxLength={5000} /></label>
      <label className="field admin-area"><span>Company overview / history (EN)</span><textarea name="body_en" defaultValue={about.body_en || ""} rows={6} maxLength={5000} /></label>
      <AdminImageInput name="image_url" label="Hakkımızda görseli" initialValue={about.image_url || ""} />
    </div></div><div className="admin-form-actions"><button className="button-primary" type="submit">Hakkımızda içeriğini kaydet</button></div></form>
  </div></main>;
}
