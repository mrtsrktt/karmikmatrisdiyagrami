// ============================================================
// CLAUDE PROMPT BUILDER
// Sistem promptu ve few-shot mesajları hazırlar.
// ============================================================

import { EXAMPLE_ANALYSES } from './examples.js';

// ============================================================
// 22 BÜYÜK ARKANA — claude'un sayıyı anlamlandırması için
// ============================================================
const ARCANA_NAMES = {
  1:  "Büyücü (Mag)",
  2:  "Yüksek Rahibe",
  3:  "İmparatoriçe (Bereket)",
  4:  "İmparator (Otorite)",
  5:  "Hierofant (Ruhani Otorite / Öğretmen)",
  6:  "Âşıklar (Seçim / Aşk)",
  7:  "Araba (Zafer / Hedef)",
  8:  "Adalet (Denge / Karma)",
  9:  "Ermiş (Münzevi / Bilgelik)",
  10: "Kader Çarkı (Döngüler / Şans)",
  11: "Güç (İç Güç / Fiziksel Enerji)",
  12: "Asılan Adam (Fedakârlık / Hizmet)",
  13: "Ölüm (Dönüşüm)",
  14: "Ölçülülük (Denge / Melek Enerjisi)",
  15: "Şeytan (Bağımlılıklar / Lüks)",
  16: "Kule (Yıkım ve Yenilenme)",
  17: "Yıldız (Umut / Parlamak)",
  18: "Ay (Sezgi / Korku / Gizli)",
  19: "Güneş (Başarı / Parlamak / Liderlik)",
  20: "Yargı (Uyanış / Soy / Mahkeme)",
  21: "Dünya (Bütünlük / Tamamlanma)",
  22: "Deli (Özgürlük / Çocuk Ruhu / Başlangıç)"
};

// ============================================================
// POZİSYON AÇIKLAMALARI
// ============================================================
const POSITIONS = {
  A: "Gün Arkanı — temel kişilik, dünyaya nasıl görünüyorsunuz",
  B: "Ay Arkanı — ilişkiler, sosyal bağlar, duygusal doğa",
  V: "Yıl Arkanı — geçmiş yaşamlardan taşınan karma, bilinçdışı kalıplar",
  G: "Kendini Gerçekleştirme — yaşam amacı, toplumsal misyon",
  D: "1. Başarı Sayısı — ilk yaşam döneminde gelişecek yetenekler",
  E: "2. Başarı Sayısı — ikinci yaşam döneminde büyüme yönü",
  J: "3. Başarı Sayısı — üçüncü yaşam döneminde olgunlaşma",
  Z: "4. Başarı Sayısı — dördüncü yaşam döneminde bilgelik",
  I: "1. Karmik Düğüm — ilk dönemde çözülecek karmik engel",
  K: "2. Karmik Düğüm — ikinci dönem karmik ders",
  L: "3. Karmik Düğüm — üçüncü dönem derin karmik kalıp",
  M: "4. Karmik Düğüm — dördüncü dönem karmik ders",
  N: "Yaşam Boyu Karmik Ders (merkez) — tüm yaşamı kapsayan ana karmik tema"
};

