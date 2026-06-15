-- ============================================================
-- ProSalud Gold — Schema inicial
-- Ejecutar en: Supabase Dashboard → SQL Editor
-- ============================================================

-- ── Extensiones ──────────────────────────────────────────────
create extension if not exists "uuid-ossp";

-- ── Enums ────────────────────────────────────────────────────
create type appointment_status as enum (
  'pendiente', 'confirmada', 'en_sala', 'atendida', 'no_asistio'
);

create type cash_entry_type as enum (
  'ingreso', 'egreso'
);

create type lab_order_status as enum (
  'solicitado', 'en_proceso', 'recibido', 'entregado'
);

create type treatment_status as enum (
  'pendiente', 'en_curso', 'completado'
);

-- ── Tabla: patients ───────────────────────────────────────────
create table patients (
  id              uuid primary key default uuid_generate_v4(),
  name            text not null,
  cedula          text,
  birth_date      date,
  phone           text,
  email           text,
  balance         numeric(10,2) not null default 0,
  last_visit      date,
  next_appointment date,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

-- ── Tabla: doctors ────────────────────────────────────────────
create table doctors (
  id          uuid primary key default uuid_generate_v4(),
  name        text not null,
  specialty   text not null,
  branch      text not null,
  available   boolean not null default true,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- ── Tabla: appointments ───────────────────────────────────────
create table appointments (
  id          uuid primary key default uuid_generate_v4(),
  patient_id  uuid not null references patients(id) on delete cascade,
  doctor_id   uuid not null references doctors(id) on delete restrict,
  date        date not null,
  time        text not null,
  duration    integer not null default 30,
  branch      text not null,
  reason      text,
  status      appointment_status not null default 'pendiente',
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- ── Tabla: treatments ─────────────────────────────────────────
create table treatments (
  id          uuid primary key default uuid_generate_v4(),
  patient_id  uuid not null references patients(id) on delete cascade,
  name        text not null,
  cost        numeric(10,2) not null default 0,
  paid        numeric(10,2) not null default 0,
  date        date not null,
  status      treatment_status not null default 'pendiente',
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- ── Tabla: cash_entries ───────────────────────────────────────
create table cash_entries (
  id          uuid primary key default uuid_generate_v4(),
  patient_id  uuid references patients(id) on delete set null,
  description text not null,
  amount      numeric(10,2) not null,
  type        cash_entry_type not null,
  method      text,
  date        date not null,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- ── Tabla: inventory_items ────────────────────────────────────
create table inventory_items (
  id          uuid primary key default uuid_generate_v4(),
  name        text not null,
  category    text not null,
  unit        text not null,
  stock       integer not null default 0,
  min_stock   integer not null default 5,
  supplier    text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- ── Tabla: lab_orders ─────────────────────────────────────────
create table lab_orders (
  id          uuid primary key default uuid_generate_v4(),
  patient_id  uuid not null references patients(id) on delete cascade,
  doctor_id   uuid not null references doctors(id) on delete restrict,
  lab         text not null,
  work        text not null,
  cost        numeric(10,2) not null default 0,
  date        date not null,
  status      lab_order_status not null default 'solicitado',
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- ── Función: updated_at automático ───────────────────────────
create or replace function set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- Triggers updated_at
create trigger trg_patients_updated_at
  before update on patients
  for each row execute function set_updated_at();

create trigger trg_doctors_updated_at
  before update on doctors
  for each row execute function set_updated_at();

create trigger trg_appointments_updated_at
  before update on appointments
  for each row execute function set_updated_at();

create trigger trg_treatments_updated_at
  before update on treatments
  for each row execute function set_updated_at();

create trigger trg_cash_entries_updated_at
  before update on cash_entries
  for each row execute function set_updated_at();

create trigger trg_inventory_items_updated_at
  before update on inventory_items
  for each row execute function set_updated_at();

create trigger trg_lab_orders_updated_at
  before update on lab_orders
  for each row execute function set_updated_at();

-- ── Índices útiles ────────────────────────────────────────────
create index idx_appointments_date      on appointments(date);
create index idx_appointments_patient   on appointments(patient_id);
create index idx_appointments_doctor    on appointments(doctor_id);
create index idx_treatments_patient     on treatments(patient_id);
create index idx_cash_entries_date      on cash_entries(date);
create index idx_lab_orders_patient     on lab_orders(patient_id);
create index idx_inventory_stock        on inventory_items(stock);

-- ── Row Level Security ────────────────────────────────────────
alter table patients         enable row level security;
alter table doctors          enable row level security;
alter table appointments     enable row level security;
alter table treatments       enable row level security;
alter table cash_entries     enable row level security;
alter table inventory_items  enable row level security;
alter table lab_orders       enable row level security;

-- Políticas: acceso total para usuarios autenticados
create policy "Authenticated full access" on patients
  for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

create policy "Authenticated full access" on doctors
  for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

create policy "Authenticated full access" on appointments
  for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

create policy "Authenticated full access" on treatments
  for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

create policy "Authenticated full access" on cash_entries
  for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

create policy "Authenticated full access" on inventory_items
  for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

create policy "Authenticated full access" on lab_orders
  for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
