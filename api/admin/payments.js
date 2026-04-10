// GET /api/admin/payments?status=pending — admin için tüm havale başvuruları
import { requireAdmin, supabaseAdmin } from '../../lib/supabase-server.js';

export default async function handler(req, res) {
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'method_not_allowed' });
    }

    const { user, error, status } = await requireAdmin(req);
    if (error) {
        return res.status(status || 401).json({ error });
    }

    const filterStatus = req.query?.status || 'pending';

    const { data, error: dbError } = await supabaseAdmin
        .from('payment_requests')
        .select(`
            id,
            user_id,
            package_name,
            amount_try,
            credits,
            sender_name,
            sender_iban,
            bank_name,
            transfer_date,
            reference_note,
            status,
            admin_note,
            approved_at,
            created_at,
            profiles!payment_requests_user_id_fkey ( email, full_name, phone )
        `)
        .eq('status', filterStatus)
        .order('created_at', { ascending: false })
        .limit(200);

    if (dbError) {
        console.error('[admin/payments]', dbError);
        return res.status(500).json({ error: 'db_error', detail: dbError.message });
    }

    return res.status(200).json({ payments: data || [] });
}
