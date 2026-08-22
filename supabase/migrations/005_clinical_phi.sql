-- ============================================================
-- ProSalud Gold — Historia clínica (PHI) en Postgres
-- Ejecutar en: Supabase Dashboard → SQL Editor
--
-- Reemplaza el almacenamiento en localStorage de: antecedentes,
-- evoluciones, recetas, consentimientos, odontograma y planes de
-- tratamiento. Antes vivían solo en el navegador del usuario (sin
-- backup, sin multi-dispositivo, sin trazabilidad).
--
-- Nota de diseño — patient_id es TEXT, no FK a patients(id):
-- La ficha de paciente del dashboard (Pacientes, PatientData,
-- PatientFicha, etc.) usa hoy una identidad de paciente mock
-- (src/lib/patients/repository.ts, ids tipo "p1", "p2"…)
-- completamente separada de la tabla `patients` real de Supabase
-- que usa Agenda/Caja. Mientras esa reconciliación no se haga,
-- estas tablas no pueden tener FK real a `patients(id)`. El
-- aislamiento multi-tenant se garantiza por `user_id` (RLS), no
-- por la relación con `patients`. Cuando se unifique la identidad
-- de paciente, agregar la FK y una migración de backfill.
-- ============================================================

-- ── antecedentes (uno por paciente) ─────────────────────────
create table if not exists antecedentes (
  id                      uuid primary key default uuid_generate_v4(),
  user_id                 uuid not null references auth.users(id) default auth.uid(),
  patient_id              text not null,
  alergias                text not null default '',
  enfermedades_sistemicas text not null default '',
  medicacion_actual       text not null default '',
  embarazo                text not null default '',
  habitos_tabaco          text not null default '',
  habitos_alcohol         text not null default '',
  observaciones           text not null default '',
  updated_at              timestamptz not null default now(),
  unique (user_id, patient_id)
);

alter table antecedentes enable row level security;
create policy "Users manage own antecedentes" on antecedentes
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ── evoluciones ──────────────────────────────────────────────
create table if not exists evoluciones (
  id            uuid primary key default uuid_generate_v4(),
  user_id       uuid not null references auth.users(id) default auth.uid(),
  patient_id    text not null,
  date          date not null,
  time          text not null default '',
  doctor_id     text not null default '',
  doctor_name   text not null default '',
  procedure_ids text[] not null default '{}',
  notes         text not null default '',
  created_at    timestamptz not null default now()
);

create index if not exists idx_evoluciones_patient on evoluciones(user_id, patient_id);

alter table evoluciones enable row level security;
create policy "Users manage own evoluciones" on evoluciones
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ── recetas ──────────────────────────────────────────────────
create table if not exists recetas (
  id                      uuid primary key default uuid_generate_v4(),
  user_id                 uuid not null references auth.users(id) default auth.uid(),
  patient_id              text not null,
  date                    date not null,
  doctor_id               text not null default '',
  doctor_name             text not null default '',
  medicamentos            jsonb not null default '[]',
  indicaciones_generales  text not null default '',
  created_at              timestamptz not null default now()
);

create index if not exists idx_recetas_patient on recetas(user_id, patient_id);

alter table recetas enable row level security;
create policy "Users manage own recetas" on recetas
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ── consentimientos ──────────────────────────────────────────
create table if not exists consentimientos (
  id              uuid primary key default uuid_generate_v4(),
  user_id         uuid not null references auth.users(id) default auth.uid(),
  patient_id      text not null,
  type            text not null,
  date            date not null,
  signed          boolean not null default false,
  signed_at       timestamptz,
  signed_by_name  text,
  created_at      timestamptz not null default now()
);

create index if not exists idx_consentimientos_patient on consentimientos(user_id, patient_id);

alter table consentimientos enable row level security;
create policy "Users manage own consentimientos" on consentimientos
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ── odontogram_records ───────────────────────────────────────
create table if not exists odontogram_records (
  id              uuid primary key default uuid_generate_v4(),
  user_id         uuid not null references auth.users(id) default auth.uid(),
  patient_id      text not null,
  permanent       boolean not null,
  tooth_id        text not null,
  condition       text not null,
  surfaces        text[] not null default '{}',
  record_type     text not null default 'CONDITION',
  condition_kind  text,
  procedure_id    text,
  procedure_name  text,
  doctor_id       text,
  quantity        integer,
  notes           text,
  created_at      timestamptz not null default now(),
  annulled_at     timestamptz
);

create index if not exists idx_odontogram_records_patient on odontogram_records(user_id, patient_id, permanent);

alter table odontogram_records enable row level security;
create policy "Users manage own odontogram_records" on odontogram_records
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ── treatment_plans ──────────────────────────────────────────
create table if not exists treatment_plans (
  id                    uuid primary key default uuid_generate_v4(),
  user_id               uuid not null references auth.users(id) default auth.uid(),
  patient_id            text not null,
  number                text not null,
  name                  text not null,
  professional_id       text not null default '',
  professional_name     text not null default '',
  specialty             text,
  collaborators         text[] not null default '{}',
  branch                text,
  convenio              text,
  total_budget          numeric(10,2) not null default 0,
  discount_percent      numeric(5,2) not null default 0,
  realizado             numeric(10,2) not null default 0,
  paid                  numeric(10,2) not null default 0,
  status                text not null default 'diagnostico',
  last_appointment_date date,
  last_appointment_time text,
  prestaciones          jsonb not null default '[]',
  created_at            timestamptz not null default now()
);

create index if not exists idx_treatment_plans_patient on treatment_plans(user_id, patient_id);

alter table treatment_plans enable row level security;
create policy "Users manage own treatment_plans" on treatment_plans
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
