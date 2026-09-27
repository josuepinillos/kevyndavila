-- ─────────────────────────────────────────────────────────────
-- RSVP · Cumpleaños Kevyn Dávila
-- Ejecutar una vez en Supabase: SQL Editor → pegar → Run.
-- ─────────────────────────────────────────────────────────────

create table if not exists public.rsvps (
  id               uuid primary key default gen_random_uuid(),
  -- nombre tal como lo escribió el invitado (solo se recortan espacios)
  name             text not null check (char_length(name) between 2 and 100),
  -- clave de comparación: minúsculas, sin tildes, espacios normalizados
  name_normalized  text not null check (char_length(name_normalized) between 2 and 100),
  status           text not null default 'confirmed' check (status in ('confirmed', 'cancelled')),
  created_at       timestamptz not null default now(),
  -- seguimiento del correo al organizador (para depuración y reintentos)
  email_status     text not null default 'pending' check (email_status in ('pending', 'sent', 'failed')),
  email_error      text,
  email_sent_at    timestamptz
);

-- Protección contra duplicados a nivel de base de datos.
create unique index if not exists rsvps_name_normalized_key on public.rsvps (name_normalized);
create index if not exists rsvps_created_at_idx on public.rsvps (created_at desc);

-- Los nombres son privados: RLS activo y sin políticas.
-- Solo el servidor (clave secreta / service_role) puede leer o escribir.
alter table public.rsvps enable row level security;
revoke all on table public.rsvps from anon, authenticated;

-- Inserción atómica e idempotente.
-- Devuelve la fila y si fue creada ahora (created = true) o ya existía.
-- Dos peticiones simultáneas con el mismo nombre nunca crean dos filas.
create or replace function public.confirm_rsvp(p_name text, p_name_normalized text)
returns table (id uuid, created boolean, created_at timestamptz)
language plpgsql
set search_path = ''
as $$
#variable_conflict use_column
declare
  v_id uuid;
  v_created_at timestamptz;
begin
  insert into public.rsvps (name, name_normalized)
  values (p_name, p_name_normalized)
  on conflict (name_normalized) do nothing
  returning public.rsvps.id, public.rsvps.created_at into v_id, v_created_at;

  if v_id is not null then
    return query select v_id, true, v_created_at;
  else
    return query
      select r.id, false, r.created_at
      from public.rsvps r
      where r.name_normalized = p_name_normalized;
  end if;
end;
$$;

revoke execute on function public.confirm_rsvp(text, text) from public, anon, authenticated;
grant execute on function public.confirm_rsvp(text, text) to service_role;
