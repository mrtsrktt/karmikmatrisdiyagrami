-- ============================================================================
-- Karmik Matris Analizi — Triggers ve Fonksiyonlar
-- ============================================================================
-- schema.sql'den sonra çalıştırın.
-- ============================================================================

-- 1) Yeni kullanıcı kayıt olduğunda profiles tablosuna otomatik satır
-- ----------------------------------------------------------------------------
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
    insert into public.profiles (id, email, full_name, phone)
    values (
        new.id,
        new.email,
        coalesce(new.raw_user_meta_data->>'full_name', ''),
        coalesce(new.raw_user_meta_data->>'phone', '')
    )
    on conflict (id) do nothing;
    return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
    after insert on auth.users
    for each row execute procedure public.handle_new_user();

-- 2) Havale/ödeme onayı (atomik kredi yükleme)
-- ----------------------------------------------------------------------------
-- Bu fonksiyon SADECE backend api/ endpointlerinden service_key ile çağrılır.
-- Yetki kontrolü API katmanında (requireAdmin middleware) yapılır;
-- bu sayede service_key kullanıldığında auth.uid() NULL döndüğü için
-- function içinde admin doğrulaması YAPILMAZ.
-- p_admin_id parametresi audit log için gereklidir (kim onayladı).
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
    -- ödeme bilgisini çek (lock)
    select user_id, credits into v_user_id, v_credits
    from public.payment_requests
    where id = p_payment_id and status = 'pending'
    for update;

    if v_user_id is null then
        raise exception 'payment not found or already processed';
    end if;

    -- ödeme talebini onaylanmış olarak güncelle
    update public.payment_requests
    set status      = 'approved',
        approved_by = p_admin_id,
        approved_at = now()
    where id = p_payment_id;

    -- kullanıcının kredisini artır
    update public.profiles
    set credits = credits + v_credits
    where id = v_user_id;

    -- işlem geçmişine yaz
    insert into public.credit_transactions (user_id, amount, type, reference_id, note)
    values (v_user_id, v_credits, 'purchase', p_payment_id, 'Havale onaylandı');
end;
$$;

-- 3) Havale/ödeme reddi
-- ----------------------------------------------------------------------------
-- Yetki API katmanında doğrulanır; function içinde admin kontrolü yapılmaz.
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

-- 4) Analiz yapıldığında kredi düşür (atomik)
-- ----------------------------------------------------------------------------
-- Kullanım: select public.deduct_credit_for_analysis('user-uuid');
-- Hata fırlatır: "insufficient credits"
create or replace function public.deduct_credit_for_analysis(p_user_id uuid)
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
    v_remaining integer;
begin
    update public.profiles
    set credits = credits - 1
    where id = p_user_id and credits > 0
    returning credits into v_remaining;

    if v_remaining is null then
        raise exception 'insufficient credits';
    end if;

    insert into public.credit_transactions (user_id, amount, type, note)
    values (p_user_id, -1, 'analysis', 'Analiz yapıldı');

    return v_remaining;
end;
$$;

-- 5) Admin manuel kredi ekleme / çıkarma (veya iade)
-- ----------------------------------------------------------------------------
-- Bu fonksiyon SADECE backend api/ endpointlerinden service_key ile çağrılır.
-- Admin yetkisi API katmanında (requireAdmin) doğrulanır.
-- 'type' parametresi credit_transactions kaydının türünü belirler.
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
