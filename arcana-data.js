// ============================================================
// ARCANA DATA - 22 Buyuk Arkana Detayli Yorumlari
// Her pozisyon tipi icin ayri yorumlar
// ============================================================

const ARCANA_NAMES = {
    1:  "Buyucu (Mag)",
    2:  "Rahibe (Yuksek Rahibe)",
    3:  "Imparatrice (Bereket)",
    4:  "Imparator (Otorite)",
    5:  "Hierofant (Ruhani Otorite)",
    6:  "Asiklar (Secim)",
    7:  "Araba (Zafer)",
    8:  "Adalet (Denge)",
    9:  "Erenis (Munzevi)",
    10: "Kader Carki (Donusum)",
    11: "Guc (Ic Guc)",
    12: "Asilan Adam (Fedakarlik)",
    13: "Olum (Donusum)",
    14: "Olcululuk (Denge)",
    15: "Seytan (Baglanti)",
    16: "Kule (Yikim ve Yenilenme)",
    17: "Yildiz (Umut)",
    18: "Ay (Yanalma)",
    19: "Gunes (Basari)",
    20: "Yargi (Uyanis)",
    21: "Dunya (Butunluk)",
    22: "Deli (Ozgurluk)"
};

const ARCANA_TAROT_NAMES = {
    1: "The Magician", 2: "The High Priestess", 3: "The Empress",
    4: "The Emperor", 5: "The Hierophant", 6: "The Lovers",
    7: "The Chariot", 8: "Justice", 9: "The Hermit",
    10: "Wheel of Fortune", 11: "Strength", 12: "The Hanged Man",
    13: "Death", 14: "Temperance", 15: "The Devil",
    16: "The Tower", 17: "The Star", 18: "The Moon",
    19: "The Sun", 20: "Judgement", 21: "The World",
    22: "The Fool"
};

// ============================================================
// POZISYON ACIKLAMALARI
// ============================================================
const POSITION_INFO = {
    A: {
        name: "A - Gun Arkani",
        fullName: "Arkan Dnya (Gun Arkani)",
        description: "Temel kisilik ozellikleri, karakterin dis dunyaya yansimasi",
        formula: "Dogum gunu (22'den buyukse 22 cikarilir)",
        meaning: "Bu pozisyon, kisinin dogussal karakter ozelliklerini, dis dunyaya nasil gorundugunü ve temel kisilik yapisini gosterir. Hayat boyunca degismeyen cekirdek kisiliginizidir."
    },
    B: {
        name: "B - Ay Arkani",
        fullName: "Arkan Mesyatsa (Ay Arkani)",
        description: "Iliskiler, sosyal baglantilar, duygusal doga",
        formula: "Dogum ayi",
        meaning: "Bu pozisyon, sosyal yasaminizdaki rolunuzu, iliskilerinize bakis acinizi ve duygusal dunya ile nasil etkilestiginizi ortaya koyar."
    },
    V: {
        name: "V - Yil Arkani",
        fullName: "Arkan Goda (Yil Arkani)",
        description: "Gecmis yasam karmalari, derin bilicdisi kaliplari",
        formula: "Yil rakamlarinin toplami (22'den büyükse 22 cikarilir)",
        meaning: "Bu pozisyon, gecmis yasamlardan tasinan karmik kaliplari, ruhun derin hafizasini ve bilicdisi programlari temsil eder. Bunlar cozulmesi gereken eski yasam deneyimleridir."
    },
    G: {
        name: "G - Kendini Gerceklestirme",
        fullName: "Samorealizatsiya",
        description: "Yasam amaci, toplumsal misyon",
        formula: "A + B + V (22'den buyukse 22 cikarilir)",
        meaning: "Bu pozisyon, bu yasamdaki asil amacınızı, topluma nasıl hizmet etmeniz gerektigini ve kendinizi nasil gerceklestirmeniz gerektigini gosterir. Hayatinizin ana misyonudur."
    },
    D: {
        name: "D - 1. Basari Sayisi",
        fullName: "Cislo Dostijeniy 1 (1. Donem Basarisi)",
        description: "Ilk yasam doneminde gelistirilecek yetenekler",
        formula: "A + B (22'den buyukse 22 cikarilir)",
        meaning: "Ilk yasam doneminizde (genclik) odaklanmaniz gereken yetenekler ve basari alanlari. Gun ve ay enerjilerinin birlesiminden dogan potansiyel."
    },
    E: {
        name: "E - 2. Basari Sayisi",
        fullName: "Cislo Dostijeniy 2 (2. Donem Basarisi)",
        description: "Ikinci yasam doneminde buyume yonu",
        formula: "A + V (22'den buyukse 22 cikarilir)",
        meaning: "Ikinci yasam doneminizde gelismeniz gereken alan. Gun arkani ile yil arkani enerjilerinin birlesimi, kisisel ve karmik deneyimlerin harmanlanmasidir."
    },
    J: {
        name: "J - 3. Basari Sayisi",
        fullName: "Cislo Dostijeniy 3 (3. Donem Basarisi)",
        description: "Ucuncu yasam doneminde olgunlasma",
        formula: "D + E (22'den buyukse 22 cikarilir)",
        meaning: "Ucuncü yasam doneminizde ulasmaniz gereken olgunluk noktasi. Onceki iki donemin basarilarinin sentezlenmesinden dogan ustalık."
    },
    Z: {
        name: "Z - 4. Basari Sayisi",
        fullName: "Cislo Dostijeniy 4 (4. Donem Basarisi)",
        description: "Dorduncu yasam doneminde bilgelik",
        formula: "B + V (22'den buyukse 22 cikarilir)",
        meaning: "Son yasam doneminizde elde edilecek bilgelik. Sosyal deneyimler ile karmik derslerin birlesiminden olusan derin anlayis."
    },
    I: {
        name: "I - 1. Karmik Dugum",
        fullName: "Karmiceskiy Uzel 1 (1. Karmik Ders)",
        description: "Ilk donem karmik engeli",
        formula: "|A - B| (0 ise 22)",
        meaning: "Ilk yasam doneminizde cozulecek karmik engel. Gun ve ay enerjileri arasindaki catisman gosterir. Bu enerji farki, ustesinden gelinmesi gereken ic celiskiyi temsil eder."
    },
    K: {
        name: "K - 2. Karmik Dugum",
        fullName: "Karmiceskiy Uzel 2 (2. Karmik Ders)",
        description: "Ikinci donem karmik engeli",
        formula: "|A - V| (0 ise 22)",
        meaning: "Ikinci yasam doneminizde yuzlesmeniz gereken karmik ders. Kisilik ile gecmis yasam karmalari arasindaki gerilim. Bu enerji, karmik borclarla yuzlesmeyi gerektirir."
    },
    L: {
        name: "L - 3. Karmik Dugum",
        fullName: "Karmiceskiy Uzel 3 (3. Karmik Ders)",
        description: "Ucuncu donem karmik engeli",
        formula: "|I - K| (0 ise 22)",
        meaning: "Ucuncu yasam doneminizde cozulmesi gereken derin karmik kalip. Ilk iki karmik dugumlerin etkilesiminden dogan, daha derinde yatan tema."
    },
    M: {
        name: "M - 4. Karmik Dugum",
        fullName: "Karmiceskiy Uzel 4 (4. Karmik Ders)",
        description: "Dorduncu donem karmik engeli",
        formula: "|B - V| (0 ise 22)",
        meaning: "Son yasam doneminizde cozulecek karmik ders. Sosyal doga ile gecmis yasam karmalari arasindaki gerilimin cozumu."
    },
    N: {
        name: "N - Yasam Boyu Karmik Ders",
        fullName: "Karmiceskiy Uzel 5 (Merkez)",
        description: "Tum yasam boyunca surecek merkezi karmik tema",
        formula: "I + K + L + M (22'den buyukse 22 cikarilir)",
        meaning: "Tum yasaminizi kapsayan en temel karmik ders. Bu, matrisin merkezidir ve tum diger karmik dugumlerin altinda yatan ana temayi gosterir. Bu enerjiyle calismak tum matrisi donusturur."
    }
};

