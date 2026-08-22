-- ============================================================
-- ProSalud Gold — Pacientes separados por módulo
-- Ejecutar en: Supabase Dashboard → SQL Editor (después de 004, 005, 006)
--
-- Antes, `patients` no tenía ninguna columna de módulo: un paciente
-- creado en Odontología aparecía también en Medicina General y Spa.
-- Agrega modules_enabled (mismo patrón que `sedes.modules_enabled`)
-- para que cada paciente pertenezca a los módulos donde fue creado.
--
-- Backfill: los pacientes existentes (creados antes de esta
-- migración, sin módulo asignado) se marcan con TODOS los módulos
-- habilitados en clinic_config del mismo usuario, para no
-- "perderlos" de golpe de la vista de ningún módulo. Puedes
-- corregirlos manualmente después si corresponde a uno solo.
-- ============================================================

alter table patients add column if not exists modules_enabled text[] not null default '{}';

update patients p
set modules_enabled = coalesce(cc.modules_enabled, '{}')
from clinic_config cc
where p.user_id = cc.user_id
  and p.modules_enabled = '{}';
