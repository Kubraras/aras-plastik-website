"use client";

import { deleteSocialPost } from "@/app/admin/actions";

export function AdminSocialPostDeleteButton({ id }: { id: string }) {
  return <form action={deleteSocialPost} onSubmit={(event) => { if (!window.confirm("Bu paylaşımı ve medya dosyasını silmek istiyor musun?")) event.preventDefault(); }}>
    <input type="hidden" name="id" value={id} />
    <button type="submit" className="admin-danger">Paylaşımı sil</button>
  </form>;
}
