-- Prevent one trading credential set from being assigned to multiple accounts/users.
-- Apply this migration after resolving any duplicates reported by the validation blocks.

DO $$
DECLARE
  duplicate_credentials TEXT;
BEGIN
  SELECT string_agg(format('%s / %s / %s (%s rows)', platform_key, server_key, login_key, duplicate_count), ', ')
  INTO duplicate_credentials
  FROM (
    SELECT
      lower(btrim(platform)) AS platform_key,
      lower(btrim(server)) AS server_key,
      lower(btrim(login)) AS login_key,
      count(*) AS duplicate_count
    FROM public.trading_accounts
    WHERE "deliveryStatus" = 'delivered'
      AND btrim(login) <> ''
      AND lower(btrim(login)) NOT LIKE 'generated_%'
      AND lower(btrim(server)) <> 'range4ex-pendingserver'
    GROUP BY 1, 2, 3
    HAVING count(*) > 1
  ) duplicates;

  IF duplicate_credentials IS NOT NULL THEN
    RAISE EXCEPTION 'Duplicate delivered trading credentials must be resolved before applying uniqueness: %', duplicate_credentials;
  END IF;
END $$;

CREATE UNIQUE INDEX IF NOT EXISTS trading_accounts_unique_delivered_credentials
  ON public.trading_accounts (
    lower(btrim(platform)),
    lower(btrim(server)),
    lower(btrim(login))
  )
  WHERE "deliveryStatus" = 'delivered'
    AND btrim(login) <> ''
    AND lower(btrim(login)) NOT LIKE 'generated_%'
    AND lower(btrim(server)) <> 'range4ex-pendingserver';

CREATE UNIQUE INDEX IF NOT EXISTS challenge_inventory_unique_credentials
  ON public.challenge_inventory (
    lower(btrim(platform)),
    lower(btrim(server)),
    lower(btrim(login))
  );
