// POST /api/admin/approve-payment — admin onayı, kredi yükler
//
// Body: { payment_id: uuid }
import { requireAdmin, supabaseAdmin } from '../../lib/supabase-server.js';

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'method_not_allowed' });
    }

    const { user, profile, error, status } = await requireAdmin(req);
    if (error) {
        return res.status(status || 401).json({ error });
    }

    const { payment_id } = req.body || {};
    if (!payment_id) {
        return res.status(400).json({ error: 'missing_payment_id' });
    }

    // Atomik işlem: payment_requests'i çek, profili güncelle, transaction logla
    const { data: payment, error: fetchError } = await supabaseAdmin
        .from('payment_requests')
        .select('*')
        .eq('id', payment_id)
        .eq('status', 'pending')
        .maybeSingle();

    if (fetchError || !payment) {
        return res.status(404).json({ error: 'payment_not_found_or_processed' });
    }

    // 1) ödemeyi onayla
    const { error: updateErr } = await supabaseAdmin
        .from('payment_requests')
        .update({
            status:      'approved',
            approved_by: user.id,
            approved_at: new Date().toISOString()
        })
        .eq('id', payment_id)
        .eq('status', 'pending'); // double-check race condition

    if (updateErr) {
        console.error('[approve-payment update]', updateErr);
        return res.status(500).json({ error: 'update_failed' });
    }

    // 2) kullanıcı kredisini artır (RPC ile atomik)
    const { data: updatedProfile, error: rpcErr } = await supabaseAdmin
        .rpc('admin_grant_credits', {
            p_user_id: payment.user_id,
            p_amount:  payment.credits,
            p_note:    `Havale onaylandı: ${payment.package_name} (${payment.amount_try} TL)`
        });

    if (rpcErr) {
        console.error('[approve-payment rpc]', rpcErr);
        // payment'i geri pending'e çek (rollback)
        await supabaseAdmin
            .from('payment_requests')
            .update({ status: 'pending', approved_by: null, approved_at: null })
            .eq('id', payment_id);
        return res.status(500).json({ error: 'credit_grant_failed', detail: rpcErr.message });
    }

    return res.status(200).json({
        success: true,
        message: `${payment.credits} kredi yüklendi.`,
        payment_id
    });
}
