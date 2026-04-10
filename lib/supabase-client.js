// =============================================================================
// Supabase tarayıcı (browser) istemcisi
// =============================================================================
// Kullanım:
//   <script src="/lib/supabase-config.js"></script>
//   <script type="module" src="/lib/supabase-client.js"></script>
//
//   import { sb, getCurrentUser, getProfile, signOut } from '/lib/supabase-client.js';
// =============================================================================

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.4';

const cfg = window.SUPABASE_CONFIG;

if (!cfg || !cfg.url || cfg.url.includes('YOUR-PROJECT')) {
    console.error('[supabase-client] SUPABASE_CONFIG eksik veya doldurulmamış. lib/supabase-config.js dosyasını kontrol et.');
}

export const sb = createClient(cfg.url, cfg.anonKey, {
    auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
        storage: window.localStorage,
        storageKey: 'km-auth'
    }
});

// -----------------------------------------------------------------------------
// Yardımcılar
// -----------------------------------------------------------------------------

export async function getCurrentUser() {
    const { data: { user } } = await sb.auth.getUser();
    return user;
}

export async function getCurrentSession() {
    const { data: { session } } = await sb.auth.getSession();
    return session;
}

export async function getProfile() {
    const user = await getCurrentUser();
    if (!user) return null;
    const { data, error } = await sb
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
    if (error) {
        console.error('[getProfile]', error);
        return null;
    }
    return data;
}

export async function getCredits() {
    const profile = await getProfile();
    return profile?.credits ?? 0;
}

export async function signOut() {
    await sb.auth.signOut();
    window.location.href = '/auth/giris.html';
}

/**
 * Bir HTML sayfasının başında çağır — kullanıcı giriş yapmamışsa /auth/giris.html'e yönlendirir.
 * @param {object} options
 * @param {boolean} options.requireAdmin — true ise admin değilse anasayfaya at.
 */
export async function requireAuth(options = {}) {
    const session = await getCurrentSession();
    if (!session) {
        const redirect = encodeURIComponent(window.location.pathname + window.location.search);
        window.location.href = `/auth/giris.html?redirect=${redirect}`;
        throw new Error('not_authenticated');
    }
    if (options.requireAdmin) {
        const profile = await getProfile();
        if (!profile?.is_admin) {
            window.location.href = '/';
            throw new Error('not_admin');
        }
    }
    return session;
}

/**
 * Bir HTML sayfasının başında çağır — kullanıcı zaten giriş yapmışsa /hesap/'a yönlendirir.
 * Login ve kayıt sayfalarında kullanılır.
 */
export async function redirectIfAuthenticated() {
    const session = await getCurrentSession();
    if (session) {
        const params = new URLSearchParams(window.location.search);
        const redirect = params.get('redirect') || '/hesap/';
        window.location.href = redirect;
    }
}

/**
 * Bearer token ile API çağrısı yapar.
 * @param {string} path — '/api/...'
 * @param {object} options — fetch options
 */
export async function apiFetch(path, options = {}) {
    const session = await getCurrentSession();
    const headers = {
        'Content-Type': 'application/json',
        ...(options.headers || {}),
        ...(session ? { 'Authorization': `Bearer ${session.access_token}` } : {})
    };
    const res = await fetch(path, { ...options, headers });
    let body = null;
    try {
        body = await res.json();
    } catch (_) {
        body = null;
    }
    if (!res.ok) {
        const err = new Error(body?.error || `HTTP ${res.status}`);
        err.status = res.status;
        err.body = body;
        throw err;
    }
    return body;
}
