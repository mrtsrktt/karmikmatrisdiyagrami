// GET /api/admin/stats — admin dashboard için temel istatistikler
import { requireAdmin, supabaseAdmin } from '../../lib/supabase-server.js';

export default async function handler(req, res) {
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'method_not_allowed' });
    }

    const { error, status } = await requireAdmin(req);
    if (error) {
        return res.status(status || 401).json({ error });
    }

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

        // Son 7 günde yapılan analizler
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        const { count: weeklyAnalyses } = await supabaseAdmin
            .from('analyses')
            .select('*', { count: 'exact', head: true })
            .gte('created_at', sevenDaysAgo.toISOString());

        return res.status(200).json({
            users:            userCount ?? 0,
            pending_payments: pendingCount ?? 0,
            approved_payments: approvedCount ?? 0,
            total_analyses:   analysisCount ?? 0,
            weekly_analyses:  weeklyAnalyses ?? 0,
            total_revenue:    totalRevenue
        });
    } catch (err) {
        console.error('[admin/stats]', err);
        return res.status(500).json({ error: 'stats_failed' });
    }
}
