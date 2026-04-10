// =============================================================================
// /api/admin — Admin endpoint'leri tek dispatcher'da
// =============================================================================
// vercel.json rewrites:
//
//   GET  /api/admin/stats             -> action=stats
//   GET  /api/admin/payments?status=  -> action=payments
//   POST /api/admin/approve-payment   -> action=approve-payment
//   POST /api/admin/reject-payment    -> action=reject-payment
//   GET  /api/admin/users             -> action=users
//   POST /api/admin/grant-credits     -> action=grant-credits
// =============================================================================

import { requireAdmin, supabaseAdmin } from '../lib/supabase-server.js';

function getAction(req) {
    if (req.query?.action) return req.query.action;
    const url = req.url || '';
    const match = url.match(/^\/api\/admin\/([^?]+)/);
    if (match) return match[1];
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

    // Tüm admin endpoint'leri auth + admin gerektirir
    const auth = await requireAdmin(req);
    if (auth.error) {
        return res.status(auth.status || 401).json({ error: auth.error });
    }
    const { user } = auth;

    const action = getAction(req);
    if (!action) {
        return res.status(400).json({ error: 'missing_action' });
    }

    // ------------------------------------------------------------------
    // GET /api/admin/stats
    // ------------------------------------------------------------------
    if (action === 'stats') {
        if (req.method !== 'GET') return res.status(405).json({ error: 'method_not_allowed' });
        try {
            const [
                { count: userCount },
                { count: pendingCount },
                { count: approvedCount },
                { count: analysisCount },
                { data: revenue }
            ] = await Promise.all([
                supabaseAdmin.from('profiles').select('*', { count: 'exact', head: true }),
                supabaseAdmin.from('payment_requests').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
                supabaseAdmin.from('payment_requests').select('*', { count: 'exact', head: true }).eq('status', 'approved'),
                supabaseAdmin.from('analyses').select('*', { count: 'exact', head: true }),
                supabaseAdmin.from('payment_requests').select('amount_try').eq('status', 'approved')
            ]);

            const totalRevenue = (revenue || []).reduce((sum, r) => sum + Number(r.amount_try || 0), 0);

            const sevenDaysAgo = new Date();
            sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
            const { count: weeklyAnalyses } = await supabaseAdmin
                .from('analyses')
                .select('*', { count: 'exact', head: true })
                .gte('created_at', sevenDaysAgo.toISOString());

            return res.status(200).json({
                users:             userCount ?? 0,
                pending_payments:  pendingCount ?? 0,
                approved_payments: approvedCount ?? 0,
                total_analyses:    analysisCount ?? 0,
                weekly_analyses:   weeklyAnalyses ?? 0,
                total_revenue:     totalRevenue
            });
        } catch (err) {
            console.error('[admin/stats]', err);
            return res.status(500).json({ error: 'stats_failed' });
        }
    }

    // ------------------------------------------------------------------
    // GET /api/admin/payments?status=pending|approved|rejected
    // ------------------------------------------------------------------
    if (action === 'payments') {
        if (req.method !== 'GET') return res.status(405).json({ error: 'method_not_allowed' });
        const filterStatus = req.query?.status || 'pending';
        const { data, error } = await supabaseAdmin
            .from('payment_requests')
            .select(`
                id, user_id, package_name, amount_try, credits, sender_name, sender_iban,
                bank_name, transfer_date, reference_note, status, admin_note, approved_at, created_at,
                profiles!payment_requests_user_id_fkey ( email, full_name, phone )
            `)
            .eq('status', filterStatus)
            .order('created_at', { ascending: false })
            .limit(200);
        if (error) {
            console.error('[admin/payments]', error);
            return res.status(500).json({ error: 'db_error', detail: error.message });
        }
        return res.status(200).json({ payments: data || [] });
    }

    // ------------------------------------------------------------------
    // POST /api/admin/approve-payment
    // ------------------------------------------------------------------
    if (action === 'approve-payment') {
        if (req.method !== 'POST') return res.status(405).json({ error: 'method_not_allowed' });
        const body = parseBody(req);
        const { payment_id } = body;
        if (!payment_id) return res.status(400).json({ error: 'missing_payment_id' });

        const { data: payment, error: fetchErr } = await supabaseAdmin
            .from('payment_requests')
            .select('*')
            .eq('id', payment_id)
            .eq('status', 'pending')
            .maybeSingle();

        if (fetchErr || !payment) {
            return res.status(404).json({ error: 'payment_not_found_or_processed' });
        }

        const { error: updateErr } = await supabaseAdmin
            .from('payment_requests')
            .update({
                status:      'approved',
                approved_by: user.id,
                approved_at: new Date().toISOString()
            })
            .eq('id', payment_id)
            .eq('status', 'pending');

        if (updateErr) {
            console.error('[approve-payment update]', updateErr);
            return res.status(500).json({ error: 'update_failed' });
        }

        const { error: rpcErr } = await supabaseAdmin.rpc('admin_grant_credits', {
            p_user_id: payment.user_id,
            p_amount:  payment.credits,
            p_note:    `Havale onaylandı: ${payment.package_name} (${payment.amount_try} TL)`
        });

        if (rpcErr) {
            console.error('[approve-payment rpc]', rpcErr);
            await supabaseAdmin
                .from('payment_requests')
                .update({ status: 'pending', approved_by: null, approved_at: null })
                .eq('id', payment_id);
            return res.status(500).json({ error: 'credit_grant_failed', detail: rpcErr.message });
        }

        return res.status(200).json({
            success: true,
            message: `${payment.credits} kredi yüklendi.`,
            payment_id
        });
    }

    // ------------------------------------------------------------------
    // POST /api/admin/reject-payment
    // ------------------------------------------------------------------
    if (action === 'reject-payment') {
        if (req.method !== 'POST') return res.status(405).json({ error: 'method_not_allowed' });
        const body = parseBody(req);
        const { payment_id, reason } = body;
        if (!payment_id) return res.status(400).json({ error: 'missing_payment_id' });

        const { data, error } = await supabaseAdmin
            .from('payment_requests')
            .update({
                status:      'rejected',
                admin_note:  reason || null,
                approved_by: user.id,
                approved_at: new Date().toISOString()
            })
            .eq('id', payment_id)
            .eq('status', 'pending')
            .select()
            .single();

        if (error || !data) {
            console.error('[reject-payment]', error);
            return res.status(500).json({ error: 'reject_failed', detail: error?.message });
        }
        return res.status(200).json({ success: true, payment: data });
    }

    // ------------------------------------------------------------------
    // GET /api/admin/users
    // ------------------------------------------------------------------
    if (action === 'users') {
        if (req.method !== 'GET') return res.status(405).json({ error: 'method_not_allowed' });
        const search = (req.query?.q || '').toString().toLowerCase().trim();
        const limit  = Math.min(parseInt(req.query?.limit ?? '100', 10) || 100, 500);

        let query = supabaseAdmin
            .from('profiles')
            .select('id, email, full_name, phone, credits, is_admin, status, created_at')
            .order('created_at', { ascending: false })
            .limit(limit);

        if (search) {
            query = query.or(`email.ilike.%${search}%,full_name.ilike.%${search}%,phone.ilike.%${search}%`);
        }

        const { data, error } = await query;
        if (error) {
            console.error('[admin/users]', error);
            return res.status(500).json({ error: 'db_error' });
        }
        return res.status(200).json({ users: data || [] });
    }

    // ------------------------------------------------------------------
    // POST /api/admin/grant-credits
    // ------------------------------------------------------------------
    if (action === 'grant-credits') {
        if (req.method !== 'POST') return res.status(405).json({ error: 'method_not_allowed' });
        const body = parseBody(req);
        const { user_id, amount, note } = body;
        const amt = parseInt(amount, 10);
        if (!user_id || !Number.isFinite(amt) || amt === 0) {
            return res.status(400).json({ error: 'invalid_input' });
        }

        const { error } = await supabaseAdmin.rpc('admin_grant_credits', {
            p_user_id: user_id,
            p_amount:  amt,
            p_note:    note || null
        });

        if (error) {
            console.error('[grant-credits]', error);
            return res.status(500).json({ error: 'rpc_failed', detail: error.message });
        }
        return res.status(200).json({ success: true, amount: amt });
    }

    return res.status(404).json({ error: 'unknown_action', action });
}
