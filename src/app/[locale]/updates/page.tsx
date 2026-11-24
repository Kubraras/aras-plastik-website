/* eslint-disable @next/next/no-img-element */
import { ImagePlus } from "lucide-react";
import { getSocialPosts } from "@/lib/data";
import { isLocale, type Locale } from "@/lib/i18n";
import { pageMetadata } from "@/lib/seo";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  return pageMetadata(locale, "/updates", locale === "tr" ? "Paylaşımlar | Aras Plastik" : "Updates | Aras Plastik", locale === "tr" ? "Aras Plastik fotoğraf ve video paylaşımları." : "Photos and videos from Aras Plastik.");
}

export default async function UpdatesPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: value } = await params;
  if (!isLocale(value)) return null;
  const locale: Locale = value;
  const posts = await getSocialPosts();
  const tr = locale === "tr";
  return <>
    <section className="page-hero"><div className="page-shell"><div className="eyebrow"><span className="eyebrow-line" />ARAS PLASTİK · {tr ? "PAYLAŞIMLAR" : "UPDATES"}</div><h1>{tr ? "Üretimden ve bizden." : "From our work and team."}</h1><p>{tr ? "Fotoğraf ve videolarla Aras Plastik’ten güncel paylaşımlar." : "The latest photos and videos from Aras Plastik."}</p></div></section>
    <section className="page-content"><div className="page-shell">{posts.length ? <div className="public-social-grid">{posts.map((post) => <article className="public-social-card" key={post.id}>
      <div className="public-social-media">{post.media_type === "video" ? <video src={post.media_url} controls playsInline preload="metadata" /> : <img src={post.media_url} alt="Aras Plastik" loading="lazy" />}</div>
      <div className="public-social-caption"><strong>ARAS PLASTİK</strong>{post.caption && <p>{post.caption}</p>}<time dateTime={post.created_at}>{new Date(post.created_at).toLocaleDateString(tr ? "tr-TR" : "en-US", { year: "numeric", month: "long", day: "numeric" })}</time></div>
    </article>)}</div> : <div className="updates-empty"><ImagePlus size={26} strokeWidth={1.3} /><h2>{tr ? "Paylaşımlar hazırlanıyor" : "Updates are coming soon"}</h2><p>{tr ? "Yeni fotoğraf ve videolar burada yer alacak." : "New photos and videos will appear here."}</p></div>}</div></section>
  </>;
}
