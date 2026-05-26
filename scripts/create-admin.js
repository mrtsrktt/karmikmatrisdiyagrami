// =============================================================================
// Admin kullanıcı oluşturma scripti
// =============================================================================
// Kullanım:
//   1) Geçici olarak .env dosyana SUPABASE_URL ve SUPABASE_SERVICE_KEY ekle
//      (Supabase Dashboard > Settings > API > service_role)
//   2) node --env-file=.env scripts/create-admin.js <email> <password> [credits]
//
// Örnek:
//   node --env-file=.env scripts/create-admin.js admin@karmikmatris.com Gizem2026! 999
//
// Script:
//   - auth.users tablosuna kullanıcı oluşturur (e-posta önceden onaylanmış)
//   - profiles satırı trigger ile otomatik oluşur
//   - is_admin = true ve credits = N olarak günceller
// =============================================================================

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
    console.error('HATA: SUPABASE_URL ve SUPABASE_SERVICE_KEY .env dosyasında olmalı.');
    console.error('Supabase Dashboard > Project Settings > API > service_role key');
    process.exit(1);
}

const [, , email, password, creditsArg] = process.argv;

if (!email || !password) {
    console.error('Kullanım: node scripts/create-admin.js <email> <password> [credits]');
    process.exit(1);
}

const credits = parseInt(creditsArg, 10) || 999;

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false }
});

console.log(`\n→ ${email} için admin kullanıcı oluşturuluyor...`);

// 1) Kullanıcı var mı kontrol et
const { data: existing } = await supabase
    .from('profiles')
    .select('id, email, is_admin, credits')
    .eq('email', email)
    .maybeSingle();

let userId;

if (existing) {
    console.log(`  • Mevcut kullanıcı bulundu: ${existing.id}`);
    userId = existing.id;
} else {
    // 2) Yeni kullanıcı oluştur
    const { data, error } = await supabase.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: { full_name: 'Admin' }
    });

    if (error) {
        console.error(`HATA: Kullanıcı oluşturulamadı — ${error.message}`);
        process.exit(1);
    }

    userId = data.user.id;
    console.log(`  • Yeni kullanıcı oluşturuldu: ${userId}`);

    // Trigger profile'ı oluşturmuş olmalı, biraz bekle ve tekrar dene
    await new Promise(r => setTimeout(r, 500));
}

// 3) is_admin = true + credits ayarla
const { error: updateError } = await supabase
    .from('profiles')
    .update({ is_admin: true, credits, status: 'active' })
    .eq('id', userId);

if (updateError) {
    console.error(`HATA: Profil güncellenemedi — ${updateError.message}`);
    process.exit(1);
}

console.log('\n✓ Admin kullanıcı hazır:');
console.log(`  email:    ${email}`);
console.log(`  password: ${password}`);
console.log(`  credits:  ${credits}`);
console.log(`  is_admin: true`);
console.log('\nGiriş için: /auth/giris.html → /admin/');
