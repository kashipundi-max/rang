-- Run this schema in Supabase before enabling collaborator accounts.
-- It is deliberately separate from the legacy affiliates/referrals tables.
CREATE TABLE IF NOT EXISTS public.collaborators (
  "userId" TEXT PRIMARY KEY REFERENCES public.users(id) ON DELETE CASCADE,
  "referralCode" TEXT NOT NULL UNIQUE,
  "commissionRate" NUMERIC NOT NULL DEFAULT 20 CHECK ("commissionRate" = 20),
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.collaborator_attributions (
  "referredUserId" TEXT PRIMARY KEY REFERENCES public.users(id) ON DELETE CASCADE,
  "collaboratorId" TEXT NOT NULL REFERENCES public.collaborators("userId") ON DELETE RESTRICT,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.collaborator_sales (
  "referredUserId" TEXT NOT NULL REFERENCES public.users(id) ON DELETE RESTRICT,
  "collaboratorId" TEXT NOT NULL REFERENCES public.collaborators("userId") ON DELETE RESTRICT,
  "orderId" TEXT NOT NULL REFERENCES public.orders(id) ON DELETE RESTRICT,
  "saleAmount" NUMERIC NOT NULL CHECK ("saleAmount" >= 0),
  "commissionAmount" NUMERIC NOT NULL CHECK ("commissionAmount" >= 0),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'paid')),
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY ("referredUserId", "orderId")
);

ALTER TABLE public.collaborators ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.collaborator_attributions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.collaborator_sales ENABLE ROW LEVEL SECURITY;

-- The application accesses these tables server-side with its service key. Do not add
-- permissive browser policies; collaborator access is mediated by /api/collaborators.
