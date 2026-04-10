// GET /api/payments/list — kullanıcının havale bildirim geçmişi
import { authenticateRequest, supabaseAdmin } from '../../lib/supabase-server.js';

export default async function handler(req, res) {
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'method_not_allowed' });
    }

    const { user, error } = await authenticateRequest(req);
    if (error || !user) {
        return res.status(401).json({ error: 'unauthorized' });
    }

    const { data, error: dbError } = await supabaseAdmin
        .from('payment_requests')
        .select('id, package_name, amount_try, credits, sender_name, bank_name, transfer_date, status, admin_note, created_at, approved_at')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50);

    if (dbError) {
        console.error('[payments/list]', dbError);
        return res.status(500).json({ error: 'db_error' });
    }

    return res.status(200).json({ payments: data || [] });
}
