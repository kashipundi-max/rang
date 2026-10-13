-- Reusable promotional email templates managed only through authenticated admin APIs.
create table if not exists public.promotion_email_templates (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  subject text not null,
  html text not null,
  "createdBy" text not null references public.users(id) on delete restrict,
  "createdAt" timestamptz not null default now(),
  "updatedAt" timestamptz not null default now(),
  constraint promotion_email_templates_name_length_check
    check (char_length(name) between 1 and 100),
  constraint promotion_email_templates_subject_length_check
    check (char_length(subject) between 1 and 200),
  constraint promotion_email_templates_html_length_check
    check (char_length(html) between 1 and 200000)
);

create unique index if not exists promotion_email_templates_name_lower_uidx
  on public.promotion_email_templates (lower(name));
create index if not exists promotion_email_templates_updated_at_idx
  on public.promotion_email_templates ("updatedAt" desc);

alter table public.promotion_email_templates enable row level security;
alter table public.promotion_email_templates force row level security;

revoke all on public.promotion_email_templates from anon, authenticated;
grant select, insert, update, delete on public.promotion_email_templates to service_role;

comment on table public.promotion_email_templates is
  'Reusable HTML promotional email templates. Accessible only through server-side admin APIs.';
