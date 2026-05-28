# Tenify Architecture

Production MVP foundation for a minimalist property management SaaS.

## Principles

- **WhatsApp simple** — few fields, obvious labels, one primary action per screen
- **Landlord-scoped data** — every row belongs to `landlord_id` (= `auth.users.id`)
- **Server-first** — reads and mutations via Server Components + Server Actions
- **No premature abstraction** — shared layout + feature folders, not a heavy DDD layer

## Folder structure

```
tenify-web/
├── app/
│   ├── (marketing)/          # Public landing
│   ├── (auth)/login/         # Auth (Supabase next)
│   └── (dashboard)/          # App shell + features
│       ├── dashboard/
│       ├── properties/
│       ├── tenants/
│       ├── leases/
│       └── invoices/
├── actions/                  # Server Actions per domain
├── components/
│   ├── layout/               # Shell, nav, page chrome
│   ├── properties/           # Feature UI
│   └── ui/                   # shadcn primitives
├── lib/
│   ├── supabase/             # Browser + server clients
│   ├── validations/          # Zod schemas
│   └── auth.ts               # getLandlordId()
├── types/database.ts         # Supabase row types (hand-maintained until codegen)
└── supabase/migrations/      # SQL source of truth
```

## Route groups

| Group        | Purpose                          |
|-------------|-----------------------------------|
| `(marketing)` | Landing, SEO, no sidebar        |
| `(auth)`      | Login / signup (placeholder)    |
| `(dashboard)` | Sidebar + top nav + main content |

Route groups do not affect URLs: `/properties` not `/dashboard/properties`.

## Component conventions

| Pattern              | Location              | Example              |
|---------------------|------------------------|----------------------|
| Page (RSC)          | `app/.../page.tsx`     | Fetch + layout       |
| Feature UI          | `components/{feature}/` | `PropertyForm`    |
| Shell / chrome      | `components/layout/`   | `DashboardShell`     |
| Primitives          | `components/ui/`       | shadcn `Button`      |
| Server Actions      | `actions/{domain}.ts`  | `createProperty`     |
| Validation          | `lib/validations/`     | `propertySchema`     |

**Naming:** PascalCase components, camelCase functions, kebab-case routes, `snake_case` in Postgres.

## Supabase architecture

### Tables (MVP)

| Table        | Purpose                                      |
|-------------|-----------------------------------------------|
| `landlords` | Profile; PK = `auth.users.id`                 |
| `properties`| Buildings / addresses                         |
| `units`     | Rentable units within a property              |
| `tenants`   | People                                        |
| `leases`    | Links unit + tenant + rent terms              |

### Security

- RLS on all tables: `auth.uid() = landlord_id`
- Trigger `handle_new_user` creates `landlords` row on signup
- Server Actions use cookie-based Supabase client (anon key + user JWT)

### Local dev without auth

Set `DEV_LANDLORD_ID` to a UUID that exists in `landlords` (insert manually after migration).

## Environment variables

See `.env.example`. Required for Property CRUD:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `DEV_LANDLORD_ID` (development only)

## Next steps (recommended order)

1. Run `supabase/migrations/001_initial_schema.sql` in Supabase SQL Editor
2. Copy `.env.example` → `.env.local` and fill values
3. Insert dev landlord: `insert into landlords (id) values ('your-uuid');`
4. Wire Supabase Auth on `/login` (email magic link or OAuth)
5. Add middleware session refresh
6. Tenants → Units → Leases CRUD (same patterns as properties)
7. Storage bucket for documents; `invoices` table when billing ships

## Property CRUD flow

```
Browser form → Server Action → Zod validate → Supabase insert/update
→ revalidatePath → redirect (create/update) or router.refresh (delete)
```
