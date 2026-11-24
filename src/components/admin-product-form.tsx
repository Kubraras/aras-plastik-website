/* eslint-disable @next/next/no-img-element */
"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState, type ChangeEvent, type FormEvent } from "react";
import { createBrowserClient } from "@supabase/ssr";
import { ArrowDown, ArrowUp, ImagePlus, LoaderCircle, Trash2, Video } from "lucide-react";
import { toast } from "sonner";
import type { Product, ProductImage } from "@/lib/types";

type Category = { id: string; name_tr: string; name_en: string | null };
type Media = { key: string; url: string; file?: File; existingId?: string };
const maxImageBytes = 15 * 1024 * 1024;
const imageTypes = new Set(["image/jpeg", "image/png", "image/webp", "image/avif"]);
const maxVideoBytes = 50 * 1024 * 1024;
const videoTypes = new Set(["video/mp4", "video/webm"]);

function slugify(input: string) {
  return input.toLocaleLowerCase("tr-TR").replace(/[ğ]/g, "g").replace(/[ü]/g, "u").replace(/[ş]/g, "s").replace(/[ı]/g, "i").replace(/[ö]/g, "o").replace(/[ç]/g, "c").normalize("NFKD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

function storagePath(url: string, bucket = "product-images") {
  const marker = `/storage/v1/object/public/${bucket}/`;
  const index = url.indexOf(marker);
  return index < 0 ? null : decodeURIComponent(url.slice(index + marker.length));
}

export function AdminProductForm({ product, categories }: { product: Product | null; categories: Category[] }) {
  const router = useRouter();
  const initialMedia = useMemo<Media[]>(() => {
    const images: Media[] = (product?.product_images ?? []).slice().sort((a, b) => a.sort_order - b.sort_order).map((image: ProductImage) => ({ key: image.id, url: image.image_url, existingId: image.id }));
    if (product?.cover_image && !images.some((image) => image.url === product.cover_image)) images.unshift({ key: `cover-${product.id}`, url: product.cover_image });
    return images;
  }, [product]);
  const [media, setMedia] = useState<Media[]>(initialMedia);
  const [coverKey, setCoverKey] = useState(initialMedia.find((image) => image.url === product?.cover_image)?.key || initialMedia[0]?.key || "");
  const [pending, setPending] = useState(false);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoPreview, setVideoPreview] = useState("");
  const [videoUrl, setVideoUrl] = useState(product?.video_url || "");

  function addVideoFile(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    if (!videoTypes.has(file.type)) { toast.error("MP4 veya WebM video seçin."); return; }
    if (file.size > maxVideoBytes) { toast.error("Video en fazla 50 MB olabilir."); return; }
    if (videoPreview) URL.revokeObjectURL(videoPreview);
    setVideoFile(file);
    setVideoPreview(URL.createObjectURL(file));
  }

  function clearVideoFile() {
    if (videoPreview) URL.revokeObjectURL(videoPreview);
    setVideoFile(null);
    setVideoPreview("");
  }

  function changeVideoUrl(value: string) {
    if (videoPreview) URL.revokeObjectURL(videoPreview);
    setVideoFile(null);
    setVideoPreview("");
    setVideoUrl(value);
  }

  function addFiles(event: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files ?? []);
    const valid: Media[] = [];
    for (const file of files) {
      if (!imageTypes.has(file.type)) { toast.error(`${file.name}: JPEG, PNG, WebP veya AVIF seçin.`); continue; }
      if (file.size > maxImageBytes) { toast.error(`${file.name}: görsel en fazla 15 MB olabilir.`); continue; }
      valid.push({ key: crypto.randomUUID(), url: URL.createObjectURL(file), file });
    }
    setMedia((current) => [...current, ...valid]);
    if (!coverKey && valid[0]) setCoverKey(valid[0].key);
    event.target.value = "";
  }

  function moveMedia(index: number, direction: -1 | 1) {
    setMedia((current) => {
      const next = [...current];
      const destination = index + direction;
      if (destination < 0 || destination >= next.length) return current;
      [next[index], next[destination]] = [next[destination], next[index]];
      return next;
    });
  }

  function removeMedia(item: Media) {
    if (item.file) URL.revokeObjectURL(item.url);
    setMedia((current) => current.filter((image) => image.key !== item.key));
    if (coverKey === item.key) setCoverKey(media.find((image) => image.key !== item.key)?.key || "");
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    const form = event.currentTarget;
    const formData = new FormData(form);
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!url || !anonKey) { toast.error("Supabase ortam değişkenleri eksik."); setPending(false); return; }
    const supabase = createBrowserClient(url, anonKey);
    const id = product?.id || crypto.randomUUID();
    const uploadedObjects: Array<{ bucket: "product-images" | "product-videos"; path: string }> = [];
    try {
      const readyMedia: Array<{ key: string; url: string; existingId?: string }> = [];
      for (const image of media) {
        if (!image.file) { readyMedia.push({ key: image.key, url: image.url, existingId: image.existingId }); continue; }
        const safeName = image.file.name.replace(/[^\w.-]/g, "-").slice(-100);
        const path = `${id}/${crypto.randomUUID()}-${safeName}`;
        const { error: uploadError } = await supabase.storage.from("product-images").upload(path, image.file, { contentType: image.file.type, upsert: false });
        if (uploadError) throw uploadError;
        uploadedObjects.push({ bucket: "product-images", path });
        const { data } = supabase.storage.from("product-images").getPublicUrl(path);
        readyMedia.push({ key: image.key, url: data.publicUrl });
      }

      let savedVideoUrl = videoUrl.trim() || null;
      if (videoFile) {
        const safeName = videoFile.name.replace(/[^\w.-]/g, "-").slice(-100);
        const path = `${id}/${crypto.randomUUID()}-${safeName}`;
        const { error: uploadError } = await supabase.storage.from("product-videos").upload(path, videoFile, { contentType: videoFile.type, upsert: false });
        if (uploadError) throw uploadError;
        uploadedObjects.push({ bucket: "product-videos", path });
        savedVideoUrl = supabase.storage.from("product-videos").getPublicUrl(path).data.publicUrl;
      }

      const specs: Record<string, string> = {};
      for (const line of String(formData.get("technicalSpecs") || "").split("\n")) {
        const separator = line.indexOf(":");
        if (separator > 0) specs[line.slice(0, separator).trim().slice(0, 80)] = line.slice(separator + 1).trim().slice(0, 200);
      }
      const selectedCover = readyMedia.find((item) => item.key === coverKey)?.url || readyMedia[0]?.url || null;
      const values = {
        id,
        name_tr: String(formData.get("nameTr") || "").trim(),
        name_en: String(formData.get("nameEn") || "").trim() || null,
        slug: slugify(String(formData.get("slug") || formData.get("nameTr") || "")),
        product_code: String(formData.get("productCode") || "").trim() || null,
        category_id: String(formData.get("categoryId") || "") || null,
        short_description_tr: String(formData.get("shortTr") || "").trim() || null,
        short_description_en: String(formData.get("shortEn") || "").trim() || null,
        description_tr: String(formData.get("descriptionTr") || "").trim() || null,
        description_en: String(formData.get("descriptionEn") || "").trim() || null,
        technical_specs: specs,
        material: String(formData.get("material") || "").trim() || null,
        dimensions: String(formData.get("dimensions") || "").trim() || null,
        usage_area_tr: String(formData.get("usageTr") || "").trim() || null,
        usage_area_en: String(formData.get("usageEn") || "").trim() || null,
        video_url: savedVideoUrl,
        seo_title_tr: String(formData.get("seoTitleTr") || "").trim() || null,
        seo_title_en: String(formData.get("seoTitleEn") || "").trim() || null,
        seo_description_tr: String(formData.get("seoDescriptionTr") || "").trim() || null,
        seo_description_en: String(formData.get("seoDescriptionEn") || "").trim() || null,
        is_featured: formData.get("isFeatured") === "on",
        is_published: formData.get("isPublished") === "on",
        cover_image: selectedCover,
      };
      if (!values.name_tr || !values.slug) throw new Error("Türkçe ürün adı zorunludur.");
      if (values.video_url && new URL(values.video_url).protocol !== "https:") throw new Error("Video bağlantısı HTTPS olmalıdır.");
      const { error: productError } = await supabase.from("products").upsert(values);
      if (productError) throw productError;

      const existingIds = new Set((product?.product_images ?? []).map((image) => image.id));
      const retainedIds = new Set(readyMedia.map((image) => image.existingId).filter(Boolean));
      const removed = (product?.product_images ?? []).filter((image) => !retainedIds.has(image.id));
      const imageRows = readyMedia.map((image, index) => ({ id: image.existingId || crypto.randomUUID(), product_id: id, image_url: image.url, alt_text_tr: values.name_tr, alt_text_en: values.name_en, sort_order: index }));
      if (imageRows.length) {
        const { error: imageError } = await supabase.from("product_images").upsert(imageRows);
        if (imageError) throw imageError;
      }
      const removedIds = removed.map((image) => image.id).filter((imageId) => existingIds.has(imageId));
      if (removedIds.length) {
        const { error: removeError } = await supabase.from("product_images").delete().in("id", removedIds);
        if (removeError) throw removeError;
        const paths = removed.map((image) => storagePath(image.image_url)).filter((path): path is string => Boolean(path));
        if (paths.length) await supabase.storage.from("product-images").remove(paths);
      }
      const oldVideoPath = product?.video_url ? storagePath(product.video_url, "product-videos") : null;
      if (oldVideoPath && product?.video_url !== values.video_url) await supabase.storage.from("product-videos").remove([oldVideoPath]);
      toast.success("Ürün kaydedildi.");
      router.push("/admin/products");
    } catch (error) {
      for (const bucket of ["product-images", "product-videos"] as const) {
        const paths = uploadedObjects.filter((item) => item.bucket === bucket).map((item) => item.path);
        if (paths.length) await supabase.storage.from(bucket).remove(paths);
      }
      toast.error(error instanceof Error ? error.message : "Ürün kaydedilemedi.");
    } finally {
      setPending(false);
    }
  }

  const specsValue = Object.entries(product?.technical_specs ?? {}).map(([key, value]) => `${key}: ${value}`).join("\n");
  return <form className="admin-product-form" onSubmit={submit}>
    <section className="admin-form-section"><h2>Ürün bilgileri</h2><div className="admin-form-grid">
      <AdminField label="Ürün adı (TR) *" name="nameTr" required defaultValue={product?.name_tr} />
      <AdminField label="Product name (EN)" name="nameEn" defaultValue={product?.name_en || ""} />
      <AdminField label="Slug" name="slug" defaultValue={product?.slug} placeholder="Otomatik oluşturulur" />
      <AdminField label="Ürün kodu" name="productCode" defaultValue={product?.product_code || ""} />
      <label className="field"><span>Kategori</span><select name="categoryId" defaultValue={product?.category_id || ""}><option value="">Kategori seçilmedi</option>{categories.map((category) => <option key={category.id} value={category.id}>{category.name_tr}</option>)}</select></label>
      <AdminField label="Malzeme" name="material" defaultValue={product?.material || ""} />
      <AdminField label="Ölçüler" name="dimensions" defaultValue={product?.dimensions || ""} />
      <div className="field admin-area"><span>Ürün videosu</span><div className="admin-video-controls"><input name="videoUrl" type="url" value={videoUrl} onChange={(event) => changeVideoUrl(event.target.value)} placeholder="HTTPS video bağlantısı" maxLength={2048} /><label className="admin-upload-button"><Video size={15} />Video yükle<input type="file" accept="video/mp4,video/webm,.mp4,.webm" onChange={addVideoFile} /></label></div><p className="admin-video-help">MP4 veya WebM dosyası · en fazla 50 MB. Dosya yüklersen bağlantı alanı yerine bu video kaydedilir.</p>{videoPreview ? <div className="admin-video-preview"><video src={videoPreview} controls muted playsInline /><button type="button" onClick={clearVideoFile}>Yüklenen dosyayı kaldır</button></div> : videoUrl && <p className="admin-video-help">Kayıtlı video: <a href={videoUrl} target="_blank" rel="noreferrer">Yeni sekmede aç</a></p>}</div>
      <AdminField label="Kısa açıklama (TR)" name="shortTr" defaultValue={product?.short_description_tr || ""} />
      <AdminField label="Short description (EN)" name="shortEn" defaultValue={product?.short_description_en || ""} />
      <AdminArea label="Detaylı açıklama (TR)" name="descriptionTr" defaultValue={product?.description_tr || ""} />
      <AdminArea label="Full description (EN)" name="descriptionEn" defaultValue={product?.description_en || ""} />
      <AdminField label="Kullanım alanı (TR)" name="usageTr" defaultValue={product?.usage_area_tr || ""} />
      <AdminField label="Applications (EN)" name="usageEn" defaultValue={product?.usage_area_en || ""} />
      <AdminArea label="Teknik özellikler (her satıra Anahtar: Değer)" name="technicalSpecs" defaultValue={specsValue} />
    </div></section>
    <section className="admin-form-section"><div className="admin-section-heading"><div><h2>Ürün görselleri</h2><p>JPEG, PNG, WebP veya AVIF · en fazla 15 MB / görsel</p></div><label className="admin-upload-button"><ImagePlus size={16} /> Görsel ekle<input type="file" accept="image/jpeg,image/png,image/webp,image/avif" multiple onChange={addFiles} /></label></div>
      {media.length ? <div className="admin-media-grid">{media.map((image, index) => <div className="admin-media-card" key={image.key}><div className="admin-media-preview">{image.file ? <img src={image.url} alt="Ürün görseli önizleme" /> : <Image src={image.url} alt={product?.name_tr || "Ürün görseli"} fill sizes="160px" />}</div><label className="admin-cover-radio"><input type="radio" name="cover" checked={coverKey === image.key} onChange={() => setCoverKey(image.key)} />Kapak</label><div className="admin-media-actions"><button type="button" onClick={() => moveMedia(index, -1)} disabled={index === 0} aria-label="Yukarı taşı"><ArrowUp size={14} /></button><button type="button" onClick={() => moveMedia(index, 1)} disabled={index === media.length - 1} aria-label="Aşağı taşı"><ArrowDown size={14} /></button><button type="button" onClick={() => removeMedia(image)} aria-label="Görseli kaldır"><Trash2 size={14} /></button></div></div>)}</div> : <div className="admin-upload-empty">Henüz ürün görseli eklenmedi.</div>}
    </section>
    <section className="admin-form-section"><h2>SEO ve yayın</h2><div className="admin-form-grid">
      <AdminField label="SEO title (TR)" name="seoTitleTr" defaultValue={product?.seo_title_tr || ""} />
      <AdminField label="SEO title (EN)" name="seoTitleEn" defaultValue={product?.seo_title_en || ""} />
      <AdminArea label="SEO description (TR)" name="seoDescriptionTr" defaultValue={product?.seo_description_tr || ""} />
      <AdminArea label="SEO description (EN)" name="seoDescriptionEn" defaultValue={product?.seo_description_en || ""} />
    </div><div className="admin-checkboxes"><label><input type="checkbox" name="isFeatured" defaultChecked={product?.is_featured} />Öne çıkan ürün</label><label><input type="checkbox" name="isPublished" defaultChecked={product?.is_published} />Yayında</label></div></section>
    <div className="admin-form-actions"><button className="button-primary" type="submit" disabled={pending}>{pending && <LoaderCircle className="spin" size={15} />}{pending ? "Kaydediliyor…" : "Kaydet"}</button><Link href="/admin/products" className="button-secondary">İptal</Link></div>
  </form>;
}

function AdminField({ label, name, defaultValue, type = "text", required = false, placeholder }: { label: string; name: string; defaultValue?: string | null; type?: string; required?: boolean; placeholder?: string }) {
  return <label className="field"><span>{label}</span><input name={name} type={type} defaultValue={defaultValue || ""} required={required} placeholder={placeholder} maxLength={type === "url" ? 2048 : 320} /></label>;
}

function AdminArea({ label, name, defaultValue }: { label: string; name: string; defaultValue?: string }) {
  return <label className="field admin-area"><span>{label}</span><textarea name={name} defaultValue={defaultValue} rows={4} /></label>;
}
