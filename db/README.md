# Veritabanı Kurulumu — Supabase

Bu klasör Karmik Matris Analizi'nin Supabase üzerinde çalışan veritabanı şemasını içerir.

## Adım Adım Kurulum

### 1. Supabase Projesi Oluştur

1. https://supabase.com/dashboard adresine git
2. **New project** → bir isim ver (örn: `karmik-matris`)
3. **Database password** belirle (güvenli yerde sakla)
4. **Region** olarak `Europe (Frankfurt)` seç (Türkiye'ye en yakın)
5. Proje oluşturulana kadar bekle (~2 dakika)

### 2. Şemayı Uygula

Sırasıyla bu dosyaları **Supabase Dashboard → SQL Editor**'de çalıştır:

```
1. db/schema.sql        ← Tabloları oluşturur
2. db/triggers.sql      ← Trigger ve fonksiyonları kurar
3. db/rls-policies.sql  ← Row Level Security politikalarını uygular
4. db/seed.sql          ← Başlangıç paketlerini ekler
```

> Her dosyayı **sırasıyla** çalıştır. Sırayı bozarsan foreign key hatası alırsın.

### 3. API Anahtarlarını Al

Supabase Dashboard → **Settings → API** sayfasından şu değerleri kopyala:

| Anahtar | Nereye Kullanılır |
|---|---|
| **Project URL** (`https://xxx.supabase.co`) | `SUPABASE_URL` |
| **anon public** key | `SUPABASE_ANON_KEY` (frontend'de güvenli) |
| **service_role** key | `SUPABASE_SERVICE_KEY` (sadece backend, ASLA frontend'de kullanma!) |

### 4. Vercel Environment Variables

```bash
vercel env add SUPABASE_URL
vercel env add SUPABASE_ANON_KEY
vercel env add SUPABASE_SERVICE_KEY
```

Veya `.env.local` dosyasına ekle:

```
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_KEY=eyJ...
```

> `SUPABASE_ANON_KEY` aynı zamanda frontend'de de gerekiyor. Bunu `lib/supabase-config.js` içine yazacağız (anon key public — sorun değil).

### 5. Auth Ayarları

Supabase Dashboard → **Authentication → Settings**:

- **Site URL**: `https://karmikmatrisdiyagrami.vercel.app` (canlı domain)
- **Redirect URLs**: `https://karmikmatrisdiyagrami.vercel.app/auth/sifre-sifirla.html`
- **Enable email confirmations**: Açık tut (zorunlu değil ama önerilir)

**Email Templates** (Authentication → Email Templates):

| Şablon | Değiştir |
|---|---|
| **Confirm signup** | Türkçe metin yaz |
| **Reset Password** | Türkçe metin yaz, link `{{ .SiteURL }}/auth/sifre-sifirla.html?...` olsun |

### 6. İlk Admin Kullanıcısını Oluştur

1. Siteye git → `/auth/kayit.html` sayfasından kayıt ol (örn: `admin@karmikmatris.com`)
2. Supabase Dashboard → **SQL Editor**'de şu sorguyu çalıştır:

```sql
update public.profiles
set is_admin = true
where email = 'admin@karmikmatris.com';
```

3. Çıkış yap → tekrar giriş yap → `/admin/` panel açılacak.

## Şema Özeti

| Tablo | Açıklama |
|---|---|
| `profiles` | `auth.users` ile 1-1 — kredi sayısı, ad, telefon, admin bayrağı |
| `credit_packages` | Satıştaki paketler (Başlangıç 30 / Profesyonel 100) |
| `payment_requests` | Kullanıcıların havale bildirimleri (pending/approved/rejected) |
| `credit_transactions` | Tüm kredi hareketleri (audit log) |
| `analyses` | Yapılan analizlerin kaydı (PDF tekrar üretmek için) |

## Güvenli Fonksiyonlar (`SECURITY DEFINER`)

- `approve_payment_request(uuid)` — admin onay → kredi yükle
- `reject_payment_request(uuid, text)` — admin red
- `deduct_credit_for_analysis(uuid)` — analiz sonrası kredi düş
- `admin_grant_credits(uuid, integer, text)` — admin manuel kredi ekleme

Bu fonksiyonlar `auth.uid()` üzerinden kim çağırıyor diye bakar; sadece admin olanları çağırabilir (kontrol fonksiyonun içindedir).

## Sorun Giderme

**"new row violates row-level security policy"** → RLS politikan eksik ya da yanlış. `rls-policies.sql`'i tekrar çalıştır.

**"function public.handle_new_user does not exist"** → `triggers.sql`'i çalıştırmayı unutmuşsun.

**Yeni kayıt olunca profiles satırı oluşmuyor** → `on_auth_user_created` trigger'ı kurulmamış. `triggers.sql`'i çalıştır.
