"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowUpRight, Check, Clock3, Copy, RefreshCw } from "lucide-react";

type MessageRecord = {
  full_name: string;
  message: string;
  created_at: string;
  reply_text: string | null;
  reply_updated_at: string | null;
};

export function CustomerMessageInbox({ token, locale }: { token: string; locale: "tr" | "en" }) {
  const english = locale === "en";
  const [record, setRecord] = useState<MessageRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [refreshSignal, setRefreshSignal] = useState(0);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    let active = true;
    let loadingNow = false;
    const controller = new AbortController();

    const load = async () => {
      if (loadingNow) return;
      loadingNow = true;
      try {
        const response = await fetch(`/api/contact/replies/${encodeURIComponent(token)}`, { cache: "no-store", signal: controller.signal });
        const result = await response.json();
        if (!response.ok) throw new Error(result.error || (english ? "This message could not be loaded." : "Mesaj açılamadı."));
        if (active) {
          setRecord(result.message as MessageRecord);
          setError("");
        }
      } catch (cause) {
        if (active && !(cause instanceof DOMException && cause.name === "AbortError")) {
          setError(cause instanceof Error ? cause.message : (english ? "Please try again." : "Lütfen tekrar deneyin."));
        }
      } finally {
        loadingNow = false;
        if (active) setLoading(false);
      }
    };

    void load();
    const interval = window.setInterval(() => void load(), 30000);
    return () => {
      active = false;
      controller.abort();
      window.clearInterval(interval);
    };
  }, [english, refreshSignal, token]);

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setError(english ? "Save this page from your browser to keep the private link." : "Özel bağlantıyı saklamak için bu sayfayı tarayıcınızdan kaydedin.");
    }
  }

  return (
    <main className="customer-message-page">
      <div className="customer-message-card">
        <div className="eyebrow"><span className="eyebrow-line" />{english ? "PRIVATE MESSAGE PAGE" : "ÖZEL MESAJ SAYFASI"}</div>
        <h1>{english ? "Your message" : "Mesajınız"}</h1>
        {loading && !record ? <p className="customer-message-status">{english ? "Loading your message…" : "Mesajınız yükleniyor…"}</p> : null}
        {error && !record ? <p className="customer-message-status is-error" role="alert">{error}</p> : null}
        {record ? <>
          <p className="customer-message-greeting">{english ? `Hello ${record.full_name},` : `Merhaba ${record.full_name},`}</p>
          <section className="customer-message-original">
            <h2>{english ? "Your message" : "Gönderdiğiniz mesaj"}</h2>
            <p>{record.message}</p>
            <time dateTime={record.created_at}>{new Date(record.created_at).toLocaleString(english ? "en-GB" : "tr-TR")}</time>
          </section>
          <section className={`customer-message-answer ${record.reply_text ? "has-reply" : ""}`} aria-live="polite">
            <h2>{english ? "Our reply" : "Aras Plastik’in yanıtı"}</h2>
            {record.reply_text ? <>
              <p>{record.reply_text}</p>
              {record.reply_updated_at && <time dateTime={record.reply_updated_at}>{new Date(record.reply_updated_at).toLocaleString(english ? "en-GB" : "tr-TR")}</time>}
            </> : <p className="customer-message-pending"><Clock3 size={16} />{english ? "We have received your message. Our reply will appear here." : "Mesajınız bize ulaştı. Yanıtımız hazır olduğunda burada görünecek."}</p>}
          </section>
          {error && <p className="customer-message-inline-error" role="status">{error}</p>}
          <div className="customer-message-actions">
            <button type="button" className="button-secondary" onClick={() => setRefreshSignal((value) => value + 1)}><RefreshCw size={15} />{english ? "Refresh" : "Yanıtı yenile"}</button>
            <button type="button" className="button-secondary" onClick={copyLink}>{copied ? <Check size={15} /> : <Copy size={15} />}{copied ? (english ? "Copied" : "Kopyalandı") : (english ? "Copy private link" : "Özel bağlantıyı kopyala")}</button>
          </div>
          <p className="customer-message-help">{english ? "Keep this private link. It gives access only to this conversation. The page checks for new replies automatically." : "Bu özel bağlantıyı saklayın; yalnızca bu görüşmeyi gösterir. Yeni yanıtları otomatik olarak kontrol eder."}</p>
        </> : null}
        <Link href={english ? "/en" : "/tr"} className="customer-message-home">{english ? "Back to Aras Plastik" : "Aras Plastik ana sayfasına dön"}<ArrowUpRight size={15} /></Link>
      </div>
    </main>
  );
}
