CREATE TABLE IF NOT EXISTS public.email_logs (
  id TEXT PRIMARY KEY,
  "userId" TEXT REFERENCES public.users(id) ON DELETE CASCADE,
  "toEmail" TEXT NOT NULL,
  subject TEXT NOT NULL,
  content TEXT NOT NULL,
  status TEXT NOT NULL,
  provider TEXT NOT NULL,
  error TEXT,
  "sentAt" TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.email_logs ENABLE ROW LEVEL SECURITY;
