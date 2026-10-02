-- ============================================================
-- ProSalud Gold — Multiusuario por clínica (staff con acceso
-- compartido a los datos del dueño, no tenants separados).
--
-- Hasta ahora cada fila de datos (patients, appointments, etc.)
-- tiene "user_id" = el dueño de la clínica, y las políticas RLS
-- solo dejaban pasar auth.uid() = user_id. Un login nuevo veía
-- la app vacía porque nada le pertenecía a su propio uid.
--
-- Esta migración agrega `clinic_members` (staff vinculado a la
-- clínica de un dueño) y una función `current_tenant_id()` que
-- resuelve, para cualquier sesión autenticada, el uid del dueño
-- de la clínica a la que pertenece (el suyo propio si es dueño,
-- o el del dueño si es un miembro activo). Se usa esa función
-- tanto en el DEFAULT de "user_id" como en las políticas RLS,
-- así que el código de la app no necesita cambiar: un insert sin
-- indicar user_id sigue quedando bien etiquetado automáticamente,
-- sea quien sea el que esté logueado.
-- ============================================================

create table if not exists clinic_members (
  id uuid primary key default gen_random_uuid(),
  clinic_config_id uuid not null references clinic_config(id) on delete cascade,
  auth_user_id uuid not null unique references auth.users(id) on delete cascade,
  username text not null unique,
  display_name text not null,
  role text not null default 'secretaria',
  allowed_modules text[] not null default '{}',
  active boolean not null default true,
  must_change_password boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists clinic_members_updated_at on clinic_members;
create trigger clinic_members_updated_at
  before update on clinic_members
  for each row execute function update_updated_at();

alter table clinic_members enable row level security;

drop policy if exists "Owners manage own clinic_members" on clinic_members;
create policy "Owners manage own clinic_members" on clinic_members
  for all
  using (clinic_config_id in (select id from clinic_config where user_id = auth.uid()))
  with check (clinic_config_id in (select id from clinic_config where user_id = auth.uid()));

drop policy if exists "Members view own membership" on clinic_members;
create policy "Members view own membership" on clinic_members
  for select
  using (auth_user_id = auth.uid());

drop policy if exists "Members update own password flag" on clinic_members;
create policy "Members update own password flag" on clinic_members
  for update
  using (auth_user_id = auth.uid())
  with check (auth_user_id = auth.uid());

-- ── current_tenant_id(): uid del dueño de la clínica para la sesión actual ──
create or replace function public.current_tenant_id()
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(
    (
      select cc.user_id
      from clinic_members cm
      join clinic_config cc on cc.id = cm.clinic_config_id
      where cm.auth_user_id = auth.uid() and cm.active
      limit 1
    ),
    auth.uid()
  );
$$;

-- ── clinic_config / sedes: los miembros pueden LEER (no administrar) ──
drop policy if exists "Members read clinic_config" on clinic_config;
create policy "Members read clinic_config" on clinic_config
  for select
  using (public.current_tenant_id() = user_id);

drop policy if exists "Members read sedes" on sedes;
create policy "Members read sedes" on sedes
  for select
  using (clinic_config_id in (select id from clinic_config where public.current_tenant_id() = user_id));

-- ── Tablas de la clínica: ampliar default + política a current_tenant_id() ──
do $$
declare
  t text;
  tables text[] := array[
    'patients','doctors','appointments','treatments','cash_entries',
    'inventory_items','lab_orders','payroll_entries','patient_feedback',
    'antecedentes','evoluciones','recetas','consentimientos',
    'odontogram_records','treatment_plans','invoices','quickbooks_connections',
    'care_encounters'
  ];
begin
  foreach t in array tables loop
    execute format('alter table %I alter column user_id set default public.current_tenant_id()', t);
    execute format('drop policy if exists %I on %I', 'Users manage own ' || t, t);
    execute format(
      'create policy %I on %I for all using (public.current_tenant_id() = user_id) with check (public.current_tenant_id() = user_id)',
      'Users manage own ' || t, t
    );
  end loop;
end $$;
