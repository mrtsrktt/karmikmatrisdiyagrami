// ============================================================
// 22 enerji için Gizem tonunda sağlık yorumları üret
// ============================================================
// lib/health-by-energy.js'i okur, her enerji için 2-3 cümlelik
// bağlayıcı yorum üretir, dosyayı günceller.
//
// Çalıştırma: node --env-file=.env scripts/generate-health-interpretations.js
// ============================================================

import { readFile, writeFile } from 'node:fs/promises';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import Anthropic from '@anthropic-ai/sdk';

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = resolve(__dirname, '..');
const targetFile = resolve(projectRoot, 'lib', 'health-by-energy.js');

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
const MODEL = 'claude-sonnet-4-6';

// Dynamically import the data
const { HEALTH_BY_ENERGY } = await import(`file:///${targetFile.replace(/\\/g, '/')}`);

console.log(`✓ ${Object.keys(HEALTH_BY_ENERGY).length} enerji yüklendi`);

const SYSTEM_PROMPT = `Sen geleneksel karmik ezoterik bilgide uzmanlaşmış bir Türkçe metin editörüsün. Sana bir Büyük Arkana sayısının (1-22 arası) sağlık yatkınlıkları kategorik liste olarak verilecek. Senin görevin bu listeyi 2-3 cümlelik akıcı bir Türkçe paragrafa dönüştürmek.

# Kurallar
1. **Müşteriye doğrudan hitap et** — "siz/sizin" diliyle. ASLA "danışan", "kişi", "bir insan" deme.
2. **Sıcak ve samimi ton** — Tıbbi rapor değil, ezoterik sıcak yorum.
3. **2-3 cümle** — Çok kısa olmasın, çok uzun da olmasın.
4. **Kategorileri sentezle** — Madde madde sayma; akıcı bir paragraf yap.
5. **Sembolik bağlam ekle** — Sayının arkana adı/anlamıyla sağlık temasını birleştir.
6. **Pratik öneri** — Cümlenin sonuna küçük bir yumuşak öneri (örn. "su tüketimine, bedensel hareketinize, sebze ağırlıklı beslenmeye dikkat etmeniz...") koy.
7. **ASLA tıbbi tavsiye verme** — "Tedavi", "iyileşir", "şifa olur" gibi iddialı ifadeler YOK. "...işaret edebilir", "...dikkat etmenizde fayda var", "...zorlanan alan olabilir" gibi yumuşak ifadeler kullan.
8. **Asla isim/marka kullanma** — Hiçbir kişi adı, marka veya kurum adı geçirme.
9. **Tamamen Türkçe** — Azerice/yabancı dil karışımı yok.

# Çıktı Formatı
Sadece <interpretation>...</interpretation> tagı içinde paragrafı geri dön. Başka açıklama yapma.

Örnek girdi:
<input>
  <number>14</number>
  <name>Ölçülülük</name>
  <categories>
    Fiziksel: Obezite, Karaciğer sorunları, Safra kesesi, Sıvı tutulumu
    Duygusal: Saldırganlık, Korkular, Kızgınlıklar
    Sindirim: Kabızlık, İshal, Ülser
  </categories>
</input>

Örnek çıktı:
<interpretation>
14 enerjisi sizde aktif olduğunda, bedeniniz "aşırılık" ve "denge eksikliği" temasıyla karşılaştığı için en hızlı zorlanan alanlar karaciğer, safra kesesi ve sıvı dengeniz olur. Ölçülülük kartıdır 14 — sizden hayatın her alanında ortayı bulmanızı ister; bu ortayı bulamadığınızda beden de sıvı tutulumu, sindirim huzursuzluğu ve duygusal patlamalarla bunu size hatırlatır. Sebze ağırlıklı beslenme, düzenli su tüketimi ve günlük detoks ritüelleri sizin için iyi gelir.
</interpretation>`;

function buildUserMessage(num, data) {
  const lines = [];
  lines.push('<input>');
  lines.push(`  <number>${num}</number>`);
  lines.push(`  <name>${data.name}</name>`);
  lines.push('  <categories>');
  for (const [cat, items] of Object.entries(data.categories)) {
    lines.push(`    ${cat}: ${items.join(', ')}`);
  }
  lines.push('  </categories>');
  lines.push('</input>');
  return lines.join('\n');
}

async function generateInterpretation(num, data) {
  const userMessage = buildUserMessage(num, data);
  const message = await client.messages.create({
    model: MODEL,
    max_tokens: 800,
    system: SYSTEM_PROMPT,
    messages: [{ role: 'user', content: userMessage }]
  });
  const text = message.content.filter(b => b.type === 'text').map(b => b.text).join('\n');
  const m = text.match(/<interpretation>([\s\S]*?)<\/interpretation>/i);
  if (!m) throw new Error(`No <interpretation> tag in response: ${text.substring(0, 200)}`);
  return { text: m[1].trim(), usage: message.usage };
}

console.log('\n=== Sağlık yorumları üretiliyor ===\n');

const interpretations = {};
let totalIn = 0, totalOut = 0;

for (let num = 1; num <= 22; num++) {
  const data = HEALTH_BY_ENERGY[num];
  if (!data) continue;
  const start = Date.now();
  try {
    const result = await generateInterpretation(num, data);
    interpretations[num] = result.text;
    totalIn += result.usage.input_tokens;
    totalOut += result.usage.output_tokens;
    const elapsed = ((Date.now() - start) / 1000).toFixed(1);
    console.log(`✓ ${String(num).padStart(2)}/22 ${data.name.padEnd(20)} ${elapsed}s (${result.text.length} char)`);
  } catch (err) {
    console.log(`✗ ${String(num).padStart(2)}/22 ${data.name} HATA: ${err.message}`);
    interpretations[num] = null;
  }
}

console.log(`\nToplam token: in=${totalIn}, out=${totalOut}`);
console.log(`Tahmini maliyet: ~$${((totalIn / 1e6 * 3) + (totalOut / 1e6 * 15)).toFixed(3)}`);

// Read source file and inject interpretations
const sourceCode = await readFile(targetFile, 'utf-8');

let updated = sourceCode;
for (const [num, text] of Object.entries(interpretations)) {
  if (!text) continue;
  // Escape for JS string literal
  const escaped = text.replace(/\\/g, '\\\\').replace(/'/g, "\\'").replace(/\n/g, '\\n');
  // Find the entry for this num and replace its interpretation: null
  const re = new RegExp(`(\\b${num}:\\s*\\{[\\s\\S]*?interpretation:\\s*)null`, 'm');
  updated = updated.replace(re, `$1'${escaped}'`);
}

await writeFile(targetFile, updated, 'utf-8');
console.log(`\n✓ ${targetFile} güncellendi`);

// Quick verify
const verifyMod = await import(`file:///${targetFile.replace(/\\/g, '/')}?t=${Date.now()}`);
const filled = Object.values(verifyMod.HEALTH_BY_ENERGY).filter(e => e.interpretation).length;
console.log(`✓ ${filled}/22 yorum dosyaya yazıldı`);
