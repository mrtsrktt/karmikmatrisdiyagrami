-- ============================================================================
-- Karmik Matris Analizi — Row Level Security Politikaları
-- ============================================================================
-- triggers.sql'den sonra çalıştırın.
-- ============================================================================

-- Yardımcı fonksiyon: çağıran kullanıcı admin mi?
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
    select coalesce(
        (select is_admin from public.profiles where id = auth.uid()),
        false
    );
$$;

-- ============================================================================
-- PROFILES
-- ============================================================================
alter table public.profiles enable row level security;

drop policy if exists "profiles_select_own"  on public.profiles;
drop policy if exists "profiles_update_own"  on public.profiles;
drop policy if exists "profiles_admin_all"   on public.profiles;

create policy "profiles_select_own"
    on public.profiles for select
    using (auth.uid() = id);

create policy "profiles_update_own"
    on public.profiles for update
    using (auth.uid() = id)
    with check (auth.uid() = id and is_admin = (select is_admin from public.profiles where id = auth.uid()));
-- (kullanıcı kendi is_admin değerini değiştiremez)

create policy "profiles_admin_all"
    on public.profiles for all
    using (public.is_admin())
    with check (public.is_admin());

-- ============================================================================
-- CREDIT_PACKAGES  (herkese görünür, sadece admin yazabilir)
-- ============================================================================
alter table public.credit_packages enable row level security;

drop policy if exists "packages_read_all"   on public.credit_packages;
drop policy if exists "packages_admin_write" on public.credit_packages;

create policy "packages_read_all"
    on public.credit_packages for select
    using (true);

create policy "packages_admin_write"
    on public.credit_packages for all
    using (public.is_admin())
    with check (public.is_admin());

-- ============================================================================
-- PAYMENT_REQUESTS
-- ============================================================================
alter table public.payment_requests enable row level security;

drop policy if exists "payments_select_own"   on public.payment_requests;
drop policy if exists "payments_insert_own"   on public.payment_requests;
drop policy if exists "payments_admin_all"    on public.payment_requests;

create policy "payments_select_own"
    on public.payment_requests for select
    using (auth.uid() = user_id);

create policy "payments_insert_own"
    on public.payment_requests for insert
    with check (auth.uid() = user_id and status = 'pending');

create policy "payments_admin_all"
    on public.payment_requests for all
    using (public.is_admin())
    with check (public.is_admin());

-- ============================================================================
-- CREDIT_TRANSACTIONS  (sadece okunur — yazma sadece SECURITY DEFINER fonksiyonlarla)
-- ============================================================================
alter table public.credit_transactions enable row level security;

drop policy if exists "tx_select_own"   on public.credit_transactions;
drop policy if exists "tx_admin_all"    on public.credit_transactions;

create policy "tx_select_own"
    on public.credit_transactions for select
    using (auth.uid() = user_id);

create policy "tx_admin_all"
    on public.credit_transactions for select
    using (public.is_admin());

-- ============================================================================
-- ANALYSES
-- ============================================================================
alter table public.analyses enable row level security;

drop policy if exists "analyses_select_own"  on public.analyses;
drop policy if exists "analyses_insert_own"  on public.analyses;
drop policy if exists "analyses_admin_all"   on public.analyses;

create policy "analyses_select_own"
    on public.analyses for select
    using (auth.uid() = user_id);

create policy "analyses_insert_own"
    on public.analyses for insert
    with check (auth.uid() = user_id);

create policy "analyses_admin_all"
    on public.analyses for select
    using (public.is_admin());
