export type Product = {
  id: string;
  name_tr: string;
  name_en: string | null;
  slug: string;
  product_code: string | null;
  category_id: string | null;
  short_description_tr: string | null;
  short_description_en: string | null;
  description_tr: string | null;
  description_en: string | null;
  technical_specs: Record<string, string> | null;
  material: string | null;
  dimensions: string | null;
  usage_area_tr: string | null;
  usage_area_en: string | null;
  cover_image: string | null;
  video_url: string | null;
  is_featured: boolean;
  is_published: boolean;
  seo_title_tr: string | null;
  seo_title_en: string | null;
  seo_description_tr: string | null;
  seo_description_en: string | null;
  created_at: string;
  updated_at: string;
  category?: { name_tr: string; name_en: string | null; slug: string } | null;
  product_images?: ProductImage[];
};

export type ProductImage = {
  id: string;
  product_id: string;
  image_url: string;
  alt_text_tr: string | null;
  alt_text_en: string | null;
  sort_order: number;
};

export type SiteSettings = {
  company_name: string;
  company_description_tr: string | null;
  company_description_en: string | null;
  phone: string | null;
  email: string | null;
  whatsapp: string | null;
  address_tr: string | null;
  address_en: string | null;
  map_url: string | null;
  instagram: string | null;
  linkedin: string | null;
  logo_url: string | null;
  favicon_url: string | null;
};

export type SiteContent = Record<string, string | string[]>;

export const emptySettings: SiteSettings = {
  company_name: "Aras Plastik", company_description_tr: null, company_description_en: null,
  phone: null, email: null, whatsapp: null, address_tr: null, address_en: null,
  map_url: null, instagram: null, linkedin: null, logo_url: null, favicon_url: null,
};
