// Supabase public config — anon key güvenli, frontend'de kullanılır.
// Vercel build sırasında değiştirilebilir, ancak şimdilik elle yazıyoruz.
//
// ÖNEMLİ: SUPABASE_SERVICE_KEY ASLA buraya koymayın — sadece backend (api/) kullanır.

window.SUPABASE_CONFIG = {
    url:     'https://cogbniuprdrpaezlzzrv.supabase.co',
    anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNvZ2JuaXVwcmRycGFlemx6enJ2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk4MjIyODIsImV4cCI6MjA5NTM5ODI4Mn0.cf3bvTFOIkeRfycW7E0W8CtWg-y2Qdn_18vUTpBb0GI'
};
