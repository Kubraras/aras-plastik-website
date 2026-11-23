/* eslint-disable @next/next/no-img-element */
"use client";

import { useState } from "react";
import { createBrowserClient } from "@supabase/ssr";
import { ImagePlus, LoaderCircle } from "lucide-react";
import { toast } from "sonner";

const types = new Set(["image/jpeg", "image/png", "image/webp", "image/avif"]);

export function AdminImageInput({ name, label, initialValue = "" }: { name: string; label: string; initialValue?: string }) {
  const [value, setValue] = useState(initialValue);
  const [pending, setPending] = useState(false);

  async function upload(file?: File) {
    if (!file) return;
    if (!types.has(file.type) || file.size > 15 * 1024 * 1024) { toast.error("JPEG, PNG, WebP veya AVIF; en fazla 15 MB."); return; }
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!url || !anonKey) { toast.error("Supabase ortam değişkenleri eksik."); return; }
    setPending(true);
    try {
      const supabase = createBrowserClient(url, anonKey);
      const path = `site/${name}-${crypto.randomUUID()}-${file.name.replace(/[^\w.-]/g, "-").slice(-80)}`;
      const { error } = await supabase.storage.from("company-images").upload(path, file, { contentType: file.type });
      if (error) throw error;
      setValue(supabase.storage.from("company-images").getPublicUrl(path).data.publicUrl);
      toast.success("Görsel yüklendi.");
    } catch {
      toast.error("Görsel yüklenemedi.");
    } finally { setPending(false); }
  }

  return <div className="field admin-image-input"><span>{label}</span><input type="hidden" name={name} value={value} /><div className="admin-image-row">{value && <img src={value} alt="Yüklenecek görsel önizleme" />}<input type="url" value={value} onChange={(event) => setValue(event.target.value)} placeholder="Görsel URL'si" aria-label={`${label} URL`} /><label className="admin-upload-button"><ImagePlus size={15} />{pending ? <LoaderCircle className="spin" size={14} /> : "Yükle"}<input type="file" accept="image/jpeg,image/png,image/webp,image/avif" disabled={pending} onChange={(event) => upload(event.target.files?.[0])} /></label></div></div>;
}
