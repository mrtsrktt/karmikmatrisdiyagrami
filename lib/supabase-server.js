// =============================================================================
// Supabase server (Vercel serverless) istemcisi
// =============================================================================
// Sadece api/ klasöründeki dosyalardan import edilebilir.
// SUPABASE_SERVICE_KEY env değişkenini kullanır — RLS'i bypass eder.
//
// Lazy initialization: env değişkenleri eksikse modul yüklenirken çökmez,
// yalnızca authenticate çağrıldığında 503 döner. Bu sayede env'siz deploy'da
// /api/generate-summary gibi diğer endpoint'ler de etkilenmez.
// =============================================================================

import { createClient } from '@supabase/supabase-js';

let _adminClient = null;
let _initError = null;

function init() {
    if (_adminClient || _initError) return;
    const SUPABASE_URL          = process.env.SUPABASE_URL;
    const SUPABASE_SERVICE_KEY  = process.env.SUPABASE_SERVICE_KEY;

    if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
        _initError = 'Supabase env değişkenleri eksik (SUPABASE_URL veya SUPABASE_SERVICE_KEY).';
        console.error('[supabase-server]', _initError);
        return;
    }

    try {
        _adminClient = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
            auth: { persistSession: false, autoRefreshToken: false }
        });
    } catch (err) {
        _initError = `Supabase client oluşturulamadı: ${err.message}`;
        console.error('[supabase-server]', _initError);
    }
}

/**
 * Tam yetkili admin istemci. RLS bypass eder. Sadece doğrulanmış istekler için.
 */
export const supabaseAdmin = new Proxy({}, {
    get(_, prop) {
        init();
        if (_initError) {
            throw new Error(_initError);
        }
        return _adminClient[prop];
    }
});

/**
 * İstek başlığından Authorization Bearer token'ı okur ve kullanıcıyı doğrular.
 * @param {Request|object} req — Vercel req
 * @returns {Promise<{user, profile, error}>}
 */
export async function authenticateRequest(req) {
    init();
    if (_initError) {
        return { user: null, profile: null, error: 'supabase_not_configured' };
    }

    const authHeader = req.headers?.authorization || req.headers?.Authorization || '';
    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;

    if (!token) {
        return { user: null, profile: null, error: 'missing_token' };
    }

    const { data: { user }, error: authError } = await _adminClient.auth.getUser(token);
    if (authError || !user) {
        return { user: null, profile: null, error: 'invalid_token' };
    }

    const { data: profile, error: profileError } = await _adminClient
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
        return { error: error || 'unauthorized', status: error === 'supabase_not_configured' ? 503 : 401 };
    }
    if (!profile?.is_admin) {
        return { error: 'forbidden', status: 403 };
    }
    return { user, profile };
}
