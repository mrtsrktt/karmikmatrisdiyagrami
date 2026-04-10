// POST /api/admin/reject-payment — admin reddi
//
// Body: { payment_id: uuid, reason?: string }
import { requireAdmin, supabaseAdmin } from '../../lib/supabase-server.js';

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'method_not_allowed' });
    }

    const { user, error, status } = await requireAdmin(req);
    if (error) {
        return res.status(status || 401).json({ error });
    }

    const { payment_id, reason } = req.body || {};
    if (!payment_id) {
        return res.status(400).json({ error: 'missing_payment_id' });
    }

    const { data, error: dbError } = await supabaseAdmin
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

    if (dbError || !data) {
        console.error('[reject-payment]', dbError);
        return res.status(500).json({ error: 'reject_failed', detail: dbError?.message });
    }

    return res.status(200).json({ success: true, payment: data });
}
