-- ============================================================
-- ProSalud Gold — Vincular movimientos de caja a un doctor/colaborador
-- (ej. comisión pagada a X, ingreso generado por la atención de X),
-- además del paciente y la categoría de gasto que ya existían.
-- ============================================================

alter table cash_entries add column if not exists doctor_id uuid references doctors(id) on delete set null;
create index if not exists idx_cash_entries_doctor on cash_entries(doctor_id);
