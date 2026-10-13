CREATE TABLE IF NOT EXISTS public.challenge_inventory (
  id TEXT PRIMARY KEY,
  platform TEXT NOT NULL,
  size NUMERIC NOT NULL,
  login TEXT NOT NULL,
  password TEXT NOT NULL,
  server TEXT NOT NULL,
  "externalStatisticsId" TEXT,
  status TEXT NOT NULL DEFAULT 'available',
  "orderId" TEXT,
  "createdAt" TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.challenge_inventory ENABLE ROW LEVEL SECURITY;

CREATE UNIQUE INDEX IF NOT EXISTS challenge_inventory_unique_credentials
  ON public.challenge_inventory (lower(btrim(platform)), lower(btrim(server)), lower(btrim(login)));

