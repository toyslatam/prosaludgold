-- ============================================================
-- ProSalud Gold — Datos de facturación/pago del staff (doctors)
-- Ejecutar en: Supabase Dashboard → SQL Editor (después de 004-009)
--
-- Agrega RUC + dígito verificador, correo, teléfono y cuenta
-- bancaria al staff (Staff/Doctores), para remuneraciones y
-- facturación electrónica.
-- ============================================================

alter table doctors add column if not exists ruc text;
alter table doctors add column if not exists ruc_dv text;
alter table doctors add column if not exists email text;
alter table doctors add column if not exists phone text;
alter table doctors add column if not exists bank_account text;