// ============================================================
// 22 ARKANA DETAYLI YORUMLARI
// Her arkana icin: genel, pozitif, negatif, pozisyon bazli yorumlar
// ============================================================
const ARCANA_DETAILS = {
    1: {
        name: "Buyucu (Mag)",
        tarot: "The Magician",
        keywords: ["Irade", "Inisiyatif", "Liderlik", "Ustalik", "Yaraticilik"],
        element: "Hava",
        planet: "Merkur",
        general: "Buyucu, saf irade gucunu ve yaratici potansiyeli temsil eder. Bu enerji, dusunceleri gerceklige donusturme yetenegini, kaynak kullanimi becerisini ve aktif yaraticilik gucunu simgeler. Buyucu enerjisi tasiyan kisiler, dogussal liderlik ozellikleri ve guclu bir inisiyatif kapasitesine sahiptir.",
        positive: ["Guclu irade ve kararlilik", "Dogal liderlik yetenegı", "Yaratici problem cozme", "Kaynaklari etkili kullanma", "Iletisim becerisi", "Hizli ogrenme kapasitesi"],
        negative: ["Manipulasyon egilimi", "Yetenekleri bencil amaclar icin kullanma", "Aldaticilik", "Dikkat daginikligi", "Basladiği isi bitirmeme"],
        inPath: "Dogussal lider, guclu kisilik, inisiyatif sahibi. Cevresini etkileme ve yonlendirme yetenegine sahip. Iletisim becerileri guclu, hizli dusunur ve hareket eder.",
        inAchievement: "Bu donemde liderlik ve ustalık becerilerinizi gelistirmeniz gerekiyor. Bir alanda uzmanlasmak, kendi projelerinizi baslatmak ve yaratici gucunuzu somut sonuclara donusturmek onemli.",
        inKarmic: "Pasiflik ve inisiyatif eksikligi karmik engeliniz. Gecmis yasamlarda yeteneklerinizi kullanmadiginiz veya baskalarini manipule ettiginiz icin bu yasam inisiyatif almak ve yaratici gucunuzu dogru kullanmak konusunda zorluklarla karsilasabilirsiniz.",
        inCenter: "Tum yasamınız boyunca aktif yaraticilik ve liderlik temaniz. Kendi gercekliginizi bilinçli olarak yaratmayi ogrenmeniz, pasiflikten cikmak ve yeteneklerinizi insanlik yararina kullanmaniz gerekiyor."
    },
    2: {
        name: "Rahibe (Yuksek Rahibe)",
        tarot: "The High Priestess",
        keywords: ["Sezgi", "Gizli bilgi", "Sabir", "Ikilik", "Ic bilgelik"],
        element: "Su",
        planet: "Ay",
        general: "Yüksek Rahibe, sezgisel bilgeligi, gizli bilgileri ve ic dunyanin derinliklerini temsil eder. Bu enerji, sabir, dinleme ve ic sesin rehberligine guvenme gerektiren bir yolculugu simgeler.",
        positive: ["Guclu sezgi", "Derin ic bilgelik", "Sabir ve dinleme becerisi", "Gizli bilgilere erisim", "Duygusal derinlik", "Ruhani yetenekler"],
        negative: ["Pasiflik ve kararsizlik", "Gerçeklikten kacis", "Asiri gizlilik", "Duygusal kapanma", "Sirlarin yarattigi sorunlar"],
        inPath: "Son derece sezgisel, icine kapanık ama derin bir ic dünyasi olan kisi. Gizli bilgilere ve ruhani alana dogal bir yatkınlık. Sessiz guc ve bilgelik tasiyicisi.",
        inAchievement: "Bu donemde sezgisel yeteneklerinizi gelistirmeniz, sabir ogrenmeniz ve ic sesinize guvenmeniZ bekleniyor. Meditatif pratikler ve ic gozlem bu doneme uygundur.",
        inKarmic: "Sezgiye guvenmemek, ic sesi bastirmak veya gizli bilgileri kotuye kullanmak karmik engeliniz. Sabir ve ic dinleme yoluyla cozume ulasilir.",
        inCenter: "Yasam boyu sezgisel gelisim ve ic bilgelik temaniz. Gorünmeyen alemleri anlamak, sezginize guvenmek ve gizli bilgilerin sorumlu tasiyicisi olmak ana gorevininiz."
    },
    3: {
        name: "Imparatrice (Bereket)",
        tarot: "The Empress",
        keywords: ["Bereket", "Yaraticilik", "Annelik", "Doga", "Guzellik"],
        element: "Toprak",
        planet: "Venus",
        general: "Imparatoriçe, bereketı, yaratıcılıgı, disil enerjiyi ve dogayla uyumu temsil eder. Bu enerji, besleyici, yaratıcı ve bol keseden veren bir yasam gucunu simgeler.",
        positive: ["Yaratici bolluk", "Besleyici ve sefkatli doga", "Estetik duyarlilik", "Maddi basari", "Dogayla uyum", "Sanatsal yetenekler"],
        negative: ["Asirilik ve savurganlik", "Tembellik", "Kibirlilik", "Bogici sevgi", "Maddeye asiri baglilik"],
        inPath: "Yaratici, besleyici kisilik. Güzellik ve konfor düskünü. Bolluk ve bereket yaratma yetenegine sahip. Sanatsal egilimli, sicak ve sefkatli.",
        inAchievement: "Bu donemde yaratici ifadenizi ve bolluk bilincini gelistirmeniz gerekiyor. Sanat, doga ve besleyici iliiskiler bu donemin anahtaridir.",
        inKarmic: "Disillikle ilgili sorunlar, engellenmis yaraticilik veya bagimlilik karmik engeliniz. Sevgiyi ozgurce vermek ve almak, yaraticiliga cesaret etmek gereken dersler.",
        inCenter: "Yasam boyu yaraticilik, bereket ve disil enerjiyle calisma temaniz. Bolluk bilinci gelistirmek ve sevgiyle yaratmak ana gorevleriniz."
    },
    4: {
        name: "Imparator (Otorite)",
        tarot: "The Emperor",
        keywords: ["Yapi", "Otorite", "Disiplin", "Istikrar", "Duzen"],
        element: "Ates",
        planet: "Mars/Jüpiter",
        general: "Imparator, yapiyi, otoriteyi, disiplini ve duzenı temsil eder. Bu enerji, saglamlik, guvenilik ve sistemli yaklasimi simgeler. Kaos icinde duzen yaratma gucudur.",
        positive: ["Guclu disiplin", "Dogal otorite", "Pratik ve sistematik yaklasim", "Istikrar yaratma", "Koruyuculuk", "Stratejik dusunme"],
        negative: ["Tiranlık ve katıllk", "Duygusal soguklukluk", "Kontrol takintisi", "Esneklik eksikligi", "Otoriter davranis"],
        inPath: "Disiplinli, otoriteli ve pratik kisilik. Yapilar kurmak ve duzen saglamak konusunda dogal yetenekli. Güvenilir ve sorumlu.",
        inAchievement: "Bu donemde yapi olusturmak, liderlik etmek ve disiplinli calismak bekleniyor. Kariyer ve maddi yaşam icin temel atma zamanidir.",
        inKarmic: "Katilık, kontrol sorunlari veya otorite figürleriyle catlsmalar karmik engeliniz. Guc ve otoriteyi dengeli kullanmayı ogrenmek gereken ders.",
        inCenter: "Yasam boyu yapi, duzen ve sorumluluk temanız. Dengeli otorite olmak, yapilar kurmak ve korumak ana gorviniz."
    },
    5: {
        name: "Hierofant (Ruhani Rehber)",
        tarot: "The Hierophant",
        keywords: ["Gelenek", "Ogretim", "Ruhani otorite", "Mentorulk", "Inanc sistemi"],
        element: "Toprak",
        planet: "Jupitor",
        general: "Hierofant, gelenegi, ogretimi, ruhani otoriteyi ve inanc sistemlerini temsil eder. Bu enerji, bilgiyi aktarmak, rehberlik etmek ve manevi yollarda yurumek ile ilgilidir.",
        positive: ["Dogal ogretmenlik", "Derin bilgelik", "Gelenege saygi", "Rehberlik yetenegı", "Manevi arayis", "Disiplinli ogrenme"],
        negative: ["Dogmatizm", "Kurlalara kor baglilik", "Iki yuzlukluk", "Eski sistemlere takılıp kalma", "Fanatizm"],
        inPath: "Geleneksel, bilgi arayan ve ogretme eğilimli kisilik. Dogal ogretmen veya ogrenci. Manevi ve felsefi konulara ilgi.",
        inAchievement: "Bu donemde ogretmenlik, rehberlik ve manevi gelisim ön plana cikiyor. Bilgi edinmek ve aktarmak bu donemin anahtari.",
        inKarmic: "Dogmatizm, rehberliği reddetme veya baskalarina kor takip karmik engeliniz. Kendi manevi yolunuzu bulmak ve başkalarına zorlamadan rehberlik etmek gereken ders.",
        inCenter: "Yasam boyu ogretim, manevi gelisim ve bilgelik aktarimı temaniz. Dogru bilgiyi bulup paylasmak ana goreviiz."
    },
    6: {
        name: "Asiklar (Secim)",
        tarot: "The Lovers",
        keywords: ["Secim", "Ask", "Birlesme", "Uyum", "Degerler"],
        element: "Hava",
        planet: "Venus",
        general: "Asiklar, secimi, aski, birlesmeyı ve degerelere dayali karar vermeyi temsil eder. Bu enerji, kalbin sesi ile aklin sesi arasinda denge kurmak ve dogru secimleri yapmakla ilglidir.",
        positive: ["Derin ask kapasitesi", "Degerlere dayali kararlar", "Uyum yaratma", "Birlesitirici enerji", "Kalp merkezli yasam", "Estetik duyarlilik"],
        negative: ["Karar verememe", "İliskilerde yuzeysellik", "Sorumluluktan kacma", "Bagimli iliskiler", "Degerlerden uzaklasma"],
        inPath: "Ask ve iliskilerle yonlenen, secimlerini kalple yapan kisi. Guzellik ve uyum arayan, birlesitirici enerjiye sahip.",
        inAchievement: "Bu donemde iliskileri uyumlastirmak, deger odakli secimler yapmak ve ask enerjisini yonlendirmek bekleniyor.",
        inKarmic: "Secim yapamama, iliski karmalari veya secenekler arasinda kalma karmik engeliniz. Kalbinizin sesini dinleyerek kararlı adimlar atmayi ogrenmeniz gereken ders.",
        inCenter: "Yasam boyu ask, iliskiler ve secim temaniz. Dogru secimleri kalple yapmak ve uyumlu iliskileri kurmak ana goreviniz."
    },
    7: {
        name: "Araba (Zafer)",
        tarot: "The Chariot",
        keywords: ["Zafer", "Irade", "Hareket", "Hirss", "Kararlilik"],
        element: "Su",
        planet: "Ay/Mars",
        general: "Araba, irade gucu ile kazanilan zaferi, hareketi, hirsi ve kararaliligi temsil eder. Bu enerji, engelleri asarak hedeflere ulasmak ve surekli ilerlemeyle ilgilidir.",
        positive: ["Guclu irade", "Kararlilik", "Hedef odaklilik", "Engelleri asma yetenegı", "Dinamizm", "Basari hirsi"],
        negative: ["Pervasizlik", "Saldirganlik", "Her ne pahasina olursa olsun kazanma", "Dikkatsizlik", "Enerji dagınikligi"],
        inPath: "Dinamik, hırsli ve surekli hareket halinde olan kisilik. İlerlemeye ve hedeflere odakli. Engelleri azimle asan yapida.",
        inAchievement: "Bu donemde zafer kazanmak, engelleri asmak ve kararlı adimlar atmak bekleniyor. Harekete gecme ve somut sonuclar elde etme zamani.",
        inKarmic: "Dagınık enerji, yon kontrolu yapamama veya saldirganlik karmik engeliniz. Gucunuzu kontrollü ve dengeli kullanmayı ogrenmek gereken ders.",
        inCenter: "Yasam boyu irade, hareket ve zafer temaniz. Engellerin ustesinden gelip yasam yolunuzda ilerlemeniz ana goreviniz."
    },
    8: {
        name: "Adalet (Denge)",
        tarot: "Justice",
        keywords: ["Karma", "Denge", "Adalet", "Yasa", "Hakikat"],
        element: "Hava",
        planet: "Saturh",
        general: "Adalet, karmik dengeyi, adaletleri, yasalari ve hakikati temsil eder. Bu enerji, neden-sonuc iliskisini anlamak ve her eylemin kacinilmaz sonuclarıyla yuzlesmek ile ilgilidir.",
        positive: ["Guclu adalet duygusu", "Durst ve analitik zeka", "Dengelilik", "Sorumluluk bilinci", "Objektiflik", "Etik yaklasim"],
        negative: ["Yargilayici tutum", "Duygusal sogutluk", "Affetme zorulugu", "Asiri elestrirellik", "Katı kuralcilik"],
        inPath: "Güçlü adalet duygusu olan, analitik ve dürüst kisilik. Dengeyi ve dogrulugu arayan, etik degerlere bgli.",
        inAchievement: "Bu donemde adalet saglamak, dengeyi bulmak ve hakikati ortaya cıkarmak bekleniyor. Hukuki ve etik konularda gelisim donemı.",
        inKarmic: "Adaletsizlik yasama (karmik geri donus), hukuki sorunlar veya affetme zorlugu karmik engeliniz. Karmik dengenizi yeniden kurmakla gorevlisiniz.",
        inCenter: "Yasam boyu adalet, denge ve karma temaniz. Etik yasam surmek ve her eylemin sorumluluugnu almak ana goreviniz."
    },
    9: {
        name: "Erenis (Munzevi)",
        tarot: "The Hermit",
        keywords: ["Yalnizlik", "Ic arayis", "Bilgelik", "Icsel yolculuk", "Rehberlik"],
        element: "Toprak",
        planet: "Merkur/Saturh",
        general: "Munzevi, yalnizligi, ic arayisi, bilgeligi ve icsel yolculugu temsil eder. Bu enerji, disaridan iceriye donmek, derinlesmek ve biregysellesmis bilgeligi bulmakla ilgilidir.",
        positive: ["Derin bilgelik", "Ic gozlem yetenegı", "Sabir", "Rehberlik", "Bagımsız dusuunnce", "Manevi derinlik"],
        negative: ["Asiri izolasyon", "İnsanlardan kacis", "Misantroplik egilimler", "Yardim kabul etmeme", "Toplumdan kopukluk"],
        inPath: "Icine donuk, bilge ve derinlikli kisilik. Yalnizligi seven, kendi ic dunyasinda zengin bir yasam suren, dogal rehber.",
        inAchievement: "Bu donemde ic bilgeligi bulmak, tek basina yolculuklara cikmak ve baskalarina rehberlik etmek bekleniyor.",
        inKarmic: "Izolasyon, yalnızlık korkusu veya ic arayistan kacma karmik engeliniz. İceriye donmek cesaret ister ve bu cesareti bulmak goereviniz.",
        inCenter: "Yasam boyu ic bilgelik ve rehberlik temaniz. Icsel arayisi tamamlayip baskalarina ısık tutmak ana goreviniz."
    },
    10: {
        name: "Kader Carki (Donusum)",
        tarot: "Wheel of Fortune",
        keywords: ["Donguler", "Kader", "Sans", "Donm noktalari", "Degisim"],
        element: "Ates",
        planet: "Jupiter",
        general: "Kader Carki, yasam dongulerini, kaderi, sansi ve donunn noktalarini temsil eder. Bu enerji, degisimin kacinilmazligini kabul etmek ve yasam donguleriyytle uyum icinde akmakla ilgilidir.",
        positive: ["Uyum kabiliyeti", "Sansin farkndaligi", "Donguuleri anlama", "Degisime acıklik", "Gelisim odaklılık", "Firsatlari gorman"],
        negative: ["İstikrarsizlik", "Sansa bagimlilik", "Kararsizlik", "Kurban zihniyeti", "Baglanma zorlugu"],
        inPath: "Degisimlerle dolu bir yasam, uyumlu, akisla giden kisilik. Dönüm noktalarinda dogru kararlari verebilen, esnek yapida.",
        inAchievement: "Bu donemde degisimleri kucaklamak, donguyelri anlamak ve firsatlari degerlendirmek bekleniyor.",
        inKarmic: "Gerekli degisimlere direnmek, sansa bagimlilik veya kurban zihniyeti karmik engeliniz. Degisimi kabul etmek ve aktif olarak yonlendirmek gorevıniz.",
        inCenter: "Yasam boyu degişim, dongüler ve evrim temanız. Degisimi kucaklyıp her donguden bilgelik çıkarmak ana goreviniz."
    },
    11: {
        name: "Guc (Ic Guc)",
        tarot: "Strength",
        keywords: ["İc guc", "Cesaret", "Sabir", "Icguduleri yonetme", "Merhamet"],
        element: "Ates",
        planet: "Gunes/Pltuo",
        general: "Guc, ic kuvveti, cesareti, sabri ve icgüdüleri sevgiyle yonetmeyi temsil eder. Bu enerji, brute force degil, icsel güç ve sabırla engelleri asmkla ilgilidir.",
        positive: ["Derin ic guc", "Cesaret", "Sabir", "Catismaları zarftle cözme", "Merhamet", "Dayanıklılık"],
        negative: ["Baskılanmis ofke", "Korku", "Guc istismari", "Zayıflik", "Icgüdüleri bastirma"],
        inPath: "Guclu, sabırlı ve cesaretli kisilik. Catismaları zarafetl çözen, ic güce dayanan yapida.",
        inAchievement: "Bu donemde ic gücünüzü kesfetmek, sabırla engelleri asmak ve icgudulerinizle barısmak bekleniyor.",
        inKarmic: "Bastırılmış ofke, korku veya guc kötüye kullanımı karmik engliniz. İçsel gücünüzü sevgiyle kullanmayı ögrenmek göreviiz.",
        inCenter: "Yasam boyu ic güc, cesaret ve sabır temaniz. Icgudülerinizi sevgiyle yönetmek ve gerçek güce ulasmak ana gorevniz."
    },
    12: {
        name: "Asilan Adam (Fedakarlik)",
        tarot: "The Hanged Man",
        keywords: ["Fedakarlık", "Yeni bkis acisi", "Bırakma", "Askıda kalma", "Ruhani büyüme"],
        element: "Su",
        planet: "Neptun",
        general: "Asılan Adam, fedakarligi, yeni perspektifleri, birakmayi ve ruhani büyümyei temsil eder. Bu enerji, alısılmışın dışına çıkmak, eski kalıpları bırakmak ve farklı açıdan bakmakla ilgilidir.",
        positive: ["Farklı perspektif", "Fedakarlık yeteneği", "Ruhani derinlik", "Bırakabilme", "Yaratıcı çözümler", "Sabır"],
        negative: ["Kurban kompleksi", "Bırakamama", "Durgunluk", "Acı yoluyla manipülasyon", "Pasiflik"],
        inPath: "Dünyayı farklı gören, fedakar, sıra dışı kişilik. Geleneksel olmayan bakış açısına sahip, ruhani derinliği olan.",
        inAchievement: "Bu dönemde eski kalıpları bırakmak, yeni perspektifler kazanmak ve fedakarlık yoluyla büyümek bekleniyor.",
        inKarmic: "Kurban kompleksi, bırakamama veya durgunluk karmik engeliniz. Bilinçli fedakarlık ile kurban rolü arasındaki farkı öğrenmek göreviniz.",
        inCenter: "Yaşam boyu bakış açısı değişikliği ve manevi büyüme temanız. Eski paradigmaları bırakıp yeni perspektifler kazanmak ana göreviniz."
    },
    13: {
        name: "Ölüm (Dönüşüm)",
        tarot: "Death",
        keywords: ["Dönüşüm", "Son", "Yeniden doğuş", "Köklü değişim", "Eski olanı bırakma"],
        element: "Su",
        planet: "Pluto",
        general: "Ölüm arkani, köklü dönüşümü, sonlanmaları ve yeniden doğuşu temsil eder. Bu enerji, eski olanın ölmesi ve yeninin doğması gereken kaçınılmaz değişim sürecini simgeler.",
        positive: ["Köklü dönüşüm kapasitesi", "Değişimden korkmama", "Yenilenme gücü", "Temizleme ve arınma", "Derinlik ve yoğunluk"],
        negative: ["Değişim korkusu", "Geçmişe takılma", "Yıkıcı kalıplar", "Nihilizm", "Acımasızlık"],
        inPath: "Derin dönüşüm insanı. Değişimden korkmayan, yoğun ve gizemli kişilik. Yaşamda büyük değişimler deneyimleyen.",
        inAchievement: "Bu dönemde radikal dönüşüm, eski kalıpların sona ermesi ve yeniden doğuş bekleniyor. Cesaretli değişim zamanı.",
        inKarmic: "Değişim korkusu, geçmişe bağlılık veya yıkıcı kalıplar karmik engeliniz. Bırakmayı ve dönüşümü kucaklamayı öğrenmek göreviniz.",
        inCenter: "Yaşam boyu dönüşüm ve yenilenme temanız. Eski olanı bilinçli olarak sonlandırıp yeniye yer açmak ana göreviniz."
    },
    14: {
        name: "Ölçülülük (Denge)",
        tarot: "Temperance",
        keywords: ["Denge", "Ölçülülük", "Sabır", "Şifa", "Uyumlu harmanlama"],
        element: "Ateş",
        planet: "Jüpiter/Sagittarius",
        general: "Ölçülülük, dengeyi, ılımlılığı, sabrı ve şifayı temsil eder. Bu enerji, zıtlıkları uyumlu bir şekilde birleştirmek ve orta yolu bulmakla ilgilidir.",
        positive: ["Denge ve uyum", "Şifa yeteneği", "Sabır", "Arabuluculuk", "Ölçülülük", "Uyum yaratma"],
        negative: ["Aşırı uzlaşma", "Kimlik kaybı", "Kararsızlık", "Aşırılıklar arasında sallanma", "Kayıtsızlık"],
        inPath: "Dengeli, ılımlı ve şifa edici kişilik. İyi bir arabulucu, sabırlı ve uyumlu.",
        inAchievement: "Bu dönemde denge bulmak, zıtlıkları birleştirmek ve şifa süreçlerine odaklanmak bekleniyor.",
        inKarmic: "Aşırılıklar, dengesizlik veya orta yolu bulamama karmik engeliniz. Dengeyi öğrenmek ve uygulamak göreviniz.",
        inCenter: "Yaşam boyu denge, ölçülülük ve şifa temanız. Her alanda orta yolu bulup uyum yaratmak ana göreviniz."
    },
    15: {
        name: "Şeytan (Bağlılık)",
        tarot: "The Devil",
        keywords: ["Maddecilik", "Bağımlılık", "Gölge benlik", "Dünyevi arzular", "Zincirler"],
        element: "Toprak",
        planet: "Satürn",
        general: "Şeytan, maddi dünyanın cazibesini, bağımlılıkları, gölge benliği ve kişiyi zincirleyen dünyevi arzuları temsil eder. Bu enerji, karanlık tarafla yüzleşme ve ondan özgürleşme sürecini simgeler.",
        positive: ["Karizmatik çekim gücü", "Maddi dünyada ustalık", "Duyusal deneyim zenginliği", "Gölge benliğin farkındalığı", "Güçlü tutku"],
        negative: ["Bağımlılıklar", "Toksik ilişkiler", "Maddecilik", "Manipülasyon", "Arzulara kölelik"],
        inPath: "Karizmatik, manyetik, maddi dünyaya çekilmiş kişilik. Güçlü tutkular ve duyusal deneyimler arayan.",
        inAchievement: "Bu dönemde maddi dünyayla sağlıklı ilişki kurmak, bağımlılıklardan kurtulmak ve gölge benliği tanımak bekleniyor.",
        inKarmic: "Bağımlılıklar, toksik ilişkiler veya maddeciliğe kölelik karmik engeliniz. Özgürleşmek ve maddi dünyayı köle olmadan deneyimlemek göreviniz.",
        inCenter: "Yaşam boyu bağımlılık ve özgürleşme temanız. Dünyevi zevklere takılmadan, gölge benliğinizle barışıp özgürleşmek ana göreviniz."
    },
    16: {
        name: "Kule (Yıkım ve Yenilenme)",
        tarot: "The Tower",
        keywords: ["Ani yıkım", "Sarsıntı", "Keşif", "Sahte yapıların yıkılması", "Özgürleşme"],
        element: "Ateş",
        planet: "Mars",
        general: "Kule, ani yıkımı, sarsıntıyı, sahte yapıların çökmesini ve zorunlu özgürleşmeyi temsil eder. Bu enerji, gerçeğe dayanmayan her şeyin yıkılıp gerçek temeller üzerine yeniden inşa edilmesini simgeler.",
        positive: ["Gerçeği görme cesareti", "Sahte yapılardan kurtulma", "Devrimci düşünce", "Yenilenme gücü", "Özgünlük"],
        negative: ["Kendini yıkma", "Kaos", "Yeniden inşa edememe", "Yıkıcı davranışlar", "Şok ve travma"],
        inPath: "Ani değişimlerle dolu yaşam. Devrimci, ikonoklast, sıra dışı kişilik. Kalıpları kıran ve gerçeği ortaya çıkaran.",
        inAchievement: "Bu dönemde sahte yapıları yıkmak, gerçeği bulmak ve enkaz üzerinde yeniden inşa etmek bekleniyor.",
        inKarmic: "Karmik ders olarak felaket niteliğinde olaylar, gerekli yıkıma direnme veya sahte güvenlik arayışı. Gerçek temeller üzerine inşa etmeyi öğrenmek göreviniz.",
        inCenter: "Yaşam boyu yıkım ve yeniden inşa temanız. Sahte yapıları yıkıp gerçek üzerine inşa etmek ana göreviniz."
    },
    17: {
        name: "Yıldız (Umut)",
        tarot: "The Star",
        keywords: ["Umut", "İlham", "Maneviyat", "Yaratıcılık", "Kozmik bağlantı"],
        element: "Hava",
        planet: "Uranüs",
        general: "Yıldız, umudu, ilhamı, manevi bağlantıyı ve yaratıcı ifadeyi temsil eder. Bu enerji, karanlıktan sonra gelen ışığı, kozmik rehberliği ve ruhani güzelliği simgeler.",
        positive: ["Güçlü umut ve ilham", "Manevi bağlantı", "Sanatsal yaratıcılık", "Şifa enerjisi", "Kozmik farkındalık", "İyimserlik"],
        negative: ["Saflık", "Gerçekçi olmayan beklentiler", "Hayal kırıklığı", "Gerçeklikten kopukluk", "Aşırı idealizm"],
        inPath: "İlhamlı, umut dolu, sanatsal ve manevi derinliği olan kişilik. Yüksek alemlere bağlı, yaratıcı ve şifacı.",
        inAchievement: "Bu dönemde ilham kaynağı olmak, manevi bağlantıyı güçlendirmek ve yaratıcı ifadeyi geliştirmek bekleniyor.",
        inKarmic: "Umut kaybı, amaçtan kopukluk veya hayal kırıklığı karmik engeliniz. Umudu yeniden bulmak ve ilhamla yaşamak göreviniz.",
        inCenter: "Yaşam boyu umut, ilham ve manevi bağlantı temanız. İnsanlara umut ve ilham vermek ana göreviniz."
    },
    18: {
        name: "Ay (Yanılma)",
        tarot: "The Moon",
        keywords: ["Yanılsama", "Korkular", "Bilinçaltı", "Rüyalar", "Sezgi"],
        element: "Su",
        planet: "Ay/Neptün",
        general: "Ay, yanılsamaları, korkuları, bilinçaltını, rüyaları ve derin sezgiyi temsil eder. Bu enerji, gölgelerle ve bilinmeyenle yüzleşme, gerçek ile yanılsama arasını ayırt etme sürecini simgeler.",
        positive: ["Güçlü sezgi", "Rüya ve vizyon yeteneği", "Zengin hayal gücü", "Bilinçaltı bilgeliği", "Psişik yetenekler"],
        negative: ["Paranoya", "Yanılsamalar", "Korkular ve fobiler", "Aldanma", "Kaçışçılık"],
        inPath: "Aşırı hassas, hayal gücü zengin, korkularına ve yanılsamalarına yatkın kişilik. Derin sezgisel yeteneklere sahip.",
        inAchievement: "Bu dönemde bilinçaltını keşfetmek, korkuları aşmak ve psişik yetenekleri geliştirmek bekleniyor.",
        inKarmic: "Fobiler, aldanma (kendine ve başkalarına), ruhsal sağlık zorlukları karmik engeliniz. Gerçek ile yanılsama arasını ayırt etmeyi öğrenmek göreviniz.",
        inCenter: "Yaşam boyu bilinçaltı, korkular ve sezgi temanız. Gölgelerle barışıp sezgisel bilgeliği geliştirmek ana göreviniz."
    },
    19: {
        name: "Güneş (Başarı)",
        tarot: "The Sun",
        keywords: ["Sevinç", "Başarı", "Canlılık", "Netlik", "Bolluk"],
        element: "Ateş",
        planet: "Güneş",
        general: "Güneş, sevinci, başarıyı, canlılığı, netliği ve bolluğu temsil eder. Bu enerji, yaşam enerjisinin tam ifadesini, otantik parlamayı ve gerçek mutluluğu simgeler.",
        positive: ["Sevinç ve mutluluk", "Doğal başarı", "Karizmatik enerji", "Canlılık", "Netlik", "Bolluk ve bereket"],
        negative: ["Ego şişmesi", "Kibirlilik", "Tükenmişlik", "Yüzeysellik", "Mutluluk bulamama"],
        inPath: "Neşeli, karizmatik, başarılı ve ışıltılı kişilik. Çevresine enerji veren, parlak ve canlı.",
        inAchievement: "Bu dönemde parlamak, başarıya ulaşmak ve otantik sevinci yaşamak bekleniyor. Doğal yeteneklerinizin meyve verme zamanı.",
        inKarmic: "Ego enflasyonu, mutluluk bulamama veya engellenmiş sevinç karmik engeliniz. Gerçek ve kalıcı sevinci bulmayı öğrenmek göreviniz.",
        inCenter: "Yaşam boyu sevinç, başarı ve parlaklık temanız. Otantik şekilde parlamak ve çevrenize ışık saçmak ana göreviniz."
    },
    20: {
        name: "Yargı (Uyanış)",
        tarot: "Judgement",
        keywords: ["Yeniden doğuş", "Çağrı", "Değerlendirme", "Aile karması", "Uyanış"],
        element: "Ateş",
        planet: "Plüton",
        general: "Yargı, yeniden doğuşu, yüksek bir amaca çağrılmayı, geçmişin değerlendirilmesini ve aile karmasını temsil eder. Bu enerji, ruhani uyanış ve geçmişle hesaplaşma sürecini simgeler.",
        positive: ["Ruhani uyanış", "Çağrıya cevap verme", "Aile karmasını çözme", "Yeniden doğuş", "Yüksek bilinç"],
        negative: ["Öz yargılama", "Geçmişte yaşama", "Dönüşümü reddetme", "Çağrıyı duymama", "Suçluluk"],
        inPath: "Yüksek bir amaca çağrılmış, ailevi temalarla bağlantılı kişilik. Ruhani uyanış sürecinde olan.",
        inAchievement: "Bu dönemde ruhani uyanış, aile karmasının çözümü ve yüksek amaca cevap vermek bekleniyor.",
        inKarmic: "Çözülmemiş aile karması, çağrıyı reddetme veya sert öz yargılama karmik engeliniz. Geçmişi affedip ileriye bakmayı öğrenmek göreviniz.",
        inCenter: "Yaşam boyu uyanış, aile karması ve yüksek çağrı temanız. Ruhani olarak uyanmak ve aile karmasını çözmek ana göreviniz."
    },
    21: {
        name: "Dünya (Bütünlük)",
        tarot: "The World",
        keywords: ["Tamamlanma", "Bütünlük", "Başarı", "Entegrasyon", "Kozmik bilinç"],
        element: "Toprak",
        planet: "Satürn",
        general: "Dünya, tamamlanmayı, bütünlüğü, başarıyı, entegrasyonu ve kozmik bilinci temsil eder. Bu enerji, bir döngünün tamamlanmasını, bütünleşmeyi ve evrensel perspektifi simgeler.",
        positive: ["Tamamlanma hissi", "Bütüncül bakış", "Küresel perspektif", "Ustalık", "Entegrasyon", "Evrensel bilinç"],
        negative: ["Tamamlama korkusu", "Başladığını bitirememe", "Eksiklik hissi", "Yeniye başlama isteksizliği", "Durgunluk"],
        inPath: "Çok yönlü, tamamlanmış, kozmopolit kişilik. Bütüncül bakış açısına sahip, dünya vatandaşı.",
        inAchievement: "Bu dönemde bütünlüğe ulaşmak, döngüleri tamamlamak ve küresel perspektif geliştirmek bekleniyor.",
        inKarmic: "Tamamlayamama, eksiklik hissi veya başladığını bitirememe karmik engeliniz. Bütünlüğe ulaşmayı ve döngüleri kapatmayı öğrenmek göreviniz.",
        inCenter: "Yaşam boyu bütünlük, tamamlanma ve entegrasyon temanız. Tüm parçaları birleştirip bütünlüğe ulaşmak ana göreviniz."
    },
    22: {
        name: "Deli (Özgürlük)",
        tarot: "The Fool",
        keywords: ["Yeni başlangıç", "Özgürlük", "Spontanlık", "İnanç", "Bilinmeyene atılma"],
        element: "Hava",
        planet: "Uranüs",
        general: "Deli, yeni başlangıçları, özgürlüğü, spontanlığı, inancı ve bilinmeyene atılmayı temsil eder. Bu enerji, saf potansiyeli, sınırsız olasılıkları ve çocuksu güveni simgeler.",
        positive: ["Sınırsız özgürlük", "Yeni başlangıçlar", "Çocuksu saflık", "Cesaret", "Yaratıcı spontanlık", "Evrene güven"],
        negative: ["Sorumsuzluk", "Aptallık", "Taahhüt korkusu", "Kaos", "Olgunlaşamama"],
        inPath: "Özgür ruh, sıra dışı, çocuksu, maceracı kişilik. Geleneklere uymayan, kendi yolunu çizen.",
        inAchievement: "Bu dönemde özgürlüğü kucaklamak, yeni başlangıçlara cesaret etmek ve evrene güvenmek bekleniyor.",
        inKarmic: "Sorumsuzluk, aptallık, bilinmezlik korkusu veya kaos karmik engeliniz. Özgürlük ile sorumluluk arasında denge kurmayı öğrenmek göreviniz.",
        inCenter: "Yaşam boyu özgürlük, spontanlık ve yeni başlangıçlar temanız. İnanç sıçrayışı yapmayı ve özgürce yaşamayı öğrenmek ana göreviniz."
    }
};
