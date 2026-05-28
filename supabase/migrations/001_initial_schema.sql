-- Tenify initial schema
-- Run in Supabase SQL Editor or via: supabase db push

-- ---------------------------------------------------------------------------
-- Landlords (1:1 with auth.users)
-- ---------------------------------------------------------------------------
create table public.landlords (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text,
  email text,
  phone text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Properties
-- ---------------------------------------------------------------------------
create table public.properties (
  id uuid primary key default gen_random_uuid(),
  landlord_id uuid not null references public.landlords (id) on delete cascade,
  name text not null,
  address_line1 text not null,
  address_line2 text,
  city text not null,
  state text,
  postal_code text,
  country text not null default 'ZA',
  property_type text check (
    property_type is null
    or property_type in ('house', 'apartment', 'complex', 'commercial', 'other')
  ),
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index properties_landlord_id_idx on public.properties (landlord_id);

-- ---------------------------------------------------------------------------
-- Units
-- ---------------------------------------------------------------------------
create table public.units (
  id uuid primary key default gen_random_uuid(),
  property_id uuid not null references public.properties (id) on delete cascade,
  landlord_id uuid not null references public.landlords (id) on delete cascade,
  name text not null,
  type text check (
    type is null
    or type in ('apartment', 'room', 'studio', 'house', 'office', 'other')
  ),
  bedrooms smallint,
  bathrooms smallint,
  parking_bays smallint,
  monthly_rent numeric(12, 2),
  status text not null default 'vacant' check (
    status in ('vacant', 'occupied', 'maintenance')
  ),
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index units_property_id_idx on public.units (property_id);
create index units_landlord_id_idx on public.units (landlord_id);

-- ---------------------------------------------------------------------------
-- Tenants
-- ---------------------------------------------------------------------------
create table public.tenants (
  id uuid primary key default gen_random_uuid(),
  landlord_id uuid not null references public.landlords (id) on delete cascade,
  unit_id uuid references public.units (id) on delete set null,
  first_name text not null,
  last_name text not null default '',
  email text,
  phone text,
  id_number text,
  emergency_contact_name text,
  emergency_contact_phone text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index tenants_landlord_id_idx on public.tenants (landlord_id);
create index tenants_unit_id_idx on public.tenants (unit_id);

-- ---------------------------------------------------------------------------
-- Leases
-- ---------------------------------------------------------------------------
create table public.leases (
  id uuid primary key default gen_random_uuid(),
  landlord_id uuid not null references public.landlords (id) on delete cascade,
  property_id uuid not null references public.properties (id) on delete restrict,
  unit_id uuid not null references public.units (id) on delete restrict,
  tenant_id uuid not null references public.tenants (id) on delete restrict,
  start_date date not null,
  end_date date,
  monthly_rent numeric(12, 2) not null,
  deposit_amount numeric(12, 2),
  status text not null default 'draft' check (
    status in ('draft', 'active', 'expired', 'terminated')
  ),
  signed_date date,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index leases_landlord_id_idx on public.leases (landlord_id);
create index leases_property_id_idx on public.leases (property_id);
create index leases_unit_id_idx on public.leases (unit_id);
create index leases_tenant_id_idx on public.leases (tenant_id);

-- ---------------------------------------------------------------------------
-- updated_at trigger
-- ---------------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger landlords_updated_at
  before update on public.landlords
  for each row execute function public.set_updated_at();

create trigger properties_updated_at
  before update on public.properties
  for each row execute function public.set_updated_at();

create trigger units_updated_at
  before update on public.units
  for each row execute function public.set_updated_at();

create trigger tenants_updated_at
  before update on public.tenants
  for each row execute function public.set_updated_at();

create trigger leases_updated_at
  before update on public.leases
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- Auto-create landlord profile on signup
-- ---------------------------------------------------------------------------
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.landlords (id, email, full_name)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'full_name', split_part(new.email, '@', 1))
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------------
alter table public.landlords enable row level security;
alter table public.properties enable row level security;
alter table public.units enable row level security;
alter table public.tenants enable row level security;
alter table public.leases enable row level security;

create policy "Landlords can view own profile"
  on public.landlords for select
  using (auth.uid() = id);

create policy "Landlords can update own profile"
  on public.landlords for update
  using (auth.uid() = id);

create policy "Landlords manage own properties"
  on public.properties for all
  using (auth.uid() = landlord_id)
  with check (auth.uid() = landlord_id);

create policy "Landlords manage own units"
  on public.units for all
  using (auth.uid() = landlord_id)
  with check (auth.uid() = landlord_id);

create policy "Landlords manage own tenants"
  on public.tenants for all
  using (auth.uid() = landlord_id)
  with check (auth.uid() = landlord_id);

create policy "Landlords manage own leases"
  on public.leases for all
  using (auth.uid() = landlord_id)
  with check (auth.uid() = landlord_id);
