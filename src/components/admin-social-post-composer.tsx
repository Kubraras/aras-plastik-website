/* eslint-disable @next/next/no-img-element */
"use client";

import { useEffect, useRef, useState, type ChangeEvent, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { createBrowserClient } from "@supabase/ssr";
import { ImagePlus, LoaderCircle, Send, Video } from "lucide-react";
import { toast } from "sonner";
import { createSocialPost } from "@/app/admin/actions";

const imageTypes = new Set(["image/jpeg", "image/png", "image/webp", "image/avif"]);
const videoTypes = new Set(["video/mp4", "video/webm"]);
const maxImageBytes = 15 * 1024 * 1024;
const maxVideoBytes = 50 * 1024 * 1024;

export function AdminSocialPostComposer({ previewOnly = false }: { previewOnly?: boolean }) {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [caption, setCaption] = useState("");
  const [previewUrl, setPreviewUrl] = useState("");
  const [pending, setPending] = useState(false);
  const previewObjectUrl = useRef("");

  useEffect(() => {
    return () => { if (previewObjectUrl.current) URL.revokeObjectURL(previewObjectUrl.current); };
  }, []);

  function selectFile(selected: File | null) {
    if (previewObjectUrl.current) URL.revokeObjectURL(previewObjectUrl.current);
    previewObjectUrl.current = selected ? URL.createObjectURL(selected) : "";
    setPreviewUrl(previewObjectUrl.current);
    setFile(selected);
  }

  function pickMedia(event: ChangeEvent<HTMLInputElement>) {
    const selected = event.target.files?.[0] ?? null;
    event.target.value = "";
    if (!selected) return;
    if (!imageTypes.has(selected.type) && !videoTypes.has(selected.type)) {
      toast.error("JPG, PNG, WebP, AVIF, MP4 veya WebM seç.");
      return;
    }
    const maxBytes = imageTypes.has(selected.type) ? maxImageBytes : maxVideoBytes;
    if (selected.size > maxBytes) {
      toast.error(imageTypes.has(selected.type) ? "Fotoğraf en fazla 15 MB olabilir." : "Video en fazla 50 MB olabilir.");
      return;
    }
    selectFile(selected);
  }

  async function publish(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (previewOnly) return;
    if (!file) { toast.error("Önce bir fotoğraf veya video seç."); return; }
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!url || !key) { toast.error("Supabase bağlantısı henüz kurulmamış."); return; }

    setPending(true);
    const supabase = createBrowserClient(url, key);
    const postId = crypto.randomUUID();
    const safeName = file.name.replace(/[^\w.-]/g, "-").slice(-100) || "media";
    const objectPath = `posts/${postId}/${crypto.randomUUID()}-${safeName}`;
    let uploaded = false;
    try {
      const { error: uploadError } = await supabase.storage.from("social-posts").upload(objectPath, file, { contentType: file.type, upsert: false });
      if (uploadError) throw uploadError;
      uploaded = true;
      const mediaUrl = supabase.storage.from("social-posts").getPublicUrl(objectPath).data.publicUrl;
      const data = new FormData();
      data.set("id", postId);
      data.set("caption", caption.trim());
      data.set("media_url", mediaUrl);
      data.set("media_type", imageTypes.has(file.type) ? "image" : "video");
      const result = await createSocialPost(data);
      if (!result.ok) throw new Error(result.error);
      toast.success("Paylaşım yayımlandı.");
      selectFile(null);
      setCaption("");
      router.refresh();
    } catch (error) {
      if (uploaded) await supabase.storage.from("social-posts").remove([objectPath]);
      toast.error(error instanceof Error ? error.message : "Paylaşım yüklenemedi. Tekrar dene.");
    } finally {
      setPending(false);
    }
  }

  const isVideo = Boolean(file && videoTypes.has(file.type));
  return <form className="social-composer" onSubmit={publish}>
    <div className="social-composer-heading"><div><span className="eyebrow"><span className="eyebrow-line" />YENİ PAYLAŞIM</span><h2>Fotoğraf veya video ekle</h2></div><span className="social-composer-limit">JPG / PNG / WebP · 15 MB<br />MP4 / WebM · 50 MB</span></div>
    {previewOnly && <p className="preview-only-note">Bu bir ekran önizlemesidir. Burada seçtiğin dosya yayımlanmaz ve kaydedilmez.</p>}
    <div className="social-composer-body">
      <div className={`social-upload-preview ${previewUrl ? "has-media" : ""}`}>
        {previewUrl ? isVideo ? <video src={previewUrl} controls playsInline /> : <img src={previewUrl} alt="Paylaşım önizlemesi" /> : <div className="social-empty-preview"><ImagePlus size={30} strokeWidth={1.3} /><strong>Fotoğraf veya video önizlemesi</strong><span>Dosyanı seçince burada görünecek</span></div>}
      </div>
      <div className="social-composer-fields">
        <label className="social-media-picker"><input type="file" accept="image/jpeg,image/png,image/webp,image/avif,video/mp4,video/webm" onChange={pickMedia} disabled={pending} /><span><ImagePlus size={17} />Fotoğraf veya video seç</span></label>
        {file && <div className="social-selected-file"><span>{isVideo ? <Video size={15} /> : <ImagePlus size={15} />}{file.name}</span><button type="button" onClick={() => selectFile(null)} disabled={pending}>Kaldır</button></div>}
        <label className="field social-caption-field"><span>Açıklama</span><textarea value={caption} onChange={(event) => setCaption(event.target.value.slice(0, 2200))} placeholder="Bu paylaşım hakkında bir şeyler yaz…" rows={6} maxLength={2200} disabled={pending} /><small>{caption.length}/2200</small></label>
        {previewOnly ? <button className="button-primary social-publish-button" type="button" disabled><Send size={15} />Yayımlamak için admin girişi gerekir</button> : <button className="button-primary social-publish-button" type="submit" disabled={pending || !file}>{pending ? <LoaderCircle className="spin" size={16} /> : <Send size={15} />}{pending ? "Yükleniyor…" : "Paylaşımı yayımla"}</button>}
      </div>
    </div>
  </form>;
}
