-- ============================================================================
-- Karmik Matris Analizi — Veritabanı Şeması
-- ============================================================================
-- Bu dosyayı Supabase SQL Editor'de çalıştır.
-- Sıra: 1) schema.sql  2) triggers.sql  3) rls-policies.sql  4) seed.sql
-- ============================================================================

-- 1) PROFILES — auth.users tablosunu genişleten kullanıcı bilgisi tablosu
-- ----------------------------------------------------------------------------
create table if not exists public.profiles (
    id           uuid primary key references auth.users(id) on delete cascade,
    email        text,
    full_name    text,
    phone        text,
    credits      integer not null default 0,
    is_admin     boolean not null default false,
    status       text    not null default 'active', -- 'active', 'suspended'
    created_at   timestamptz not null default now(),
    updated_at   timestamptz not null default now()
);

create index if not exists profiles_is_admin_idx on public.profiles (is_admin) where is_admin = true;

-- 2) CREDIT_PACKAGES — satışa sunulan paketler
-- ----------------------------------------------------------------------------
create table if not exists public.credit_packages (
    id          uuid primary key default gen_random_uuid(),
    name        text not null,
    description text,
    credits     integer not null,
    price_try   numeric(10,2) not null,
    is_active   boolean not null default true,
    sort_order  integer not null default 0,
    created_at  timestamptz not null default now()
);

-- 3) PAYMENT_REQUESTS — kullanıcıların havale bildirimleri
-- ----------------------------------------------------------------------------
create table if not exists public.payment_requests (
    id              uuid primary key default gen_random_uuid(),
    user_id         uuid not null references public.profiles(id) on delete cascade,
    package_id      uuid not null references public.credit_packages(id),
    package_name    text not null,
    amount_try      numeric(10,2) not null,
    credits         integer not null,
    sender_name     text not null,
    sender_iban     text,
    bank_name       text,
    transfer_date   date,
    reference_note  text,
    status          text not null default 'pending', -- pending | approved | rejected
    admin_note      text,
    approved_by     uuid references public.profiles(id),
    approved_at     timestamptz,
    created_at      timestamptz not null default now()
);

create index if not exists payment_requests_user_idx
    on public.payment_requests (user_id, created_at desc);

create index if not exists payment_requests_status_idx
    on public.payment_requests (status, created_at desc);

-- 4) CREDIT_TRANSACTIONS — kredi hareketleri (audit log)
-- ----------------------------------------------------------------------------
create table if not exists public.credit_transactions (
    id            uuid primary key default gen_random_uuid(),
    user_id       uuid not null references public.profiles(id) on delete cascade,
    amount        integer not null, -- + alacak, - borç
    type          text not null,    -- 'purchase' | 'analysis' | 'admin_grant' | 'refund'
    reference_id  uuid,             -- payment_request.id veya analysis.id
    note          text,
    created_at    timestamptz not null default now()
);

create index if not exists credit_transactions_user_idx
    on public.credit_transactions (user_id, created_at desc);

-- 5) ANALYSES — kullanıcıların yaptığı analizler
-- ----------------------------------------------------------------------------
create table if not exists public.analyses (
    id                  uuid primary key default gen_random_uuid(),
    user_id             uuid not null references public.profiles(id) on delete cascade,
    client_name         text,         -- analiz edilen kişinin adı (opsiyonel)
    birth_date          date not null,
    birth_time          time,
    birth_city          text,
    matrix_data         jsonb,        -- hesaplanan matris (positions, energies)
    birth_chart_data    jsonb,        -- natal harita
    ai_summary          text,         -- claude api çıktısı
    ai_model            text,         -- 'claude-haiku-4-5'
    cost_credits        integer not null default 1,
    created_at          timestamptz not null default now()
);

create index if not exists analyses_user_idx
    on public.analyses (user_id, created_at desc);

-- 6) updated_at otomatik güncelleme tetikleyicisi
-- ----------------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
    new.updated_at := now();
    return new;
end;
$$;

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at
    before update on public.profiles
    for each row execute function public.set_updated_at();
