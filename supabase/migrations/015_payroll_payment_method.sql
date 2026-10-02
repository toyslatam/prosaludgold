-- ============================================================
-- ProSalud Gold — Método de pago en liquidaciones (payroll_entries)
--
-- Yappy / ACH / Tarjeta / Transferencia internacional -> llevan ITBMS (7%).
-- Efectivo -> no lleva ITBMS, pero sí un check "se factura".
-- ============================================================

alter table payroll_entries add column if not exists payment_method text;
alter table payroll_entries add column if not exists itbms_percentage numeric(5,2);
alter table payroll_entries add column if not exists is_invoiced boolean;

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'payroll_entries_payment_method_check'
  ) then
    alter table payroll_entries
      add constraint payroll_entries_payment_method_check
      check (payment_method is null or payment_method in (
        'yappy', 'ach', 'tarjeta_credito', 'transferencia_internacional', 'efectivo'
      ));
  end if;
end $$;
