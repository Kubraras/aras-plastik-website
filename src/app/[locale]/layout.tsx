import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { isLocale, type Locale } from "@/lib/i18n";
import { getSiteSettings } from "@/lib/data";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { WhatsAppFloat } from "@/components/whatsapp-float";

export async function generateStaticParams() { return [{ locale: "tr" }, { locale: "en" }]; }

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  return {};
}

export default async function LocaleLayout({ children, params }: Readonly<{ children: React.ReactNode; params: Promise<{ locale: string }> }>) {
  const { locale: value } = await params;
  if (!isLocale(value)) notFound();
  const locale: Locale = value;
  const settings = await getSiteSettings();
  return <div lang={locale}><SiteHeader locale={locale} settings={settings} /><main>{children}</main><SiteFooter locale={locale} settings={settings} /><WhatsAppFloat phone={settings.whatsapp} label={locale === "tr" ? "WhatsApp ile yazın" : "Message us on WhatsApp"} /></div>;
}
