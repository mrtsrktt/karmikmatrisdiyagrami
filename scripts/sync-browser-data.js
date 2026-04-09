// ============================================================
// Browser-friendly health data senkronizasyonu
// ============================================================
// lib/health-by-energy.js (ESM modülü) içeriğini okur,
// pdf/health-data.js (browser script) olarak sarar.
//
// lib/health-by-energy.js her güncellendiğinde bunu çalıştır:
//   node scripts/sync-browser-data.js
// ============================================================

import { writeFile } from 'node:fs/promises';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = resolve(__dirname, '..');

const { HEALTH_BY_ENERGY } = await import(`file:///${resolve(projectRoot, 'lib', 'health-by-energy.js').replace(/\\/g, '/')}`);

const json = JSON.stringify(HEALTH_BY_ENERGY, null, 2);
const out = `// AUTO-GENERATED FROM lib/health-by-energy.js — DO NOT EDIT BY HAND
// To regenerate: node scripts/sync-browser-data.js
// Browser-side wrapper that exposes HEALTH_BY_ENERGY on window.

window.HEALTH_BY_ENERGY = ${json};
`;

const targetFile = resolve(projectRoot, 'pdf', 'health-data.js');
await writeFile(targetFile, out, 'utf-8');
console.log(`✓ ${targetFile}`);
console.log(`  ${(out.length / 1024).toFixed(1)} KB, ${Object.keys(HEALTH_BY_ENERGY).length} enerji`);
