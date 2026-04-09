// ============================================================
// arcana-data.js TON DÜZELTME SCRIPT'İ
// ============================================================
// arcana-data.js'deki tüm 22 arkana açıklamasını
// "danışmana hitap eden 3. tekil şahıs" anlatımından
// "doğrudan müşteriye hitap eden 2. tekil şahıs" anlatımına çevirir.
//
// Ayrıca POSITION_INFO'nun meaning alanlarını da düzeltir.
//
// Çalıştırmak için:
//   node --env-file=.env scripts/rewrite-arcana-tone.js
// ============================================================

import { readFile, writeFile, copyFile } from 'node:fs/promises';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import vm from 'node:vm';
import Anthropic from '@anthropic-ai/sdk';

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = resolve(__dirname, '..');

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
const MODEL = 'claude-sonnet-4-6';

// ----- Step 1: Load arcana-data.js into a sandboxed context -----
const sourcePath = resolve(projectRoot, 'arcana-data.js');
const sourceCode = await readFile(sourcePath, 'utf-8');

// Append code to expose const declarations on the sandbox (since
// `const` is scoped to the script, we need explicit assignment to `this`).
const wrappedCode = sourceCode + `
;
this.ARCANA_NAMES = typeof ARCANA_NAMES !== 'undefined' ? ARCANA_NAMES : null;
this.ARCANA_TAROT_NAMES = typeof ARCANA_TAROT_NAMES !== 'undefined' ? ARCANA_TAROT_NAMES : null;
this.POSITION_INFO = typeof POSITION_INFO !== 'undefined' ? POSITION_INFO : null;
this.ARCANA_DETAILS = typeof ARCANA_DETAILS !== 'undefined' ? ARCANA_DETAILS : null;
`;

const sandbox = {};
vm.createContext(sandbox);
vm.runInContext(wrappedCode, sandbox);

const ARCANA_NAMES       = sandbox.ARCANA_NAMES;
const ARCANA_TAROT_NAMES = sandbox.ARCANA_TAROT_NAMES;
const POSITION_INFO      = sandbox.POSITION_INFO;
const ARCANA_DETAILS     = sandbox.ARCANA_DETAILS;

if (!ARCANA_DETAILS || Object.keys(ARCANA_DETAILS).length !== 22) {
  throw new Error(`Beklenen 22 arkana bulunamadı, bulunan: ${Object.keys(ARCANA_DETAILS || {}).length}`);
}

console.log(`✓ arcana-data.js yüklendi: ${Object.keys(ARCANA_DETAILS).length} arkana`);

// ----- Step 2: Backup original -----
const backupPath = resolve(projectRoot, 'arcana-data.js.backup');
await copyFile(sourcePath, backupPath);
console.log(`✓ Backup: ${backupPath}`);

// ============================================================
// SİSTEM PROMPTU (ton düzeltme için)
// ============================================================
const REWRITE_SYSTEM_PROMPT = `Sen Türkçe metin editörsün. Sana karmik numeroloji ve Büyük Arkana açıklamaları verilecek. Bu metinler şu an "danışmana yardım eden 3. tekil şahıs" anlatımıyla yazılmış. Senin görevin bunları "doğrudan müşteriye hitap eden 2. tekil şahıs (siz/sizin)" anlatımına çevirmek.

# Ton Kuralları (MUTLAK)

1. **Daima 2. tekil şahıs**: "Sizde", "Sizin", "Siz", "şöyle hissedersiniz", "böyle yaşarsınız" gibi. ASLA "danışanınız", "danışan", "o kişi", "bu insan", "bir kişi" KULLANMA.

2. **"Danışanınıza söyleyin/önerin/anlatın" → doğrudan tavsiye**:
   - "Danışanınıza şunu önerin: her sabah meditasyon yapsın" → "Her sabah meditasyon yapın"
   - "Ona şöyle anlatabilirsiniz: 'Sizde X enerjisi var'" → "Sizde X enerjisi var"
   - "Danışanınız bunu hissedebilir" → "Bunu hissedebilirsiniz"

3. **Anlamı KORU**. Sadece anlatım yönünü değiştir. Hiçbir bilgiyi atma, hiçbir ekleme yapma. Aynı içerik, farklı kalıp.

4. **Sıcak ve samimi**. Doğrudan ama yumuşak. Profesyonel ama dostane. Gizem Şule Mert'in danışan analizleri tonunda.

5. **Tamamen Türkçe**. Hiçbir Azerice/Türkmence karışımı yok. Akıcı, doğal Türkçe.

6. **Üçüncü şahıs örnek tırnakları**: Bazı metinlerde "Ona şöyle anlatabilirsiniz: '...'" şeklinde tırnak içi alıntılar var. Bu tırnakları AÇ ve direkt anlatımla yaz. Tırnak içindeki cümleyi de "siz" ile yaz.

7. **Madde listelerinde aynı kalıba sadık kal**. Liste maddesi geldiyse liste maddesi geri ver. Cümle başlangıçları emir/öneri biçiminde olsun (örn. "Her gün 10 dakika...", "Şunu deneyin...", "Size şunu öneriyorum...").

# Çıktı Formatı

Sana XML içinde alanlar geleceğin. Aynı XML yapısıyla, aynı tag isimleriyle, içeriği yeniden yazılmış olarak geri dön. Hiçbir açıklama yapma, sadece XML döndür.

Örnek:
<input>
  <general>Büyücü, kişinin yaratıcı potansiyelini temsil eder. Bu kişiler doğal liderdir.</general>
</input>

<output>
  <general>Sizde Büyücü enerjisi var ve bu yaratıcı potansiyelinizi temsil ediyor. Doğal bir lider ruhuna sahipsiniz.</general>
</output>`;

