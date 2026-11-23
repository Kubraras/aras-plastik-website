import { copy, isLocale, type Locale } from "@/lib/i18n";
import { getSiteContent, getSiteSettings } from "@/lib/data";
import { pageMetadata } from "@/lib/seo";
import type { Metadata } from "next";
import Image from "next/image";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale: value } = await params;
  if (!isLocale(value)) return {};
  return pageMetadata(value, "/about", copy[value].aboutPageTitle, copy[value].aboutPageCopy);
}

export default async function AboutPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: value } = await params;
  if (!isLocale(value)) return null;
  const locale: Locale = value;
  const text = copy[locale];
  const [settings, content] = await Promise.all([getSiteSettings(), getSiteContent("about")]);
  const description = locale === "tr" ? settings.company_description_tr : settings.company_description_en || settings.company_description_tr;
  const aboutCopy = locale === "tr" ? content.body_tr : content.body_en || content.body_tr;
  const heading = locale === "tr" ? content.heading_tr : content.heading_en || content.heading_tr;
  const aboutImage = typeof content.image_url === "string" ? content.image_url : undefined;
  return <><section className="page-hero"><div className="page-shell"><div className="eyebrow"><span className="eyebrow-line" />ARAS PLASTİK · 02</div><h1>{text.aboutPageTitle}</h1><p>{(typeof heading === "string" && heading) || text.aboutTitle}</p></div></section><section className="page-content"><div className="page-shell about-page-layout">{aboutImage && <Image className="about-page-image" src={aboutImage} alt={locale === "tr" ? "Aras Plastik firma tanıtımı" : "Aras Plastik company overview"} width={1400} height={600} unoptimized />}<div className="prose-placeholder">{(typeof aboutCopy === "string" && aboutCopy) || description || text.aboutPageCopy}</div></div></section></>;
}
