/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import { ArrowUpRight, ImagePlus } from "lucide-react";
import { AdminHeader } from "@/components/admin-header";
import { AdminSocialPostComposer } from "@/components/admin-social-post-composer";
import { AdminSocialPostDeleteButton } from "@/components/admin-social-post-delete-button";
import { getSocialPosts } from "@/lib/data";
import { requireAdmin } from "@/lib/admin";

export default async function AdminPostsPage() {
  await requireAdmin();
  const posts = await getSocialPosts();
  return <main className="admin-dashboard">
    <AdminHeader />
    <div className="admin-content">
      <div className="eyebrow"><span className="eyebrow-line" />İÇERİK YÖNETİMİ</div>
      <h1>Paylaşımlar</h1>
      <p>Fotoğraf veya video seç, açıklamanı yaz ve sitede yayımla.</p>
      <AdminSocialPostComposer />
      <section className="admin-social-post-list">
        <div className="admin-page-heading"><div><h2>Yayımlanan paylaşımlar</h2><p>{posts.length} paylaşım</p></div><Link className="button-secondary" href="/tr/updates" target="_blank">Sitede gör<ArrowUpRight size={14} /></Link></div>
        {posts.length ? <div className="admin-social-grid">{posts.map((post) => <article className="admin-social-card" key={post.id}>
          <div className="admin-social-card-media">{post.media_type === "video" ? <video src={post.media_url} controls playsInline preload="metadata" /> : <img src={post.media_url} alt="Aras Plastik paylaşımı" />}</div>
          <div className="admin-social-card-copy"><time dateTime={post.created_at}>{new Date(post.created_at).toLocaleDateString("tr-TR")}</time><p>{post.caption || "Açıklama eklenmedi."}</p><AdminSocialPostDeleteButton id={post.id} /></div>
        </article>)}</div> : <div className="admin-social-empty"><ImagePlus size={25} strokeWidth={1.3} /><strong>Henüz paylaşım yok</strong><span>İlk fotoğrafını veya videonu yukarıdan ekleyebilirsin.</span></div>}
      </section>
    </div>
  </main>;
}
