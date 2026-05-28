-- Tenify documents foundation — run after 001–007

create table public.documents (
  id uuid primary key default gen_random_uuid(),
  landlord_id uuid not null references public.landlords (id) on delete cascade,
  entity_type text not null check (
    entity_type in ('property', 'unit', 'tenant', 'lease', 'invoice', 'payment')
  ),
  entity_id uuid not null,
  title text not null,
  description text,
  category text not null check (
    category in (
      'Lease Agreement',
      'POP',
      'ID Document',
      'Rates & Taxes',
      'Inspection',
      'Invoice',
      'Other'
    )
  ),
  file_name text not null,
  file_path text not null,
  file_size bigint,
  mime_type text,
  uploaded_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index documents_landlord_id_idx on public.documents (landlord_id);
create index documents_entity_idx on public.documents (entity_type, entity_id);
create index documents_category_idx on public.documents (category);
create index documents_uploaded_at_idx on public.documents (uploaded_at desc);

create trigger documents_updated_at
  before update on public.documents
  for each row execute function public.set_updated_at();

alter table public.documents enable row level security;
alter table public.documents disable row level security;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'tenant-documents',
  'tenant-documents',
  false,
  15728640,
  array[
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/gif',
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ]
)
on conflict (id) do nothing;

create policy "TEMP dev: tenant-documents read"
  on storage.objects for select
  using (bucket_id = 'tenant-documents');

create policy "TEMP dev: tenant-documents insert"
  on storage.objects for insert
  with check (bucket_id = 'tenant-documents');

create policy "TEMP dev: tenant-documents update"
  on storage.objects for update
  using (bucket_id = 'tenant-documents');

create policy "TEMP dev: tenant-documents delete"
  on storage.objects for delete
  using (bucket_id = 'tenant-documents');
