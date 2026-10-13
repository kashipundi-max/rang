ALTER TABLE public.trading_accounts
  ADD COLUMN IF NOT EXISTS "externalStatisticsId" TEXT,
  ADD COLUMN IF NOT EXISTS "statisticsPayload" JSONB,
  ADD COLUMN IF NOT EXISTS "statisticsUpdatedAt" TIMESTAMPTZ;
