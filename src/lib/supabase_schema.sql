-- users Table
CREATE TABLE IF NOT EXISTS public.users (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  phone TEXT,
  country TEXT,
  "passwordHash" TEXT NOT NULL,
  role TEXT NOT NULL,
  status TEXT NOT NULL,
  "emailVerified" BOOLEAN NOT NULL DEFAULT TRUE,
  "emailVerifiedAt" TIMESTAMPTZ,
  "referredBy" TEXT REFERENCES public.users(id) ON DELETE SET NULL,
  "createdAt" TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- email_verification_tokens Table
CREATE TABLE IF NOT EXISTS public.email_verification_tokens (
  "tokenHash" TEXT PRIMARY KEY,
  "userId" TEXT NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  "expiresAt" TIMESTAMPTZ NOT NULL,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS email_verification_tokens_user_id_idx
  ON public.email_verification_tokens ("userId");
ALTER TABLE public.email_verification_tokens ENABLE ROW LEVEL SECURITY;

-- challenge_plans Table
CREATE TABLE IF NOT EXISTS public.challenge_plans (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  size NUMERIC NOT NULL,
  price NUMERIC NOT NULL,
  "profitTargetP1" NUMERIC NOT NULL,
  "profitTargetP2" NUMERIC NOT NULL,
  "maxDailyLoss" NUMERIC NOT NULL,
  "maxTotalLoss" NUMERIC NOT NULL,
  "profitSplit" NUMERIC NOT NULL,
  platform TEXT,
  login TEXT,
  password TEXT,
  server TEXT
);
ALTER TABLE public.challenge_plans ENABLE ROW LEVEL SECURITY;

-- challenge_inventory Table
CREATE TABLE IF NOT EXISTS public.challenge_inventory (
  id TEXT PRIMARY KEY,
  platform TEXT NOT NULL,
  size NUMERIC NOT NULL,
  login TEXT NOT NULL,
  password TEXT NOT NULL,
  server TEXT NOT NULL,
  "externalStatisticsId" TEXT,
  status TEXT NOT NULL DEFAULT 'available',
  "orderId" TEXT,
  "createdAt" TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.challenge_inventory ENABLE ROW LEVEL SECURITY;
CREATE UNIQUE INDEX IF NOT EXISTS challenge_inventory_unique_credentials
  ON public.challenge_inventory (lower(btrim(platform)), lower(btrim(server)), lower(btrim(login)));

-- kyc Table
CREATE TABLE IF NOT EXISTS public.kyc (
  "userId" TEXT PRIMARY KEY REFERENCES public.users(id) ON DELETE CASCADE,
  "documentType" TEXT NOT NULL,
  "frontUrl" TEXT,
  "backUrl" TEXT,
  "selfieUrl" TEXT,
  "addressUrl" TEXT,
  status TEXT NOT NULL,
  "rejectReason" TEXT,
  "updatedAt" TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.kyc ENABLE ROW LEVEL SECURITY;

-- orders Table
CREATE TABLE IF NOT EXISTS public.orders (
  id TEXT PRIMARY KEY,
  "userId" TEXT REFERENCES public.users(id) ON DELETE CASCADE,
  "planId" TEXT REFERENCES public.challenge_plans(id) ON DELETE SET NULL,
  "couponUsed" TEXT,
  "amountPaid" NUMERIC NOT NULL,
  "referralBalanceApplied" NUMERIC DEFAULT 0,
  "weekendHoldingAddon" BOOLEAN DEFAULT false,
  "legacyRules" BOOLEAN DEFAULT false,
  "paymentMethod" TEXT NOT NULL,
  status TEXT NOT NULL,
  "gatewayRef" TEXT,
  "createdAt" TIMESTAMPTZ DEFAULT now(),
  "updatedAt" TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- trading_accounts Table
CREATE TABLE IF NOT EXISTS public.trading_accounts (
  id TEXT PRIMARY KEY,
  "userId" TEXT REFERENCES public.users(id) ON DELETE CASCADE,
  "orderId" TEXT REFERENCES public.orders(id) ON DELETE SET NULL,
  platform TEXT NOT NULL,
  login TEXT NOT NULL,
  "passwordMaster" TEXT,
  "passwordInvestor" TEXT,
  server TEXT NOT NULL,
  "profitTarget" NUMERIC NOT NULL,
  balance NUMERIC NOT NULL,
  equity NUMERIC NOT NULL,
  "todayPl" NUMERIC NOT NULL,
  "totalPl" NUMERIC NOT NULL,
  status TEXT NOT NULL,
  phase TEXT,
  "graphLink" TEXT,
  "weekendHoldingAddon" BOOLEAN DEFAULT false,
  "externalStatisticsId" TEXT,
  "statisticsPayload" JSONB,
  "statisticsUpdatedAt" TIMESTAMPTZ,
  "deliveryStatus" TEXT NOT NULL,
  "deliveredAt" TIMESTAMPTZ,
  "createdAt" TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.trading_accounts ENABLE ROW LEVEL SECURITY;
CREATE UNIQUE INDEX IF NOT EXISTS trading_accounts_unique_delivered_credentials
  ON public.trading_accounts (lower(btrim(platform)), lower(btrim(server)), lower(btrim(login)))
  WHERE "deliveryStatus" = 'delivered'
    AND btrim(login) <> ''
    AND lower(btrim(login)) NOT LIKE 'generated_%'
    AND lower(btrim(server)) <> 'range4ex-pendingserver';

-- payouts Table
CREATE TABLE IF NOT EXISTS public.payouts (
  id TEXT PRIMARY KEY,
  "accountId" TEXT REFERENCES public.trading_accounts(id) ON DELETE CASCADE,
  "userId" TEXT REFERENCES public.users(id) ON DELETE CASCADE,
  amount NUMERIC NOT NULL,
  "profitSplitAmount" NUMERIC NOT NULL,
  "firmShareAmount" NUMERIC NOT NULL,
  "paymentMethod" TEXT NOT NULL,
  "paymentDetails" TEXT NOT NULL,
  status TEXT NOT NULL,
  "approvedBy" TEXT REFERENCES public.users(id) ON DELETE SET NULL,
  "approvedAt" TIMESTAMPTZ,
  notes TEXT,
  "createdAt" TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.payouts ENABLE ROW LEVEL SECURITY;

-- affiliates Table
CREATE TABLE IF NOT EXISTS public.affiliates (
  "userId" TEXT PRIMARY KEY REFERENCES public.users(id) ON DELETE CASCADE,
  "referralCode" TEXT NOT NULL UNIQUE,
  "commissionRate" NUMERIC NOT NULL
);
ALTER TABLE public.affiliates ENABLE ROW LEVEL SECURITY;

-- referrals Table
CREATE TABLE IF NOT EXISTS public.referrals (
  "referredUserId" TEXT REFERENCES public.users(id) ON DELETE CASCADE,
  "affiliateId" TEXT REFERENCES public.users(id) ON DELETE CASCADE,
  "orderId" TEXT REFERENCES public.orders(id) ON DELETE CASCADE,
  "commissionAmount" NUMERIC NOT NULL,
  status TEXT NOT NULL,
  "createdAt" TIMESTAMPTZ DEFAULT now(),
  PRIMARY KEY ("referredUserId", "orderId")
);
ALTER TABLE public.referrals ENABLE ROW LEVEL SECURITY;

-- certificates Table
CREATE TABLE IF NOT EXISTS public.certificates (
  id TEXT PRIMARY KEY,
  "userId" TEXT REFERENCES public.users(id) ON DELETE CASCADE,
  "accountId" TEXT REFERENCES public.trading_accounts(id) ON DELETE CASCADE,
  "traderName" TEXT NOT NULL,
  "accountSize" NUMERIC NOT NULL,
  "planName" TEXT NOT NULL,
  "datePassed" TIMESTAMPTZ NOT NULL
);
ALTER TABLE public.certificates ENABLE ROW LEVEL SECURITY;

-- notifications Table
CREATE TABLE IF NOT EXISTS public.notifications (
  id TEXT PRIMARY KEY,
  "userId" TEXT REFERENCES public.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL,
  channel TEXT NOT NULL,
  status TEXT NOT NULL,
  read BOOLEAN DEFAULT false,
  "sentAt" TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- email_logs Table
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

-- audit_logs Table
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id TEXT PRIMARY KEY,
  "userId" TEXT REFERENCES public.users(id) ON DELETE CASCADE,
  "userName" TEXT NOT NULL,
  "targetId" TEXT NOT NULL,
  "targetType" TEXT NOT NULL,
  action TEXT NOT NULL,
  description TEXT NOT NULL,
  "createdAt" TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Seed users
INSERT INTO public.users (id, name, email, phone, country, "passwordHash", role, status, "createdAt")
VALUES ('u-admin', 'Admin Manager', 'admin@range4ex.com', '+1 (555) 019-2831', 'United States', '8c6976e5b5410415bde908bd4dee15dfb167a9c873fc4bb8a81f6f2ab448a918', 'admin', 'active', '2026-06-01T00:00:00.000Z')
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, email = EXCLUDED.email, phone = EXCLUDED.phone, country = EXCLUDED.country, "passwordHash" = EXCLUDED."passwordHash", role = EXCLUDED.role, status = EXCLUDED.status;
INSERT INTO public.users (id, name, email, phone, country, "passwordHash", role, status, "createdAt")
VALUES ('u-trader', 'Alex Mercer', 'trader@range4ex.com', '+1 (555) 042-4242', 'United Kingdom', '8c6976e5b5410415bde908bd4dee15dfb167a9c873fc4bb8a81f6f2ab448a918', 'trader', 'active', '2026-06-10T12:00:00.000Z')
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, email = EXCLUDED.email, phone = EXCLUDED.phone, country = EXCLUDED.country, "passwordHash" = EXCLUDED."passwordHash", role = EXCLUDED.role, status = EXCLUDED.status;
INSERT INTO public.users (id, name, email, phone, country, "passwordHash", role, status, "createdAt")
VALUES ('u-trader2', 'Jane Doe', 'jane.doe@range4ex.com', '+1 (555) 011-2233', 'Canada', '8c6976e5b5410415bde908bd4dee15dfb167a9c873fc4bb8a81f6f2ab448a918', 'trader', 'active', '2026-06-14T09:00:00.000Z')
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, email = EXCLUDED.email, phone = EXCLUDED.phone, country = EXCLUDED.country, "passwordHash" = EXCLUDED."passwordHash", role = EXCLUDED.role, status = EXCLUDED.status;
INSERT INTO public.users (id, name, email, phone, country, "passwordHash", role, status, "createdAt")
VALUES ('u-trader3', 'Marco Rossi', 'marco.rossi@range4ex.com', '+39 333 445566', 'Italy', '8c6976e5b5410415bde908bd4dee15dfb167a9c873fc4bb8a81f6f2ab448a918', 'trader', 'suspended', '2026-06-16T15:20:00.000Z')
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, email = EXCLUDED.email, phone = EXCLUDED.phone, country = EXCLUDED.country, "passwordHash" = EXCLUDED."passwordHash", role = EXCLUDED.role, status = EXCLUDED.status;
INSERT INTO public.users (id, name, email, phone, country, "passwordHash", role, status, "createdAt")
VALUES ('u-trader4', 'Yuki Tanaka', 'yuki.tanaka@range4ex.com', '+81 90 1234 5678', 'Japan', '8c6976e5b5410415bde908bd4dee15dfb167a9c873fc4bb8a81f6f2ab448a918', 'trader', 'active', '2026-06-20T08:00:00.000Z')
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, email = EXCLUDED.email, phone = EXCLUDED.phone, country = EXCLUDED.country, "passwordHash" = EXCLUDED."passwordHash", role = EXCLUDED.role, status = EXCLUDED.status;
INSERT INTO public.users (id, name, email, phone, country, "passwordHash", role, status, "createdAt")
VALUES ('u-trader5', 'Liam O''Connor', 'liam.oconnor@range4ex.com', '+353 87 123 4567', 'Ireland', '8c6976e5b5410415bde908bd4dee15dfb167a9c873fc4bb8a81f6f2ab448a918', 'trader', 'active', '2026-06-22T10:45:00.000Z')
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, email = EXCLUDED.email, phone = EXCLUDED.phone, country = EXCLUDED.country, "passwordHash" = EXCLUDED."passwordHash", role = EXCLUDED.role, status = EXCLUDED.status;
INSERT INTO public.users (id, name, email, phone, country, "passwordHash", role, status, "createdAt")
VALUES ('u-affiliate', 'Sarah Jenkins', 'affiliate@range4ex.com', '+1 (555) 099-8877', 'Canada', '8c6976e5b5410415bde908bd4dee15dfb167a9c873fc4bb8a81f6f2ab448a918', 'affiliate', 'active', '2026-06-12T08:30:00.000Z')
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, email = EXCLUDED.email, phone = EXCLUDED.phone, country = EXCLUDED.country, "passwordHash" = EXCLUDED."passwordHash", role = EXCLUDED.role, status = EXCLUDED.status;
INSERT INTO public.users (id, name, email, phone, country, "passwordHash", role, status, "createdAt")
VALUES ('u-affiliate2', 'Chen Wei', 'chen.wei@range4ex.com', '+86 139 1234 5678', 'China', '8c6976e5b5410415bde908bd4dee15dfb167a9c873fc4bb8a81f6f2ab448a918', 'affiliate', 'active', '2026-06-18T14:00:00.000Z')
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, email = EXCLUDED.email, phone = EXCLUDED.phone, country = EXCLUDED.country, "passwordHash" = EXCLUDED."passwordHash", role = EXCLUDED.role, status = EXCLUDED.status;

-- Seed challenge_plans
INSERT INTO public.challenge_plans (id, name, size, price, "profitTargetP1", "profitTargetP2", "maxDailyLoss", "maxTotalLoss", "profitSplit", platform, login, password, server)
VALUES ('plan-instant-50k', 'Instant', 50000, 749, 0, 0, 3, 6, 80, NULL, NULL, NULL, NULL)
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, size = EXCLUDED.size, price = EXCLUDED.price, "profitTargetP1" = EXCLUDED."profitTargetP1", "profitTargetP2" = EXCLUDED."profitTargetP2", "maxDailyLoss" = EXCLUDED."maxDailyLoss", "maxTotalLoss" = EXCLUDED."maxTotalLoss", "profitSplit" = EXCLUDED."profitSplit", platform = EXCLUDED.platform, login = EXCLUDED.login, password = EXCLUDED.password, server = EXCLUDED.server;
INSERT INTO public.challenge_plans (id, name, size, price, "profitTargetP1", "profitTargetP2", "maxDailyLoss", "maxTotalLoss", "profitSplit", platform, login, password, server)
VALUES ('plan-2-step-challenge-100k', 'Two Step', 100000, 499, 10, 5, 5, 10, 80, NULL, NULL, NULL, NULL)
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, size = EXCLUDED.size, price = EXCLUDED.price, "profitTargetP1" = EXCLUDED."profitTargetP1", "profitTargetP2" = EXCLUDED."profitTargetP2", "maxDailyLoss" = EXCLUDED."maxDailyLoss", "maxTotalLoss" = EXCLUDED."maxTotalLoss", "profitSplit" = EXCLUDED."profitSplit", platform = EXCLUDED.platform, login = EXCLUDED.login, password = EXCLUDED.password, server = EXCLUDED.server;
INSERT INTO public.challenge_plans (id, name, size, price, "profitTargetP1", "profitTargetP2", "maxDailyLoss", "maxTotalLoss", "profitSplit", platform, login, password, server)
VALUES ('plan-mt5-100k-100k', 'One Step', 100000, 500, 10, 0, 4, 10, 80, 'MT5', '4324', '32423', 'Range4ex-Demo')
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, size = EXCLUDED.size, price = EXCLUDED.price, "profitTargetP1" = EXCLUDED."profitTargetP1", "profitTargetP2" = EXCLUDED."profitTargetP2", "maxDailyLoss" = EXCLUDED."maxDailyLoss", "maxTotalLoss" = EXCLUDED."maxTotalLoss", "profitSplit" = EXCLUDED."profitSplit", platform = EXCLUDED.platform, login = EXCLUDED.login, password = EXCLUDED.password, server = EXCLUDED.server;
INSERT INTO public.challenge_plans (id, name, size, price, "profitTargetP1", "profitTargetP2", "maxDailyLoss", "maxTotalLoss", "profitSplit", platform, login, password, server)
VALUES ('plan-2step-100k', 'Two Step', 100000, 499, 10, 5, 5, 10, 80, NULL, NULL, NULL, NULL)
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, size = EXCLUDED.size, price = EXCLUDED.price, "profitTargetP1" = EXCLUDED."profitTargetP1", "profitTargetP2" = EXCLUDED."profitTargetP2", "maxDailyLoss" = EXCLUDED."maxDailyLoss", "maxTotalLoss" = EXCLUDED."maxTotalLoss", "profitSplit" = EXCLUDED."profitSplit", platform = EXCLUDED.platform, login = EXCLUDED.login, password = EXCLUDED.password, server = EXCLUDED.server;
INSERT INTO public.challenge_plans (id, name, size, price, "profitTargetP1", "profitTargetP2", "maxDailyLoss", "maxTotalLoss", "profitSplit", platform, login, password, server)
VALUES ('plan-2step-50k', 'Two Step', 50000, 299, 10, 5, 5, 10, 80, NULL, NULL, NULL, NULL)
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, size = EXCLUDED.size, price = EXCLUDED.price, "profitTargetP1" = EXCLUDED."profitTargetP1", "profitTargetP2" = EXCLUDED."profitTargetP2", "maxDailyLoss" = EXCLUDED."maxDailyLoss", "maxTotalLoss" = EXCLUDED."maxTotalLoss", "profitSplit" = EXCLUDED."profitSplit", platform = EXCLUDED.platform, login = EXCLUDED.login, password = EXCLUDED.password, server = EXCLUDED.server;
INSERT INTO public.challenge_plans (id, name, size, price, "profitTargetP1", "profitTargetP2", "maxDailyLoss", "maxTotalLoss", "profitSplit", platform, login, password, server)
VALUES ('plan-1step-10k', 'One Step', 10000, 99, 10, 0, 4, 10, 80, NULL, NULL, NULL, NULL)
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, size = EXCLUDED.size, price = EXCLUDED.price, "profitTargetP1" = EXCLUDED."profitTargetP1", "profitTargetP2" = EXCLUDED."profitTargetP2", "maxDailyLoss" = EXCLUDED."maxDailyLoss", "maxTotalLoss" = EXCLUDED."maxTotalLoss", "profitSplit" = EXCLUDED."profitSplit", platform = EXCLUDED.platform, login = EXCLUDED.login, password = EXCLUDED.password, server = EXCLUDED.server;
INSERT INTO public.challenge_plans (id, name, size, price, "profitTargetP1", "profitTargetP2", "maxDailyLoss", "maxTotalLoss", "profitSplit", platform, login, password, server)
VALUES ('plan-2step-25k', 'Two Step', 25000, 189, 10, 5, 5, 10, 80, NULL, NULL, NULL, NULL)
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, size = EXCLUDED.size, price = EXCLUDED.price, "profitTargetP1" = EXCLUDED."profitTargetP1", "profitTargetP2" = EXCLUDED."profitTargetP2", "maxDailyLoss" = EXCLUDED."maxDailyLoss", "maxTotalLoss" = EXCLUDED."maxTotalLoss", "profitSplit" = EXCLUDED."profitSplit", platform = EXCLUDED.platform, login = EXCLUDED.login, password = EXCLUDED.password, server = EXCLUDED.server;

-- Seed kyc
INSERT INTO public.kyc ("userId", "documentType", "frontUrl", "backUrl", "selfieUrl", "addressUrl", status, "rejectReason", "updatedAt")
VALUES ('u-trader', 'passport', '/mock-docs/passport-front.jpg', '/mock-docs/passport-back.jpg', '/mock-docs/selfie.jpg', '/mock-docs/proof-of-address.jpg', 'pending', '', '2026-06-25T18:00:00.000Z')
ON CONFLICT ("userId") DO UPDATE SET "documentType" = EXCLUDED."documentType", status = EXCLUDED.status, "rejectReason" = EXCLUDED."rejectReason", "updatedAt" = EXCLUDED."updatedAt";
INSERT INTO public.kyc ("userId", "documentType", "frontUrl", "backUrl", "selfieUrl", "addressUrl", status, "rejectReason", "updatedAt")
VALUES ('u-trader2', 'drivers_license', '/mock-docs/license-front.jpg', '/mock-docs/license-back.jpg', '/mock-docs/selfie2.jpg', '/mock-docs/address-utility.jpg', 'approved', '', '2026-06-14T11:00:00.000Z')
ON CONFLICT ("userId") DO UPDATE SET "documentType" = EXCLUDED."documentType", status = EXCLUDED.status, "rejectReason" = EXCLUDED."rejectReason", "updatedAt" = EXCLUDED."updatedAt";
INSERT INTO public.kyc ("userId", "documentType", "frontUrl", "backUrl", "selfieUrl", "addressUrl", status, "rejectReason", "updatedAt")
VALUES ('u-trader3', 'national_id', '/mock-docs/id-front.jpg', '/mock-docs/id-back.jpg', '/mock-docs/selfie3.jpg', '/mock-docs/address-expired.jpg', 'rejected', 'Address proof statement is older than 3 months.', '2026-06-17T09:30:00.000Z')
ON CONFLICT ("userId") DO UPDATE SET "documentType" = EXCLUDED."documentType", status = EXCLUDED.status, "rejectReason" = EXCLUDED."rejectReason", "updatedAt" = EXCLUDED."updatedAt";
INSERT INTO public.kyc ("userId", "documentType", "frontUrl", "backUrl", "selfieUrl", "addressUrl", status, "rejectReason", "updatedAt")
VALUES ('u-trader4', 'passport', '/mock-docs/passport-front-yuki.jpg', '/mock-docs/passport-back-yuki.jpg', '/mock-docs/selfie-yuki.jpg', '/mock-docs/address-yuki.jpg', 'pending', '', '2026-06-26T22:00:00.000Z')
ON CONFLICT ("userId") DO UPDATE SET "documentType" = EXCLUDED."documentType", status = EXCLUDED.status, "rejectReason" = EXCLUDED."rejectReason", "updatedAt" = EXCLUDED."updatedAt";
INSERT INTO public.kyc ("userId", "documentType", "frontUrl", "backUrl", "selfieUrl", "addressUrl", status, "rejectReason", "updatedAt")
VALUES ('u-trader5', 'passport', '/mock-docs/passport-liam.jpg', '/mock-docs/passport-liam-back.jpg', '/mock-docs/selfie-liam.jpg', '/mock-docs/address-liam.jpg', 'needs_review', 'Scanned document is too blurry, please re-upload with clear lighting.', '2026-06-25T11:20:00.000Z')
ON CONFLICT ("userId") DO UPDATE SET "documentType" = EXCLUDED."documentType", status = EXCLUDED.status, "rejectReason" = EXCLUDED."rejectReason", "updatedAt" = EXCLUDED."updatedAt";

-- Seed orders
INSERT INTO public.orders (id, "userId", "planId", "couponUsed", "amountPaid", "paymentMethod", status, "gatewayRef", "createdAt", "updatedAt")
VALUES ('o-1001', 'u-trader', 'plan-2step-100k', 'LUNAR10', 449, 'Credit Card', 'Step2 Active', 'ch_3M4a9bL8c2d1', '2026-06-15T10:00:00.000Z', '2026-06-28T10:59:27.002Z')
ON CONFLICT (id) DO UPDATE SET status = EXCLUDED.status, "updatedAt" = EXCLUDED."updatedAt";
INSERT INTO public.orders (id, "userId", "planId", "couponUsed", "amountPaid", "paymentMethod", status, "gatewayRef", "createdAt", "updatedAt")
VALUES ('o-1002', 'u-trader', 'plan-2step-50k', '', 299, 'USDT (Crypto)', 'Pending', 'tx_8f29d10e53a0', '2026-06-26T02:00:00.000Z', '2026-06-26T02:00:00.000Z')
ON CONFLICT (id) DO UPDATE SET status = EXCLUDED.status, "updatedAt" = EXCLUDED."updatedAt";
INSERT INTO public.orders (id, "userId", "planId", "couponUsed", "amountPaid", "paymentMethod", status, "gatewayRef", "createdAt", "updatedAt")
VALUES ('o-1003', 'u-trader2', 'plan-2step-50k', 'SARAH10', 269, 'Credit Card', 'Active', 'ch_5N1b2cL9e3f8', '2026-06-14T09:15:00.000Z', '2026-06-14T09:20:00.000Z')
ON CONFLICT (id) DO UPDATE SET status = EXCLUDED.status, "updatedAt" = EXCLUDED."updatedAt";
INSERT INTO public.orders (id, "userId", "planId", "couponUsed", "amountPaid", "paymentMethod", status, "gatewayRef", "createdAt", "updatedAt")
VALUES ('o-1004', 'u-trader4', 'plan-1step-10k', '', 99, 'USDT (Crypto)', 'Pending', 'tx_3a10e95c10fa', '2026-06-26T22:30:00.000Z', '2026-06-26T22:30:00.000Z')
ON CONFLICT (id) DO UPDATE SET status = EXCLUDED.status, "updatedAt" = EXCLUDED."updatedAt";
INSERT INTO public.orders (id, "userId", "planId", "couponUsed", "amountPaid", "paymentMethod", status, "gatewayRef", "createdAt", "updatedAt")
VALUES ('o-1005', 'u-trader5', 'plan-instant-50k', 'LUNAR10', 674, 'Credit Card', 'Active', 'ch_7P2c9dL1f8a9', '2026-06-22T11:00:00.000Z', '2026-06-22T11:05:00.000Z')
ON CONFLICT (id) DO UPDATE SET status = EXCLUDED.status, "updatedAt" = EXCLUDED."updatedAt";
INSERT INTO public.orders (id, "userId", "planId", "couponUsed", "amountPaid", "paymentMethod", status, "gatewayRef", "createdAt", "updatedAt")
VALUES ('o-1006', 'u-trader3', 'plan-2step-25k', '', 189, 'USDT (Crypto)', 'Failed', 'tx_failed_992120', '2026-06-16T16:00:00.000Z', '2026-06-16T16:05:00.000Z')
ON CONFLICT (id) DO UPDATE SET status = EXCLUDED.status, "updatedAt" = EXCLUDED."updatedAt";

-- Seed trading_accounts
INSERT INTO public.trading_accounts (id, "userId", "orderId", platform, login, "passwordMaster", "passwordInvestor", server, "profitTarget", balance, equity, "todayPl", "totalPl", status, phase, "graphLink", "deliveryStatus", "deliveredAt", "createdAt")
VALUES ('928172', 'u-trader', 'o-1001', 'MT5', '928172', 'MasterPassSecure!12', 'InvestorPassReadOnly!99', 'Range4ex-Demo', 8000, 100000, 100450.2, 450.2, 450.2, 'Failed', NULL, 'https://www.myfxbook.com/members/propfirm/928172', 'delivered', '2026-06-15T11:00:00.000Z', '2026-06-15T11:00:00.000Z')
ON CONFLICT (id) DO UPDATE SET balance = EXCLUDED.balance, equity = EXCLUDED.equity, "todayPl" = EXCLUDED."todayPl", "totalPl" = EXCLUDED."totalPl", status = EXCLUDED.status;
INSERT INTO public.trading_accounts (id, "userId", "orderId", platform, login, "passwordMaster", "passwordInvestor", server, "profitTarget", balance, equity, "todayPl", "totalPl", status, phase, "graphLink", "deliveryStatus", "deliveredAt", "createdAt")
VALUES ('881273', 'u-trader2', 'o-1003', 'MT5', '881273', 'JaneSecurePass1', 'JaneInvestRead', 'Range4ex-LiveFeed', 4000, 51200, 51200, 300, 1200, 'Active', NULL, 'https://myfxbook.com/members/propfirm/881273', 'delivered', '2026-06-14T10:00:00.000Z', '2026-06-14T10:00:00.000Z')
ON CONFLICT (id) DO UPDATE SET balance = EXCLUDED.balance, equity = EXCLUDED.equity, "todayPl" = EXCLUDED."todayPl", "totalPl" = EXCLUDED."totalPl", status = EXCLUDED.status;
INSERT INTO public.trading_accounts (id, "userId", "orderId", platform, login, "passwordMaster", "passwordInvestor", server, "profitTarget", balance, equity, "todayPl", "totalPl", status, phase, "graphLink", "deliveryStatus", "deliveredAt", "createdAt")
VALUES ('654321', 'u-trader4', 'o-1004', 'cTrader', '654321', 'GENERATED_MASTER_PASS', 'GENERATED_INVEST_PASS', 'Range4ex-PendingServer', 900, 10000, 10000, 0, 0, 'Active', NULL, '', 'pending', NULL, '2026-06-27T01:00:00.000Z')
ON CONFLICT (id) DO UPDATE SET balance = EXCLUDED.balance, equity = EXCLUDED.equity, "todayPl" = EXCLUDED."todayPl", "totalPl" = EXCLUDED."totalPl", status = EXCLUDED.status;
INSERT INTO public.trading_accounts (id, "userId", "orderId", platform, login, "passwordMaster", "passwordInvestor", server, "profitTarget", balance, equity, "todayPl", "totalPl", status, phase, "graphLink", "deliveryStatus", "deliveredAt", "createdAt")
VALUES ('449281', 'u-trader5', 'o-1005', 'MT5', '449281', 'LiamMT5SecurePass', 'LiamReadPass', 'Range4ex-LiveFeed', 0, 92000, 92000, -1500, -8000, 'Failed', NULL, '', 'delivered', '2026-06-22T12:00:00.000Z', '2026-06-22T12:00:00.000Z')
ON CONFLICT (id) DO UPDATE SET balance = EXCLUDED.balance, equity = EXCLUDED.equity, "todayPl" = EXCLUDED."todayPl", "totalPl" = EXCLUDED."totalPl", status = EXCLUDED.status;
INSERT INTO public.trading_accounts (id, "userId", "orderId", platform, login, "passwordMaster", "passwordInvestor", server, "profitTarget", balance, equity, "todayPl", "totalPl", status, phase, "graphLink", "deliveryStatus", "deliveredAt", "createdAt")
VALUES ('724327', 'u-trader', 'o-1001', 'MT5', '4324', '32423', 'Ipass3871', 'Range4ex-Demo', 8000, 100000, 100000, 0, 0, 'Passed', 'Phase 1 (Evaluation)', 'https://myfxbook.com/members/propfirm/724327', 'delivered', '2026-06-28T11:15:59.078Z', '2026-06-28T10:59:12.461Z')
ON CONFLICT (id) DO UPDATE SET balance = EXCLUDED.balance, equity = EXCLUDED.equity, "todayPl" = EXCLUDED."todayPl", "totalPl" = EXCLUDED."totalPl", status = EXCLUDED.status;
INSERT INTO public.trading_accounts (id, "userId", "orderId", platform, login, "passwordMaster", "passwordInvestor", server, "profitTarget", balance, equity, "todayPl", "totalPl", status, phase, "graphLink", "deliveryStatus", "deliveredAt", "createdAt")
VALUES ('118508', 'u-trader', 'o-1001', 'MT5', '118508', 'GENERATED_MASTER_PASS', 'GENERATED_INVEST_PASS', 'Range4ex-PendingServer', 5000, 100000, 100000, 0, 0, 'Active', 'Phase 2 (Verification)', '', 'pending', NULL, '2026-06-28T10:59:19.817Z')
ON CONFLICT (id) DO UPDATE SET balance = EXCLUDED.balance, equity = EXCLUDED.equity, "todayPl" = EXCLUDED."todayPl", "totalPl" = EXCLUDED."totalPl", status = EXCLUDED.status;

-- Seed payouts
INSERT INTO public.payouts (id, "accountId", "userId", amount, "profitSplitAmount", "firmShareAmount", "paymentMethod", "paymentDetails", status, "approvedBy", "approvedAt", notes, "createdAt")
VALUES ('pay-5001', '928172', 'u-trader', 1500, 1200, 300, 'Crypto (USDT)', '{"address":"0x71C2496a89afc6C4c5415Bde908bd4dee15dfb16"}', 'paid', 'u-admin', '2026-06-20T14:00:00.000Z', 'Verified trades compliance. Payout completed via withdrawal contract.', '2026-06-19T09:00:00.000Z')
ON CONFLICT (id) DO UPDATE SET status = EXCLUDED.status, notes = EXCLUDED.notes;
INSERT INTO public.payouts (id, "accountId", "userId", amount, "profitSplitAmount", "firmShareAmount", "paymentMethod", "paymentDetails", status, "approvedBy", "approvedAt", notes, "createdAt")
VALUES ('pay-5002', '881273', 'u-trader2', 1000, 800, 200, 'Bank Wire', '{"accountName":"Jane Doe","bankName":"RBC Royal Bank","iban":"CA99RYAL123456789"}', 'paid', 'u-admin', '2026-06-18T16:00:00.000Z', 'Cleared regulatory scan. Settled via wire transfer.', '2026-06-17T11:00:00.000Z')
ON CONFLICT (id) DO UPDATE SET status = EXCLUDED.status, notes = EXCLUDED.notes;
INSERT INTO public.payouts (id, "accountId", "userId", amount, "profitSplitAmount", "firmShareAmount", "paymentMethod", "paymentDetails", status, "approvedBy", "approvedAt", notes, "createdAt")
VALUES ('pay-5003', '928172', 'u-trader', 2500, 2000, 500, 'Crypto (USDT)', '{"address":"0x71C2496a89afc6C4c5415Bde908bd4dee15dfb16"}', 'pending', NULL, NULL, NULL, '2026-06-26T14:00:00.000Z')
ON CONFLICT (id) DO UPDATE SET status = EXCLUDED.status, notes = EXCLUDED.notes;
INSERT INTO public.payouts (id, "accountId", "userId", amount, "profitSplitAmount", "firmShareAmount", "paymentMethod", "paymentDetails", status, "approvedBy", "approvedAt", notes, "createdAt")
VALUES ('pay-5004', '881273', 'u-trader2', 500, 400, 100, 'Crypto (USDT)', '{"address":"0x0000000000000000000000000000000000000000"}', 'rejected', NULL, NULL, 'Rejected: Invalid black hole payment destination address string.', '2026-06-25T15:00:00.000Z')
ON CONFLICT (id) DO UPDATE SET status = EXCLUDED.status, notes = EXCLUDED.notes;

-- Seed affiliates
INSERT INTO public.affiliates ("userId", "referralCode", "commissionRate")
VALUES ('u-affiliate', 'SARAH10', 15)
ON CONFLICT ("userId") DO UPDATE SET "referralCode" = EXCLUDED."referralCode", "commissionRate" = EXCLUDED."commissionRate";
INSERT INTO public.affiliates ("userId", "referralCode", "commissionRate")
VALUES ('u-affiliate2', 'WEI20', 20)
ON CONFLICT ("userId") DO UPDATE SET "referralCode" = EXCLUDED."referralCode", "commissionRate" = EXCLUDED."commissionRate";

-- Seed referrals
INSERT INTO public.referrals ("referredUserId", "affiliateId", "orderId", "commissionAmount", status, "createdAt")
VALUES ('u-trader', 'u-affiliate', 'o-1001', 67.35, 'approved', '2026-06-15T10:05:00.000Z')
ON CONFLICT ("referredUserId", "orderId") DO UPDATE SET status = EXCLUDED.status;
INSERT INTO public.referrals ("referredUserId", "affiliateId", "orderId", "commissionAmount", status, "createdAt")
VALUES ('u-trader2', 'u-affiliate', 'o-1003', 40.35, 'approved', '2026-06-14T09:20:00.000Z')
ON CONFLICT ("referredUserId", "orderId") DO UPDATE SET status = EXCLUDED.status;
INSERT INTO public.referrals ("referredUserId", "affiliateId", "orderId", "commissionAmount", status, "createdAt")
VALUES ('u-trader5', 'u-affiliate2', 'o-1005', 134.8, 'approved', '2026-06-22T11:05:00.000Z')
ON CONFLICT ("referredUserId", "orderId") DO UPDATE SET status = EXCLUDED.status;

-- Seed certificates
INSERT INTO public.certificates (id, "userId", "accountId", "traderName", "accountSize", "planName", "datePassed")
VALUES ('cert-9281a', 'u-trader', '928172', 'Alex Mercer', 100000, 'Two Step', '2026-06-20T12:00:00.000Z')
ON CONFLICT (id) DO NOTHING;

-- Seed notifications
INSERT INTO public.notifications (id, "userId", title, message, type, channel, status, read, "sentAt")
VALUES ('notif-001', 'u-trader', 'KYC Status Update', 'Your KYC documents have been submitted and are currently pending review.', 'info', 'in_app', 'sent', false, '2026-06-25T18:00:00.000Z')
ON CONFLICT (id) DO UPDATE SET read = EXCLUDED.read;
INSERT INTO public.notifications (id, "userId", title, message, type, channel, status, read, "sentAt")
VALUES ('notif-002', 'u-trader2', 'Account Ready', 'Your MT4 50K account credentials have been delivered successfully.', 'success', 'email', 'sent', true, '2026-06-14T10:05:00.000Z')
ON CONFLICT (id) DO UPDATE SET read = EXCLUDED.read;
INSERT INTO public.notifications (id, "userId", title, message, type, channel, status, read, "sentAt")
VALUES ('notif-003', 'u-trader5', 'Account Failed Alert', 'Account 449281 has breached max drawdown limit and is deactivated.', 'error', 'in_app', 'sent', false, '2026-06-25T15:30:00.000Z')
ON CONFLICT (id) DO UPDATE SET read = EXCLUDED.read;
INSERT INTO public.notifications (id, "userId", title, message, type, channel, status, read, "sentAt")
VALUES ('notif-7kbq9b3ma', 'u-trader', 'Order Refunded', 'Order o-1001 has been refunded. Check your bank statement or card holder wallet.', 'warning', 'email', 'sent', false, '2026-06-27T07:24:09.512Z')
ON CONFLICT (id) DO UPDATE SET read = EXCLUDED.read;
INSERT INTO public.notifications (id, "userId", title, message, type, channel, status, read, "sentAt")
VALUES ('notif-7ur15k4ib', 'u-admin', 'System Maintenance Alert', 'Our trading network will undergo a scheduled gateway update on Sunday at 02:00 UTC. Trading feeds will remain operational.', 'info', 'in_app', 'sent', false, '2026-06-27T07:41:00.033Z')
ON CONFLICT (id) DO UPDATE SET read = EXCLUDED.read;
INSERT INTO public.notifications (id, "userId", title, message, type, channel, status, read, "sentAt")
VALUES ('notif-ijlbduga0', 'u-trader', 'System Maintenance Alert', 'Our trading network will undergo a scheduled gateway update on Sunday at 02:00 UTC. Trading feeds will remain operational.', 'info', 'in_app', 'sent', false, '2026-06-27T07:41:00.034Z')
ON CONFLICT (id) DO UPDATE SET read = EXCLUDED.read;
INSERT INTO public.notifications (id, "userId", title, message, type, channel, status, read, "sentAt")
VALUES ('notif-2j3phwseb', 'u-trader2', 'System Maintenance Alert', 'Our trading network will undergo a scheduled gateway update on Sunday at 02:00 UTC. Trading feeds will remain operational.', 'info', 'in_app', 'sent', false, '2026-06-27T07:41:00.036Z')
ON CONFLICT (id) DO UPDATE SET read = EXCLUDED.read;
INSERT INTO public.notifications (id, "userId", title, message, type, channel, status, read, "sentAt")
VALUES ('notif-afogpkjk5', 'u-trader3', 'System Maintenance Alert', 'Our trading network will undergo a scheduled gateway update on Sunday at 02:00 UTC. Trading feeds will remain operational.', 'info', 'in_app', 'sent', false, '2026-06-27T07:41:00.038Z')
ON CONFLICT (id) DO UPDATE SET read = EXCLUDED.read;
INSERT INTO public.notifications (id, "userId", title, message, type, channel, status, read, "sentAt")
VALUES ('notif-1c3bd1ewe', 'u-trader4', 'System Maintenance Alert', 'Our trading network will undergo a scheduled gateway update on Sunday at 02:00 UTC. Trading feeds will remain operational.', 'info', 'in_app', 'sent', false, '2026-06-27T07:41:00.040Z')
ON CONFLICT (id) DO UPDATE SET read = EXCLUDED.read;
INSERT INTO public.notifications (id, "userId", title, message, type, channel, status, read, "sentAt")
VALUES ('notif-dsleb8kg7', 'u-trader5', 'System Maintenance Alert', 'Our trading network will undergo a scheduled gateway update on Sunday at 02:00 UTC. Trading feeds will remain operational.', 'info', 'in_app', 'sent', false, '2026-06-27T07:41:00.041Z')
ON CONFLICT (id) DO UPDATE SET read = EXCLUDED.read;
INSERT INTO public.notifications (id, "userId", title, message, type, channel, status, read, "sentAt")
VALUES ('notif-shtw0f1sr', 'u-affiliate', 'System Maintenance Alert', 'Our trading network will undergo a scheduled gateway update on Sunday at 02:00 UTC. Trading feeds will remain operational.', 'info', 'in_app', 'sent', false, '2026-06-27T07:41:00.043Z')
ON CONFLICT (id) DO UPDATE SET read = EXCLUDED.read;
INSERT INTO public.notifications (id, "userId", title, message, type, channel, status, read, "sentAt")
VALUES ('notif-3tm0agrk3', 'u-affiliate2', 'System Maintenance Alert', 'Our trading network will undergo a scheduled gateway update on Sunday at 02:00 UTC. Trading feeds will remain operational.', 'info', 'in_app', 'sent', false, '2026-06-27T07:41:00.045Z')
ON CONFLICT (id) DO UPDATE SET read = EXCLUDED.read;
INSERT INTO public.notifications (id, "userId", title, message, type, channel, status, read, "sentAt")
VALUES ('notif-7yygblust', 'u-affiliate', 'Referral Commission Earned', 'Your referral link generated a new sale! $67.35 has been credited to your balance (pending payout).', 'success', 'email', 'sent', false, '2026-06-28T10:59:12.463Z')
ON CONFLICT (id) DO UPDATE SET read = EXCLUDED.read;
INSERT INTO public.notifications (id, "userId", title, message, type, channel, status, read, "sentAt")
VALUES ('notif-ya3geqdml', 'u-trader', 'Order Confirmed & Phase 1 Active', 'Thank you! Your order o-1001 was confirmed. Your Phase 1 evaluation credentials are currently being generated.', 'success', 'email', 'sent', false, '2026-06-28T10:59:12.464Z')
ON CONFLICT (id) DO UPDATE SET read = EXCLUDED.read;
INSERT INTO public.notifications (id, "userId", title, message, type, channel, status, read, "sentAt")
VALUES ('notif-x3pzzwtr3', 'u-trader', 'Phase 2 Account Ready for Delivery', 'Congratulations on passing Phase 1! Your Phase 2 Verification trading account is ready to be delivered by the administrator.', 'success', 'email', 'sent', false, '2026-06-28T10:59:19.818Z')
ON CONFLICT (id) DO UPDATE SET read = EXCLUDED.read;
INSERT INTO public.notifications (id, "userId", title, message, type, channel, status, read, "sentAt")
VALUES ('notif-ne8b1lcnp', 'u-trader', 'Trading Credentials Delivered', 'Your account credentials have been delivered for Account 4324. Platform: MT5 | Server: Range4ex-Demo | Master Pass: 32423 | Investor Pass: Ipass3871. Start trading!', 'success', 'email', 'sent', false, '2026-06-28T11:15:59.079Z')
ON CONFLICT (id) DO UPDATE SET read = EXCLUDED.read;


-- coupons Table
CREATE TABLE IF NOT EXISTS public.coupons (
  code TEXT PRIMARY KEY,
  "discountPercent" NUMERIC NOT NULL,
  status TEXT NOT NULL DEFAULT 'active',
  "expiresAt" TIMESTAMPTZ,
  "createdAt" TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;

-- pricing_plans Table
CREATE TABLE IF NOT EXISTS public.pricing_plans (
  id TEXT PRIMARY KEY,
  model TEXT NOT NULL,
  size NUMERIC NOT NULL,
  price NUMERIC NOT NULL,
  status TEXT NOT NULL DEFAULT 'active',
  "createdAt" TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.pricing_plans ENABLE ROW LEVEL SECURITY;

-- pixel_events Table
-- Every Meta Pixel / Conversions API event the backend attempts to deliver is
-- logged here so admins can audit what fired (e.g. Purchase on order placed).
CREATE TABLE IF NOT EXISTS public.pixel_events (
  id TEXT PRIMARY KEY,
  "eventName" TEXT NOT NULL,
  "eventId" TEXT,
  source TEXT NOT NULL DEFAULT 'capi',
  status TEXT NOT NULL DEFAULT 'sent',
  "pixelId" TEXT,
  "orderId" TEXT,
  "userId" TEXT,
  "userEmail" TEXT,
  value NUMERIC,
  currency TEXT,
  "contentName" TEXT,
  "contentIds" TEXT,
  "eventSourceUrl" TEXT,
  error TEXT,
  "createdAt" TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX IF NOT EXISTS pixel_events_created_at_idx ON public.pixel_events ("createdAt" DESC);
CREATE INDEX IF NOT EXISTS pixel_events_order_id_idx ON public.pixel_events ("orderId");
ALTER TABLE public.pixel_events ENABLE ROW LEVEL SECURITY;

