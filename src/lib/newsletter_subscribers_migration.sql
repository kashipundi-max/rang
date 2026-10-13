-- Newsletter subscribers captured by the public server API and viewed by CRM admins.
create table if not exists public.newsletter_subscribers (
  id bigint generated always as identity primary key,
  email text not null,
  source text not null default 'website',
  status text not null default 'active',
  "emailStatus" text not null default 'pending',
  "confirmationSentAt" timestamptz,
  "createdAt" timestamptz not null default now(),
  "updatedAt" timestamptz not null default now(),
  constraint newsletter_subscribers_source_check check (source in ('footer', 'home', 'website')),
  constraint newsletter_subscribers_status_check check (status in ('active', 'unsubscribed')),
  constraint newsletter_subscribers_email_status_check check ("emailStatus" in ('pending', 'sent', 'failed')),
  constraint newsletter_subscribers_email_length_check check (char_length(email) between 3 and 320)
);

create unique index if not exists newsletter_subscribers_email_lower_uidx
  on public.newsletter_subscribers (lower(email));
create index if not exists newsletter_subscribers_created_at_idx
  on public.newsletter_subscribers ("createdAt" desc);

alter table public.newsletter_subscribers enable row level security;
alter table public.newsletter_subscribers force row level security;

revoke all on public.newsletter_subscribers from anon, authenticated;
grant select, insert, update on public.newsletter_subscribers to service_role;
grant usage, select on sequence public.newsletter_subscribers_id_seq to service_role;

comment on table public.newsletter_subscribers is
  'Newsletter email addresses submitted through the Range4ex server API. No direct public Data API access.';