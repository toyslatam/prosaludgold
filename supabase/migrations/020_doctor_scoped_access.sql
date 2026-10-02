-- ============================================================
-- ProSalud Gold — Acceso restringido por colaborador (doctor/terapeuta)
--
-- Hasta ahora clinic_members solo distinguía "dueño" vs "staff con
-- acceso completo a la clínica" (secretarias). Esta migración agrega
-- un tercer nivel: colaboradores (doctores/terapeutas) vinculados a
-- su propia ficha en `doctors`, que solo deben ver:
--   - su propia agenda (appointments.doctor_id = el suyo)
--   - el historial clínico de SUS pacientes (los que tienen cita con
--     ellos, o que los tienen como assigned_doctor_id/collaborators)
--   - de esos pacientes, SIN datos de contacto (teléfono/correo/
--     dirección) — para eso se agrega la vista `patients_clinical`.
-- ============================================================

alter table clinic_members add column if not exists linked_doctor_id uuid references doctors(id) on delete set null;

-- ── current_doctor_scope(): null = sin restricción por doctor (dueño
-- o secretaria); si no es null, es el id de doctors al que hay que
-- limitar agenda e historial clínico. ──
create or replace function public.current_doctor_scope()
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select cm.linked_doctor_id
  from clinic_members cm
  where cm.auth_user_id = auth.uid() and cm.active
  limit 1;
$$;

-- ── ¿el colaborador de la sesión actual puede ver a este paciente? ──
create or replace function public.current_doctor_can_see_patient(p_patient_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select
    public.current_doctor_scope() is null
    or exists (
      select 1 from appointments a
      where a.patient_id = p_patient_id and a.doctor_id = public.current_doctor_scope()
    )
    or exists (
      select 1 from patients p
      where p.id = p_patient_id
        and (
          p.assigned_doctor_id = public.current_doctor_scope()::text
          or public.current_doctor_scope()::text = any (p.collaborators)
        )
    );
$$;

-- ── patients: dueño/secretarias sin cambios; colaboradores solo
-- pueden LEER (no crear/editar/borrar) a los pacientes que les tocan. ──
drop policy if exists "Users manage own patients" on patients;

create policy "Owners and staff manage patients" on patients
  for all
  using (current_tenant_id() = user_id and current_doctor_scope() is null)
  with check (current_tenant_id() = user_id and current_doctor_scope() is null);

create policy "Doctors view assigned patients" on patients
  for select
  using (current_tenant_id() = user_id and public.current_doctor_can_see_patient(id));

-- ── vista sin datos de contacto, para que los colaboradores consulten
-- esto en vez de la tabla real. security_invoker: respeta la RLS de
-- quien hace la consulta (no eleva privilegios). ──
create or replace view public.patients_clinical
with (security_invoker = true) as
select
  id, name, cedula, birth_date, balance, last_visit, next_appointment,
  created_at, updated_at, user_id, gender, benefits, branch,
  assigned_doctor_id, collaborators, modules_enabled, qb_customer_id
from patients;

grant select on public.patients_clinical to authenticated;

-- ── appointments: dueño/secretarias sin cambios; colaboradores solo
-- su propia agenda, y solo pueden actualizar (no crear/borrar) sus
-- propias citas (ej. marcar atendida). ──
drop policy if exists "Users manage own appointments" on appointments;

create policy "Owners and staff manage appointments" on appointments
  for all
  using (current_tenant_id() = user_id and current_doctor_scope() is null)
  with check (current_tenant_id() = user_id and current_doctor_scope() is null);

create policy "Doctors view own appointments" on appointments
  for select
  using (current_tenant_id() = user_id and doctor_id = public.current_doctor_scope());

create policy "Doctors update own appointments" on appointments
  for update
  using (current_tenant_id() = user_id and doctor_id = public.current_doctor_scope())
  with check (current_tenant_id() = user_id and doctor_id = public.current_doctor_scope());

-- ── tablas clínicas: dueño/secretarias sin cambios; colaboradores con
-- acceso completo (ver/crear/editar) pero solo para SUS pacientes —
-- ahí sí necesitan poder escribir (notas de evolución, recetas, etc).
-- patient_id es `text` en estas tablas (legado), se castea a uuid.
do $$
declare
  t text;
  tables text[] := array[
    'antecedentes','evoluciones','recetas','consentimientos',
    'odontogram_records','treatment_plans'
  ];
begin
  foreach t in array tables loop
    execute format('drop policy if exists %I on %I', 'Users manage own ' || t, t);
    execute format(
      'create policy %I on %I for all using (current_tenant_id() = user_id and current_doctor_scope() is null) with check (current_tenant_id() = user_id and current_doctor_scope() is null)',
      'Owners and staff manage ' || t, t
    );
    execute format(
      'create policy %I on %I for all using (current_tenant_id() = user_id and public.current_doctor_can_see_patient(patient_id::uuid)) with check (current_tenant_id() = user_id and public.current_doctor_can_see_patient(patient_id::uuid))',
      'Doctors manage own patients ' || t, t
    );
  end loop;
end $$;

-- care_encounters usa patient_id uuid (no texto) — misma idea, policy aparte.
drop policy if exists "Users manage own care_encounters" on care_encounters;

create policy "Owners and staff manage care_encounters" on care_encounters
  for all
  using (current_tenant_id() = user_id and current_doctor_scope() is null)
  with check (current_tenant_id() = user_id and current_doctor_scope() is null);

create policy "Doctors manage own patients care_encounters" on care_encounters
  for all
  using (current_tenant_id() = user_id and public.current_doctor_can_see_patient(patient_id))
  with check (current_tenant_id() = user_id and public.current_doctor_can_see_patient(patient_id));
