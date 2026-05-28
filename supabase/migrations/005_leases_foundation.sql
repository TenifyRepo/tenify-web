-- Tenify leases foundation — run after 001–004

-- property_id on leases
alter table public.leases add column if not exists property_id uuid references public.properties (id) on delete restrict;

update public.leases l
set property_id = u.property_id
from public.units u
where l.unit_id = u.id
  and l.property_id is null;

alter table public.leases alter column property_id set not null;

create index if not exists leases_property_id_idx on public.leases (property_id);

-- deposit → deposit_amount
do $$
begin
  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'leases'
      and column_name = 'deposit'
  ) then
    alter table public.leases rename column deposit to deposit_amount;
  end if;
end $$;

alter table public.leases add column if not exists deposit_amount numeric(12, 2);
alter table public.leases add column if not exists signed_date date;
alter table public.leases add column if not exists notes text;

-- Status values: draft, active, expired, terminated
update public.leases set status = 'expired' where status = 'ended';
update public.leases set status = 'terminated' where status = 'cancelled';

alter table public.leases drop constraint if exists leases_status_check;
alter table public.leases
  add constraint leases_status_check
  check (status in ('draft', 'active', 'expired', 'terminated'));

-- =============================================================================
-- TEMPORARY dev RLS — remove when Supabase Auth is wired (see 003 migration)
-- =============================================================================
create policy "TEMP dev: leases for allowlisted landlord"
  on public.leases for all
  using (
    auth.uid() = landlord_id
    or (
      auth.uid() is null
      and landlord_id in (select landlord_id from public._dev_landlord_access)
    )
  )
  with check (
    auth.uid() = landlord_id
    or (
      auth.uid() is null
      and landlord_id in (select landlord_id from public._dev_landlord_access)
    )
  );
