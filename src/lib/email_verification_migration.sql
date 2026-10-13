-- Existing accounts are treated as verified. New application signups explicitly
-- set emailVerified to false until their one-time email link is consumed.
ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS "emailVerified" BOOLEAN NOT NULL DEFAULT TRUE,
  ADD COLUMN IF NOT EXISTS "emailVerifiedAt" TIMESTAMPTZ;

CREATE TABLE IF NOT EXISTS public.email_verification_tokens (
  "tokenHash" TEXT PRIMARY KEY,
  "userId" TEXT NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  "expiresAt" TIMESTAMPTZ NOT NULL,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS email_verification_tokens_user_id_idx
  ON public.email_verification_tokens ("userId");

ALTER TABLE public.email_verification_tokens ENABLE ROW LEVEL SECURITY;

-- Server routes use the service role. No public policies are intentionally added.
