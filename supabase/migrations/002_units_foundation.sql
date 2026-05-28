-- Tenify units foundation — run after 001_initial_schema.sql

-- Rename legacy column
do $$
begin
  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'units'
      and column_name = 'label'
  ) then
    alter table public.units rename column label to name;
  end if;
end $$;

-- New columns
alter table public.units add column if not exists type text;
alter table public.units add column if not exists parking_bays smallint;
alter table public.units add column if not exists notes text;
alter table public.units add column if not exists status text;

-- Migrate is_vacant → status
do $$
begin
  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'units'
      and column_name = 'is_vacant'
  ) then
    update public.units
    set status = case when is_vacant then 'vacant' else 'occupied' end
    where status is null;

    alter table public.units drop column is_vacant;
  end if;
end $$;

update public.units set status = 'vacant' where status is null;

alter table public.units alter column status set default 'vacant';
alter table public.units alter column status set not null;

alter table public.units drop constraint if exists units_status_check;
alter table public.units
  add constraint units_status_check
  check (status in ('vacant', 'occupied', 'maintenance'));

alter table public.units drop constraint if exists units_type_check;
alter table public.units
  add constraint units_type_check
  check (
    type is null
    or type in ('apartment', 'room', 'studio', 'house', 'office', 'other')
  );
