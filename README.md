# Aras Plastik Kurumsal Web Sitesi

Aras Plastik için Türkçe/İngilizce, ürün kataloğu ve teklif talebi odaklı bir kurumsal web uygulaması. Firma adresi, iletişim bilgileri, ürünler, kapasite veya geçmiş gibi sağlanmamış bilgiler uydurulmaz; içerikler yönetim ekranından doldurulana kadar açıklayıcı varsayılan metinler gösterilir.

## Teknolojiler

- Next.js 16 App Router ve TypeScript
- Tailwind CSS 4
- Supabase PostgreSQL, Auth, Storage ve Row Level Security
- Zod sunucu doğrulaması
- Lucide ikonları ve Sonner bildirimleri

## Hazır özellikler

- Responsive kurumsal ana sayfa, ürün listesi ve ürün detay sayfaları
- Türkçe varsayılan adresler (`/products`, `/about`, `/contact`) ve İngilizce adresler (`/en/...`)
- Arama, kategori filtresi ve sayfalama
- Ürün görsel galerisi, video URL alanı, teknik özellikler ve iki dilli SEO alanları
- İletişim ve teklif talebi formları; sunucu doğrulaması, honeypot ve IP tabanlı veritabanı rate limit
- Supabase Auth ile yönetici girişi; ürün/kategori yönetimi, talepler, mesajlar ve içerik düzenleme
- Ürün fotoğrafı yükleme ve sıralama; Instagram benzeri Paylaşımlar alanında fotoğraf/video ve açıklama yayınlama
- Site ayarları, e-posta bildirimi (Resend yapılandırıldığında), WhatsApp
- Dinamik metadata, canonical/hreflang, Open Graph, robots ve sitemap
- Hukuki inceleme gerektirdiği açıkça belirtilen KVKK metin taslağı

## Yerel kurulum

1. Node.js 20.19 veya üzeri kurun (ESLint 10 gereksinimi; Next.js 16 için Node.js 20.9+ gerekir).
2. Bu klasörde terminal açıp bağımlılıkları yükleyin:

   ```bash
   npm install
   ```

3. `.env.example` dosyasını `.env.local` adıyla kopyalayın ve Supabase proje değerlerini girin. `.env.local` Git'e eklenmez.
4. Supabase migration'ını aşağıdaki yönergeyle uygulayın.
5. Geliştirme sunucusunu çalıştırın:

   ```bash
   npm run dev
   ```

Site `http://localhost:3000` adresinde, yönetim girişi `/admin/login` adresinde açılır. Ürün ve formlar için Supabase ayarlarının yapılmış olması gerekir.

## Supabase kurulumu

1. Supabase'te yeni bir proje oluşturun.
2. Dashboard'daki **Connect** veya **Settings → API Keys** bölümünden Project URL, publishable key (`sb_publishable_...`) ve secret key (`sb_secret_...`) değerlerini alın. Secret key yalnızca sunucudaki doğrulanmış form uçları ve rate limit çağrısı için kullanılır; bunu hiçbir zaman `NEXT_PUBLIC_` adıyla tanımlamayın veya tarayıcı koduna koymayın. Uygulama eski `anon` / `service_role` anahtar adlarını da geçiş süresince kabul eder.
3. `supabase/migrations` içindeki SQL dosyalarını dosya adına göre sırayla Supabase SQL Editor'da çalıştırın. Bu dosyalar tabloları, RLS politikalarını, medya bucket'larını, iletişim kişilerini ve admin e-posta kısıtlamasını kurar.
4. Authentication ayarlarında e-posta/şifre girişini açın ve herkese açık kayıt oluşturmayı kapatın.
5. Supabase Authentication bölümünde `davutaras1978@gmail.com` adresiyle bir kullanıcı oluşturun ve kendinizin belirlediği şifreyi kullanın. Kayıt oluşturmayı kapalı tutun. Bu hesabı tek yönetici yapmak için SQL Editor'da aşağıdaki sorguyu çalıştırın:

   ```sql
   update auth.users
   set raw_app_meta_data = coalesce(raw_app_meta_data, '{}'::jsonb) || '{"role":"admin"}'::jsonb
   where lower(email) = 'davutaras1978@gmail.com';
   ```

   Kullanıcıdan çıkış yapıp tekrar giriş yaptıktan sonra `/admin/login` adresini kullanın. Uygulama ve RLS, hem bu e-postayı hem de `app_metadata.role = admin` değerini doğrular. Diğer e-posta adresleri admin rolü olsa bile giriş yapamaz.

6. `.env.local` dosyasında en az şu değerleri tanımlayın:

   ```dotenv
   NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
   NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_...
   SUPABASE_SECRET_KEY=sb_secret_...
   NEXT_PUBLIC_SITE_URL=http://localhost:3000
   ```

   Service role anahtarı sunucunun form doğrulaması/rate limitinden sonra talebi kaydetmesi için gerekir. Public API/RLS üzerinden doğrudan tabloya kayıt izni verilmez; anahtar yoksa formlar güvenli biçimde kapalı kalır.

## Environment variables

| Değişken | Kullanım |
| --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase proje URL'si |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Tarayıcı ve sunucu istemcileri için public anahtar; erişimi RLS sınırlar |
| `SUPABASE_SECRET_KEY` | Sunucudaki form kayıtları ve rate-limit RPC için gizli anahtar; istemciye koymayın |
| `NEXT_PUBLIC_SITE_URL` | Metadata, canonical URL, sitemap ve robots için site kökü |
| `RESEND_API_KEY` | Yönetici bildirimleri ve admin panelinden müşteriye yanıt göndermek için Resend API anahtarı |
| `ADMIN_NOTIFICATION_EMAIL` | İsteğe bağlı yönetici bildirim adresi |
| `RESEND_FROM_EMAIL` | Resend'de doğrulanmış alan adındaki gönderen adresi (ör. `Aras Plastik <iletisim@example.com>`) |

