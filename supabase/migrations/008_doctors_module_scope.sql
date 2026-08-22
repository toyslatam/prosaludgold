-- ============================================================
-- ProSalud Gold — Profesionales (doctors) separados por módulo
-- Ejecutar en: Supabase Dashboard → SQL Editor (después de 004-007)
--
-- Mismo problema que ya se corrigió en patients (007) y sedes: la
-- tabla `doctors` (usada por la pantalla "Staff"/"Doctores") no
-- tenía columna de módulo, así que un profesional creado en
-- Odontología aparecía también como opción en Spa (por ejemplo, al
-- crear un paquete de servicios).
-- ============================================================

alter table doctors add column if not exists modules_enabled text[] not null default '{}';

update doctors d
set modules_enabled = coalesce(cc.modules_enabled, '{}')
from clinic_config cc
where d.user_id = cc.user_id
  and d.modules_enabled = '{}';
