// POST /api/admin/grant-credits — admin manuel kredi ekleme/çıkarma
//
// Body: { user_id: uuid, amount: int (+/-), note?: string }
import { requireAdmin, supabaseAdmin } from '../../lib/supabase-server.js';

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'method_not_allowed' });
    }

    const { error, status } = await requireAdmin(req);
    if (error) {
        return res.status(status || 401).json({ error });
    }

    const { user_id, amount, note } = req.body || {};
    const amt = parseInt(amount, 10);

    if (!user_id || !Number.isFinite(amt) || amt === 0) {
        return res.status(400).json({ error: 'invalid_input' });
    }

    const { error: rpcErr } = await supabaseAdmin.rpc('admin_grant_credits', {
        p_user_id: user_id,
        p_amount:  amt,
        p_note:    note || null
    });

    if (rpcErr) {
        console.error('[grant-credits]', rpcErr);
        return res.status(500).json({ error: 'rpc_failed', detail: rpcErr.message });
    }

    return res.status(200).json({ success: true, amount: amt });
}
