-- ============================================================
-- ProSalud Gold — Aislamiento multi-tenant real (RLS)
-- Ejecutar en: Supabase Dashboard → SQL Editor
--
-- Problema que corrige: las políticas "Authenticated full access"
-- de 001_initial_schema.sql permiten a cualquier usuario autenticado
-- leer y modificar los pacientes, citas, tratamientos, caja,
-- inventario y órdenes de laboratorio de TODAS las clínicas.
--
-- Nota sobre datos existentes: las filas creadas antes de esta
-- migración no tienen dueño. Este script intenta asignarlas al
-- primer usuario encontrado en clinic_config (asumiendo un único
-- tenant en uso hasta ahora). Si tu proyecto ya tiene varias
-- clínicas con datos reales, backfillea user_id manualmente por
-- clínica ANTES de correr este script, o las filas sin dueño
-- quedarán inaccesibles (no se borran, solo dejan de verse) hasta
-- que se les asigne user_id.
-- ============================================================

-- ── patients ─────────────────────────────────────────────────
alter table patients add column if not exists user_id uuid references auth.users(id) default auth.uid();
update patients set user_id = (select user_id from clinic_config order by created_at limit 1) where user_id is null;
create index if not exists idx_patients_user on patients(user_id);

drop policy if exists "Authenticated full access" on patients;
create policy "Users manage own patients" on patients
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ── doctors ──────────────────────────────────────────────────
alter table doctors add column if not exists user_id uuid references auth.users(id) default auth.uid();
update doctors set user_id = (select user_id from clinic_config order by created_at limit 1) where user_id is null;
create index if not exists idx_doctors_user on doctors(user_id);

drop policy if exists "Authenticated full access" on doctors;
create policy "Users manage own doctors" on doctors
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ── appointments ─────────────────────────────────────────────
alter table appointments add column if not exists user_id uuid references auth.users(id) default auth.uid();
update appointments set user_id = (select user_id from clinic_config order by created_at limit 1) where user_id is null;
create index if not exists idx_appointments_user on appointments(user_id);

drop policy if exists "Authenticated full access" on appointments;
create policy "Users manage own appointments" on appointments
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ── treatments ───────────────────────────────────────────────
alter table treatments add column if not exists user_id uuid references auth.users(id) default auth.uid();
update treatments set user_id = (select user_id from clinic_config order by created_at limit 1) where user_id is null;
create index if not exists idx_treatments_user on treatments(user_id);

drop policy if exists "Authenticated full access" on treatments;
create policy "Users manage own treatments" on treatments
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ── cash_entries ─────────────────────────────────────────────
alter table cash_entries add column if not exists user_id uuid references auth.users(id) default auth.uid();
update cash_entries set user_id = (select user_id from clinic_config order by created_at limit 1) where user_id is null;
create index if not exists idx_cash_entries_user on cash_entries(user_id);

drop policy if exists "Authenticated full access" on cash_entries;
create policy "Users manage own cash_entries" on cash_entries
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ── inventory_items ──────────────────────────────────────────
alter table inventory_items add column if not exists user_id uuid references auth.users(id) default auth.uid();
update inventory_items set user_id = (select user_id from clinic_config order by created_at limit 1) where user_id is null;
create index if not exists idx_inventory_items_user on inventory_items(user_id);

drop policy if exists "Authenticated full access" on inventory_items;
create policy "Users manage own inventory_items" on inventory_items
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ── lab_orders ───────────────────────────────────────────────
alter table lab_orders add column if not exists user_id uuid references auth.users(id) default auth.uid();
update lab_orders set user_id = (select user_id from clinic_config order by created_at limit 1) where user_id is null;
create index if not exists idx_lab_orders_user on lab_orders(user_id);

drop policy if exists "Authenticated full access" on lab_orders;
create policy "Users manage own lab_orders" on lab_orders
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ── payroll_entries / patient_feedback (002_financial_tables.sql) ──
-- Mismo problema: "Authenticated full access" sin columna de dueño.
alter table payroll_entries add column if not exists user_id uuid references auth.users(id) default auth.uid();
update payroll_entries set user_id = (select user_id from clinic_config order by created_at limit 1) where user_id is null;
create index if not exists idx_payroll_entries_user on payroll_entries(user_id);

drop policy if exists "Authenticated full access" on payroll_entries;
create policy "Users manage own payroll_entries" on payroll_entries
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

alter table patient_feedback add column if not exists user_id uuid references auth.users(id) default auth.uid();
update patient_feedback set user_id = (select user_id from clinic_config order by created_at limit 1) where user_id is null;
create index if not exists idx_patient_feedback_user on patient_feedback(user_id);

drop policy if exists "Authenticated full access" on patient_feedback;
create policy "Users manage own patient_feedback" on patient_feedback
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
