-- CREATE offers Table
-- Promotional offers that a flat percentage coupon cannot express:
--   type = 'bogo'       -> buy N challenges, get M of the same size free
--   type = 'free_retry' -> a failed challenge can be retried free of charge
-- Scope columns are jsonb arrays; an EMPTY array means "applies to everything"
-- so a store-wide offer stays a single row.
CREATE TABLE IF NOT EXISTS public.offers (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'bogo',
  code TEXT,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'active',
  "startsAt" TIMESTAMPTZ,
  "expiresAt" TIMESTAMPTZ,
  "accountSizes" JSONB NOT NULL DEFAULT '[]'::jsonb,
  "models" JSONB NOT NULL DEFAULT '[]'::jsonb,
  "userIds" JSONB NOT NULL DEFAULT '[]'::jsonb,
  "accountIds" JSONB NOT NULL DEFAULT '[]'::jsonb,
  "buyQuantity" NUMERIC NOT NULL DEFAULT 1,
  "freeQuantity" NUMERIC NOT NULL DEFAULT 1,
  "retryLimit" NUMERIC NOT NULL DEFAULT 0,
  "maxRedemptions" NUMERIC NOT NULL DEFAULT 0,
  "redeemedCount" NUMERIC NOT NULL DEFAULT 0,
  "createdAt" TIMESTAMPTZ DEFAULT now(),
  "updatedAt" TIMESTAMPTZ DEFAULT now()
);

-- Re-runnable column adds so an existing table picks up later fields.
ALTER TABLE public.offers ADD COLUMN IF NOT EXISTS code TEXT;
ALTER TABLE public.offers ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE public.offers ADD COLUMN IF NOT EXISTS "startsAt" TIMESTAMPTZ;
ALTER TABLE public.offers ADD COLUMN IF NOT EXISTS "expiresAt" TIMESTAMPTZ;
ALTER TABLE public.offers ADD COLUMN IF NOT EXISTS "accountSizes" JSONB NOT NULL DEFAULT '[]'::jsonb;
ALTER TABLE public.offers ADD COLUMN IF NOT EXISTS "models" JSONB NOT NULL DEFAULT '[]'::jsonb;
ALTER TABLE public.offers ADD COLUMN IF NOT EXISTS "userIds" JSONB NOT NULL DEFAULT '[]'::jsonb;
ALTER TABLE public.offers ADD COLUMN IF NOT EXISTS "accountIds" JSONB NOT NULL DEFAULT '[]'::jsonb;
ALTER TABLE public.offers ADD COLUMN IF NOT EXISTS "buyQuantity" NUMERIC NOT NULL DEFAULT 1;
ALTER TABLE public.offers ADD COLUMN IF NOT EXISTS "freeQuantity" NUMERIC NOT NULL DEFAULT 1;
ALTER TABLE public.offers ADD COLUMN IF NOT EXISTS "retryLimit" NUMERIC NOT NULL DEFAULT 0;
ALTER TABLE public.offers ADD COLUMN IF NOT EXISTS "maxRedemptions" NUMERIC NOT NULL DEFAULT 0;
ALTER TABLE public.offers ADD COLUMN IF NOT EXISTS "redeemedCount" NUMERIC NOT NULL DEFAULT 0;
ALTER TABLE public.offers ADD COLUMN IF NOT EXISTS "updatedAt" TIMESTAMPTZ DEFAULT now();

CREATE INDEX IF NOT EXISTS offers_status_idx ON public.offers (status);
CREATE UNIQUE INDEX IF NOT EXISTS offers_code_unique_idx
  ON public.offers (upper(code)) WHERE code IS NOT NULL AND code <> '';

-- Enable Row Level Security
ALTER TABLE public.offers ENABLE ROW LEVEL SECURITY;

-- Buyers need to read offers to see what applies to them; writes go through the
-- service role in /api/offers, which already checks the admin session.
DROP POLICY IF EXISTS "Allow public read of offers" ON public.offers;
CREATE POLICY "Allow public read of offers" ON public.offers
  FOR SELECT
  TO anon, authenticated
  USING (true);

-- CREATE offer_redemptions Table
-- One row per granted benefit. Free-retry eligibility is counted from these
-- rows (not from a bare counter), so a failed account cannot be claimed twice
-- and an offer's redemption cap stays truthful.
CREATE TABLE IF NOT EXISTS public.offer_redemptions (
  id TEXT PRIMARY KEY,
  "offerId" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'free_retry',
  "sourceAccountId" TEXT,
  "newAccountId" TEXT,
  "orderId" TEXT,
  status TEXT NOT NULL DEFAULT 'granted',
  "createdAt" TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS offer_redemptions_offer_idx
  ON public.offer_redemptions ("offerId");
CREATE INDEX IF NOT EXISTS offer_redemptions_user_idx
  ON public.offer_redemptions ("userId");
-- One live retry per failed account per offer is enforced in the API; this
-- index makes that lookup cheap.
CREATE INDEX IF NOT EXISTS offer_redemptions_source_account_idx
  ON public.offer_redemptions ("sourceAccountId");

ALTER TABLE public.offer_redemptions ENABLE ROW LEVEL SECURITY;

-- No public policy: redemptions are read and written only through /api/offers
-- with the service role, which checks the session itself. RLS on with zero
-- policies means anon/authenticated keys see nothing.
