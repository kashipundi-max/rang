-- Weekend Holding paid add-on.
-- Selected at checkout for a +20% fee; unlocks holding positions through the
-- weekend closure on the account provisioned from the order.
ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS "weekendHoldingAddon" BOOLEAN DEFAULT false;

ALTER TABLE public.trading_accounts
  ADD COLUMN IF NOT EXISTS "weekendHoldingAddon" BOOLEAN DEFAULT false;
