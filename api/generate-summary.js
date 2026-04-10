// ============================================================
// Vercel Serverless Function: Karmik Özet Üretimi
// POST /api/generate-summary
// Body: { birthDate: "GG.AA.YYYY", matrixResults: { A, B, V, ... },
//         clientName?, birthCity?, birthTime?, birthChartData? }
// Headers: Authorization: Bearer <jwt>
// Response: { summary, cached, credits_remaining, analysis_id }
// ============================================================

import Anthropic from '@anthropic-ai/sdk';
import { SYSTEM_PROMPT, buildUserPrompt, buildFewShotMessages } from '../lib/prompt.js';
import { authenticateRequest, supabaseAdmin } from '../lib/supabase-server.js';

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

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

// "GG.AA.YYYY" -> "YYYY-MM-DD"
function birthDateToISO(d) {
  const [day, month, year] = d.split('.');
  return `${year}-${month}-${day}`;
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // ---------------------------------------------------------------
  // 1) Auth: kullanıcıyı doğrula
  // ---------------------------------------------------------------
  const { user, profile, error: authError } = await authenticateRequest(req);
  if (authError || !user) {
    return res.status(401).json({
      error: 'unauthorized',
      message: 'Bu işlem için giriş yapmalısınız.'
    });
  }

  if (!profile || (profile.credits ?? 0) < 1) {
    return res.status(402).json({
      error: 'insufficient_credits',
      message: 'Kredi bakiyeniz yetersiz. Lütfen yeni paket alın.',
      credits: profile?.credits ?? 0
    });
  }

  // ---------------------------------------------------------------
  // 2) Body validate
  // ---------------------------------------------------------------
  let body = req.body;
  if (typeof body === 'string') {
    try { body = JSON.parse(body); } catch { body = {}; }
  }

  const {
    birthDate,
    matrixResults,
    clientName,
    birthCity,
    birthTime,
    birthChartData
  } = body || {};

  if (!validateBirthDate(birthDate)) {
    return res.status(400).json({ error: 'Geçersiz doğum tarihi formatı. GG.AA.YYYY bekleniyor.' });
  }
  if (!validateMatrixResults(matrixResults)) {
    return res.status(400).json({ error: 'Geçersiz matrixResults. A-N arası 13 sayı ve periods gerekli.' });
  }

  // ---------------------------------------------------------------
  // 3) Krediyi atomik düş (RPC)
  // ---------------------------------------------------------------
  const { data: creditsRemaining, error: deductError } = await supabaseAdmin
    .rpc('deduct_credit_for_analysis', { p_user_id: user.id });

  if (deductError) {
    console.error('[generate-summary] credit deduct error:', deductError);
    return res.status(402).json({
      error: 'credit_deduct_failed',
      message: deductError.message?.includes('insufficient')
        ? 'Kredi bakiyeniz yetersiz.'
        : 'Kredi düşürülürken bir hata oluştu.'
    });
  }

  // ---------------------------------------------------------------
  // 4) Claude API
  // ---------------------------------------------------------------
  let summary = null;
  let aiUsage = null;

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

    summary = message.content
      .filter(block => block.type === 'text')
      .map(block => block.text)
      .join('\n\n')
      .trim();

    aiUsage = {
      input_tokens:  message.usage?.input_tokens,
      output_tokens: message.usage?.output_tokens
    };

    if (!summary || summary.length < 500) {
      throw new Error(`Üretilen özet beklenenden kısa: ${summary?.length || 0}`);
    }
  } catch (error) {
    console.error('Claude API error:', error);

    // Krediyi geri ver (refund)
    await supabaseAdmin.rpc('admin_grant_credits', {
      p_user_id: user.id,
      p_amount:  1,
      p_note:    'Analiz başarısız oldu — kredi iadesi',
      p_type:    'refund'
    }).catch(e => console.error('refund failed', e));

    return res.status(500).json({
      error: 'ai_generation_failed',
      message: 'Karmik özet üretilirken bir hata oluştu. Krediniz iade edildi.',
      details: error.message
    });
  }

  // ---------------------------------------------------------------
  // 5) Analizi DB'ye kaydet
  // ---------------------------------------------------------------
  let analysisId = null;
  try {
    const { data: insertedAnalysis, error: insertError } = await supabaseAdmin
      .from('analyses')
      .insert({
        user_id:           user.id,
        client_name:       clientName?.toString().slice(0, 200) || null,
        birth_date:        birthDateToISO(birthDate),
        birth_time:        birthTime || null,
        birth_city:        birthCity?.toString().slice(0, 100) || null,
        matrix_data:       matrixResults,
        birth_chart_data:  birthChartData || null,
        ai_summary:        summary,
        ai_model:          'claude-haiku-4-5',
        cost_credits:      1
      })
      .select('id')
      .single();

    if (insertError) {
      console.error('[generate-summary] save analysis error:', insertError);
    } else {
      analysisId = insertedAnalysis?.id || null;
    }
  } catch (e) {
    console.error('[generate-summary] save error:', e);
  }

  // ---------------------------------------------------------------
  // 6) Yanıt
  // ---------------------------------------------------------------
  return res.status(200).json({
    summary,
    analysis_id: analysisId,
    credits_remaining: creditsRemaining,
    usage: aiUsage
  });
}