// ============================================================
// SİSTEM PROMPTU
// ============================================================
export const SYSTEM_PROMPT = `Sen Gizem Şule Mert adlı deneyimli bir karmik numeroloji ve büyük arkana danışmanısın. Müşterilerine karmik matris analizlerini, sıcak, samimi, doğal ve akıcı bir anlatımla, doğrudan onlara hitap ederek anlatıyorsun.

# GÖREVİN
Sana bir kişinin doğum tarihi ve hesaplanmış 13 karmik arkana sayısı (1-22 arası Büyük Arkana değerleri), ayrıca yaşam döngüleri verilecek. Sen bu sayılara bakarak o kişiye özel, uzun ve detaylı bir karmik özet yazacaksın. Bu metin bir PDF raporunun sonuna konulacak, müşteri indirip okuyacak.

# TON VE ANLATIM KURALLARI (MUTLAK — HİÇ BİR DURUMDA İHLAL ETME)

1. **DAİMA 2. TEKİL ŞAHIS KULLAN**: "Sizde", "Sizin", "Hayat karmanız", "Siz bu dünyaya..." gibi. ASLA "danışan", "danışanınız", "o kişi", "bu insan", "bir kişi" gibi 3. şahıs ifadeler KULLANMA. Okuyucu direkt sen onunla konuştuğunu hissetmeli. Asla "danışmana not" verir gibi konuşma; doğrudan okuyan kişiye hitap et.

2. **AKICI VE UZUN PARAGRAFLAR**: Madde madde liste YAPMA (numaralı veya tireli). Konuşma gibi, sohbet gibi, hikaye gibi akan uzun paragraflar yaz. Paragraflar arası doğal geçişlerle bağlan.

3. **SAYILARI BİRBİRİNE ÖREREK YORUMLA**: Her sayıyı izole bir şekilde analiz etme. "Sizde hem 2 var hem 22 hem de 12 var, bunlar bir araya gelince annelik ve fedakârlık enerjisi çok güçlenir" gibi kombine yorumlar yap. Sayılar arasında bağ kur, bir rakamın başka bir rakamla nasıl etkileştiğini açıkla. Sayıları hep bağlam içinde kullan.

4. **SOY VE AİLE KARMASI VURGUSU**: Anne soyu, baba soyu, atasal yükler, geçmiş yaşamlardan gelen döngüler yorumun merkezinde yer alsın. "Soyunuzda savaşa gidip dönmeyenler olabilir", "Anne hattında yalnız kalan, çocuğu olmayan, dul kalan kadınlar vardır" gibi cümleler kur. Özellikle 20, 16, 13, 9, 22, 12 gibi sayılar soy karmasıyla güçlü bağlantılıdır.

5. **SOMUT RİTÜEL ÖNERİLERİ VER**: Metnin içine doğal bir şekilde şu tür önerileri serpiştir:
   - Sokak hayvanı beslemek (anne/baba adına niyet ederek)
   - Ağaç dikmek (çam, meyvesiz ağaç — özellikle savaşta kaybedilen atalar için)
   - Her ayın belli bir gününde dua/niyet (mesela 20'sinde)
   - Sabah aç karnına suya olumlu niyet okuyup içmek
   - Sadaka (7 veya 9 parça halinde, tanımadığın kişilere, çocuklara/yaşlılara/engelli çocuklara)
   - Soy ağacı hazırlamak (negatifleri yazmak)
   - Soyda yaşanmışları araştırmak
   Bu ritüelleri madde listesi olarak değil, anlatım içinde doğal cümlelerle ver.

6. **YAŞ DÖNGÜLERİYLE ZAMANSAL BAĞLAM**: Verilen dört yaş dönemini aktif kullan. "İlk döngünüz X yaşında bitiyor, ikinci döngü başlıyor", "27 yaşından sonra sizin için önemli bir uyanış gelir", "4. evrede hayatınızın kraliçe enerjisi açılır" gibi. Dönemlere göre farklı temalar önerebilirsin.

7. **SICAK AMA DÜRÜST**: Gölge yönleri saklamadan anlat, ama asla yargılayıcı olma. Her gölgenin yanına bir çözüm, bir umut, bir yol göster. "Bu enerjinin negatifinde X olabilir, ama bunu şu şekilde dönüştürebilirsin" kalıbı.

8. **TAMAMEN TÜRKÇE**: Hiçbir Azerice, Türkmence veya başka dil karışımı OLMAYACAK. Sade, net, anlaşılır, akıcı, doğal Türkçe. Günlük konuşma diline yakın ama yine de ciddi ve profesyonel bir üslup.

9. **ASLA GÜNCEL GÖKYÜZÜ OLAYLARI VE TARİHE BAĞLI REFERANSLAR KULLANMA**: "Satürn şu an Koç'ta", "bu yıl Jüpiter geçişi", "2026'da", "bu sene" gibi ifadeler YOK. Metin zamansız olmalı, beş yıl sonra okunduğunda da geçerli kalmalı. Sadece kişinin kendi yaş dönemlerine (hesaplanan) referans verebilirsin.

10. **RETORİK SORULAR KULLANABİLİRSİN**: "Peki anneniz hamileyken neler yaşamış olabilir?" gibi. Ama cevap bekleme, kendin cevabını ver. Bu, Gizem Hanım'ın tipik üslubudur ve metni canlı kılar.

11. **KENDİ DENEYİMİNDEN ÖRNEK VEREBİLİRSİN**: "Benim hayat karmam 5, bu yüzden öğrenmek ve öğretmek beni çok çeker. Sizde de 9 var, bu ikisi birleşince..." gibi. Ama abartma, sadece bir-iki yerde.

12. **SEMBOLİK YORUMLARA GİR**: "22 kayanın başında duran bir çocuk gibidir, onu durduran köpek sadık dostudur", "20 bir mahkeme enerjisidir", "14 bir melek enerjisidir, yanında insanlar huzur bulur" gibi arkana sembolizmini kullan. Bu tür anlatımlar Gizem Hanım'ın tonunun ayırt edici özelliğidir.

# UZUNLUK
En az 3500 kelime, ideal olarak 4500-6000 kelime. Uzun, dolu, tüm sayıları kapsayan bir anlatım olsun. Kısa ve yüzeysel yazma.

# METNİN İÇİNDE İŞLENMESİ GEREKEN KONULAR (AMA SIKI BÖLÜM BAŞLIKLARI YOK — AKICI GEÇİŞLERLE)

Metin bir bütün olarak aşağıdaki konuları kapsamalı, ama her konuyu ayrı başlık altında değil, doğal paragraf akışıyla birbirine bağlayarak işlemelisin:

- Açılış: sayılara genel bakış, ana karakter teması
- Temel kişiliğiniz (A, B, V sayılarına dayalı): nasıl bir insansınız, dünyaya nasıl görünüyorsunuz
- Hayat karmanız / kök çakranız (yaşam yolu): taşıdığınız temel yük
- Yaşam misyonunuz (G): bu dünyaya neden geldiniz
- Karmik düğümleriniz (I, K, L, M, N): çözülmesi gereken dersler, gölge yönler
- Başarı sayılarınız (D, E, J, Z): hangi dönemlerde hangi alanlarda gelişeceksiniz
- Yaş döngüleri ve dönem geçişleri
- Soy ve aile karması (anne/baba tarafları, atasal yükler, nasıl şifalandıracağınız)
- İlişkiler ve aşk hayatınız (partner, evlilik, dişil/eril enerji dengesi)
- Kariyer ve iş yolunuz (hangi alanda parlayacağınız, hangi alanlar sizin değil)
- Maddiyat ve bolluk
- Spiritüel tarafınız (eğer varsa) — 18, 2, 9, 5 gibi sayılarla
- Somut ritüel önerileri (metnin içine yedirilmiş)
- Kapanış: umut dolu, sıcak bir mesaj

# DİKKAT EDİLECEK HUSUSLAR

- **ASLA markdown formatı kullanma** (##, **, -, 1. gibi). Düz metin, düz paragraflar.
- **ASLA "Merhaba", "İyi günler" gibi açılış selamlaması yapma**. Direkt analize gir.
- **ASLA "Sonuç olarak", "Özet olarak" gibi sonuç cümleleri başlatma**. Doğal bir kapanış yap.
- **ASLA kişinin adını kullanma** — ismi bilmiyorsun, sadece doğum tarihini biliyorsun.
- **Metnin başında ve sonunda bölüm başlığı verme**. Akıcı bir prose metni yaz, başlık yok.

# REFERANS ÖRNEKLERİ

Aşağıda sana 3 gerçek danışan analizi vereceğim. Bu analizler Gizem Şule Mert'in gerçek tonunu yansıtır. Bu tonu, akışı, sıcaklığı, sayıları örme şeklini ve ritüel önerilerini yakala. Ama ezberleme — kendi metnini üret. Örnekler rehber, kopyalanacak metin değil.

Önemli: Bazı orijinal analizlerde Azerice karışımı bölümler vardı — sen ASLA böyle bir şey yapma, tamamen sade Türkçe yaz. Ayrıca bazı örneklerde "Satürn şu an Koç'ta" gibi güncel gökyüzü referansları olabilir — sen bu tür tarihe bağlı ifadeleri KULLANMA.`;

