-- Legacy rule pin for existing orders.
-- When true, the account(s) provisioned from this order are evaluated against the
-- pre-2026-09 rulebook (old drawdown limits, targets and weekend-holding rule; the
-- rules added in that update are not applied). Admin-controlled from the Orders Desk.
ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS "legacyRules" BOOLEAN DEFAULT false;
