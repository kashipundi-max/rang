-- CREATE coupons Table
CREATE TABLE IF NOT EXISTS public.coupons (
  code TEXT PRIMARY KEY,
  "discountPercent" NUMERIC NOT NULL,
  status TEXT NOT NULL DEFAULT 'active',
  "expiresAt" TIMESTAMPTZ,
  "createdAt" TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.coupons
  ADD COLUMN IF NOT EXISTS "expiresAt" TIMESTAMPTZ;

ALTER TABLE public.coupons
  ADD COLUMN IF NOT EXISTS "createdAt" TIMESTAMPTZ DEFAULT now();

-- Enable Row Level Security
ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;

-- Create Policies
-- Allow public select/read access to all coupons so buyers can check them
DROP POLICY IF EXISTS "Allow public read of coupons" ON public.coupons;
CREATE POLICY "Allow public read of coupons" ON public.coupons
  FOR SELECT
  TO anon, authenticated
  USING (true);

DROP POLICY IF EXISTS "Allow service role or authenticated admin to manage coupons" ON public.coupons;

-- Seed default coupon codes
INSERT INTO public.coupons (code, "discountPercent", status, "createdAt")
VALUES ('LUNAR10', 10, 'active', now())
ON CONFLICT (code) DO UPDATE SET "discountPercent" = EXCLUDED."discountPercent", status = EXCLUDED.status;

INSERT INTO public.coupons (code, "discountPercent", status, "createdAt")
VALUES ('SARAH10', 10, 'active', now())
ON CONFLICT (code) DO UPDATE SET "discountPercent" = EXCLUDED."discountPercent", status = EXCLUDED.status;
