"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import { toast } from "sonner";
import { ArrowUpRight } from "lucide-react";
import { copy, localizedPath, type Locale } from "@/lib/i18n";

export function ContactForm({ locale }: { locale: Locale }) {
  const text = copy[locale];
  const [pending, setPending] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    const form = event.currentTarget;
    try {
      const response = await fetch("/api/contact", { method: "POST", headers: { "Content-Type": "application/json", "x-site-locale": locale }, body: JSON.stringify(Object.fromEntries(new FormData(form))) });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || text.formError);
      form.reset();
      toast.success(text.formSuccess);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : text.formError);
    } finally {
      setPending(false);
    }
  }

  return (
    <form className="contact-form" onSubmit={submit}>
      <div className="field"><label htmlFor="fullName">{text.name} *</label><input id="fullName" name="fullName" autoComplete="name" required minLength={2} maxLength={120} /></div>
      <div className="field"><label htmlFor="phone">{text.phone} *</label><input id="phone" name="phone" type="tel" autoComplete="tel" required maxLength={24} /></div>
      <div className="field"><label htmlFor="email">{text.email}</label><input id="email" name="email" type="email" autoComplete="email" maxLength={254} /></div>
      <div className="field"><label htmlFor="companyName">{text.company}</label><input id="companyName" name="companyName" autoComplete="organization" maxLength={120} /></div>
      <div className="field full"><label htmlFor="message">{text.message} *</label><textarea id="message" name="message" required minLength={10} maxLength={5000} /></div>
      <label className="consent-field field full"><input type="checkbox" name="privacyConsent" required /><span><Link href={localizedPath("/privacy", locale)} target="_blank">{text.privacy}</Link> — {text.consent}</span></label>
      <div className="honeypot" aria-hidden="true"><label htmlFor="website">Website</label><input id="website" name="website" tabIndex={-1} autoComplete="off" /></div>
      <button type="submit" className="button-primary form-submit" disabled={pending}>{pending ? text.sending : text.send}<ArrowUpRight size={16} /></button>
    </form>
  );
}
