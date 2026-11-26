import { copy, isLocale, type Locale } from "@/lib/i18n";
import { pageMetadata } from "@/lib/seo";
import type { Metadata } from "next";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale: value } = await params;
  if (!isLocale(value)) return {};
  return pageMetadata(value, "/privacy", copy[value].privacy, copy[value].privacy);
}

export default async function PrivacyPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: value } = await params;
  if (!isLocale(value)) return null;
  const locale: Locale = value;
  const text = copy[locale];
  return <><section className="page-hero"><div className="page-shell"><div className="eyebrow"><span className="eyebrow-line" />ARAS PLASTİK · {locale === "tr" ? "BİLGİLENDİRME" : "NOTICE"}</div><h1>{text.privacy}</h1><p>{locale === "tr" ? "Bu içerik firma bilgileriyle tamamlanması ve hukuki değerlendirmeden geçirilmesi gereken bir taslaktır." : "This content is a draft that needs company details and legal review."}</p></div></section><section className="page-content"><div className="page-shell privacy-copy">{locale === "tr" ? <><p>Bu taslak bilgilendirme metni, Aras Plastik web sitesi üzerinden iletişim ve teklif talebi formlarıyla iletilen kişisel verilerin işlenmesine ilişkin genel bilgi vermek amacıyla hazırlanmıştır. Yayına alınmadan önce veri sorumlusu bilgileri, işleme amaçları, hukuki sebepler, saklama süreleri, alıcı grupları ve başvuru kanalları firma tarafından tamamlanmalı ve hukuki değerlendirmeden geçirilmelidir.</p><h2>İşlenebilecek bilgiler</h2><p>Formlarda ad soyad, telefon, isteğe bağlı e-posta ve firma adı ile mesaj içeriği talep edilebilir. Mesaj gönderildiğinde, mesajı ve verilecek yanıtı yalnızca o görüşmeye açan özel bir takip bağlantısı oluşturulur. Bu bağlantıyı başkalarıyla paylaşmayın. Yalnızca talebin değerlendirilmesi ve yanıtlanması için gerekli bilgileri paylaşın.</p><h2>Haklar ve başvuru</h2><p>KVKK kapsamındaki haklarınız ve veri sorumlusuna başvuru yöntemleri, firma bilgileriyle doğrulanmış metinle bu alanda açıklanmalıdır. Bu taslak tek başına hukuki aydınlatma metni olarak kullanılmamalıdır.</p></> : <><p>This draft provides general information about personal data submitted through contact and quote request forms on the Aras Plastik website. Before publication, the company must add and legally review the controller identity, processing purposes and legal grounds, retention periods, recipient groups and request channels.</p><h2>Information that may be processed</h2><p>Forms may request a name, phone number, optional email and company name, and message content. After a message is submitted, a private tracking link is created to show that conversation and its reply. Do not share the link with others. Share only information needed to review and respond to your request.</p><h2>Your rights and requests</h2><p>Rights and request methods under applicable data protection law should be explained here in a verified notice completed with company details. This draft should not be used as a final legal notice.</p></>}</div></section></>;
}
