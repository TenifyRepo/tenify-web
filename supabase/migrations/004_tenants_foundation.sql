-- Tenify tenants foundation — run after 001 and 002

alter table public.tenants add column if not exists unit_id uuid references public.units (id) on delete set null;
alter table public.tenants add column if not exists first_name text;
alter table public.tenants add column if not exists last_name text;
alter table public.tenants add column if not exists emergency_contact_name text;
alter table public.tenants add column if not exists emergency_contact_phone text;

-- Migrate legacy full_name column
do $$
begin
  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'tenants'
      and column_name = 'full_name'
  ) then
    update public.tenants
    set
      first_name = split_part(full_name, ' ', 1),
      last_name = case
        when position(' ' in full_name) > 0
          then trim(substring(full_name from position(' ' in full_name) + 1))
        else ''
      end
    where first_name is null;

    alter table public.tenants drop column full_name;
  end if;
end $$;

update public.tenants set last_name = '' where last_name is null;
update public.tenants set first_name = 'Tenant' where first_name is null or first_name = '';

alter table public.tenants alter column first_name set not null;
alter table public.tenants alter column last_name set not null;
alter table public.tenants alter column last_name set default '';

create index if not exists tenants_unit_id_idx on public.tenants (unit_id);
