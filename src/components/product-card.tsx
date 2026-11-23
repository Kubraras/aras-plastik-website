import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, Layers3 } from "lucide-react";
import { copy, localizedPath, type Locale } from "@/lib/i18n";
import type { Product } from "@/lib/types";

export function ProductCard({ product, locale }: { product: Product; locale: Locale }) {
  const text = copy[locale];
  const name = locale === "en" ? product.name_en || product.name_tr : product.name_tr;
  const description = locale === "en" ? product.short_description_en || product.short_description_tr : product.short_description_tr;
  return (
    <article className="product-card">
      <Link href={localizedPath(`/products/${product.slug}`, locale)} className="product-image" aria-label={`${name} ${text.details}`}>
        {product.cover_image ? (
          <Image src={product.cover_image} alt={name} fill sizes="(max-width: 760px) 90vw, (max-width: 1100px) 45vw, 30vw" />
        ) : (
          <span className="product-placeholder"><Layers3 size={34} strokeWidth={1.1} /><span>ARAS / {product.product_code || "PRODUCT"}</span></span>
        )}
        <span className="product-open"><ArrowUpRight size={17} /></span>
      </Link>
      <div className="product-card-info">
        <div>
          <h3><Link href={localizedPath(`/products/${product.slug}`, locale)}>{name}</Link></h3>
          {product.product_code && <p className="product-code">{text.productCode} <span>{product.product_code}</span></p>}
        </div>
        <p className="product-desc">{description || (locale === "tr" ? "Ürün detayları için inceleyin." : "View product details.")}</p>
        <Link className="product-details-link" href={localizedPath(`/products/${product.slug}`, locale)}>{text.details}<ArrowUpRight size={15} /></Link>
      </div>
    </article>
  );
}
