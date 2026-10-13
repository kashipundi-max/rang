-- CREATE news_events Table (News Trading Rule)
-- High-impact economic-calendar events synced from the Forex Factory weekly
-- feeds by POST /api/news-calendar/sync. Rows are never deleted: past events are
-- needed to check old trades at payout time. An admin can set "isRestricted" to
-- false to exclude one event from the rule; the sync never overwrites that.
-- Safe to re-run.
CREATE TABLE IF NOT EXISTS public.news_events (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "eventTime" TIMESTAMPTZ NOT NULL,
  currency TEXT NOT NULL,
  title TEXT NOT NULL,
  impact TEXT NOT NULL DEFAULT 'High',
  "isRestricted" BOOLEAN NOT NULL DEFAULT true,
  source TEXT NOT NULL DEFAULT 'forexfactory',
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.news_events ADD COLUMN IF NOT EXISTS impact TEXT NOT NULL DEFAULT 'High';
ALTER TABLE public.news_events ADD COLUMN IF NOT EXISTS "isRestricted" BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE public.news_events ADD COLUMN IF NOT EXISTS source TEXT NOT NULL DEFAULT 'forexfactory';
ALTER TABLE public.news_events ADD COLUMN IF NOT EXISTS "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now();

CREATE UNIQUE INDEX IF NOT EXISTS news_events_time_currency_title_key
  ON public.news_events ("eventTime", currency, title);
CREATE INDEX IF NOT EXISTS news_events_event_time_idx
  ON public.news_events ("eventTime");

ALTER TABLE public.news_events ENABLE ROW LEVEL SECURITY;

-- The app reads/writes this table server-side with its service key; no browser
-- policies. Refresh PostgREST so the new table is visible immediately.
NOTIFY pgrst, 'reload schema';
