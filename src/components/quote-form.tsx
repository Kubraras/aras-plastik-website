"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import { toast } from "sonner";
import { ArrowUpRight } from "lucide-react";
import { copy, localizedPath, type Locale } from "@/lib/i18n";

export function QuoteForm({ locale, productId, productName, productCode }: { locale: Locale; productId: string; productName: string; productCode: string | null }) {
  const text = copy[locale];
  const [pending, setPending] = useState(false);
  const [submissionToken, setSubmissionToken] = useState<string | null>(null);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    const form = event.currentTarget;
    try {
      const token = submissionToken || crypto.randomUUID();
      setSubmissionToken(token);
      const payload = Object.fromEntries(new FormData(form));
      payload.submissionToken = token;
      const response = await fetch("/api/quotes", { method: "POST", headers: { "Content-Type": "application/json", "x-site-locale": locale }, body: JSON.stringify(payload) });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || text.formError);
      form.reset();
      setSubmissionToken(null);
      toast.success(`${text.quoteSuccess} ${result.orderNumber}`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : text.formError);
    } finally {
      setPending(false);
    }
  }

  return (
    <form className="contact-form quote-form" onSubmit={submit}>
      <input type="hidden" name="productId" value={productId} />
      <div className="field full"><label>{text.products}</label><input value={`${productName}${productCode ? ` · ${productCode}` : ""}`} readOnly /></div>
      <div className="field"><label htmlFor="quantity">{text.quantity} *</label><input id="quantity" name="quantity" type="number" min={1} max={1000000} step={1} required /></div>
      <div className="field"><label htmlFor="quotePhone">{text.phone} *</label><input id="quotePhone" name="phone" type="tel" autoComplete="tel" required maxLength={24} /></div>
      <div className="field"><label htmlFor="firstName">{text.firstName} *</label><input id="firstName" name="firstName" autoComplete="given-name" required minLength={2} maxLength={80} /></div>
      <div className="field"><label htmlFor="lastName">{text.lastName} *</label><input id="lastName" name="lastName" autoComplete="family-name" required minLength={2} maxLength={80} /></div>
      <div className="field"><label htmlFor="quoteEmail">{text.email}</label><input id="quoteEmail" name="email" type="email" autoComplete="email" maxLength={254} /></div>
      <div className="field"><label htmlFor="quoteCompany">{text.company}</label><input id="quoteCompany" name="companyName" autoComplete="organization" maxLength={120} /></div>
      <div className="field full"><label htmlFor="quoteMessage">{text.note}</label><textarea id="quoteMessage" name="message" maxLength={2000} /></div>
      <label className="consent-field field full"><input type="checkbox" name="privacyConsent" required /><span><Link href={localizedPath("/privacy", locale)} target="_blank">{text.privacy}</Link> — {text.consent}</span></label>
      <div className="honeypot" aria-hidden="true"><label htmlFor="quoteWebsite">Website</label><input id="quoteWebsite" name="website" tabIndex={-1} autoComplete="off" /></div>
      <button type="submit" className="button-primary form-submit" disabled={pending}>{pending ? text.sending : text.submitQuote}<ArrowUpRight size={16} /></button>
    </form>
  );
}
