import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowUpRight, Box } from "lucide-react";
import { QuoteForm } from "@/components/quote-form";
import { copy, isLocale, localizedPath, type Locale } from "@/lib/i18n";
import { getProductBySlug, getProducts, getSiteSettings } from "@/lib/data";
import { ProductCard as ProductCardMini } from "@/components/product-card";
import { pageMetadata } from "@/lib/seo";

export async function generateMetadata({ params }: { params: Promise<{ locale: string; slug: string }> }): Promise<Metadata> {
  const { locale: value, slug } = await params;
  if (!isLocale(value)) return {};
  const product = await getProductBySlug(slug);
  if (!product) return {};
  const title = value === "en" ? product.seo_title_en || product.name_en || product.name_tr : product.seo_title_tr || product.name_tr;
  const description = value === "en" ? product.seo_description_en || product.short_description_en || product.short_description_tr : product.seo_description_tr || product.short_description_tr;
  return { ...pageMetadata(value, `/products/${slug}`, title, description || "Aras Plastik ürün bilgileri"), openGraph: { title, description: description || undefined, images: product.cover_image ? [product.cover_image] : undefined } };
}

export default async function ProductPage({ params }: { params: Promise<{ locale: string; slug: string }> }) {
  const { locale: value, slug } = await params;
  if (!isLocale(value)) notFound();
  const locale: Locale = value;
  const text = copy[locale];
  const product = await getProductBySlug(slug);
  if (!product) notFound();
  const name = locale === "en" ? product.name_en || product.name_tr : product.name_tr;
  const description = locale === "en" ? product.description_en || product.description_tr : product.description_tr;
  const short = locale === "en" ? product.short_description_en || product.short_description_tr : product.short_description_tr;
  const usage = locale === "en" ? product.usage_area_en || product.usage_area_tr : product.usage_area_tr;
  const category = product.category && (locale === "en" ? product.category.name_en || product.category.name_tr : product.category.name_tr);
  const [relatedProducts, settings] = await Promise.all([getProducts({ category: product.category_id || undefined }), getSiteSettings()]);
  const related = relatedProducts.filter((item) => item.id !== product.id).slice(0, 3);
  const gallery = [...(product.cover_image ? [{ image_url: product.cover_image, alt_text_tr: name, alt_text_en: name }] : []), ...(product.product_images ?? []).sort((a, b) => a.sort_order - b.sort_order)];
  const structuredData = {
    "@context": "https://schema.org", "@type": "Product", name, description: description || short || undefined,
    sku: product.product_code || undefined, image: gallery.map((item) => item.image_url), category: category || undefined,
    brand: { "@type": "Brand", name: "Aras Plastik" },
  };
  return (
    <>
      <section className="page-hero"><div className="page-shell"><Link className="back-link" href={localizedPath("/products", locale)}><ArrowLeft size={14} />{text.backProducts}</Link></div></section>
      <section className="page-content"><div className="page-shell">
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData).replace(/</g, "\\u003c") }} />
        <div className="product-detail">
          <div>
            <div className="product-detail-image">
              {product.cover_image ? <Image src={product.cover_image} alt={name} fill sizes="(max-width: 760px) 95vw, 50vw" priority /> : <Box size={52} strokeWidth={1} />}
            </div>
            {gallery.length > 1 && <div className="gallery-thumbs">{gallery.map((image, index) => <a key={`${image.image_url}-${index}`} href={image.image_url} target="_blank" rel="noreferrer" aria-label={`Image ${index + 1}`}><Image src={image.image_url} alt={locale === "en" ? image.alt_text_en || name : image.alt_text_tr || name} fill sizes="74px" /></a>)}</div>}
            {product.video_url && <div className="product-video"><video src={product.video_url} controls preload="metadata" playsInline /></div>}
          </div>
          <div className="product-detail-copy">
            {category && <div className="eyebrow"><span className="eyebrow-line" />{category}</div>}
            <h1>{name}</h1>
            {product.product_code && <p className="product-code">{text.productCode} <span>{product.product_code}</span></p>}
            <p>{short || description}</p>
            <div className="product-kv">
              {category && <div className="product-kv-row"><span>{text.category}</span><span>{category}</span></div>}
              {product.material && <div className="product-kv-row"><span>{text.material}</span><span>{product.material}</span></div>}
              {product.dimensions && <div className="product-kv-row"><span>{text.dimensions}</span><span>{product.dimensions}</span></div>}
              {usage && <div className="product-kv-row"><span>{text.usage}</span><span>{usage}</span></div>}
              {Object.entries(product.technical_specs ?? {}).map(([key, value]) => <div className="product-kv-row" key={key}><span>{key}</span><span>{value}</span></div>)}
            </div>
            {description && <div className="product-long-description"><h2>{text.details}</h2><p>{description}</p></div>}
            <div className="detail-actions"><a href="#quote-form" className="button-primary">{text.quote}<ArrowUpRight size={16} /></a>{settings.whatsapp && <a href={`https://wa.me/${settings.whatsapp.replace(/\D/g, "")}?text=${encodeURIComponent(locale === "tr" ? `Merhaba, ${name}${product.product_code ? ` (${product.product_code})` : ""} hakkında bilgi almak istiyorum.` : `Hello, I would like information about ${name}${product.product_code ? ` (${product.product_code})` : ""}.`)}`} target="_blank" rel="noreferrer" className="button-secondary">WhatsApp <ArrowUpRight size={15} /></a>}</div>
          </div>
        </div>
        <div className="quote-section" id="quote-form"><div><div className="eyebrow"><span className="eyebrow-line" />{text.quote}</div><h2>{locale === "tr" ? "Talebinizi iletin" : "Send your request"}</h2></div><QuoteForm locale={locale} productId={product.id} productName={name} productCode={product.product_code} /></div>
      </div></section>
      {related.length > 0 && <section className="catalog-section"><div className="page-shell"><div className="section-heading"><div><div className="eyebrow"><span className="eyebrow-line" />{locale === "tr" ? "KEŞFEDİN" : "EXPLORE"}</div><h2>{text.related}</h2></div></div><div className="product-grid">{related.map((item) => <ProductCardMini key={item.id} locale={locale} product={item} />)}</div></div></section>}
    </>
  );
}

