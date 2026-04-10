// Supabase public config — anon key güvenli, frontend'de kullanılır.
// Vercel build sırasında değiştirilebilir, ancak şimdilik elle yazıyoruz.
//
// ÖNEMLİ: SUPABASE_SERVICE_KEY ASLA buraya koymayın — sadece backend (api/) kullanır.

window.SUPABASE_CONFIG = {
    url:     'https://YOUR-PROJECT.supabase.co',
    anonKey: 'YOUR-ANON-KEY-HERE'
};
