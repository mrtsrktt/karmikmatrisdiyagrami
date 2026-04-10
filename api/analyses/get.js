// GET /api/analyses/get?id=... — tek bir analizin tüm detayını döner (PDF tekrar üretmek için)
import { authenticateRequest, supabaseAdmin } from '../../lib/supabase-server.js';

export default async function handler(req, res) {
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'method_not_allowed' });
    }

    const { user, error } = await authenticateRequest(req);
    if (error || !user) {
        return res.status(401).json({ error: 'unauthorized' });
    }

    const id = req.query?.id;
    if (!id) {
        return res.status(400).json({ error: 'missing_id' });
    }

    const { data, error: dbError } = await supabaseAdmin
        .from('analyses')
        .select('*')
        .eq('id', id)
        .eq('user_id', user.id)
        .maybeSingle();

    if (dbError) {
        console.error('[analyses/get]', dbError);
        return res.status(500).json({ error: 'db_error' });
    }

    if (!data) {
        return res.status(404).json({ error: 'not_found' });
    }

    return res.status(200).json({ analysis: data });
}
