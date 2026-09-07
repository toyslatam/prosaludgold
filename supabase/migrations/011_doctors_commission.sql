-- ============================================================
-- ProSalud Gold — % de comisión por profesional
-- Ejecutar en: Supabase Dashboard → SQL Editor (después de 004-010)
--
-- % que se lleva el profesional por atención (el resto queda para
-- la clínica). Se usa para generar automáticamente la liquidación
-- en payroll_entries al finalizar una atención en Atención Clínica.
-- Default 60% (60 doctor / 40 clínica), editable por profesional.
-- ============================================================

alter table doctors add column if not exists commission_percentage numeric(5,2) not null default 60;
