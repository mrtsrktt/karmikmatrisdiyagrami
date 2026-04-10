// GET /api/payments/packages — aktif kredi paketlerini döner (auth gerektirmez)
import { supabaseAdmin } from '../../lib/supabase-server.js';

export default async function handler(req, res) {
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'method_not_allowed' });
    }

    const { data, error } = await supabaseAdmin
        .from('credit_packages')
        .select('id, name, description, credits, price_try, sort_order')
        .eq('is_active', true)
        .order('sort_order', { ascending: true });

    if (error) {
        console.error('[payments/packages]', error);
        return res.status(500).json({ error: 'db_error' });
    }

    return res.status(200).json({ packages: data || [] });
}
