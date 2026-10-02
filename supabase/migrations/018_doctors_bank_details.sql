-- ============================================================
-- ProSalud Gold — Datos bancarios completos del staff (doctors)
-- A partir del formato real "Listado de Colaboradores" usado por
-- las clínicas para pagar comisiones por transferencia.
-- ============================================================

alter table doctors add column if not exists cedula text;
alter table doctors add column if not exists address text;
alter table doctors add column if not exists photo_url text;
alter table doctors add column if not exists bank_name text;
alter table doctors add column if not exists account_type text not null default 'ahorro';
alter table doctors add column if not exists account_holder_name text;

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'doctors_account_type_check'
  ) then
    alter table doctors
      add constraint doctors_account_type_check check (account_type in ('ahorro', 'corriente'));
  end if;
end $$;
