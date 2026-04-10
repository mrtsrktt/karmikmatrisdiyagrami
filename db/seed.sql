-- ============================================================================
-- Karmik Matris Analizi — Başlangıç Verileri (Seed)
-- ============================================================================
-- rls-policies.sql'den sonra çalıştırın.
-- ============================================================================

-- Başlangıç paketleri
insert into public.credit_packages (name, description, credits, price_try, sort_order, is_active)
values
    ('Başlangıç', 'Tek danışman / Yeni başlayan',          30,  1250.00, 1, true),
    ('Profesyonel', 'Yoğun müşteri portföyü / Atelye',    100,  2750.00, 2, true)
on conflict do nothing;

-- ============================================================================
-- ADMIN KULLANICISI OLUŞTURMA — MANUEL ADIM
-- ============================================================================
-- 1. Önce site üzerinden /auth/kayit.html sayfasından admin e-postası ile
--    normal bir kullanıcı kaydı oluşturun (örn: admin@karmikmatris.com).
-- 2. Sonra Supabase SQL Editor'de aşağıdaki sorguyu çalıştırın:
--
--    update public.profiles
--    set is_admin = true
--    where email = 'admin@karmikmatris.com';
--
-- 3. Çıkış yapıp tekrar giriş yapın — artık /admin/ paneline erişebilirsiniz.
-- ============================================================================
