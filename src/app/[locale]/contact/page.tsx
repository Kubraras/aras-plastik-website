import { AtSign, ArrowUpRight, MapPin, Phone, MessageCircle } from "lucide-react";
import { ContactForm } from "@/components/contact-form";
import { copy, isLocale, type Locale } from "@/lib/i18n";
import { getSiteSettings } from "@/lib/data";
import { pageMetadata } from "@/lib/seo";
import { DEFAULT_BUSINESS_ADDRESS, SECOND_CONTACT_SERVICE_LABEL, formatTurkishPhone, googleMapsDirectionsUrl } from "@/lib/site-copy";
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
  const address = (locale === "tr" ? settings.address_tr : settings.address_en || settings.address_tr)?.trim() || DEFAULT_BUSINESS_ADDRESS;
  const directionsUrl = googleMapsDirectionsUrl(address);
  const contactPeople = [
    { name: settings.contact_person_1_name, phone: settings.contact_person_1_phone },
    { name: settings.contact_person_2_name, phone: settings.contact_person_2_phone },
  ].filter((person): person is { name: string; phone: string } => Boolean(person.name && person.phone));
  const contactNumbers = new Set(contactPeople.map((person) => person.phone.replace(/\D/g, "")));
  const items = [
    ...contactPeople.map((person, index) => ({ icon: Phone, label: index === 1 ? SECOND_CONTACT_SERVICE_LABEL : person.name, value: index === 1 ? `${person.name} · ${formatTurkishPhone(person.phone)}` : formatTurkishPhone(person.phone), href: `tel:${person.phone.replace(/[^\d+]/g, "")}` })),
    settings.phone && !contactNumbers.has(settings.phone.replace(/\D/g, "")) ? { icon: Phone, label: text.phone, value: formatTurkishPhone(settings.phone), href: `tel:${settings.phone.replace(/[^\d+]/g, "")}` } : null,
    settings.email ? { icon: AtSign, label: text.email, value: settings.email, href: `mailto:${settings.email}` } : null,
    settings.whatsapp ? { icon: MessageCircle, label: "WhatsApp", value: settings.whatsapp, href: `https://wa.me/${settings.whatsapp.replace(/\D/g, "")}` } : null,
  ].filter((item): item is NonNullable<typeof item> => Boolean(item));
  return <><section className="page-hero"><div className="page-shell"><div className="eyebrow"><span className="eyebrow-line" />ARAS PLASTİK · 03</div><h1>{text.contactTitle}</h1><p>{text.contactSub}</p></div></section><section className="page-content"><div className="page-shell contact-layout"><div className="contact-details"><h2>{locale === "tr" ? "Bize ulaşın" : "Get in touch"}</h2><p>{settings.company_name}</p><div className="contact-detail-list">{items.length ? items.map((item) => <a key={item.label} className="contact-detail" href={item.href} target={item.href?.startsWith("http") ? "_blank" : undefined} rel={item.href?.startsWith("http") ? "noreferrer" : undefined}><item.icon size={17} strokeWidth={1.5} /><span className="contact-detail-copy"><strong>{item.label}</strong><span>{item.value}</span></span></a>) : <p>{text.notConfigured}</p>}</div><section id="location" className="contact-location-card" aria-labelledby="contact-location-heading"><div className="contact-location-heading"><MapPin size={19} strokeWidth={1.7} /><h3 id="contact-location-heading">{text.location}</h3></div><p>{address}</p><a className="button-primary contact-directions-button" href={directionsUrl} target="_blank" rel="noreferrer">{text.getDirections}<ArrowUpRight size={15} /></a></section></div><ContactForm locale={locale} /></div></section></>;
}
