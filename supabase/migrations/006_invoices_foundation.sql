-- Tenify invoices foundation — run after 001–005

create table public.invoices (
  id uuid primary key default gen_random_uuid(),
  landlord_id uuid not null references public.landlords (id) on delete cascade,
  lease_id uuid not null references public.leases (id) on delete restrict,
  tenant_id uuid not null references public.tenants (id) on delete restrict,
  property_id uuid not null references public.properties (id) on delete restrict,
  unit_id uuid not null references public.units (id) on delete restrict,
  invoice_number text not null,
  invoice_date date not null default current_date,
  due_date date not null,
  billing_period_start date,
  billing_period_end date,
  description text,
  subtotal_amount numeric(12, 2) not null default 0,
  total_amount numeric(12, 2) not null default 0,
  amount_paid numeric(12, 2) not null default 0,
  balance_due numeric(12, 2) not null default 0,
  status text not null default 'draft' check (
    status in ('draft', 'sent', 'paid', 'overdue', 'cancelled')
  ),
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint invoices_landlord_invoice_number_key unique (landlord_id, invoice_number)
);

create index invoices_landlord_id_idx on public.invoices (landlord_id);
create index invoices_lease_id_idx on public.invoices (lease_id);
create index invoices_tenant_id_idx on public.invoices (tenant_id);
create index invoices_property_id_idx on public.invoices (property_id);
create index invoices_unit_id_idx on public.invoices (unit_id);
create index invoices_status_idx on public.invoices (status);
create index invoices_due_date_idx on public.invoices (due_date);

create trigger invoices_updated_at
  before update on public.invoices
  for each row execute function public.set_updated_at();

-- RLS disabled during MVP dev; landlord_id is set on every row for future policies.
alter table public.invoices enable row level security;
alter table public.invoices disable row level security;
