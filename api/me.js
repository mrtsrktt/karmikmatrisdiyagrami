// =============================================================================
// /api/me — Kullanıcıya yönelik tüm endpoint'ler tek dispatcher'da
// =============================================================================
// Vercel Hobby tier 12 fonksiyon sınırı nedeniyle birden fazla URL tek dosyada.
// vercel.json'daki rewrites kuralları frontend URL'leri aynı bırakır:
//
//   GET  /api/credits/balance        -> action=credits/balance
//   GET  /api/analyses/list          -> action=analyses/list
//   GET  /api/analyses/get?id=...    -> action=analyses/get
//   GET  /api/payments/list          -> action=payments/list
//   POST /api/payments/submit        -> action=payments/submit
//   GET  /api/payments/packages      -> action=payments/packages   (auth opsiyonel)
//
// Frontend kodları olduğu gibi çağırabilir; vercel.json yönlendirmeyi yapar.
// =============================================================================

import { authenticateRequest, supabaseAdmin } from '../lib/supabase-server.js';

function getAction(req) {
    // Önce explicit query param, yoksa URL pathname'inden çıkar
    if (req.query?.action) return req.query.action;

    const url = req.url || '';
    // /api/credits/balance -> credits/balance
    const match = url.match(/^\/api\/([^?]+)/);
    if (match) {
        const path = match[1];
        // /api/me'yi atla
        if (path === 'me' || path.startsWith('me/')) return null;
        return path;
    }
    return null;
}

function parseBody(req) {
    let body = req.body;
    if (typeof body === 'string') {
        try { body = JSON.parse(body); } catch { body = {}; }
    }
    return body || {};
}

export default async function handler(req, res) {
    res.setHeader('Cache-Control', 'no-store');

    const action = getAction(req);
    if (!action) {
        return res.status(400).json({ error: 'missing_action' });
    }

    // ------------------------------------------------------------------
    // payments/packages — auth gerekmez (paketleri herkes görebilir)
    // ------------------------------------------------------------------
    if (action === 'payments/packages') {
        if (req.method !== 'GET') return res.status(405).json({ error: 'method_not_allowed' });
        const { data, error } = await supabaseAdmin
            .from('credit_packages')
            .select('id, name, description, credits, price_try, sort_order')
            .eq('is_active', true)
            .order('sort_order', { ascending: true });
        if (error) {
            console.error('[me/payments/packages]', error);
            return res.status(500).json({ error: 'db_error' });
        }
        return res.status(200).json({ packages: data || [] });
    }

    // ------------------------------------------------------------------
    // Aşağıdaki tüm endpoint'ler auth ister
    // ------------------------------------------------------------------
    const { user, profile, error: authError } = await authenticateRequest(req);
    if (authError || !user) {
        return res.status(401).json({ error: 'unauthorized' });
    }

    // ------------------------------------------------------------------
    // GET /api/credits/balance
    // ------------------------------------------------------------------
    if (action === 'credits/balance') {
        if (req.method !== 'GET') return res.status(405).json({ error: 'method_not_allowed' });
        return res.status(200).json({
            credits:    profile?.credits ?? 0,
            is_admin:   profile?.is_admin ?? false,
            full_name:  profile?.full_name ?? null,
            email:      profile?.email ?? user.email
        });
    }

    // ------------------------------------------------------------------
    // GET /api/analyses/list
    // ------------------------------------------------------------------
    if (action === 'analyses/list') {
        if (req.method !== 'GET') return res.status(405).json({ error: 'method_not_allowed' });
        const limit  = Math.min(parseInt(req.query?.limit ?? '50', 10) || 50, 200);
        const offset = parseInt(req.query?.offset ?? '0', 10) || 0;
        const { data, error } = await supabaseAdmin
            .from('analyses')
            .select('id, client_name, birth_date, birth_city, ai_model, cost_credits, created_at')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false })
            .range(offset, offset + limit - 1);
        if (error) {
            console.error('[me/analyses/list]', error);
            return res.status(500).json({ error: 'db_error' });
        }
        return res.status(200).json({ analyses: data || [] });
    }

    // ------------------------------------------------------------------
    // GET /api/analyses/get?id=...
    // ------------------------------------------------------------------
    if (action === 'analyses/get') {
        if (req.method !== 'GET') return res.status(405).json({ error: 'method_not_allowed' });
        const id = req.query?.id;
        if (!id) return res.status(400).json({ error: 'missing_id' });
        const { data, error } = await supabaseAdmin
            .from('analyses')
            .select('*')
            .eq('id', id)
            .eq('user_id', user.id)
            .maybeSingle();
        if (error) {
            console.error('[me/analyses/get]', error);
            return res.status(500).json({ error: 'db_error' });
        }
        if (!data) return res.status(404).json({ error: 'not_found' });
        return res.status(200).json({ analysis: data });
    }

    // ------------------------------------------------------------------
    // GET /api/payments/list
    // ------------------------------------------------------------------
    if (action === 'payments/list') {
        if (req.method !== 'GET') return res.status(405).json({ error: 'method_not_allowed' });
        const { data, error } = await supabaseAdmin
            .from('payment_requests')
            .select('id, package_name, amount_try, credits, sender_name, bank_name, transfer_date, status, admin_note, created_at, approved_at')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false })
            .limit(50);
        if (error) {
            console.error('[me/payments/list]', error);
            return res.status(500).json({ error: 'db_error' });
        }
        return res.status(200).json({ payments: data || [] });
    }

    // ------------------------------------------------------------------
    // POST /api/payments/submit
    // ------------------------------------------------------------------
    if (action === 'payments/submit') {
        if (req.method !== 'POST') return res.status(405).json({ error: 'method_not_allowed' });
        const body = parseBody(req);
        const { package_id, sender_name, sender_iban, bank_name, transfer_date, reference_note } = body;

        if (!package_id || !sender_name) {
            return res.status(400).json({ error: 'missing_fields', message: 'package_id ve sender_name zorunludur' });
        }

        const { data: pkg, error: pkgError } = await supabaseAdmin
            .from('credit_packages')
            .select('*')
            .eq('id', package_id)
            .eq('is_active', true)
            .maybeSingle();
        if (pkgError || !pkg) {
            return res.status(404).json({ error: 'package_not_found' });
        }

        const { count: pendingCount } = await supabaseAdmin
            .from('payment_requests')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', user.id)
            .eq('status', 'pending');

        if ((pendingCount ?? 0) >= 3) {
            return res.status(429).json({
                error: 'too_many_pending',
                message: 'Bekleyen 3 başvurunuz var. Lütfen onay bekleyin.'
            });
        }

        const { data, error: insertError } = await supabaseAdmin
            .from('payment_requests')
            .insert({
                user_id:        user.id,
                package_id:     pkg.id,
                package_name:   pkg.name,
                amount_try:     pkg.price_try,
                credits:        pkg.credits,
                sender_name:    sender_name.toString().slice(0, 200),
                sender_iban:    sender_iban?.toString().slice(0, 34) || null,
                bank_name:      bank_name?.toString().slice(0, 100) || null,
                transfer_date:  transfer_date || null,
                reference_note: reference_note?.toString().slice(0, 1000) || null,
                status:         'pending'
            })
            .select()
            .single();

        if (insertError) {
            console.error('[me/payments/submit]', insertError);
            return res.status(500).json({ error: 'insert_failed' });
        }
        return res.status(200).json({ payment: data });
    }

    return res.status(404).json({ error: 'unknown_action', action });
}
