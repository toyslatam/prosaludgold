-- ============================================================
-- ProSalud Gold — Facturación electrónica (Panamá / DGI vía PAC)
-- Ejecutar en: Supabase Dashboard → SQL Editor (después de 004-008)
--
-- Registra las facturas emitidas a través de un PAC (proveedor
-- autorizado de facturación electrónica). No genera ni firma XML:
-- delega eso al PAC vía su API REST (ver edge function
-- `issue-invoice`) y solo guarda el resultado (folio/CUFE, estado,
-- PDF) para mostrarlo en la ficha del paciente.
-- ============================================================

create type invoice_status as enum ('draft', 'pending', 'issued', 'error', 'cancelled');

create table if not exists invoices (
  id                  uuid primary key default uuid_generate_v4(),
  user_id             uuid not null references auth.users(id) default auth.uid(),
  patient_id          uuid not null references patients(id) on delete restrict,
  treatment_plan_id   uuid references treatment_plans(id) on delete set null,

  -- Datos del comprador (requeridos por DGI en la factura)
  buyer_name          text not null,
  buyer_ruc           text,
  buyer_email         text,

  -- Detalle de la factura
  items               jsonb not null default '[]',
  subtotal            numeric(10,2) not null default 0,
  tax_total           numeric(10,2) not null default 0,
  total               numeric(10,2) not null default 0,
  currency            text not null default 'USD',

  -- Resultado de la emisión ante el PAC
  status              invoice_status not null default 'draft',
  provider            text not null default 'efactura_pty',
  external_id         text,          -- folio / número de factura del PAC
  cufe                text,          -- código único de factura electrónica (DGI)
  pdf_url             text,          -- URL firmada del PDF (Supabase Storage)
  error_message       text,

  created_at          timestamptz not null default now(),
  issued_at           timestamptz
);

create index if not exists idx_invoices_patient on invoices(user_id, patient_id);
create index if not exists idx_invoices_plan on invoices(treatment_plan_id);

alter table invoices enable row level security;
create policy "Users manage own invoices" on invoices
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Bucket de Storage para los PDF de factura (privado; se sirve con URL firmada)
insert into storage.buckets (id, name, public)
values ('invoices', 'invoices', false)
on conflict (id) do nothing;

create policy "Users manage own invoice PDFs"
  on storage.objects for all
  using (bucket_id = 'invoices' and (storage.foldername(name))[1] = auth.uid()::text)
  with check (bucket_id = 'invoices' and (storage.foldername(name))[1] = auth.uid()::text);
