// =============================================================================
// Supabase server (Vercel serverless) istemcisi
// =============================================================================
// Sadece api/ klasöründeki dosyalardan import edilebilir.
// SUPABASE_SERVICE_KEY env değişkenini kullanır — RLS'i bypass eder.
// =============================================================================

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL          = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_KEY  = process.env.SUPABASE_SERVICE_KEY;
const SUPABASE_ANON_KEY     = process.env.SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
    console.error('[supabase-server] SUPABASE_URL veya SUPABASE_SERVICE_KEY env değişkeni eksik!');
}

/**
 * Tam yetkili admin istemci — RLS'i bypass eder. Sadece doğrulanmış istekler için.
 */
export const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false }
});

/**
 * Anonim istemci — JWT doğrulamak için.
 */
export const supabaseAnon = createClient(SUPABASE_URL, SUPABASE_ANON_KEY || SUPABASE_SERVICE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false }
});

/**
 * İstek başlığından Authorization Bearer token'ı okur ve kullanıcıyı doğrular.
 * @param {Request|object} req — Vercel req
 * @returns {Promise<{user, profile, error}>}
 */
export async function authenticateRequest(req) {
    const authHeader = req.headers?.authorization || req.headers?.Authorization || '';
    const token = authHeader.startsWith('Bearer ')
        ? authHeader.slice(7)
        : null;

    if (!token) {
        return { user: null, profile: null, error: 'missing_token' };
    }

    // Token'ı doğrula
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);
    if (authError || !user) {
        return { user: null, profile: null, error: 'invalid_token' };
    }

    // Profil bilgisini çek
    const { data: profile, error: profileError } = await supabaseAdmin
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

    if (profileError) {
        return { user, profile: null, error: 'profile_not_found' };
    }

    return { user, profile, error: null };
}

/**
 * Sadece admin'lerin geçebildiği middleware.
 */
export async function requireAdmin(req) {
    const { user, profile, error } = await authenticateRequest(req);
    if (error || !user) {
        return { error: 'unauthorized', status: 401 };
    }
    if (!profile?.is_admin) {
        return { error: 'forbidden', status: 403 };
    }
    return { user, profile };
}
