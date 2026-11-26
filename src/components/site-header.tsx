"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { ArrowUpRight, Menu, X } from "lucide-react";
import { useState } from "react";
import { copy, localizedPath, type Locale } from "@/lib/i18n";
import type { SiteSettings } from "@/lib/types";

export function SiteHeader({ locale, settings }: { locale: Locale; settings: SiteSettings }) {
  const pathname = usePathname();
  const text = copy[locale];
  const [open, setOpen] = useState(false);
  const links = [
    { href: "/", label: text.home },
    { href: "/products", label: text.products },
    { href: "/updates", label: text.updates },
    { href: "/about", label: text.about },
    { href: "/contact", label: text.contact },
    { href: "/contact#location", label: text.location, isLocation: true },
  ];
  const pathWithoutLocale = pathname.replace(/^\/(tr|en)(?=\/|$)/, "") || "/";
  const english = pathname.startsWith("/en");
  const nextLocale: Locale = english ? "tr" : "en";
  const languageHref = localizedPath(pathWithoutLocale, nextLocale);

  return (
    <header className="site-header">
      <div className="header-inner">
        <Link href={localizedPath("/", locale)} className="brand" aria-label="Aras Plastik ana sayfa">
          {settings.logo_url ? <Image src={settings.logo_url} alt="Aras Plastik" width={150} height={42} className="brand-image" unoptimized /> : <><span className="brand-mark" aria-hidden="true"><span /><span /><span /></span><span className="brand-name">ARAS<span>PLASTİK</span></span></>}
        </Link>
        <nav className={`desktop-nav ${open ? "is-open" : ""}`} aria-label={locale === "tr" ? "Ana menü" : "Main navigation"}>
          {links.map((link) => (
            <Link key={link.href} href={link.isLocation ? `${localizedPath("/contact", locale)}#location` : localizedPath(link.href, locale)} onClick={() => setOpen(false)} className={!link.isLocation && pathWithoutLocale === link.href ? "nav-link active" : "nav-link"}>
              {link.label}
            </Link>
          ))}
          <div className="mobile-nav-bottom">
            <Link href={languageHref} className="language-switch">{nextLocale.toUpperCase()} <ArrowUpRight size={14} /></Link>
            <Link href={localizedPath("/contact", locale)} className="nav-cta">{text.contactUs}<ArrowUpRight size={15} /></Link>
          </div>
        </nav>
        <div className="header-actions">
          <Link href={languageHref} className="language-switch desktop-language" aria-label={locale === "tr" ? "Switch to English" : "Türkçe'ye geç"}>{nextLocale.toUpperCase()}</Link>
          <Link href={localizedPath("/contact", locale)} className="nav-cta desktop-cta">{text.contactUs}<ArrowUpRight size={15} /></Link>
          <button className="menu-toggle" aria-label={open ? "Menüyü kapat" : "Menüyü aç"} aria-expanded={open} onClick={() => setOpen(!open)}>
            {open ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>
    </header>
  );
}
