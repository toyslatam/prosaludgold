-- ============================================================
-- ProSalud Gold — Integración QuickBooks Online
-- Una conexión OAuth por clínica (user_id), y referencias para
-- no duplicar registros al reintentar el sync.
-- ============================================================

create table if not exists quickbooks_connections (
  user_id uuid primary key references auth.users(id) on delete cascade,
  realm_id text not null,
  access_token text not null,
  refresh_token text not null,
  access_token_expires_at timestamptz not null,
  refresh_token_expires_at timestamptz not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table quickbooks_connections enable row level security;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'quickbooks_connections'
      and policyname = 'Users manage own quickbooks_connections'
  ) then
    create policy "Users manage own quickbooks_connections" on quickbooks_connections
      for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
  end if;
end $$;

alter table patients add column if not exists qb_customer_id text;
alter table doctors add column if not exists qb_vendor_id text;

alter table cash_entries add column if not exists qb_sales_receipt_id text;
alter table cash_entries add column if not exists qb_sync_status text not null default 'pending';
alter table cash_entries add column if not exists qb_synced_at timestamptz;

alter table payroll_entries add column if not exists qb_bill_id text;
alter table payroll_entries add column if not exists qb_sync_status text not null default 'pending';
alter table payroll_entries add column if not exists qb_synced_at timestamptz;

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'cash_entries_qb_sync_status_check'
  ) then
    alter table cash_entries
      add constraint cash_entries_qb_sync_status_check
      check (qb_sync_status in ('pending', 'synced', 'error', 'skipped'));
  end if;
  if not exists (
    select 1 from pg_constraint where conname = 'payroll_entries_qb_sync_status_check'
  ) then
    alter table payroll_entries
      add constraint payroll_entries_qb_sync_status_check
      check (qb_sync_status in ('pending', 'synced', 'error', 'skipped'));
  end if;
end $$;
