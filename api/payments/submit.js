// POST /api/payments/submit — kullanıcı havale bildirimi gönderir
//
// Body:
// {
//   package_id: uuid,
//   sender_name: string,
//   sender_iban?: string,
//   bank_name?: string,
//   transfer_date?: 'YYYY-MM-DD',
//   reference_note?: string
// }
import { authenticateRequest, supabaseAdmin } from '../../lib/supabase-server.js';

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'method_not_allowed' });
    }

    const { user, error } = await authenticateRequest(req);
    if (error || !user) {
        return res.status(401).json({ error: 'unauthorized' });
    }

    const {
        package_id,
        sender_name,
        sender_iban,
        bank_name,
        transfer_date,
        reference_note
    } = req.body || {};

    if (!package_id || !sender_name) {
        return res.status(400).json({ error: 'missing_fields', message: 'package_id ve sender_name zorunludur' });
    }

    // Paket bilgisini çek
    const { data: pkg, error: pkgError } = await supabaseAdmin
        .from('credit_packages')
        .select('*')
        .eq('id', package_id)
        .eq('is_active', true)
        .maybeSingle();

    if (pkgError || !pkg) {
        return res.status(404).json({ error: 'package_not_found' });
    }

    // Aynı kullanıcının bekleyen başvurusu var mı? (spam koruması)
    const { count: pendingCount } = await supabaseAdmin
        .from('payment_requests')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('status', 'pending');

    if ((pendingCount ?? 0) >= 3) {
        return res.status(429).json({
            error: 'too_many_pending',
            message: 'Bekleyen 3 başvurunuz var. Onay bekleyiniz.'
        });
    }

    const { data, error: insertError } = await supabaseAdmin
        .from('payment_requests')
        .insert({
            user_id:        user.id,
            package_id:     pkg.id,
            package_name:   pkg.name,
            amount_try:     pkg.price_try,
            credits:        pkg.credits,
            sender_name:    sender_name.toString().slice(0, 200),
            sender_iban:    sender_iban?.toString().slice(0, 34) || null,
            bank_name:      bank_name?.toString().slice(0, 100) || null,
            transfer_date:  transfer_date || null,
            reference_note: reference_note?.toString().slice(0, 1000) || null,
            status:         'pending'
        })
        .select()
        .single();

    if (insertError) {
        console.error('[payments/submit]', insertError);
        return res.status(500).json({ error: 'insert_failed' });
    }

    return res.status(200).json({ payment: data });
}
