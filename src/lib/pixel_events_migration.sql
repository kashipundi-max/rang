-- ============================================================================
-- pixel_events  —  admin log of every Meta Pixel / Conversions API event
-- Run this once in the Supabase SQL editor (or via `supabase db push`).
-- Safe to re-run: everything is IF NOT EXISTS / OR REPLACE.
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.pixel_events (
  id TEXT PRIMARY KEY,
  "eventName" TEXT NOT NULL,
  "eventId" TEXT,
  source TEXT NOT NULL DEFAULT 'capi',        -- 'capi' (server) | 'pixel' (browser)
  status TEXT NOT NULL DEFAULT 'sent',        -- 'sent' | 'failed'
  "pixelId" TEXT,
  "orderId" TEXT,
  "userId" TEXT,
  "userEmail" TEXT,
  value NUMERIC,
  currency TEXT,
  "contentName" TEXT,
  "contentIds" TEXT,                          -- comma-joined plan ids
  "eventSourceUrl" TEXT,
  error TEXT,
  "createdAt" TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS pixel_events_created_at_idx
  ON public.pixel_events ("createdAt" DESC);
CREATE INDEX IF NOT EXISTS pixel_events_order_id_idx
  ON public.pixel_events ("orderId");

ALTER TABLE public.pixel_events ENABLE ROW LEVEL SECURITY;

-- The app connects with the service-role key (bypasses RLS). This policy just
-- keeps behaviour consistent with the other admin-only tables.
DROP POLICY IF EXISTS "Allow service role to manage pixel_events" ON public.pixel_events;
CREATE POLICY "Allow service role to manage pixel_events" ON public.pixel_events
  FOR ALL USING (true);
