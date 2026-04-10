-- ============================================================================
-- Migration 001: RPC auth.uid() admin kontrol bug fix
-- ============================================================================
-- SORUN:
-- approve_payment_request, reject_payment_request, admin_grant_credits
-- fonksiyonları auth.uid() ile admin kontrolü yapıyor. Backend API service_key
-- ile çağırdığında auth.uid() NULL döner ve "unauthorized" hatası fırlatılır.
-- Sonuç: Admin onay basana ödeme onaylanmaz, kredi yüklenmez.
--
-- ÇÖZÜM: API katmanı zaten requireAdmin middleware ile yetki kontrolü
-- yapıyor. Function içindeki kontrolü kaldır, admin id'yi parametre olarak al.
-- ============================================================================
-- Bu dosyayı Supabase SQL Editor'de bir kez çalıştırın.
-- Yeni kurulumlarda gerekli değildir; db/triggers.sql zaten güncel sürümü içerir.
-- ============================================================================

-- 1) approve_payment_request — eski versiyonu sil, yenisini oluştur
drop function if exists public.approve_payment_request(uuid);

create or replace function public.approve_payment_request(
    p_payment_id uuid,
    p_admin_id   uuid
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
    v_user_id     uuid;
    v_credits     integer;
begin
    select user_id, credits into v_user_id, v_credits
    from public.payment_requests
    where id = p_payment_id and status = 'pending'
    for update;

    if v_user_id is null then
        raise exception 'payment not found or already processed';
    end if;

    update public.payment_requests
    set status      = 'approved',
        approved_by = p_admin_id,
        approved_at = now()
    where id = p_payment_id;

    update public.profiles
    set credits = credits + v_credits
    where id = v_user_id;

    insert into public.credit_transactions (user_id, amount, type, reference_id, note)
    values (v_user_id, v_credits, 'purchase', p_payment_id, 'Havale onaylandı');
end;
$$;

-- 2) reject_payment_request
drop function if exists public.reject_payment_request(uuid, text);

create or replace function public.reject_payment_request(
    p_payment_id uuid,
    p_admin_id   uuid,
    p_reason     text default null
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
    update public.payment_requests
    set status      = 'rejected',
        admin_note  = p_reason,
        approved_by = p_admin_id,
        approved_at = now()
    where id = p_payment_id and status = 'pending';

    if not found then
        raise exception 'payment not found or already processed';
    end if;
end;
$$;

-- 3) admin_grant_credits
drop function if exists public.admin_grant_credits(uuid, integer, text);

create or replace function public.admin_grant_credits(
    p_user_id uuid,
    p_amount  integer,
    p_note    text default null,
    p_type    text default 'admin_grant'
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
    if p_amount = 0 then
        raise exception 'amount must not be zero';
    end if;

    update public.profiles
    set credits = credits + p_amount
    where id = p_user_id;

    if not found then
        raise exception 'user not found';
    end if;

    insert into public.credit_transactions (user_id, amount, type, note)
    values (p_user_id, p_amount, p_type, coalesce(p_note, 'Admin tarafından eklendi'));
end;
$$;
