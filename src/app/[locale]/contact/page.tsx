import { AtSign, MapPin, Phone, MessageCircle } from "lucide-react";
import { ContactForm } from "@/components/contact-form";
import { copy, isLocale, type Locale } from "@/lib/i18n";
import { getSiteSettings } from "@/lib/data";
import { pageMetadata } from "@/lib/seo";
import type { Metadata } from "next";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale: value } = await params;
  if (!isLocale(value)) return {};
  return pageMetadata(value, "/contact", copy[value].contact, copy[value].contactSub);
}

export default async function ContactPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: value } = await params;
  if (!isLocale(value)) return null;
  const locale: Locale = value;
  const text = copy[locale];
  const settings = await getSiteSettings();
  const address = locale === "tr" ? settings.address_tr : settings.address_en || settings.address_tr;
  const items = [
    settings.phone ? { icon: Phone, label: text.phone, value: settings.phone, href: `tel:${settings.phone}` } : null,
    settings.email ? { icon: AtSign, label: text.email, value: settings.email, href: `mailto:${settings.email}` } : null,
    settings.whatsapp ? { icon: MessageCircle, label: "WhatsApp", value: settings.whatsapp, href: `https://wa.me/${settings.whatsapp.replace(/\D/g, "")}` } : null,
    address ? { icon: MapPin, label: text.address, value: address, href: settings.map_url || undefined } : null,
  ].filter((item): item is NonNullable<typeof item> => Boolean(item));
  return <><section className="page-hero"><div className="page-shell"><div className="eyebrow"><span className="eyebrow-line" />ARAS PLASTİK · 03</div><h1>{text.contactTitle}</h1><p>{text.contactSub}</p></div></section><section className="page-content"><div className="page-shell contact-layout"><div className="contact-details"><h2>{locale === "tr" ? "Bize ulaşın" : "Get in touch"}</h2><p>{settings.company_name}</p><div className="contact-detail-list">{items.length ? items.map((item) => <a key={item.label} className="contact-detail" href={item.href} target={item.href?.startsWith("http") ? "_blank" : undefined} rel={item.href?.startsWith("http") ? "noreferrer" : undefined}><item.icon size={17} strokeWidth={1.5} /><span>{item.value}</span></a>) : <p>{text.notConfigured}</p>}</div></div><ContactForm locale={locale} /></div></section></>;
}
