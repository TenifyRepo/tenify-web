-- =============================================================================
-- TEMPORARY — local development without Supabase Auth
-- =============================================================================
-- Allows anon API requests (no auth.uid()) when the row's landlord_id is listed
-- in _dev_landlord_access. Matches app-side DEV_LANDLORD_ID in .env.local.
--
-- REMOVE this migration's policies and table once Auth is wired (auth.uid() only).
--
-- After running, register your dev landlord once in SQL Editor:
--   insert into public._dev_landlord_access (landlord_id)
--   values ('<same-uuid-as-DEV_LANDLORD_ID>')
--   on conflict (landlord_id) do nothing;
-- =============================================================================

create table if not exists public._dev_landlord_access (
  landlord_id uuid primary key references public.landlords (id) on delete cascade
);

comment on table public._dev_landlord_access is
  'TEMPORARY: allowlisted landlords for anon dev access. Drop when Supabase Auth is live.';

-- Properties (same pattern as units — for consistent local dev)
create policy "TEMP dev: properties for allowlisted landlord"
  on public.properties for all
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

-- Units
create policy "TEMP dev: units for allowlisted landlord"
  on public.units for all
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

-- Tenants (for upcoming tenant CRUD in local dev)
create policy "TEMP dev: tenants for allowlisted landlord"
  on public.tenants for all
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
