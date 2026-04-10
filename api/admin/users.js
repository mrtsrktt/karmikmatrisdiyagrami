// GET /api/admin/users — admin için tüm kullanıcılar
import { requireAdmin, supabaseAdmin } from '../../lib/supabase-server.js';

export default async function handler(req, res) {
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'method_not_allowed' });
    }

    const { error, status } = await requireAdmin(req);
    if (error) {
        return res.status(status || 401).json({ error });
    }

    const search = (req.query?.q || '').toString().toLowerCase().trim();
    const limit  = Math.min(parseInt(req.query?.limit ?? '100', 10) || 100, 500);

    let query = supabaseAdmin
        .from('profiles')
        .select('id, email, full_name, phone, credits, is_admin, status, created_at')
        .order('created_at', { ascending: false })
        .limit(limit);

    if (search) {
        // Postgrest 'or' filter
        query = query.or(`email.ilike.%${search}%,full_name.ilike.%${search}%,phone.ilike.%${search}%`);
    }

    const { data, error: dbError } = await query;

    if (dbError) {
        console.error('[admin/users]', dbError);
        return res.status(500).json({ error: 'db_error' });
    }

    return res.status(200).json({ users: data || [] });
}
