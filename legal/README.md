# Hukuki Dokümanlar — Kullanım Kılavuzu

Bu klasör, Karmik Matris Analizi sitesinin hukuki dokümanlarını içerir. Müşteri kabulüne başlamadan önce **bu dosyaları doldurman ve avukata göstermen** gerekiyor.

## ⚠️ ÖNEMLİ HATIRLATMALAR

1. **Bu dosyalar şablondur**, gerçek hukuki belge değildir.
2. **Avukat onayı şart**. Yayına almadan önce bir avukatla mutlaka gözden geçir.
3. **Yer tutucuları doldur**. Tüm `[KÖŞELİ PARANTEZ]` içindeki ifadeler doldurulması gereken alanlardır.
4. **Yayına Almadan Önce Kaldırılacaklar**: Her dokümanın başındaki kırmızı `⚠️ Hukuki Uyarı` bloklarını silmen gerek.

## 📁 Dosya Listesi

| Dosya | Açıklama | Öncelik |
|---|---|---|
| `kvkk-aydinlatma-metni.html` | KVKK m. 10 kapsamında zorunlu aydınlatma | 🔴 Kritik |
| `acik-riza-metni.html` | Özel nitelikli veri + yurtdışı aktarım için açık rıza | 🔴 Kritik |
| `gizlilik-politikasi.html` | Genel gizlilik politikası | 🔴 Kritik |
| `kullanim-kosullari.html` | Hizmet kullanım koşulları | 🟡 Önemli |
| `mesafeli-satis-sozlesmesi.html` | Abonelik satışı için TKHK m. 48 sözleşmesi | 🟡 Önemli |
| `on-bilgilendirme-formu.html` | Tüketici Mevzuatı zorunlu ön bilgilendirme | 🟡 Önemli |
| `iade-iptal-politikasi.html` | İade ve iptal kuralları | 🟡 Önemli |
| `cerez-politikasi.html` | Çerez kullanım politikası | 🟢 Standart |
| `style.css` | Tüm hukuki sayfalar için ortak stil | — |

## ✍️ Doldurman Gereken Yer Tutucular

Tüm dosyalarda aşağıdaki yer tutucular yer alır. Aynı bilgileri her dosyada tekrar yerine yazman gerekir (veya bir kez kararlaştırıp toplu replace yapabilirsin).

### Veri Sorumlusu Bilgileri

| Yer Tutucu | Doldurulacak Bilgi |
|---|---|
| `[VERİ SORUMLUSU ÜNVANI]` | Şirket adı veya gerçek kişi adı (örn: "Gizem Şule Mert" veya "ABC Spiritüel Danışmanlık Tic. Ltd. Şti.") |
| `[VERGİ DAİRESİ]` | Vergi dairesi adı |
| `[VERGİ NO]` | Vergi numarası (10 hane) |
| `[T.C. KİMLİK NO]` | Şahıs ise T.C. kimlik numarası |
| `[MERSİS NO]` | MERSIS numarası (şirket varsa, 16 hane) |
| `[İŞ YERİ ADRESİ]` | Tam yazışma adresi (mahalle, sokak, no, ilçe, il) |
| `[İLETİŞİM E-POSTASI]` | Genel iletişim e-postası |
| `[KVKK BAŞVURU E-POSTASI]` | KVKK başvurularının yapılacağı e-posta (genellikle aynı veya kvkk@... gibi özel) |
| `[İLETİŞİM TELEFONU]` | Telefon numarası |
| `[KEP ADRESİ]` | Kayıtlı Elektronik Posta adresi (varsa) |
| `[SİTE ADRESİ]` | Web sitesi URL (örn: www.karmikmatris.com) |
| `[YETKİLİ İL]` | Uyuşmazlık halinde yetkili olacak il (genellikle iş yerinin bulunduğu il) |

### Banka Bilgileri (Mesafeli Satış için)

| Yer Tutucu | Doldurulacak Bilgi |
|---|---|
| `[BANKA ADI]` | Banka adı (örn: "Ziraat Bankası") |
| `[HESAP SAHİBİ]` | Hesap sahibinin tam adı |
| `[IBAN]` | TR ile başlayan 26 haneli IBAN |

### Tarih

| Yer Tutucu | Doldurulacak Bilgi |
|---|---|
| `[GÜN.AY.YIL]` | Yayına alma veya son güncelleme tarihi (örn: "10.04.2026") |

