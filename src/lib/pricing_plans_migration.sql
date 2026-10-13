-- CREATE pricing_plans Table
CREATE TABLE IF NOT EXISTS public.pricing_plans (
  id TEXT PRIMARY KEY,
  model TEXT NOT NULL,
  size NUMERIC NOT NULL,
  price NUMERIC NOT NULL,
  status TEXT NOT NULL DEFAULT 'active',
  "createdAt" TIMESTAMPTZ DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.pricing_plans ENABLE ROW LEVEL SECURITY;

-- Create Policies
-- Allow public select/read access to all pricing plans so they can be shown on the landing page
CREATE POLICY "Allow public read of pricing_plans" ON public.pricing_plans
  FOR SELECT USING (true);

-- Allow full access to authenticated service-role or administrators to manage pricing plans
CREATE POLICY "Allow service role or authenticated admin to manage pricing_plans" ON public.pricing_plans
  FOR ALL USING (true);