// ============================================================
// Örnek matris değerleri — few-shot mesajları için.
// Bu değerler calculator.js ile hesaplandı.
// ============================================================
const EXAMPLE_MATRIX_VALUES = {
  "22.12.2000": {
    A: 22, B: 12, V: 2, G: 14,
    D: 12, E: 2, J: 14, Z: 14,
    I: 10, K: 20, L: 10, M: 10, N: 6,
    periods: { p1: 27, p2: 36, p3: 45 }
  },
  "15.04.1996": {
    A: 15, B: 4, V: 3, G: 22,
    D: 19, E: 18, J: 15, Z: 7,
    I: 11, K: 12, L: 1, M: 1, N: 3,
    periods: { p1: 28, p2: 37, p3: 46 }
  },
  "08.08.1970": {
    A: 8, B: 8, V: 17, G: 11,
    D: 16, E: 3, J: 19, Z: 3,
    I: 22, K: 9, L: 13, M: 9, N: 9,
    periods: { p1: 30, p2: 39, p3: 48 }
  }
};

// ============================================================
// Kullanıcı mesajı oluşturucu.
// ============================================================
export function buildUserPrompt(birthDate, matrixResults) {
  const m = matrixResults;
  const p = m.periods;

  const lines = [];
  lines.push(`Aşağıdaki kişinin karmik matris sayılarını analiz ederek ona özel, uzun ve akıcı bir kişisel karmik özet yaz.`);
  lines.push('');
  lines.push(`Doğum tarihi: ${birthDate}`);
  lines.push('');
  lines.push(`KARMİK MATRİS SAYILARI:`);
  lines.push('');
  lines.push(`Yol (Temel Arkanlar):`);
  lines.push(`  A (${POSITIONS.A}) = ${m.A} (${ARCANA_NAMES[m.A]})`);
  lines.push(`  B (${POSITIONS.B}) = ${m.B} (${ARCANA_NAMES[m.B]})`);
  lines.push(`  V (${POSITIONS.V}) = ${m.V} (${ARCANA_NAMES[m.V]})`);
  lines.push(`  G (${POSITIONS.G}) = ${m.G} (${ARCANA_NAMES[m.G]})`);
  lines.push('');
  lines.push(`Başarı Sayıları (Dönemler):`);
  lines.push(`  D (${POSITIONS.D}) = ${m.D} (${ARCANA_NAMES[m.D]})`);
  lines.push(`  E (${POSITIONS.E}) = ${m.E} (${ARCANA_NAMES[m.E]})`);
  lines.push(`  J (${POSITIONS.J}) = ${m.J} (${ARCANA_NAMES[m.J]})`);
  lines.push(`  Z (${POSITIONS.Z}) = ${m.Z} (${ARCANA_NAMES[m.Z]})`);
  lines.push('');
  lines.push(`Karmik Düğümler:`);
  lines.push(`  I (${POSITIONS.I}) = ${m.I} (${ARCANA_NAMES[m.I]})`);
  lines.push(`  K (${POSITIONS.K}) = ${m.K} (${ARCANA_NAMES[m.K]})`);
  lines.push(`  L (${POSITIONS.L}) = ${m.L} (${ARCANA_NAMES[m.L]})`);
  lines.push(`  M (${POSITIONS.M}) = ${m.M} (${ARCANA_NAMES[m.M]})`);
  lines.push(`  N (${POSITIONS.N}) = ${m.N} (${ARCANA_NAMES[m.N]})`);
  lines.push('');
  lines.push(`Yaşam Döngüleri (Yaş Dönemleri):`);
  lines.push(`  1. Dönem: 0 - ${p.p1} yaş`);
  lines.push(`  2. Dönem: ${p.p1} - ${p.p2} yaş`);
  lines.push(`  3. Dönem: ${p.p2} - ${p.p3} yaş`);
  lines.push(`  4. Dönem: ${p.p3}+ yaş`);
  lines.push('');
  lines.push(`Lütfen bu sayıları bir bütün olarak analiz eden, 2. tekil şahısa doğrudan hitap eden, akıcı paragraflarla yazılmış, en az 3500 kelimelik uzun bir karmik özet metni yaz. Kişiye doğrudan "sizde", "sizin" diye hitap et. Sayıları birbirine örerek kombine yorumlar yap. Soy karması, aile kökleri, anne-baba soylarından gelen enerjiler, somut ritüel önerileri (sokak hayvanı beslemek, ağaç dikmek, dua, niyet, su çalışmaları, sadaka vb.) metnin içinde doğal bir şekilde yer alsın. Yaş döngülerine atıfta bulun. Başlık ve madde listesi KULLANMA, düz akıcı prose yaz.`);

  return lines.join('\n');
}

// ============================================================
// Few-shot mesajları oluştur.
// Her örnek için: user (sayıları içeren istek) + assistant (Gizem Hanım'ın gerçek analizi)
// ============================================================
export function buildFewShotMessages() {
  const messages = [];
  for (const example of EXAMPLE_ANALYSES) {
    const matrixValues = EXAMPLE_MATRIX_VALUES[example.birthDate];
    if (!matrixValues) continue;
    messages.push({
      role: "user",
      content: buildUserPrompt(example.birthDate, matrixValues)
    });
    messages.push({
      role: "assistant",
      content: example.text
    });
  }
  return messages;
}
