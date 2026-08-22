-- ============================================================
-- ProSalud Gold — Unifica la identidad de paciente
-- Ejecutar en: Supabase Dashboard → SQL Editor (después de 004 y 005)
--
-- Antes de esta migración, la app tenía DOS identidades de paciente
-- separadas: la tabla `patients` real (usada por Agenda/Caja, creada
-- desde el botón "Nuevo paciente") y una lista mock/localStorage
-- (src/lib/patients/repository.ts, ids "p1".."p10") usada por la
-- ficha de paciente (Pacientes → Ver ficha). Un paciente creado desde
-- la UI nunca aparecía en la ficha porque vivían en sitios distintos.
--
-- Esta migración agrega a `patients` los campos que solo existían en
-- el lado mock, para que la ficha pueda leer directamente de la
-- tabla real. src/lib/patients/repository.ts pasa a consultar esta
-- tabla en vez de localStorage.
-- ============================================================

alter table patients add column if not exists gender text;
alter table patients add column if not exists address text;
alter table patients add column if not exists benefits text;
alter table patients add column if not exists branch text;
alter table patients add column if not exists assigned_doctor_id text;
alter table patients add column if not exists collaborators text[] not null default '{}';
