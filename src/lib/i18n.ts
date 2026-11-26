export const locales = ["tr", "en"] as const;
export type Locale = (typeof locales)[number];

export function isLocale(value: string): value is Locale {
  return locales.includes(value as Locale);
}

export const copy = {
  tr: {
    home: "Ana Sayfa", products: "Ürünler", about: "Hakkımızda", updates: "Paylaşımlar", contact: "İletişim", location: "Konum",
    eyebrow: "ARAS PLASTİK · ÜRÜN KATALOĞU",
    heroTitle: "Plastik ürün ihtiyaçlarınız için doğru başlangıç.",
    heroText: "Ürünlerimizi keşfedin, ihtiyaçlarınızı bize anlatın. Size en uygun çözüm için birlikte ilerleyelim.",
    discover: "Ürünleri keşfet", contactUs: "İletişime geç", featured: "Ürün kataloğu",
    featuredSub: "Ürünleri inceleyin, teknik detayları keşfedin.", allProducts: "Tüm ürünler",
    noProducts: "Ürün kataloğu hazırlanıyor", noProductsText: "Yayındaki ürünler burada listelenecek.",
    aboutEyebrow: "ARAS PLASTİK HAKKINDA", aboutTitle: "İhtiyacınızı anlayarak başlıyoruz.",
    aboutText: "Aras Plastik hakkında firma tanıtımı ve çalışma yaklaşımı bu alanda yer alacak. Kurumsal bilgiler yönetim panelinden düzenlenebilir.",
    learnMore: "Hakkımızda", why: "Birlikte çalışmak için iyi bir başlangıç", whyText: "İhtiyacınızı paylaşın; ürünlerimiz hakkında bilgi alın ve teklif talebinizi iletin.",
    ctaTitle: "İhtiyacınızı konuşalım.", ctaText: "Ürünlerimizle ilgili sorularınız veya teklif talebiniz için bize ulaşın.",
    requestQuote: "Teklif isteyin", footerText: "Plastik ürünler hakkında bilgi ve teklif talepleriniz için bizimle iletişime geçin.",
    rights: "Tüm hakları saklıdır.", privacy: "KVKK bilgilendirmesi", productCode: "Ürün kodu",
    search: "Ürün adı veya kodu ara", category: "Tüm kategoriler", results: "ürün", noSearch: "Aramanızla eşleşen ürün bulunamadı.",
    details: "Ürün detayları", specifications: "Teknik özellikler", material: "Malzeme", dimensions: "Ölçüler", usage: "Kullanım alanı",
    related: "Benzer ürünler", backProducts: "Tüm ürünlere dön", contactTitle: "Size nasıl yardımcı olabiliriz?", contactSub: "Mesajınızı iletin, sizinle iletişime geçelim.",
    name: "Ad soyad", phone: "Telefon", email: "E-posta", company: "Firma adı", message: "Mesajınız", consent: "KVKK aydınlatma metnini okudum.",
    send: "Mesajı gönder", sending: "Gönderiliyor…", required: "Bu alan zorunludur.", formSuccess: "Mesajınız alındı. Teşekkür ederiz.", formError: "Mesaj gönderilemedi. Lütfen tekrar deneyin.",
    address: "Adres", openMaps: "Google Haritalar'da görüntüle", notConfigured: "İletişim bilgileri henüz eklenmedi.", aboutPageTitle: "Hakkımızda", aboutPageCopy: "Aras Plastik firma tanıtım metni, çalışma anlayışı ve tarihçe bilgileri yönetim panelinden eklendiğinde burada yayınlanacaktır.",
    quote: "Teklif / sipariş talebi", quantity: "Talep miktarı", firstName: "Ad", lastName: "Soyad", note: "Ek açıklama", submitQuote: "Talep oluştur", quoteSuccess: "Talebiniz alındı. Talep numaranız:",
    adminLogin: "Yönetici girişi", dashboard: "Yönetim paneli", adminOnly: "Bu alan yalnızca yetkili yöneticiler içindir.",
  },
  en: {
    home: "Home", products: "Products", about: "About", updates: "Updates", contact: "Contact", location: "Location",
    eyebrow: "ARAS PLASTIK · PRODUCT CATALOG",
    heroTitle: "A clear starting point for your plastic product needs.",
    heroText: "Explore our products and tell us what you need. Let’s find the right way forward together.",
    discover: "Explore products", contactUs: "Get in touch", featured: "Product catalog",
    featuredSub: "Browse products and explore their details.", allProducts: "All products",
    noProducts: "Catalog is being prepared", noProductsText: "Published products will appear here.",
    aboutEyebrow: "ABOUT ARAS PLASTIK", aboutTitle: "We start by understanding what you need.",
    aboutText: "Company information and working approach for Aras Plastik will appear here. Corporate details can be edited from the admin panel.",
    learnMore: "About us", why: "A good place to start working together", whyText: "Share your requirements, ask about our products and request a quote.",
    ctaTitle: "Let’s talk about what you need.", ctaText: "Get in touch with questions about our products or to request a quote.",
    requestQuote: "Request a quote", footerText: "Contact us for information and quote requests about plastic products.",
    rights: "All rights reserved.", privacy: "Privacy notice", productCode: "Product code",
    search: "Search by name or product code", category: "All categories", results: "products", noSearch: "No products match your search.",
    details: "Product details", specifications: "Specifications", material: "Material", dimensions: "Dimensions", usage: "Applications",
    related: "Related products", backProducts: "Back to all products", contactTitle: "How can we help?", contactSub: "Send us a message and we’ll get back to you.",
    name: "Full name", phone: "Phone", email: "Email", company: "Company", message: "Your message", consent: "I have read the privacy notice.",
    send: "Send message", sending: "Sending…", required: "This field is required.", formSuccess: "Your message has been received. Thank you.", formError: "Message could not be sent. Please try again.",
    address: "Address", openMaps: "View on Google Maps", notConfigured: "Contact information has not been added yet.", aboutPageTitle: "About us", aboutPageCopy: "The company overview, working approach and history for Aras Plastik will be published here once added in the admin panel.",
    quote: "Quote / order request", quantity: "Requested quantity", firstName: "First name", lastName: "Last name", note: "Additional details", submitQuote: "Submit request", quoteSuccess: "Your request has been received. Reference number:",
    adminLogin: "Admin sign in", dashboard: "Admin dashboard", adminOnly: "This area is for authorized administrators only.",
  },
} satisfies Record<Locale, Record<string, string>>;

export function localizedPath(path: string, locale: Locale) {
  const cleanPath = path.replace(/^\/(tr|en)(?=\/|$)/, "") || "/";
  return locale === "tr" ? cleanPath : `/en${cleanPath === "/" ? "" : cleanPath}`;
}
