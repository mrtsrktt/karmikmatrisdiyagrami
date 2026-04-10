// GET /api/credits/balance — kullanıcının kredi bakiyesini döner
import { authenticateRequest } from '../../lib/supabase-server.js';

export default async function handler(req, res) {
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'method_not_allowed' });
    }

    const { user, profile, error } = await authenticateRequest(req);
    if (error || !user) {
        return res.status(401).json({ error: 'unauthorized' });
    }

    return res.status(200).json({
        credits: profile?.credits ?? 0,
        is_admin: profile?.is_admin ?? false,
        full_name: profile?.full_name ?? null,
        email: profile?.email ?? user.email
    });
}
