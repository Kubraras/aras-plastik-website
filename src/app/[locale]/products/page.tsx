import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { ProductCard } from "@/components/product-card";
import { copy, isLocale, localizedPath, type Locale } from "@/lib/i18n";
import { getCategories, getProductsPage, getSocialPosts } from "@/lib/data";
import { pageMetadata } from "@/lib/seo";
import type { Metadata } from "next";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale: value } = await params;
  if (!isLocale(value)) return {};
  return pageMetadata(value, "/products", copy[value].featured, copy[value].featuredSub);
}

export default async function ProductsPage({ params, searchParams }: { params: Promise<{ locale: string }>; searchParams: Promise<{ q?: string; category?: string; page?: string }> }) {
  const [{ locale: value }, query, categories, socialPosts] = await Promise.all([params, searchParams, getCategories(), getSocialPosts()]);
  if (!isLocale(value)) return null;
  const locale: Locale = value;
  const text = copy[locale];
  const page = Math.max(1, Math.min(10000, Number(query.page) || 1));
  const { products, total } = await getProductsPage({ search: query.q?.trim().slice(0, 60), category: query.category, page, pageSize: 24 });
  const pageCount = Math.ceil(total / 24);
  const hasProductFilter = Boolean(query.q?.trim() || query.category);
  const showSocialPosts = !hasProductFilter && page === 1 && socialPosts.length > 0;
  const heading = locale === "tr" ? "Ürün kataloğu" : "Product catalog";
  return (
    <>
      <section className="page-hero"><div className="page-shell"><div className="eyebrow"><span className="eyebrow-line" />ARAS PLASTİK · 01</div><h1>{heading}</h1><p>{text.featuredSub}</p></div></section>
      <section className="page-content"><div className="page-shell">
        <form className="filter-bar" method="get">
          <input type="search" name="q" defaultValue={query.q} placeholder={text.search} aria-label={text.search} />
          {categories.length > 0 && <select name="category" defaultValue={query.category || ""} aria-label={text.category}><option value="">{text.category}</option>{categories.map((category) => <option key={category.id} value={category.id}>{locale === "en" ? category.name_en || category.name_tr : category.name_tr}</option>)}</select>}
          <button className="button-primary" type="submit">{locale === "tr" ? "Ara" : "Search"}<ArrowUpRight size={15} /></button>
        </form>
        {products.length ? <><p className="results-count">{total} {text.results}</p><div className="product-grid">{products.map((product) => <ProductCard key={product.id} product={product} locale={locale} />)}</div></> : !showSocialPosts && <div className="empty-products"><p>{hasProductFilter ? text.noSearch : text.noProductsText}</p></div>}
        {showSocialPosts && <section className="catalog-social-posts">
          <div className="section-heading"><div><div className="eyebrow"><span className="eyebrow-line" />{locale === "tr" ? "ARAS PLASTİK · FOTOĞRAF VE VİDEOLAR" : "ARAS PLASTIK · PHOTOS AND VIDEOS"}</div><h2>{locale === "tr" ? "Paylaşımlarımız" : "From Aras Plastik"}</h2><p>{locale === "tr" ? "Paylaşılan fotoğraf ve videolar burada da görünür." : "Our latest photos and videos are also shown here."}</p></div></div>
          <div className="public-social-grid">{socialPosts.map((post) => <article className="public-social-card" key={post.id}>
            <div className="public-social-media">{post.media_type === "video" ? <video src={post.media_url} controls playsInline preload="metadata" /> : <Image src={post.media_url} alt="Aras Plastik paylaşımı" width={800} height={800} sizes="(max-width: 760px) 90vw, 30vw" unoptimized />}</div>
            <div className="public-social-caption"><strong>ARAS PLASTİK</strong>{post.caption && <p>{post.caption}</p>}<time dateTime={post.created_at}>{new Date(post.created_at).toLocaleDateString(locale === "tr" ? "tr-TR" : "en-US", { year: "numeric", month: "long", day: "numeric" })}</time></div>
          </article>)}</div>
        </section>}
        {pageCount > 1 && <nav className="pagination" aria-label={locale === "tr" ? "Ürün sayfaları" : "Product pages"}>{page > 1 && <Link href={pageHref(page - 1, query.q, query.category, locale)}>{locale === "tr" ? "← Önceki" : "← Previous"}</Link>}<span>{page} / {pageCount}</span>{page < pageCount && <Link href={pageHref(page + 1, query.q, query.category, locale)}>{locale === "tr" ? "Sonraki →" : "Next →"}</Link>}</nav>}
        <div className="catalog-contact"><Link className="text-link" href={localizedPath("/contact", locale)}>{text.contactUs}<ArrowUpRight size={15} /></Link></div>
      </div></section>
    </>
  );
}

function pageHref(page: number, search: string | undefined, category: string | undefined, locale: Locale) {
  const query = new URLSearchParams();
  query.set("page", String(page));
  if (search) query.set("q", search);
  if (category) query.set("category", category);
  return `${localizedPath("/products", locale)}?${query.toString()}`;
}
