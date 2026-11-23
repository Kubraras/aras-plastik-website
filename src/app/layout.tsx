import type { Metadata } from "next";
import { Toaster } from "sonner";
import "./globals.css";
import { getSiteSettings } from "@/lib/data";

const origin = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettings();
  return {
    metadataBase: new URL(origin),
    title: { default: "Aras Plastik | Plastik Ürünler", template: "%s | Aras Plastik" },
    description: "Aras Plastik ürün kataloğunu keşfedin. Ürün bilgisi ve teklif talepleriniz için bizimle iletişime geçin.",
    icons: settings.favicon_url ? { icon: settings.favicon_url } : undefined,
    openGraph: { type: "website", siteName: "Aras Plastik", locale: "tr_TR" },
    twitter: { card: "summary_large_image" },
    robots: { index: true, follow: true },
  };
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="tr"><body>{children}<Toaster position="top-center" richColors /></body></html>;
}
