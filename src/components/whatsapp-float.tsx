import { MessageCircle } from "lucide-react";

export function WhatsAppFloat({ phone, label }: { phone: string | null; label: string }) {
  if (!phone) return null;
  const number = phone.replace(/\D/g, "");
  if (!number) return null;
  return <a className="whatsapp-float" href={`https://wa.me/${number}`} target="_blank" rel="noreferrer" aria-label={label}><MessageCircle size={20} /><span>{label}</span></a>;
}
