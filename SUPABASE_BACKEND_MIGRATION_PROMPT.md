# Prompt: Connect this app to the new firm's Supabase project (backend as-is)

Copy everything below the line into the Claude Code session that has this repo open.

Context: this codebase's schema, RLS policies, API routes, and CRM/admin logic have already been replicated 1:1 into a **new Supabase project** for the new firm. Nothing about the schema or business logic needs to change — this is purely a **reconnect**: point this app at the new project's credentials, seed a CRM/admin login, and verify parity. Do not rewrite or "port" anything; if something doesn't work, the fix is almost always a config/credential mismatch, not a code change.

---

## 1. Swap the Supabase credentials

Update `.env.local` (create it from `.env.local.example` if it doesn't exist) with the **new** project's values — do not touch any other key in this file unless the new firm also needs different values for them (payment gateways, SMTP, etc. are separate concerns from Supabase):

```
NEXT_PUBLIC_SUPABASE_URL=<new project URL>
NEXT_PUBLIC_SUPABASE_ANON_KEY=<new project anon key>
SUPABASE_SERVICE_ROLE_KEY=<new project service role key>
```

Get these from Supabase Dashboard → Project Settings → API on the new project.

Before overwriting, check whether `.env.local` in this repo currently points at a **different, still-live** Supabase project (e.g. the original range4ex one) — if so, confirm with the user before overwriting, since that would disconnect whatever currently depends on it.

## 2. Verify schema parity (don't assume — check)

Even though the schema was supposedly replicated 1:1, confirm before wiring anything else:

- Every table in `src/lib/supabase_schema.sql` exists in the new project with matching columns (`information_schema.columns`, or Supabase Table Editor).
- RLS is **enabled** on every table (`ALTER TABLE ... ENABLE ROW LEVEL SECURITY` ran) and policies exist — a table with RLS enabled but zero policies will silently return no rows to the anon client, which looks like "nothing works" but is actually "everything is locked."
- All `*_migration.sql` files in `src/lib/` were applied (each is idempotent, so re-running them against the new project is safe and a good way to guarantee nothing was missed).

## 3. Seed a CRM/admin login

CRM/admin auth in this app is **not** Supabase Auth — it's a plain row in `public.users` with `role IN ('admin','support')` and `status = 'active'`, checked directly in [src/app/api/auth/crm/signin/route.ts](src/app/api/auth/crm/signin/route.ts). A fresh Supabase project has no such row, so the CRM portal will reject every login with "Access Denied" until one exists.

Password hashing is `sha256(password)` with no salt ([src/lib/db.ts:7-9](src/lib/db.ts#L7-L9)) — reproduce that exactly when seeding, don't use bcrypt or any other scheme.

Insert (via the Supabase SQL editor, using the service role / as the table owner) a row like:

```sql
insert into public.users (id, name, email, phone, country, "passwordHash", role, status, "emailVerified")
values (
  'admin-' || gen_random_uuid()::text,
  'Admin',
  'admin@<new-firm-domain>',
  null,
  null,
  encode(digest('<chosen-password>', 'sha256'), 'hex'),
  'admin',
  'active',
  true
);
```

Ask the user for the admin email + password to use if not already provided — don't invent production credentials.

## 4. Sanity-check the other env vars this backend depends on

These aren't Supabase-specific but the ported business logic reads them directly — confirm which ones the new firm actually needs (don't assume all of them):

- `STATISTICS_API_BASE_URL` — trading statistics source
- `DIDIT_API_KEY` / `DIDIT_WORKFLOW_ID` / `DIDIT_WEBHOOK_SECRET` / `DIDIT_CALLBACK_URL` — KYC
- Payment gateways actually in use: Stripe / NOWPayments / CodaPay / Paddle keys
- `HOSTINGER_SMTP_*` / `HOSTINGER_EMAIL_FROM` — transactional email
- `NEXT_PUBLIC_META_PIXEL_ID` / `META_CONVERSIONS_API_ACCESS_TOKEN` — marketing tracking
- `NEXT_PUBLIC_APP_URL` / `NEXT_PUBLIC_SITE_URL` / `SUPPORT_EMAIL` — should be the new firm's own domain/email, not range4ex's

## 5. Verify end to end

- App builds/typechecks and starts against the new project.
- Customer signup → email verification → login works (proves anon-key RLS + `users` table access is correct).
- CRM portal (`/crm-portal/signin`) logs in with the seeded admin row and can see users/orders/accounts (proves service-role path + role gating is correct).
- Customer dashboard tabs load real data (accounts, orders, payouts, KYC, support) with no data leaking across a second test user (proves RLS scoping, not just that RLS is "on").