// ============================================================
// XML serialize/parse helpers
// ============================================================
function escapeXml(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function unescapeXml(s) {
  return String(s)
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&');
}

function buildArcanaInputXML(arcana) {
  const lines = ['<arcana>'];
  lines.push(`  <general>${escapeXml(arcana.general)}</general>`);
  lines.push(`  <inPath>${escapeXml(arcana.inPath)}</inPath>`);
  lines.push(`  <inAchievement>${escapeXml(arcana.inAchievement)}</inAchievement>`);
  lines.push(`  <inKarmic>${escapeXml(arcana.inKarmic)}</inKarmic>`);
  lines.push(`  <inCenter>${escapeXml(arcana.inCenter)}</inCenter>`);
  if (arcana.consultantNote) {
    lines.push(`  <consultantNote>${escapeXml(arcana.consultantNote)}</consultantNote>`);
  }
  if (Array.isArray(arcana.practicalSolutions) && arcana.practicalSolutions.length) {
    lines.push('  <practicalSolutions>');
    for (const item of arcana.practicalSolutions) {
      lines.push(`    <item>${escapeXml(item)}</item>`);
    }
    lines.push('  </practicalSolutions>');
  }
  if (arcana.detailedReading) {
    lines.push(`  <detailedReading>${escapeXml(arcana.detailedReading)}</detailedReading>`);
  }
  lines.push('</arcana>');
  return lines.join('\n');
}

function extractTag(text, tag) {
  const re = new RegExp(`<${tag}>([\\s\\S]*?)<\\/${tag}>`, 'i');
  const m = text.match(re);
  return m ? unescapeXml(m[1].trim()) : null;
}

function extractItems(text) {
  const re = /<item>([\s\S]*?)<\/item>/gi;
  const items = [];
  let m;
  while ((m = re.exec(text)) !== null) {
    items.push(unescapeXml(m[1].trim()));
  }
  return items;
}

function parseArcanaOutputXML(xml, original) {
  const out = { ...original }; // start with original to preserve unchanged fields

  const fields = ['general', 'inPath', 'inAchievement', 'inKarmic', 'inCenter', 'consultantNote', 'detailedReading'];
  for (const field of fields) {
    const val = extractTag(xml, field);
    if (val) out[field] = val;
  }

  // practicalSolutions: array
  const psBlockMatch = xml.match(/<practicalSolutions>([\s\S]*?)<\/practicalSolutions>/i);
  if (psBlockMatch) {
    const items = extractItems(psBlockMatch[1]);
    if (items.length > 0) out.practicalSolutions = items;
  }

  return out;
}

// ============================================================
// Claude API call
// ============================================================
async function rewriteArcana(arcanaNum, arcana) {
  const inputXml = buildArcanaInputXML(arcana);
  const userMessage = `Aşağıdaki ${arcanaNum}. Büyük Arkana (${arcana.name}) açıklamasını 2. tekil şahsa çevir.

<input>
${inputXml}
</input>

Sadece <output> içinde XML olarak geri dön, başka bir şey yazma.`;

  const message = await client.messages.create({
    model: MODEL,
    max_tokens: 8000,
    system: REWRITE_SYSTEM_PROMPT,
    messages: [
      { role: 'user', content: userMessage }
    ]
  });

  const responseText = message.content
    .filter(b => b.type === 'text')
    .map(b => b.text)
    .join('\n');

  // Extract <output>...</output>
  const outputMatch = responseText.match(/<output>([\s\S]*?)<\/output>/i);
  const outputXml = outputMatch ? outputMatch[1] : responseText;

  const rewritten = parseArcanaOutputXML(outputXml, arcana);
  return {
    rewritten,
    usage: message.usage
  };
}

// ============================================================
// POSITION_INFO ayrı rewrite
// ============================================================
async function rewritePositionInfo(positions) {
  const lines = ['<positions>'];
  for (const [key, info] of Object.entries(positions)) {
    lines.push(`  <position key="${key}">`);
    lines.push(`    <meaning>${escapeXml(info.meaning)}</meaning>`);
    lines.push(`  </position>`);
  }
  lines.push('</positions>');

  const userMessage = `Aşağıdaki karmik pozisyon açıklamalarını ("meaning" alanları) 2. tekil şahsa çevir. Her birini doğrudan müşteriye hitap eder gibi yaz.

<input>
${lines.join('\n')}
</input>

Aynı XML yapısıyla, aynı key değerleriyle, sadece meaning içeriği güncellenmiş halde <output> içinde geri dön.`;

  const message = await client.messages.create({
    model: MODEL,
    max_tokens: 4000,
    system: REWRITE_SYSTEM_PROMPT,
    messages: [{ role: 'user', content: userMessage }]
  });

  const responseText = message.content.filter(b => b.type === 'text').map(b => b.text).join('\n');
  const outputMatch = responseText.match(/<output>([\s\S]*?)<\/output>/i);
  const outputXml = outputMatch ? outputMatch[1] : responseText;

  const updated = { ...positions };
  const positionRe = /<position\s+key="([A-Z])">([\s\S]*?)<\/position>/gi;
  let pm;
  while ((pm = positionRe.exec(outputXml)) !== null) {
    const key = pm[1];
    const inner = pm[2];
    const newMeaning = extractTag(inner, 'meaning');
    if (newMeaning && updated[key]) {
      updated[key] = { ...updated[key], meaning: newMeaning };
    }
  }
  return { updated, usage: message.usage };
}

// ============================================================
// Step 3: Process all arcana
// ============================================================
console.log('\n=== POSITION_INFO ton düzeltmesi ===');
const posResult = await rewritePositionInfo(POSITION_INFO);
const newPositionInfo = posResult.updated;
console.log(`✓ POSITION_INFO güncellendi (in: ${posResult.usage.input_tokens}, out: ${posResult.usage.output_tokens})`);

const newArcanaDetails = {};
let totalInputTokens = posResult.usage.input_tokens;
let totalOutputTokens = posResult.usage.output_tokens;

console.log('\n=== ARCANA_DETAILS ton düzeltmesi (22 arkana) ===');
for (let num = 1; num <= 22; num++) {
  const original = ARCANA_DETAILS[num];
  if (!original) {
    console.log(`✗ ${num}. arkana bulunamadı, atlanıyor`);
    continue;
  }

  const startTime = Date.now();
  try {
    const result = await rewriteArcana(num, original);
    newArcanaDetails[num] = result.rewritten;
    totalInputTokens += result.usage.input_tokens;
    totalOutputTokens += result.usage.output_tokens;
    const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
    console.log(`✓ ${String(num).padStart(2)}/22 ${original.name.padEnd(35)} ${elapsed}s (in:${result.usage.input_tokens} out:${result.usage.output_tokens})`);
  } catch (err) {
    console.log(`✗ ${String(num).padStart(2)}/22 ${original.name} HATA: ${err.message}`);
    newArcanaDetails[num] = original; // fallback to original on error
  }
}

console.log(`\nToplam token: in=${totalInputTokens}, out=${totalOutputTokens}`);
console.log(`Tahmini maliyet: ~$${((totalInputTokens / 1e6 * 3) + (totalOutputTokens / 1e6 * 15)).toFixed(3)}`);

// ============================================================
// Step 4: Build new arcana-data.js
// ============================================================
function jsString(s) {
  // Escape for JS string literal: backslash, single quote, newlines
  return "'" + String(s).replace(/\\/g, '\\\\').replace(/'/g, "\\'").replace(/\n/g, '\\n') + "'";
}

function buildArcanaDetailsBlock(details) {
  const lines = ['const ARCANA_DETAILS = {'];
  for (let num = 1; num <= 22; num++) {
    const a = details[num];
    if (!a) continue;
    lines.push(`    ${num}: {`);
    lines.push(`        name: ${jsString(a.name)},`);
    lines.push(`        tarot: ${jsString(a.tarot)},`);
    lines.push(`        keywords: [${a.keywords.map(jsString).join(', ')}],`);
    lines.push(`        element: ${jsString(a.element)},`);
    lines.push(`        planet: ${jsString(a.planet)},`);
    lines.push(`        general: ${jsString(a.general)},`);
    lines.push(`        positive: [${a.positive.map(jsString).join(', ')}],`);
    lines.push(`        negative: [${a.negative.map(jsString).join(', ')}],`);
    lines.push(`        inPath: ${jsString(a.inPath)},`);
    lines.push(`        inAchievement: ${jsString(a.inAchievement)},`);
    lines.push(`        inKarmic: ${jsString(a.inKarmic)},`);
    lines.push(`        inCenter: ${jsString(a.inCenter)},`);
    if (a.consultantNote) {
      lines.push(`        consultantNote: ${jsString(a.consultantNote)},`);
    }
    if (Array.isArray(a.practicalSolutions) && a.practicalSolutions.length) {
      lines.push(`        practicalSolutions: [`);
      for (const item of a.practicalSolutions) {
        lines.push(`            ${jsString(item)},`);
      }
      lines.push(`        ],`);
    }
    if (a.detailedReading) {
      lines.push(`        detailedReading: ${jsString(a.detailedReading)}`);
    }
    lines.push(`    },`);
  }
  lines.push('};');
  return lines.join('\n');
}

function buildPositionInfoBlock(positions) {
  const lines = ['const POSITION_INFO = {'];
  for (const [key, info] of Object.entries(positions)) {
    lines.push(`    ${key}: {`);
    lines.push(`        name: ${jsString(info.name)},`);
    lines.push(`        fullName: ${jsString(info.fullName)},`);
    lines.push(`        description: ${jsString(info.description)},`);
    lines.push(`        formula: ${jsString(info.formula)},`);
    lines.push(`        meaning: ${jsString(info.meaning)}`);
    lines.push(`    },`);
  }
  lines.push('};');
  return lines.join('\n');
}

function buildArcanaNamesBlock(names, varName) {
  const lines = [`const ${varName} = {`];
  for (const [num, name] of Object.entries(names)) {
    lines.push(`    ${num}: ${jsString(name)},`);
  }
  lines.push('};');
  return lines.join('\n');
}

const newFileContent = `// ============================================================
// ARCANA DATA - 22 Buyuk Arkana Detayli Yorumlari
// 2. tekil sahis (siz/sizin) anlatimiyla, dogrudan musteriye hitap eder.
// Otomatik ton duzeltmesi: scripts/rewrite-arcana-tone.js
// ============================================================

${buildArcanaNamesBlock(ARCANA_NAMES, 'ARCANA_NAMES')}

${buildArcanaNamesBlock(ARCANA_TAROT_NAMES, 'ARCANA_TAROT_NAMES')}

// ============================================================
// POZISYON ACIKLAMALARI (2. tekil sahis)
// ============================================================
${buildPositionInfoBlock(newPositionInfo)}

// ============================================================
// 22 ARKANA DETAYLI YORUMLARI
// Her arkana icin: genel, pozitif, negatif, pozisyon bazli yorumlar
// Tum metinler 2. tekil sahis (siz/sizin) anlatimiyla.
// ============================================================
${buildArcanaDetailsBlock(newArcanaDetails)}
`;

await writeFile(sourcePath, newFileContent, 'utf-8');
console.log(`\n✓ ${sourcePath} güncellendi (${newFileContent.length} karakter)`);
console.log(`  Backup: ${backupPath}`);
