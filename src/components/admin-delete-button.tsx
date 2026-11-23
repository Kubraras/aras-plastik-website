"use client";

export function AdminDeleteButton({ label = "Sil" }: { label?: string }) {
  return <button type="submit" className="admin-danger" onClick={(event) => { if (!window.confirm("Bu kaydı silmek istediğinizden emin misiniz?")) event.preventDefault(); }}>{label}</button>;
}
