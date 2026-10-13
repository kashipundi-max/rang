-- Alter users table to add referredBy column referencing itself
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS "referredBy" TEXT REFERENCES public.users(id) ON DELETE SET NULL;
