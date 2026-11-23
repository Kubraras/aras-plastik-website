import type { Metadata } from "next";
import type { Locale } from "@/lib/i18n";

export function pageMetadata(locale: Locale, path: string, title: string, description: string): Metadata {
  const cleanPath = path.replace(/^\/(tr|en)(?=\/|$)/, "") || "/";
  const urlFor = (language: Locale) => `/${language}${cleanPath === "/" ? "" : cleanPath}`;
  const canonical = urlFor(locale);
  return {
    title,
    description,
    alternates: { canonical, languages: { tr: urlFor("tr"), en: urlFor("en") } },
    openGraph: { title, description, url: canonical, locale: locale === "tr" ? "tr_TR" : "en_US" },
  };
}

export function siteOrigin() {
  return process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
}
