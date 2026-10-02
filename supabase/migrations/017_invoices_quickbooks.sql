-- ============================================================
-- ProSalud Gold — Factura vs Recibo de venta en el módulo de
-- Facturación (invoices), y envío manual a QuickBooks.
--
-- qb_doc_type decide que documento se crea en QuickBooks al apretar
-- el botón: 'recibo' -> Sales Receipt (ya cobrado), 'factura' -> Invoice
-- (cuenta por cobrar / crédito).
-- ============================================================

alter table invoices add column if not exists qb_doc_type text not null default 'factura';
alter table invoices add column if not exists qb_doc_id text;
alter table invoices add column if not exists qb_sync_status text not null default 'pending';
alter table invoices add column if not exists qb_synced_at timestamptz;

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'invoices_qb_doc_type_check'
  ) then
    alter table invoices
      add constraint invoices_qb_doc_type_check check (qb_doc_type in ('factura', 'recibo'));
  end if;
  if not exists (
    select 1 from pg_constraint where conname = 'invoices_qb_sync_status_check'
  ) then
    alter table invoices
      add constraint invoices_qb_sync_status_check
      check (qb_sync_status in ('pending', 'synced', 'error', 'skipped'));
  end if;
end $$;
