export const DEFAULT_HOME_HERO_TITLE_TR = "Aras Plastik";
export const DEFAULT_HOME_HERO_DESCRIPTION_TR = "Deneyimli usta üreticilerimizle enjeksiyon ve el presi baskı işleri; fason ve imalat seçenekleriyle İzmir Karabağlar’da hizmetinizdeyiz.";

export const DEFAULT_ABOUT_SERVICES_TR = [
  "Plastik Kalıp Baskı İşleri",
  "Plastik Kalıp Tasarım",
  "Plastik Elpresi Baskı İşleri Yapılır",
];

export const DEFAULT_ABOUT_SERVICES_EN = [
  "Plastic mold printing services",
  "Plastic mold design",
  "Plastic hand press printing services",
];

export const DEFAULT_BUSINESS_ADDRESS = "Aydın, 4306. Sk. No:33, 35130 Karabağlar/İzmir";
export const SECOND_CONTACT_SERVICE_LABEL = "Plastik Ürün Temin Etme Satış Ekipmanı:";

export function googleMapsSearchUrl(address: string) {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;
}

export function googleMapsDirectionsUrl(address: string) {
  return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(address)}&travelmode=driving`;
}

export function formatTurkishPhone(phone: string | null | undefined) {
  if (!phone) return "";
  const digits = phone.replace(/\D/g, "");
  const national = digits.length === 12 && digits.startsWith("90")
    ? digits.slice(2)
    : digits.length === 11 && digits.startsWith("0")
      ? digits.slice(1)
      : digits;
  if (national.length !== 10) return phone;
  return `0 (${national.slice(0, 3)}) ${national.slice(3, 6)} ${national.slice(6)}`;
}
