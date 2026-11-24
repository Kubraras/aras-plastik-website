import Link from "next/link";
import Image from "next/image";
import { ArrowRight, ArrowUpRight, Box, Check, CircleDot, Ruler } from "lucide-react";
import { HeroArtwork } from "@/components/hero-artwork";
import { ProductCard } from "@/components/product-card";
import { copy, isLocale, localizedPath, type Locale } from "@/lib/i18n";
import { getProducts, getSiteContent, getSiteSettings, getSocialPosts } from "@/lib/data";
import { pageMetadata, siteOrigin } from "@/lib/seo";
import type { Metadata } from "next";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale: value } = await params;
  if (!isLocale(value)) return {};
  const settings = await getSiteSettings();
  const description = value === "tr" ? settings.company_description_tr : settings.company_description_en || settings.company_description_tr;
  const content = await getSiteContent("home");
  const image = typeof content.hero_image_url === "string" ? content.hero_image_url : undefined;
  const base = pageMetadata(value, "/", "Aras Plastik | Plastik Ürünler", description || copy[value].heroText);
  return image ? { ...base, openGraph: { ...base.openGraph, images: [image] } } : base;
}

export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: value } = await params;
  if (!isLocale(value)) return null;
  const locale: Locale = value;
  const text = copy[locale];
  const [products, settings, siteContent, socialPosts] = await Promise.all([getProducts({ featured: true }), getSiteSettings(), getSiteContent("home"), getSocialPosts()]);
  const shortDescription = locale === "tr" ? settings.company_description_tr : settings.company_description_en || settings.company_description_tr;
  const heroTitle = locale === "tr" ? siteContent.hero_title_tr : siteContent.hero_title_en || siteContent.hero_title_tr;
  const heroDescription = locale === "tr" ? siteContent.hero_description_tr : siteContent.hero_description_en || siteContent.hero_description_tr;
  const homeAbout = locale === "tr" ? siteContent.home_about_tr : siteContent.home_about_en || siteContent.home_about_tr;
  const heroImage = typeof siteContent.hero_image_url === "string" ? siteContent.hero_image_url : undefined;
  const aboutImage = typeof siteContent.home_about_image_url === "string" ? siteContent.home_about_image_url : undefined;
  const orgData = { "@context": "https://schema.org", "@type": "Organization", name: settings.company_name, url: siteOrigin(), logo: settings.logo_url || undefined, sameAs: [settings.instagram, settings.linkedin].filter(Boolean) };
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(orgData).replace(/</g, "\\u003c") }} />
      <section className="home-hero page-shell">
        <div className="hero-copy">
          <div className="eyebrow"><span className="eyebrow-line" />{text.eyebrow}</div>
          <h1>{typeof heroTitle === "string" && heroTitle ? heroTitle : locale === "tr" ? <>Plastik ürün ihtiyaçlarınız için <em>doğru başlangıç.</em></> : <>A clear starting point for your <em>product needs.</em></>}</h1>
          <p>{(typeof heroDescription === "string" && heroDescription) || shortDescription || text.heroText}</p>
          <div className="hero-actions">
            <Link href={localizedPath("/products", locale)} className="button-primary">{text.discover}<ArrowUpRight size={16} /></Link>
            <Link href={localizedPath("/contact", locale)} className="button-secondary">{text.contactUs}<ArrowRight size={15} /></Link>
          </div>
          <div className="hero-footnote">{locale === "tr" ? "Ürün kataloğu · Bilgi · Teklif" : "Product catalog · Information · Quotes"}</div>
        </div>
        <HeroArtwork imageUrl={heroImage} />
      </section>

      {socialPosts.length > 0 && <section className="home-social-section">
        <div className="page-shell">
          <div className="section-heading">
            <div><div className="eyebrow"><span className="eyebrow-line" />{locale === "tr" ? "ARAS PLASTİK · PAYLAŞIMLAR" : "ARAS PLASTIK · UPDATES"}</div><h2>{locale === "tr" ? "Bizden güncel paylaşımlar." : "The latest from us."}</h2><p>{locale === "tr" ? "Fotoğraf ve videolarla Aras Plastik’ten haberler." : "News from Aras Plastik in photos and videos."}</p></div>
            <Link href={localizedPath("/updates", locale)} className="text-link">{locale === "tr" ? "Tüm paylaşımlar" : "All updates"}<ArrowRight size={15} /></Link>
          </div>
          <div className="public-social-grid">{socialPosts.slice(0, 3).map((post) => <article className="public-social-card" key={post.id}>
            <div className="public-social-media">{post.media_type === "video" ? <video src={post.media_url} controls playsInline preload="metadata" /> : <Image src={post.media_url} alt="Aras Plastik paylaşımı" width={800} height={800} sizes="(max-width: 760px) 90vw, 30vw" unoptimized />}</div>
            <div className="public-social-caption"><strong>ARAS PLASTİK</strong>{post.caption && <p>{post.caption}</p>}<time dateTime={post.created_at}>{new Date(post.created_at).toLocaleDateString(locale === "tr" ? "tr-TR" : "en-US", { year: "numeric", month: "long", day: "numeric" })}</time></div>
          </article>)}</div>
        </div>
      </section>}

      <section className="catalog-section">
        <div className="page-shell">
          <div className="section-heading">
            <div><div className="eyebrow"><span className="eyebrow-line" />01 / {locale === "tr" ? "ÜRÜNLER" : "PRODUCTS"}</div><h2>{!products.length && socialPosts.length ? (locale === "tr" ? "Ürünlerimizden görseller." : "A look at our products.") : text.featured}</h2><p>{!products.length && socialPosts.length ? (locale === "tr" ? "Fotoğraf ve video paylaşımlarımız bu katalog alanında da yer alır." : "Our photos and videos also appear in this catalog section.") : text.featuredSub}</p></div>
            <Link href={localizedPath("/products", locale)} className="text-link">{text.allProducts}<ArrowRight size={15} /></Link>
          </div>
          {products.length ? <div className="product-grid">{products.slice(0, 3).map((product) => <ProductCard key={product.id} product={product} locale={locale} />)}</div> : (
            socialPosts.length ? <div className="public-social-grid">{socialPosts.slice(0, 3).map((post) => <article className="public-social-card" key={post.id}>
              <div className="public-social-media">{post.media_type === "video" ? <video src={post.media_url} controls playsInline preload="metadata" /> : <Image src={post.media_url} alt="Aras Plastik paylaşımı" width={800} height={800} sizes="(max-width: 760px) 90vw, 30vw" unoptimized />}</div>
              <div className="public-social-caption"><strong>ARAS PLASTİK</strong>{post.caption && <p>{post.caption}</p>}<time dateTime={post.created_at}>{new Date(post.created_at).toLocaleDateString(locale === "tr" ? "tr-TR" : "en-US", { year: "numeric", month: "long", day: "numeric" })}</time></div>
            </article>)}</div> : <div className="empty-products"><Box size={27} strokeWidth={1.2} /><h3>{text.noProducts}</h3><p>{text.noProductsText}</p></div>
          )}
        </div>
      </section>

      <section className="about-band">
        <div className="page-shell">
          <div className="about-layout">
            <div className="about-visual">{aboutImage && <Image src={aboutImage} alt="" fill sizes="(max-width: 760px) 90vw, 40vw" className="about-company-image" unoptimized />}<div className="about-visual-grid" /><div className="about-visual-caption">ARAS PLASTİK <span>·</span> {locale === "tr" ? "FİRMA TANITIMI" : "COMPANY OVERVIEW"}</div></div>
            <div className="about-copy">
              <div className="eyebrow"><span className="eyebrow-line" />02 / {text.aboutEyebrow}</div>
              <h2>{text.aboutTitle}</h2>
              <p>{(typeof homeAbout === "string" && homeAbout) || shortDescription || text.aboutText}</p>
              <Link href={localizedPath("/about", locale)} className="text-link">{text.learnMore}<ArrowRight size={15} /></Link>
              <div className="about-note"><Check size={15} /><span><strong>{locale === "tr" ? "Aras Plastik" : "Aras Plastik"}</strong> — {locale === "tr" ? "firma bilgileri ve ürün detayları yönetim panelinden güncellenebilir." : "company information and product details can be updated from the admin panel."}</span></div>
            </div>
          </div>
          <div className="feature-row">
            <div className="feature-item"><span className="feature-num">01</span><Box size={17} strokeWidth={1.4} />{locale === "tr" ? "Ürün kataloğunu keşfedin" : "Explore the product catalog"}</div>
            <div className="feature-item"><span className="feature-num">02</span><Ruler size={17} strokeWidth={1.4} />{locale === "tr" ? "Ürün detaylarını inceleyin" : "Review product details"}</div>
            <div className="feature-item"><span className="feature-num">03</span><CircleDot size={17} strokeWidth={1.4} />{locale === "tr" ? "İhtiyacınız için teklif alın" : "Request a quote for your needs"}</div>
          </div>
        </div>
      </section>

      <section className="cta-band"><div className="page-shell"><div className="cta-panel"><div><div className="eyebrow"><span className="eyebrow-line" />03 / {locale === "tr" ? "İLETİŞİM" : "CONTACT"}</div><h2>{text.ctaTitle}</h2><p>{text.ctaText}</p></div><Link href={localizedPath("/contact", locale)} className="button-primary">{text.requestQuote}<ArrowUpRight size={16} /></Link></div></div></section>
    </>
  );
}
