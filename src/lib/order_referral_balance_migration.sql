-- Alter orders table to add referralBalanceApplied column
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS "referralBalanceApplied" NUMERIC DEFAULT 0;