Admin panelindeki müşteri yanıtları, ilgili mesaj kaydında bulunan e-posta adresine gönderilir. E-posta gönderimi için Resend'de sahip olunan bir alan adı doğrulanmalı, ardından Vercel Production ortamına `RESEND_API_KEY` ve `RESEND_FROM_EMAIL` eklenip yeniden dağıtım yapılmalıdır. Müşteri iletişim formunda yanıt alabilmek için e-posta adresi zorunludur.

### Supabase anahtarlarını bağlama

Dashboard'da Project URL ve `sb_publishable_...` anahtarını **Connect** veya **Settings → API Keys** bölümünden alın. `sb_secret_...` anahtarını yalnızca sunucu tarafı için kullanın. Yeni anahtar biçimiyle `.env.local` şu şekilde görünür:

```dotenv
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_...
SUPABASE_SECRET_KEY=sb_secret_...
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

`.env.local` kaydedildikten sonra geliştirme sunucusunu yeniden başlatın. Auth kullanıcısını **Authentication → Users → Add user** bölümünde oluşturun; admin rolünü yalnızca `davutaras1978@gmail.com` için verin.

Resend ayarlanmazsa kayıtlar Supabase'e yine kaydedilir. Yayına çıkarken Resend'de doğrulanmış bir gönderen domaini kullanın. E-posta hatası kaydedilmiş form verisini silmez.

## Admin paneli

- Giriş: `/admin/login`. Tek izinli hesap `davutaras1978@gmail.com`; ilk kullanım için Supabase Auth'ta bu kullanıcıyı oluşturup `app_metadata.role = admin` yetkisini verin.
- Ürünlerde Türkçe/İngilizce metin, slug, kod, kategori, teknik alanlar, SEO metinleri, öne çıkarma ve yayın durumu yönetilir.
- Ürün fotoğrafları Supabase Storage'a yüklenir; admin görselleri sıralayıp kapak olarak seçebilir. Ürün videosu için HTTPS bağlantısı girebilir veya en fazla 50 MB MP4/WebM dosyası yükleyebilirsiniz.
- `/admin/posts` ekranında tek görsel veya MP4/WebM video seçip açıklama yazın. Önizleme ve yayımlama sonrası gönderi `/tr/updates` ve `/en/updates` sayfalarında gösterilir. Dosya sınırları görsel için 15 MB, video için 50 MB'dır.
- Supabase bağlantısı yokken yerel `/admin/preview` ekranından paylaşım oluşturma arayüzünü inceleyin; bu önizleme dosyaları kaydetmez.
- Ürün eklemek için `Ürünler > Yeni ürün` yolunu izleyin; bilgileri doldurun, fotoğraf ve isterseniz video ekleyin, sonra `Yayında` kutusunu seçip kaydedin.
- Kategoriler yönetilebilir; teklif talepleri filtrelenebilir, durum ve admin notu güncellenebilir.
- İletişim mesajları okunmuş/okunmamış olarak işaretlenebilir.
- `Site içerikleri` ekranında firma bilgilerini, Davut Aras ve Muhammed Yusuf Aras iletişim alanlarını, ana sayfa görsellerini/metinlerini ve hakkımızda içeriğini düzenleyebilirsiniz.

## Veritabanı ve güvenlik

- Public ziyaretçiler yalnızca yayındaki ürünleri ve aktif kategorileri okuyabilir.
- Sipariş/teklif ve iletişim tablolarında public `SELECT` veya doğrudan `INSERT` politikası yoktur. Validasyonu geçen public form istekleri sunucu route'larından kaydedilir.
- Yönetici yazma/okuma politikaları Auth e-posta izin listesini ve `app_metadata` rolünü PostgreSQL RLS içinde doğrular.
- Storage bucket'ları public görüntülemeye açık, yükleme/değiştirme/silme işlemleri yönetici ile sınırlıdır.
- Formlar server-side Zod doğrulaması, honeypot ve service-role ile çağrılan veritabanı rate limit kontrolü kullanır. API'den geçmeyen doğrudan REST insert'lerini RLS engeller.
- Secret/service role anahtarı istemci bileşenlerinde kullanılmaz.

## Build ve yayın

Yerel üretim derlemesini doğrulayın:

```bash
npm run build
```

GitHub ve Vercel için:

1. GitHub'da `aras-plastik-website` adlı repository oluşturun.
2. Bu klasörü repository'ye bağlayıp commit/push edin.
3. Vercel'de repository'yi import edin ve Production/Preview ortamlarına gerekli environment variable'ları ekleyin.
4. Deploy edin. Domain satın alındığında `NEXT_PUBLIC_SITE_URL` değerini güncelleyip Vercel domain/DNS yönergelerini izleyin.
5. Yayındaki sitemap'i Google Search Console'a (`/sitemap.xml`) gönderin.

`.env.local` ve service role anahtarı repository'ye kesinlikle eklenmemelidir. Domain henüz bilinmediği için URL değişkeni tek noktadan kullanılır.

## İçerik ve yayına çıkış notları

- Firma logosu, ürün görselleri, adres, telefon ve teknik ürün bilgileri verilmediği için temsili şirket verisi eklenmemiştir.
- KVKK metni yayın öncesi veri sorumlusu bilgileriyle tamamlanmalı ve hukuk uzmanına inceletilmelidir.
- Canlı formları etkinleştirmek için Supabase URL, anon key ve service role key gerekir.
- Resend e-posta bildirimi isteğe bağlıdır; gerçek gönderici adresi sağlayıcıda doğrulanmalıdır.

