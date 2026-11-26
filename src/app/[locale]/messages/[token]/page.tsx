import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CustomerMessageInbox } from "@/components/customer-message-inbox";
import { isLocale } from "@/lib/i18n";

export const metadata: Metadata = {
  title: "Mesaj takibi | Aras Plastik",
  robots: { index: false, follow: false },
  referrer: "no-referrer",
};

export default async function CustomerMessagePage({ params }: { params: Promise<{ locale: string; token: string }> }) {
  const { locale, token } = await params;
  if (!isLocale(locale) || !/^[A-Za-z0-9_-]{43}$/.test(token)) notFound();
  return <CustomerMessageInbox token={token} locale={locale} />;
}
