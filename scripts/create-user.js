// =============================================================================
// Test kullanıcı oluşturma scripti (admin veya normal)
// =============================================================================
// Kullanım:
//   node --env-file=.env scripts/create-user.js <email> <password> [credits] [--admin]
//
// Örnek (normal kullanıcı):
//   node --env-file=.env scripts/create-user.js test@karmikmatris.com Test2026! 5
//
// Örnek (admin):
//   node --env-file=.env scripts/create-user.js admin@karmikmatris.com Pass! 999 --admin
//
// Script:
//   - auth.users tablosuna kullanıcı oluşturur (e-posta önceden onaylanmış)
//   - profiles satırı trigger ile otomatik oluşur
//   - is_admin (default false) ve credits = N olarak günceller
// =============================================================================

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
    console.error('HATA: SUPABASE_URL ve SUPABASE_SERVICE_KEY .env dosyasında olmalı.');
    process.exit(1);
}

const args = process.argv.slice(2);
const isAdmin = args.includes('--admin');
const positional = args.filter(a => !a.startsWith('--'));
const [email, password, creditsArg] = positional;

if (!email || !password) {
    console.error('Kullanım: node scripts/create-user.js <email> <password> [credits] [--admin]');
    process.exit(1);
}

const credits = parseInt(creditsArg, 10) || (isAdmin ? 999 : 5);

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false }
});

console.log(`\n→ ${email} için ${isAdmin ? 'ADMIN' : 'normal'} kullanıcı oluşturuluyor...`);

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
    const { data, error } = await supabase.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: { full_name: isAdmin ? 'Admin' : 'Test Kullanıcı' }
    });

    if (error) {
        console.error(`HATA: Kullanıcı oluşturulamadı — ${error.message}`);
        process.exit(1);
    }

    userId = data.user.id;
    console.log(`  • Yeni kullanıcı oluşturuldu: ${userId}`);

    await new Promise(r => setTimeout(r, 500));
}

const { error: updateError } = await supabase
    .from('profiles')
    .update({ is_admin: isAdmin, credits, status: 'active' })
    .eq('id', userId);

if (updateError) {
    console.error(`HATA: Profil güncellenemedi — ${updateError.message}`);
    process.exit(1);
}

console.log('\n✓ Kullanıcı hazır:');
console.log(`  email:    ${email}`);
console.log(`  password: ${password}`);
console.log(`  credits:  ${credits}`);
console.log(`  is_admin: ${isAdmin}`);
console.log(`\nGiriş için: /auth/giris.html`);
