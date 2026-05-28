-- Tenify payments foundation — run after 001–006

create table public.payments (
  id uuid primary key default gen_random_uuid(),
  landlord_id uuid not null references public.landlords (id) on delete cascade,
  invoice_id uuid not null references public.invoices (id) on delete restrict,
  tenant_id uuid not null references public.tenants (id) on delete restrict,
  property_id uuid not null references public.properties (id) on delete restrict,
  unit_id uuid not null references public.units (id) on delete restrict,
  payment_date date not null default current_date,
  amount_paid numeric(12, 2) not null check (amount_paid >= 0),
  payment_method text not null check (
    payment_method in ('EFT', 'Cash', 'Card', 'Other')
  ),
  reference_number text,
  notes text,
  pop_file_path text,
  status text not null default 'pending' check (
    status in ('pending', 'confirmed', 'rejected')
  ),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index payments_landlord_id_idx on public.payments (landlord_id);
create index payments_invoice_id_idx on public.payments (invoice_id);
create index payments_tenant_id_idx on public.payments (tenant_id);
create index payments_status_idx on public.payments (status);
create index payments_payment_date_idx on public.payments (payment_date);

create trigger payments_updated_at
  before update on public.payments
  for each row execute function public.set_updated_at();

alter table public.payments enable row level security;
alter table public.payments disable row level security;

-- Proof-of-payment uploads (private bucket; open policies for MVP dev)
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'proof-of-payments',
  'proof-of-payments',
  false,
  10485760,
  array['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'application/pdf']
)
on conflict (id) do nothing;

create policy "TEMP dev: POP bucket read"
  on storage.objects for select
  using (bucket_id = 'proof-of-payments');

create policy "TEMP dev: POP bucket insert"
  on storage.objects for insert
  with check (bucket_id = 'proof-of-payments');

create policy "TEMP dev: POP bucket update"
  on storage.objects for update
  using (bucket_id = 'proof-of-payments');

create policy "TEMP dev: POP bucket delete"
  on storage.objects for delete
  using (bucket_id = 'proof-of-payments');
