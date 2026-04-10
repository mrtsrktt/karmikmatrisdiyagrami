// GET /api/analyses/list — kullanıcının analiz geçmişi
import { authenticateRequest, supabaseAdmin } from '../../lib/supabase-server.js';

export default async function handler(req, res) {
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'method_not_allowed' });
    }

    const { user, error } = await authenticateRequest(req);
    if (error || !user) {
        return res.status(401).json({ error: 'unauthorized' });
    }

    const limit  = Math.min(parseInt(req.query?.limit ?? '50', 10) || 50, 200);
    const offset = parseInt(req.query?.offset ?? '0', 10) || 0;

    const { data, error: dbError } = await supabaseAdmin
        .from('analyses')
        .select('id, client_name, birth_date, birth_city, ai_model, cost_credits, created_at')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

    if (dbError) {
        console.error('[analyses/list]', dbError);
        return res.status(500).json({ error: 'db_error' });
    }

    return res.status(200).json({ analyses: data || [] });
}
