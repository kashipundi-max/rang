-- Public graph link (e.g. myfxbook / fxblue URL) stored on a container account
-- so it can be viewed/edited from the admin Container view and carried over
-- to the trader account on delivery.
ALTER TABLE public.challenge_inventory
  ADD COLUMN IF NOT EXISTS "graphLink" TEXT;
