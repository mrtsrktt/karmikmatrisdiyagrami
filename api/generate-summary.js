// ============================================================
// Vercel Serverless Function: Karmik Özet Üretimi
// POST /api/generate-summary
// Body: { birthDate: "GG.AA.YYYY", matrixResults: { A, B, V, ... } }
// Response: { summary: string, cached: boolean }
// ============================================================

import Anthropic from '@anthropic-ai/sdk';
import { SYSTEM_PROMPT, buildUserPrompt, buildFewShotMessages } from '../lib/prompt.js';

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

// In-memory cache (persists between warm invocations in same Lambda container).
// Anahtar: doğum tarihi (GG.AA.YYYY). Değer: üretilen özet metin.
const cache = new Map();
const CACHE_MAX_SIZE = 500;

function validateMatrixResults(m) {
  if (!m || typeof m !== 'object') return false;
  const keys = ['A', 'B', 'V', 'G', 'D', 'E', 'J', 'Z', 'I', 'K', 'L', 'M', 'N'];
  for (const k of keys) {
    if (typeof m[k] !== 'number' || m[k] < 1 || m[k] > 22) return false;
  }
  if (!m.periods || typeof m.periods !== 'object') return false;
  if (typeof m.periods.p1 !== 'number' ||
      typeof m.periods.p2 !== 'number' ||
      typeof m.periods.p3 !== 'number') return false;
  return true;
}

function validateBirthDate(d) {
  if (typeof d !== 'string') return false;
  return /^\d{2}\.\d{2}\.\d{4}$/.test(d);
}

export default async function handler(req, res) {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Parse body (Vercel sometimes delivers body as string)
  let body = req.body;
  if (typeof body === 'string') {
    try { body = JSON.parse(body); } catch { body = {}; }
  }

  const { birthDate, matrixResults } = body || {};

  if (!validateBirthDate(birthDate)) {
    return res.status(400).json({ error: 'Geçersiz doğum tarihi formatı. GG.AA.YYYY bekleniyor.' });
  }
  if (!validateMatrixResults(matrixResults)) {
    return res.status(400).json({ error: 'Geçersiz matrixResults. A-N arası 13 sayı ve periods gerekli.' });
  }

  // Cache check
  const cacheKey = birthDate;
  if (cache.has(cacheKey)) {
    return res.status(200).json({
      summary: cache.get(cacheKey),
      cached: true
    });
  }

  try {
    const fewShotMessages = buildFewShotMessages();
    const userMessage = buildUserPrompt(birthDate, matrixResults);

    const message = await client.messages.create({
      model: 'claude-haiku-4-5',
      max_tokens: 3300,
      system: SYSTEM_PROMPT,
      messages: [
        ...fewShotMessages,
        { role: 'user', content: userMessage }
      ]
    });

    // Extract text content
    const summary = message.content
      .filter(block => block.type === 'text')
      .map(block => block.text)
      .join('\n\n')
      .trim();

    if (!summary || summary.length < 500) {
      return res.status(500).json({
        error: 'Üretilen özet beklenenden kısa veya boş geldi.',
        length: summary?.length || 0
      });
    }

    // Cache it (LRU-ish: basit boyut limiti)
    if (cache.size >= CACHE_MAX_SIZE) {
      const firstKey = cache.keys().next().value;
      cache.delete(firstKey);
    }
    cache.set(cacheKey, summary);

    return res.status(200).json({
      summary,
      cached: false,
      usage: {
        input_tokens: message.usage?.input_tokens,
        output_tokens: message.usage?.output_tokens
      }
    });
  } catch (error) {
    console.error('Claude API error:', error);
    return res.status(500).json({
      error: 'Karmik özet üretilirken bir hata oluştu.',
      details: error.message
    });
  }
}