## 🛠️ Toplu Replace ile Hızlı Doldurma

VS Code, Notepad++ veya benzer bir editörde, bu klasörde **"Find in Files"** özelliği ile yer tutucuları topluca değiştirebilirsin:

```
Find:    [VERİ SORUMLUSU ÜNVANI]
Replace: Gizem Şule Mert
```

Bunu her yer tutucu için tekrarla.

## ✅ Yayına Alma Kontrol Listesi

Yayına almadan önce her dosya için:

- [ ] Tüm `[KÖŞELİ PARANTEZ]` yer tutucuları dolduruldu
- [ ] Üstteki kırmızı "⚠️ Hukuki Uyarı" bloğu kaldırıldı
- [ ] "Son güncelleme" tarihi güncellendi
- [ ] Bir avukat tarafından gözden geçirildi
- [ ] Tüm sayfalar mobile cihazda kontrol edildi
- [ ] Footer linkleri çalışıyor mu test edildi
- [ ] Üyelik kayıt formunda onay kutuları eklendi (KVKK + Açık Rıza + Kullanım Koşulları + Mesafeli Satış)

## 📋 VERBİS Kayıt Yükümlülüğü

KVKK Kurumu'nun Veri Sorumluları Sicili Bilgi Sistemi (VERBİS) kayıt yükümlülüğü, aşağıdaki kriterlere göre belirlenir:

### Kayıt Zorunlu mu?

**KAYIT ZORUNLU:**
- Yıllık çalışan sayısı 50'den fazla **VEYA** yıllık mali bilanço toplamı 100 milyon TL'den fazla olan veri sorumluları
- Yurtdışı yerleşik veri sorumluları
- Kamu kurumu ve kuruluşları
- Özel nitelikli kişisel veri işleyen herkes (eğer "ana faaliyet" kapsamındaysa — örn: sağlık kuruluşları)

**KAYIT GEREKMEYEBİLİR (istisna kapsamında):**
- 50'den az çalışan ve 100 milyon TL altı ciroya sahip, özel nitelikli veri "ana faaliyet" olarak işlemeyenler
- Şahıs şirketleri ve gerçek kişiler (genellikle istisna kapsamında)

### Sizin Durumunuz

Karmik Matris Analizi:
- ✅ Çalışan sayısı muhtemelen az
- ✅ Yıllık ciro 100 milyon TL altında
- ⚠️ Özel nitelikli veri (felsefi/dini içerik yorumları) işliyor olabilir — ama bu "ana faaliyet" olarak tanımlanabilir mi?

**Sonuç:** VERBİS kaydı **muhtemelen zorunlu değil**, ancak özel nitelikli veri konusu nedeniyle bir avukatla doğrulama yapmanız önerilir.

### VERBİS Kayıt İçin

Eğer kayıt zorunluysa:

1. https://verbis.kvkk.gov.tr adresine gidin
2. e-Devlet ile giriş yapın
3. "Veri Sorumluları Sicili" başvurusu yapın
4. İşlenen veri kategorileri, amaçları, aktarımları, saklama süreleri gibi bilgileri girin
5. Aydınlatma yükümlülüklerinizi yerine getirdiğinizi beyan edin

## 🔄 Dokümanları Güncelleme

Yasal mevzuat değişirse veya hizmet kapsamı değişirse, dokümanları güncellemen gerekir. Her güncellemede:

1. İlgili dosyada değişikliği yap
2. "Son güncelleme" tarihini değiştir
3. Önemli değişikliklerde mevcut kullanıcılara e-posta ile bildir
4. Site footer'ında ve dokümanların altında yeni tarih görünür

## 📞 Destek

KVKK ve Tüketici Mevzuatı konularında yardım için:
- KVKK Kurumu: https://www.kvkk.gov.tr
- Ticaret Bakanlığı (Tüketici): https://www.ticaret.gov.tr
- e-Tüketici Portalı: https://etuketici.ticaret.gov.tr

---

**Son Hatırlatma:** Bu metinler bir AI tarafından genel KVKK ve TKHK pratiklerine göre hazırlanmıştır. **Her durumda bir avukat görüşü almak şarttır**. Yer tutucular doldurulmadan veya avukat onayı olmadan yayına almayın.
