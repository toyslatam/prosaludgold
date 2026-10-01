-- ============================================================
-- ProSalud Gold — Atenciones clínicas (consultas/sesiones/procedimientos)
--
-- "Atención Clínica" guardaba todo solo en localStorage del navegador,
-- nunca llegaba al backend: cualquier usuaria que cerrara el navegador,
-- cambiara de computadora o limpiara datos del sitio perdía su trabajo.
-- Esta tabla reemplaza ese almacenamiento local por el real.
-- ============================================================

create table if not exists care_encounters (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  vertical text not null,
  patient_id uuid not null,
  professional_id uuid,
  start_at timestamptz not null,
  status text not null default 'DRAFT',
  site_id uuid,
  location_id uuid,
  procedures jsonb not null default '[]'::jsonb,
  inventory_used jsonb not null default '[]'::jsonb,
  clinical_notes text,
  vertical_data jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'care_encounters_status_check'
  ) then
    alter table care_encounters
      add constraint care_encounters_status_check check (status in ('DRAFT', 'COMPLETED'));
  end if;
end $$;

create index if not exists care_encounters_user_id_idx on care_encounters(user_id);
create index if not exists care_encounters_patient_id_idx on care_encounters(patient_id);
create index if not exists care_encounters_vertical_idx on care_encounters(vertical);

alter table care_encounters enable row level security;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'care_encounters'
      and policyname = 'Users manage own care_encounters'
  ) then
    create policy "Users manage own care_encounters" on care_encounters
      for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
  end if;
end $$;

drop trigger if exists set_care_encounters_updated_at on care_encounters;
create trigger set_care_encounters_updated_at
  before update on care_encounters
  for each row execute function set_updated_at();
