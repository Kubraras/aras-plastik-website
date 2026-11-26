import Link from "next/link";
import Image from "next/image";
import { ArrowUpRight, ArrowRight } from "lucide-react";
import { copy, localizedPath, type Locale } from "@/lib/i18n";
import type { SiteSettings } from "@/lib/types";
import { DEFAULT_BUSINESS_ADDRESS, googleMapsSearchUrl } from "@/lib/site-copy";

export function SiteFooter({ locale, settings }: { locale: Locale; settings: SiteSettings }) {
  const text = copy[locale];
  const year = new Date().getFullYear();
  const address = ((locale === "tr" ? settings.address_tr : settings.address_en || settings.address_tr)?.trim()) || DEFAULT_BUSINESS_ADDRESS;
  const mapUrl = settings.map_url?.trim() || googleMapsSearchUrl(address);
  const contactPeople = [
    { name: settings.contact_person_1_name, phone: settings.contact_person_1_phone },
    { name: settings.contact_person_2_name, phone: settings.contact_person_2_phone },
  ].filter((person): person is { name: string; phone: string } => Boolean(person.name && person.phone));
  const contactNumbers = new Set(contactPeople.map((person) => person.phone.replace(/\D/g, "")));
  const showCompanyPhone = Boolean(settings.phone && !contactNumbers.has(settings.phone.replace(/\D/g, "")));
  return (
    <footer className="site-footer">
      <div className="footer-main page-shell">
        <div className="footer-brand-block">
          <Link href={localizedPath("/", locale)} className="brand brand-light">
            {settings.logo_url ? <Image src={settings.logo_url} alt="Aras Plastik" width={150} height={42} className="brand-image" unoptimized /> : <>
            <span className="brand-mark" aria-hidden="true"><span /><span /><span /></span>
            <span className="brand-name">ARAS<span>PLASTİK</span></span>
            </>}
          </Link>
          <p>{(locale === "tr" ? settings.company_description_tr : settings.company_description_en) || text.footerText}</p>
        </div>
        <div className="footer-column">
          <span className="footer-label">{locale === "tr" ? "KEŞFEDİN" : "EXPLORE"}</span>
          <Link href={localizedPath("/products", locale)}>{text.products}<ArrowUpRight size={13} /></Link>
          <Link href={localizedPath("/updates", locale)}>{text.updates}<ArrowUpRight size={13} /></Link>
          <Link href={localizedPath("/about", locale)}>{text.about}<ArrowUpRight size={13} /></Link>
          <Link href={localizedPath("/contact", locale)}>{text.contact}<ArrowUpRight size={13} /></Link>
        </div>
        <div className="footer-column footer-contact">
          <span className="footer-label">{text.contact}</span>
          {contactPeople.map((person) => <a key={person.name} href={`tel:${person.phone.replace(/[^\d+]/g, "")}`}>{person.name} · {person.phone}<ArrowUpRight size={13} /></a>)}
          {showCompanyPhone && <a href={`tel:${settings.phone}`}>{settings.phone}<ArrowUpRight size={13} /></a>}
          {settings.email && <a href={`mailto:${settings.email}`}>{settings.email}<ArrowUpRight size={13} /></a>}
          {settings.whatsapp && <a href={`https://wa.me/${settings.whatsapp.replace(/\D/g, "")}`} target="_blank" rel="noreferrer">WhatsApp<ArrowUpRight size={13} /></a>}
          {settings.instagram && <a href={settings.instagram} target="_blank" rel="noreferrer">Instagram<ArrowUpRight size={13} /></a>}
          {settings.linkedin && <a href={settings.linkedin} target="_blank" rel="noreferrer">LinkedIn<ArrowUpRight size={13} /></a>}
          {address && <a className="footer-address" href={mapUrl} target="_blank" rel="noreferrer">{address}<ArrowUpRight size={13} /></a>}
          {!contactPeople.length && !settings.phone && !settings.email && !address && <span className="footer-address">{text.notConfigured}</span>}
        </div>
        <Link href={localizedPath("/contact", locale)} className="footer-contact-link">{locale === "tr" ? "Birlikte başlayalım" : "Let’s get started"}<ArrowRight size={17} /></Link>
      </div>
      <div className="footer-bottom page-shell">
        <span>© {year} Aras Plastik. {text.rights}</span>
        <Link href={localizedPath("/privacy", locale)}>{text.privacy}</Link>
        <span className="footer-location">{locale === "tr" ? "Türkiye" : "Türkiye"}</span>
      </div>
    </footer>
  );
}
