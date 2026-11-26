export const DEFAULT_HOME_HERO_TITLE_TR = "Aras Plastik";
export const DEFAULT_HOME_HERO_DESCRIPTION_TR = "Deneyimli usta üreticilerimizle enjeksiyon ve el presi baskı işleri; fason ve imalat seçenekleriyle İzmir Karabağlar’da hizmetinizdeyiz.";

export const DEFAULT_ABOUT_SERVICES_TR = [
  "Plastik Kalıp Baskı İşleri",
  "Plastik Kalıp Tasarım",
  "Plastik Elpresi Baskı İşleri Yapılır",
];

export const DEFAULT_BUSINESS_ADDRESS = "4306 Sokak No: 33, Aydın Mahallesi, Karabağlar/İzmir (Gediz Kavşağı arka sokağı)";
export const SECOND_CONTACT_SERVICE_LABEL = "Plastik Ürün Temin Etme Satış Ekipmanı:";

export function googleMapsSearchUrl(address: string) {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;
}
