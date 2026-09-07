-- ============================================================
-- ProSalud Gold — Reparto doctor/clínica en liquidaciones
-- Ejecutar en: Supabase Dashboard → SQL Editor (después de 004-011)
--
-- Antes, la parte de la clínica quedaba implícita (bruto - total).
-- Ahora cada liquidación indica a quién pertenece esa fila:
-- 'doctor' (el profesional) o 'clinic' (la clínica), para poder
-- generar automáticamente ambas filas al mismo tiempo.
-- ============================================================

alter table payroll_entries add column if not exists party text not null default 'doctor';

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'payroll_entries_party_check'
  ) then
    alter table payroll_entries
      add constraint payroll_entries_party_check check (party in ('doctor', 'clinic'));
  end if;
end $$;
