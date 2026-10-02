-- ============================================================
-- ProSalud Gold — Factura vs Recibo de venta (estilo QuickBooks)
--
-- payment_status decide que documento se crea en QuickBooks:
-- 'pagado' -> Sales Receipt (recibo de venta, ya cobrado)
-- 'por_cobrar' -> Invoice (factura, cuenta por cobrar / credito)
-- ============================================================

alter table cash_entries add column if not exists payment_status text not null default 'pagado';
alter table cash_entries add column if not exists qb_invoice_id text;

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'cash_entries_payment_status_check'
  ) then
    alter table cash_entries
      add constraint cash_entries_payment_status_check
      check (payment_status in ('pagado', 'por_cobrar'));
  end if;
end $$;
