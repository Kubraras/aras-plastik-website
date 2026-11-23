import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { ProductCard } from "@/components/product-card";
import { copy, isLocale, localizedPath, type Locale } from "@/lib/i18n";
import { getCategories, getProductsPage } from "@/lib/data";
import { pageMetadata } from "@/lib/seo";
import type { Metadata } from "next";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale: value } = await params;
  if (!isLocale(value)) return {};
  return pageMetadata(value, "/products", copy[value].featured, copy[value].featuredSub);
}

export default async function ProductsPage({ params, searchParams }: { params: Promise<{ locale: string }>; searchParams: Promise<{ q?: string; category?: string; page?: string }> }) {
  const [{ locale: value }, query, categories] = await Promise.all([params, searchParams, getCategories()]);
  if (!isLocale(value)) return null;
  const locale: Locale = value;
  const text = copy[locale];
  const page = Math.max(1, Math.min(10000, Number(query.page) || 1));
  const { products, total } = await getProductsPage({ search: query.q?.trim().slice(0, 60), category: query.category, page, pageSize: 24 });
  const pageCount = Math.ceil(total / 24);
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
        {products.length ? <><p className="results-count">{total} {text.results}</p><div className="product-grid">{products.map((product) => <ProductCard key={product.id} product={product} locale={locale} />)}</div></> : <div className="empty-products"><p>{query.q || query.category ? text.noSearch : text.noProductsText}</p></div>}
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
