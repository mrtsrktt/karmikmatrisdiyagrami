// ============================================================
// POSITION INFO — 2. tekil şahıs anlatımıyla, PDF için
// ============================================================
// 13 karmik pozisyonun her biri için: kısa ad, formül, ve "siz" diliyle
// yazılmış kısa bir anlam açıklaması.
// Bu metinler PDF'in teknik bölümünde, her pozisyon kartının altında yer alır.

const POSITION_INFO = {
  A: {
    name: 'A — Gün Arkanı',
    formula: 'Doğum günü (22\'den büyükse 22 çıkarılır)',
    meaning: 'Bu sayı sizin doğuştan gelen karakterinizi, dünyaya nasıl göründüğünüzü ve insanların sizi ilk görüşte nasıl algıladığını gösterir. Hayat boyunca değişmeyen çekirdek kişiliğinizdir; bu enerji sizin doğal akış tarzınızdır.',
  },
  B: {
    name: 'B — Ay Arkanı',
    formula: 'Doğum ayı',
    meaning: 'Bu sayı sizin sosyal yaşamdaki rolünüzü, ilişkilere bakış açınızı ve duygusal dünyanızla nasıl etkileşime girdiğinizi anlatır. İnsanlarla kurduğunuz bağların doğasını ve duygusal kimliğinizi şekillendirir.',
  },
  V: {
    name: 'V — Yıl Arkanı',
    formula: 'Yıl rakamlarının toplamı (22\'den büyükse 22 çıkarılır)',
    meaning: 'Bu sayı geçmiş yaşamlardan taşıdığınız karmik kalıpları, ruhunuzun derin hafızasını ve bilinçdışınızda işleyen programları temsil eder. Çözülmesi gereken eski yaşam izlerinizdir.',
  },
  G: {
    name: 'G — Kendini Gerçekleştirme',
    formula: 'A + B + V',
    meaning: 'Bu sayı sizin bu yaşamdaki asıl amacınızı, topluma nasıl katkı sağlamanız gerektiğini ve kendinizi nasıl gerçekleştirmeniz gerektiğini gösterir. Hayatınızın ana misyonu, sizden beklenen büyük yön budur.',
  },
  D: {
    name: 'D — 1. Başarı Sayısı',
    formula: 'A + B',
    meaning: 'İlk yaşam döneminizde (genelde gençlik yıllarınızda) odaklanmanız gereken yetenekleri ve başarı alanlarını gösterir. Gün ve ay enerjilerinizin birleşiminden doğan ilk potansiyelinizdir.',
  },
  E: {
    name: 'E — 2. Başarı Sayısı',
    formula: 'A + V',
    meaning: 'İkinci yaşam döneminizde gelişmeniz gereken alanı işaret eder. Kişiliğiniz ile karmik mirasınızın birleşiminden doğan, sizi olgunlaştıran bir enerjidir.',
  },
  J: {
    name: 'J — 3. Başarı Sayısı',
    formula: 'D + E',
    meaning: 'Üçüncü yaşam döneminizde ulaşmanız beklenen olgunluk noktasıdır. Önceki iki dönemin başarılarının birleşmesinden doğan bir ustalık çağrısıdır.',
  },
  Z: {
    name: 'Z — 4. Başarı Sayısı',
    formula: 'B + V',
    meaning: 'Son yaşam döneminizde elde edeceğiniz bilgeliği temsil eder. Sosyal deneyimlerinizle karmik derslerinizin harmanlanmasından doğan derin bir anlayıştır.',
  },
  I: {
    name: 'I — 1. Karmik Düğüm',
    formula: '|A − B|',
    meaning: 'İlk yaşam döneminizde çözmeniz gereken karmik engeli gösterir. Gün ve ay enerjileriniz arasındaki gerilimden doğan bir iç çelişkiyi temsil eder.',
  },
  K: {
    name: 'K — 2. Karmik Düğüm',
    formula: '|A − V|',
    meaning: 'İkinci yaşam döneminizde yüzleşmeniz gereken karmik dersi gösterir. Kişiliğiniz ile geçmiş yaşam karmalarınız arasındaki gerilimden doğar; karmik borçlarla yüzleşmeyi gerektirir.',
  },
  L: {
    name: 'L — 3. Karmik Düğüm',
    formula: '|I − K|',
    meaning: 'Üçüncü yaşam döneminizde çözülmesi gereken derin bir karmik kalıbı işaret eder. İlk iki karmik düğümün etkileşiminden doğan, daha derinde yatan bir temadır.',
  },
  M: {
    name: 'M — 4. Karmik Düğüm',
    formula: '|B − V|',
    meaning: 'Son yaşam döneminizde çözmeniz gereken karmik dersi gösterir. Sosyal doğanız ile geçmiş yaşam karmalarınız arasındaki gerilimi çözmenizi ister.',
  },
  N: {
    name: 'N — Yaşam Boyu Karmik Ders (Merkez)',
    formula: 'I + K + L + M',
    meaning: 'Tüm yaşamınızı kapsayan, en temel karmik dersinizdir. Matrisinizin merkezi noktası ve diğer tüm karmik düğümlerin altında yatan ana temadır. Bu enerjiyle bilinçli çalışmak tüm haritanızı dönüştürür.',
  },
};

const ARCANA_NAMES = {
  1:  'Büyücü (Mag)',
  2:  'Yüksek Rahibe',
  3:  'İmparatoriçe (Bereket)',
  4:  'İmparator (Otorite)',
  5:  'Hierofant (Ruhani Otorite)',
  6:  'Âşıklar (Seçim / Aşk)',
  7:  'Araba (Zafer / Hedef)',
  8:  'Adalet (Denge / Karma)',
  9:  'Ermiş (Münzevi / Bilgelik)',
  10: 'Kader Çarkı (Döngüler)',
  11: 'Güç (İç Güç)',
  12: 'Asılan Adam (Fedakârlık)',
  13: 'Ölüm (Dönüşüm)',
  14: 'Ölçülülük (Melek Enerjisi)',
  15: 'Şeytan (Bağımlılık / Lüks)',
  16: 'Kule (Yıkım ve Yenilenme)',
  17: 'Yıldız (Umut / Parlamak)',
  18: 'Ay (Sezgi / Korku / Gizli)',
  19: 'Güneş (Başarı / Liderlik)',
  20: 'Yargı (Uyanış / Soy)',
  21: 'Dünya (Bütünlük)',
  22: 'Deli (Özgürlük / Çocuk Ruhu)',
};

// Browser global
window.PDF_POSITION_INFO = POSITION_INFO;
window.PDF_ARCANA_NAMES = ARCANA_NAMES;
