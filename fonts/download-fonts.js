// Downloads all required TTF fonts from Google Fonts GitHub repository.
// Cinzel and CormorantGaramond use variable fonts (single TTF with weight axis).
// IM Fell English has static TTFs.
// Usage: node fonts/download-fonts.js
import { writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));

const FONTS = [
  // Cinzel — variable font (single file, all weights)
  ['Cinzel-Variable.ttf', 'https://raw.githubusercontent.com/google/fonts/main/ofl/cinzel/Cinzel%5Bwght%5D.ttf'],

  // Cormorant Garamond — variable font + variable italic
  ['CormorantGaramond-Variable.ttf',       'https://raw.githubusercontent.com/google/fonts/main/ofl/cormorantgaramond/CormorantGaramond%5Bwght%5D.ttf'],
  ['CormorantGaramond-Italic-Variable.ttf','https://raw.githubusercontent.com/google/fonts/main/ofl/cormorantgaramond/CormorantGaramond-Italic%5Bwght%5D.ttf'],

  // IM Fell English — static
  ['IMFellEnglish-Regular.ttf', 'https://raw.githubusercontent.com/google/fonts/main/ofl/imfellenglish/IMFeENrm28P.ttf'],
  ['IMFellEnglish-Italic.ttf',  'https://raw.githubusercontent.com/google/fonts/main/ofl/imfellenglish/IMFeENit28P.ttf'],
];

async function downloadFont(fileName, url) {
  const res = await fetch(url, { redirect: 'follow' });
  if (!res.ok) {
    throw new Error(`HTTP ${res.status} for ${url}`);
  }
  const buffer = Buffer.from(await res.arrayBuffer());

  // Validate it's a real TTF/OTF
  const magic = buffer.subarray(0, 4);
  const isTTF = (magic[0] === 0x00 && magic[1] === 0x01 && magic[2] === 0x00 && magic[3] === 0x00) ||
                magic.toString('ascii') === 'OTTO' ||
                magic.toString('ascii') === 'true';
  if (!isTTF) {
    throw new Error(`Not a valid TTF file: ${fileName} — magic: ${[...magic].map(b => '0x' + b.toString(16)).join(' ')}`);
  }

  const outPath = resolve(__dirname, fileName);
  await writeFile(outPath, buffer);
  console.log(`✓ ${fileName.padEnd(45)} ${(buffer.length / 1024).toFixed(1)} KB`);
}

console.log('Downloading TTF fonts from Google Fonts...\n');
let success = 0;
let failed = 0;
for (const [fileName, url] of FONTS) {
  try {
    await downloadFont(fileName, url);
    success++;
  } catch (e) {
    console.log(`✗ ${fileName.padEnd(45)} FAILED: ${e.message}`);
    failed++;
  }
}
console.log(`\nDone. ${success} succeeded, ${failed} failed.`);
if (failed > 0) process.exit(1);
