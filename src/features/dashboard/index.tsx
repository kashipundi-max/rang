"use client";

import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { useParams, usePathname } from "next/navigation";
import { parseStatisticsDate, statisticsTradeOpenedAt } from "@/lib/statisticsTime";
import Sidebar from "./components/Sidebar";
import Header from "./components/Header";

// Import tabs dynamically or normally. Since we want an instant load and smooth transitions,
// we can import them normally, keeping them clean.
import OverviewTab from "./components/tabs/OverviewTab";
import AccountsTab from "./components/tabs/AccountsTab";
import OffersTab from "./components/tabs/OffersTab";
import PerformanceTab from "./components/tabs/PerformanceTab";
import HistoryTab from "./components/tabs/HistoryTab";
import RulesTab from "./components/tabs/RulesTab";
import PayoutsTab from "./components/tabs/PayoutsTab";
import BuyChallengeTab, { prefetchBuyCatalog } from "./components/tabs/BuyChallengeTab";
import KycTab from "./components/tabs/KycTab";
import AchievementsTab from "./components/tabs/AchievementsTab";
import NewsTab from "./components/tabs/NewsTab";
import SettingsTab from "./components/tabs/SettingsTab";
import AdminCrmTab from "./components/tabs/AdminCrmTab";
import CollaboratorSalesTab from "./components/tabs/CollaboratorSalesTab";
import PixelEventsTab from "./components/tabs/PixelEventsTab";
import TrustpilotInvitesTab from "./components/tabs/TrustpilotInvitesTab";
import NewsCalendarTab from "./components/tabs/NewsCalendarTab";
import ReferralsTab from "./components/tabs/ReferralsTab";
import AccountGraphModal from "./components/tabs/AccountGraphModal";
import { Logo } from "@/components/Logo";
import { calculateDrawdownSnapshot } from "@/lib/drawdown";
import { getChallengeRule, getDrawdownLimits } from "@/lib/rulebook";
import { getPhaseRank } from "@/lib/challengeStages";
import { calculateProfitableTradingDays } from "@/lib/accountTradingRules";
import { getTodayClosedLoss } from "@/lib/tradingStatistics";
import {
  IconBriefcase,
  IconCheck,
  IconClock,
  IconServer,
  MenuIcon,
} from "./components/Icons";

// Define the type structures
export interface Account {
  id: string;
  orderId?: string;
  type: string;
  size: number;
  phase: string;
  status: "Active" | "Passed" | "Failed" | "Funded";
  balance: number;
  equity: number;
  todayPl: number;
  totalPl: number;
  platform: "MT4" | "MT5" | "cTrader";
  login: string;
  passwordMaster?: string;
  server: string;
  target: number;
  dailyLossLimit: number;
  maxDrawdown: number;
  currentDailyLoss: number;
  currentMaxDrawdown: number;
  minTradingDays: number;
  currentTradingDays: number;
  consistencyRule: boolean;
  newsRule: boolean;
  weekendHoldingAddon?: boolean;
  legacyRules?: boolean;
  deliveryStatus?: "pending" | "delivered";
  externalStatisticsId?: string;
  statisticsPayload?: any;
  statisticsUpdatedAt?: string;
  createdAt?: string;
  ruleChecks?: Array<{
    id: string;
    label: string;
    status: "passed" | "pending" | "warning" | "failed";
    info: string;
  }>;
  ruleAlerts?: Array<{
    id: string;
    title: string;
    message: string;
    type: "warning" | "success" | "info" | "error";
  }>;
  /** News Trading Rule soft breaches computed by the rule engine. */
  newsViolations?: Array<{
    ticket: string;
    symbol: string;
    eventTitle: string;
    currency: string;
    eventTime: string;
    type: "opened_in_window" | "closed_in_window";
    secondsFromEvent: number;
    profit: number;
  }>;
  newsProfitToDeduct?: number;
}

export interface Trade {
  id: string;
  date: string;
  /** Open time (UTC); empty when the feed has no usable open timestamp. */
  openDate?: string;
  symbol: string;
  direction: "Buy" | "Sell";
  lots: number;
  entryPrice: number;
  exitPrice: number;
  pl: number;
  duration: string;
}

export interface Payout {
  id: string;
  accountId: string;
  date: string;
  amount: number;
  status: "Pending" | "Approved" | "Paid" | "Rejected";
  method: string;
  details: string;
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: "warning" | "success" | "info" | "error";
  date: string;
  read: boolean;
}

// Initial mock data
const initialAccounts: Account[] = [
  {
    id: "928172",
    type: "Two Step",
    size: 100000,
    phase: "Phase 1 (Evaluation)",
    status: "Active",
    balance: 100000,
    equity: 100450.2,
    todayPl: 450.2,
    totalPl: 450.2,
    platform: "MT5",
    login: "928172",
    server: "Range4ex-Demo",
    target: 10000,
    dailyLossLimit: 5000,
    maxDrawdown: 10000,
    currentDailyLoss: 0,
    currentMaxDrawdown: 0,
    minTradingDays: 5,
    currentTradingDays: 3,
    consistencyRule: true,
    newsRule: true,
  },
  {
    id: "738192",
    type: "Funded Account",
    size: 50000,
    phase: "Funded (Live)",
    status: "Funded",
    balance: 51900,
    equity: 52380.0,
    todayPl: 1280.0,
    totalPl: 2380.0,
    platform: "cTrader",
    login: "738192",
    server: "Range4ex-Live",
    target: 0, // no target
    dailyLossLimit: 2000,
    maxDrawdown: 5000,
    currentDailyLoss: -150,
    currentMaxDrawdown: -520,
    minTradingDays: 0,
    currentTradingDays: 14,
    consistencyRule: true,
    newsRule: true,
  },
  {
    id: "849201",
    type: "2-Step Verification",
    size: 25000,
    phase: "Phase 2 (Verification)",
    status: "Passed",
    balance: 26250,
    equity: 26250,
    todayPl: 0,
    totalPl: 1250,
    platform: "MT4",
    login: "849201",
    server: "Range4ex-Demo2",
    target: 1250,
    dailyLossLimit: 1250,
    maxDrawdown: 2500,
    currentDailyLoss: 0,
    currentMaxDrawdown: 0,
    minTradingDays: 5,
    currentTradingDays: 5,
    consistencyRule: true,
    newsRule: true,
  },
];

const initialTrades: Record<string, Trade[]> = {
  "928172": [
    {
      id: "t1",
      date: "2026-06-25 14:22",
      symbol: "EURUSD",
      direction: "Buy",
      lots: 2.0,
      entryPrice: 1.0892,
      exitPrice: 1.09015,
      pl: 190.0,
      duration: "45m",
    },
    {
      id: "t2",
      date: "2026-06-25 11:05",
      symbol: "GBPUSD",
      direction: "Sell",
      lots: 1.5,
      entryPrice: 1.2655,
      exitPrice: 1.2638,
      pl: 255.0,
      duration: "1h 12m",
    },
    {
      id: "t3",
      date: "2026-06-24 16:40",
      symbol: "XAUUSD",
      direction: "Buy",
      lots: 0.5,
      entryPrice: 2322.4,
      exitPrice: 2318.1,
      pl: -215.0,
      duration: "25m",
    },
    {
      id: "t4",
      date: "2026-06-24 09:15",
      symbol: "EURUSD",
      direction: "Buy",
      lots: 3.0,
      entryPrice: 1.0875,
      exitPrice: 1.0888,
      pl: 390.0,
      duration: "2h 5m",
    },
    {
      id: "t5",
      date: "2026-06-23 15:30",
      symbol: "USDCAD",
      direction: "Sell",
      lots: 2.5,
      entryPrice: 1.369,
      exitPrice: 1.3702,
      pl: -300.0,
      duration: "38m",
    },
  ],
  "738192": [
    {
      id: "t10",
      date: "2026-06-25 13:00",
      symbol: "XAUUSD",
      direction: "Buy",
      lots: 1.0,
      entryPrice: 2320.5,
      exitPrice: 2331.0,
      pl: 1050.0,
      duration: "1h 5m",
    },
    {
      id: "t11",
      date: "2026-06-25 08:30",
      symbol: "GBPUSD",
      direction: "Buy",
      lots: 2.0,
      entryPrice: 1.262,
      exitPrice: 1.26315,
      pl: 230.0,
      duration: "32m",
    },
    {
      id: "t12",
      date: "2026-06-24 10:10",
      symbol: "EURUSD",
      direction: "Sell",
      lots: 4.0,
      entryPrice: 1.086,
      exitPrice: 1.0845,
      pl: 600.0,
      duration: "2h 45m",
    },
    {
      id: "t13",
      date: "2026-06-23 14:15",
      symbol: "USDCAD",
      direction: "Buy",
      lots: 2.0,
      entryPrice: 1.365,
      exitPrice: 1.3675,
      pl: 500.0,
      duration: "4h 10m",
    },
  ],
  "849201": [
    {
      id: "t20",
      date: "2026-06-20 15:30",
      symbol: "GBPUSD",
      direction: "Buy",
      lots: 2.0,
      entryPrice: 1.258,
      exitPrice: 1.26425,
      pl: 1250.0,
      duration: "3h 15m",
    },
  ],
};

const initialPayouts: Payout[] = [
  {
    id: "p-1",
    accountId: "738192",
    date: "2026-06-01",
    amount: 1520.0,
    status: "Paid",
    method: "USDT (ERC20)",
    details: "Address: 0x71C...89af",
  },
  {
    id: "p-2",
    accountId: "738192",
    date: "2026-05-15",
    amount: 980.5,
    status: "Paid",
    method: "Bank Wire",
    details: "Chase Account: *9281",
  },
];

type StatisticsPayload = Record<string, any> | undefined;

function asNumber(value: any, fallback = 0) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function formatStatsDate(value?: string) {
  if (!value) return "";
  // Same UTC reading the rule engine uses, so the dates a trader sees in the trade
  // table are the dates their rules were evaluated against. Seconds are kept so a
  // trade's exact open/close moment stays visible — the layering and holding-time
  // rules are decided down to the second.
  const date = parseStatisticsDate(value);
  if (!date) return value;
  return date.toISOString().replace("T", " ").substring(0, 19);
}

function formatDuration(seconds: any) {
  const totalSeconds = Math.max(0, Math.round(asNumber(seconds, 0)));
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const secs = totalSeconds % 60;
  if (hours > 0) return `${hours}h ${minutes}m ${secs}s`;
  if (minutes > 0) return `${minutes}m ${secs}s`;
  return `${secs}s`;
}

function mapStatisticsTrades(payload: StatisticsPayload): Trade[] {
  const rows =
    payload?.statistics?.advanced_statistics?.charts?.recent_trades_duration;
  if (!Array.isArray(rows)) return [];

  return rows.map((trade: any, index: number) => ({
    id: String(trade.ticket || `stat-${index + 1}`),
    date: formatStatsDate(trade.close_time || trade.open_time),
    openDate: formatStatsDate(statisticsTradeOpenedAt(trade)?.toISOString()),
    symbol: String(trade.symbol || "N/A"),
    direction: (trade.type || trade.direction || trade.side || "Buy")
      .toString()
      .toLowerCase()
      .includes("sell")
      ? "Sell"
      : "Buy",
    lots: asNumber(trade.volume, 0),
    entryPrice: asNumber(trade.entry_price ?? trade.open_price, 0),
    exitPrice: asNumber(trade.exit_price ?? trade.close_price, 0),
    pl: asNumber(trade.net_profit ?? trade.profit, 0),
    duration: formatDuration(trade.duration),
  }));
}

function enrichAccountWithStatistics(account: Account): Account {
  const payload = account.statisticsPayload;
  const info = payload?.account_info || {};
  const accountStats = payload?.statistics?.account_stats || {};
  const periodReturns =
    payload?.statistics?.monthly_yearly_performance?.period_returns || {};
  const today = periodReturns.today || {};
  const dailyPerformance = payload?.statistics?.equity_curve?.daily_performance;
  const balance = asNumber(
    info.balance ?? accountStats.balance,
    account.balance,
  );
  const equity = asNumber(info.equity ?? accountStats.equity, account.equity);
  const todayClosedPl = asNumber(today.profit, account.todayPl);
  const todayClosedLoss = getTodayClosedLoss(payload, todayClosedPl);
  const profitableDays = calculateProfitableTradingDays(payload, account.size);
  const drawdownSnapshot = calculateDrawdownSnapshot({
    initialBalance: account.size,
    balance,
    equity,
    todayClosedPl: -todayClosedLoss,
  });

  return {
    ...account,
    balance,
    equity,
    todayPl: todayClosedPl,
    totalPl: asNumber(accountStats.profit ?? info.profit, account.totalPl),
    currentTradingDays: payload
      ? profitableDays.count
      : account.currentTradingDays,
    currentDailyLoss: drawdownSnapshot.currentDailyLoss,
    currentMaxDrawdown: drawdownSnapshot.currentOverallLoss,
  };
}

function DashboardLoadingSkeleton({
  isCrmPortal = false,
}: {
  isCrmPortal?: boolean;
}) {
  const navRows = isCrmPortal
    ? [
        "Control Dashboard",
        "User Manager",
        "KYC Requests",
        "Orders Desk",
        "Audit Logs",
      ]
    : ["Overview", "Accounts", "Analytics", "Payouts", "Settings"];

  return (
    <div className={`dashboard-clash-font flex h-screen w-screen overflow-hidden bg-bg-dark text-text-primary antialiased crm-portal-readable ${isCrmPortal ? "" : "trader-dashboard dashboard-scale"}`}>
      <aside className="hidden h-full w-[260px] shrink-0 border-r border-border-secondary/50 bg-gradient-to-b from-bg-dark via-bg-card/25 to-bg-dark p-5 md:flex md:flex-col">
        <div className="space-y-6">
          <div className="space-y-3">
            <div className="h-9 w-36 rounded-lg bg-white/[0.08] animate-pulse" />
            <div className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              <div className="h-2 w-32 rounded bg-white/[0.08] animate-pulse" />
            </div>
          </div>

          <div className="space-y-3">
            <div className="h-2 w-24 rounded bg-white/[0.06] animate-pulse" />
            {navRows.map((row, index) => (
              <div
                key={row}
                className={`flex items-center gap-3 rounded-lg border px-3.5 py-3 ${
                  index === 0
                    ? "border-brand-primary/20 bg-brand-primary/[0.07]"
                    : "border-transparent"
                }`}
              >
                <div className="h-4 w-4 rounded bg-white/[0.12] animate-pulse" />
                <div className="h-2.5 w-28 rounded bg-white/[0.08] animate-pulse" />
              </div>
            ))}
          </div>
        </div>

        <div className="mt-auto rounded-xl border border-white/5 bg-white/[0.03] p-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-brand-primary/25 animate-pulse" />
            <div className="space-y-2">
              <div className="h-2.5 w-24 rounded bg-white/[0.1] animate-pulse" />
              <div className="h-2 w-16 rounded bg-white/[0.06] animate-pulse" />
            </div>
          </div>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-[74px] shrink-0 items-center justify-between border-b border-border-secondary/40 bg-bg-card/35 px-5 md:px-8">
          <div className="space-y-2">
            <div className="h-3 w-48 rounded bg-white/[0.1] animate-pulse" />
            <div className="h-2.5 w-32 rounded bg-white/[0.06] animate-pulse" />
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden h-9 w-36 rounded-lg border border-white/5 bg-white/[0.04] animate-pulse sm:block" />
            <div className="h-9 w-9 rounded-full border border-white/5 bg-white/[0.06] animate-pulse" />
            <div className="h-9 w-9 rounded-full border border-white/5 bg-white/[0.06] animate-pulse" />
          </div>
        </header>

        <main className="flex-1 overflow-hidden bg-neutral-900/30 p-4 md:p-6 lg:p-8">
          <div className="mx-auto max-w-7xl space-y-6">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {[0, 1, 2, 3].map((item) => (
                <div
                  key={item}
                  className="h-32 rounded-2xl border border-white/5 bg-bg-card/70 p-5 shadow-xl"
                >
                  <div className="flex items-start justify-between">
                    <div className="space-y-3">
                      <div className="h-2.5 w-24 rounded bg-white/[0.08] animate-pulse" />
                      <div className="h-7 w-28 rounded bg-white/[0.12] animate-pulse" />
                    </div>
                    <div className="h-10 w-10 rounded-xl bg-brand-primary/15 animate-pulse" />
                  </div>
                  <div className="mt-5 h-2 w-full rounded bg-white/[0.06] animate-pulse" />
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
              <div className="min-h-[420px] rounded-2xl border border-white/5 bg-bg-card/70 p-6 shadow-xl">
                <div className="mb-6 flex items-center justify-between">
                  <div className="space-y-2">
                    <div className="h-4 w-44 rounded bg-white/[0.12] animate-pulse" />
                    <div className="h-2.5 w-64 rounded bg-white/[0.06] animate-pulse" />
                  </div>
                  <div className="h-8 w-24 rounded-lg bg-white/[0.08] animate-pulse" />
                </div>
                <div className="h-[300px] rounded-xl bg-white/[0.06] animate-pulse" />
              </div>

              <div className="space-y-4">
                <div className="h-48 rounded-2xl border border-white/5 bg-bg-card/70 p-5 shadow-xl">
                  <div className="h-3 w-32 rounded bg-white/[0.1] animate-pulse" />
                  <div className="mt-5 space-y-3">
                    <div className="h-4 w-full rounded bg-white/[0.08] animate-pulse" />
                    <div className="h-4 w-4/5 rounded bg-white/[0.08] animate-pulse" />
                    <div className="h-4 w-3/5 rounded bg-white/[0.08] animate-pulse" />
                  </div>
                </div>
                <div className="h-48 rounded-2xl border border-white/5 bg-bg-card/70 p-5 shadow-xl">
                  <div className="h-3 w-28 rounded bg-white/[0.1] animate-pulse" />
                  <div className="mt-5 grid grid-cols-2 gap-3">
                    <div className="h-24 rounded-xl bg-white/[0.06] animate-pulse" />
                    <div className="h-24 rounded-xl bg-white/[0.06] animate-pulse" />
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-center gap-3 text-[11px] font-medium text-neutral-500">
              <span className="h-2 w-2 rounded-full bg-brand-primary animate-pulse" />
              <span>
                {isCrmPortal
                  ? "Preparing CRM control desk"
                  : "Preparing your dashboard"}
              </span>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

/**
 * Traders only work on the account their order is currently sitting on. Earlier stages of
 * the same order — a passed Phase 1 once Phase 2 exists, a passed Phase 2 once the funded
 * account exists — are superseded and drop out of the dashboard's account list.
 */
function selectCurrentAccounts(accounts: Account[]): Account[] {
  const currentByOrder = new Map<string, Account>();
  const standalone = new Set<Account>();

  accounts.forEach((account) => {
    if (!account.orderId) {
      standalone.add(account);
      return;
    }
    const current = currentByOrder.get(account.orderId);
    if (!current) {
      currentByOrder.set(account.orderId, account);
      return;
    }
    const rankDelta = getPhaseRank(account.phase) - getPhaseRank(current.phase);
    const supersedes =
      rankDelta > 0 ||
      (rankDelta === 0 &&
        new Date(account.createdAt || 0).getTime() >
          new Date(current.createdAt || 0).getTime());
    if (supersedes) currentByOrder.set(account.orderId, account);
  });

  const keep = new Set<Account>([...currentByOrder.values(), ...standalone]);
  return accounts.filter((account) => keep.has(account));
}

function PendingDeliveryPanel({ account }: { account: Account }) {
  const isNextStageRequest = [
    "Phase 2 (Verification)",
    "Funded (Live)",
  ].includes(account.phase);

  return (
    <div className="max-w-2xl mx-auto my-12 p-7 sm:p-8 rounded-2xl bg-gradient-to-br from-neutral-950/90 via-neutral-950/75 to-brand-surface/20 border border-white/10 backdrop-blur-xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] space-y-6 animate-fade-in relative z-10 overflow-hidden">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-brand-primary/60 to-transparent" />
      <div className="flex flex-col sm:flex-row sm:items-start gap-4">
        <div className="mx-auto sm:mx-0 flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-brand-primary/10 border border-brand-primary/25 text-brand-primary shadow-[0_0_30px_rgba(0,220,130,0.12)]">
          <IconClock size={24} />
        </div>
        <div className="text-center sm:text-left space-y-2">
          <span className="inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-emerald-300">
            <IconCheck size={12} />
            Request submitted
          </span>
          <h2 className="text-2xl font-clash-display font-semibold text-white tracking-tight">
            {isNextStageRequest
              ? "Next Stage Account Delivery Pending"
              : "Account Delivery Pending"}
          </h2>
          <p className="text-neutral-400 text-sm leading-relaxed max-w-xl">
            Your {account.phase} request for account{" "}
            <strong className="text-white font-mono">#{account.id}</strong> has
            been saved and sent to the admin delivery desk. Credentials will
            appear here as soon as the account is issued.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {[
          { label: "Platform", value: account.platform },
          { label: "Account Size", value: `$${account.size.toLocaleString()}` },
          { label: "Status", value: "Pending delivery" },
        ].map((item) => (
          <div
            key={item.label}
            className="rounded-xl border border-white/5 bg-white/[0.03] p-4"
          >
            <span className="block text-[10px] uppercase tracking-wider text-neutral-500 font-mono">
              {item.label}
            </span>
            <span className="mt-1 block text-sm font-semibold text-white">
              {item.value}
            </span>
          </div>
        ))}
      </div>

      <div className="rounded-2xl border border-white/5 bg-neutral-950/60 p-5">
        <div className="mb-4 flex items-center gap-2 text-xs font-semibold text-white">
          <IconServer size={15} className="text-brand-primary" />
          Delivery queue
        </div>
        <div className="grid gap-3 text-xs text-neutral-400">
          {[
            "Request saved in your account record",
            "Admin team assigns the trading server credentials",
            "Risk limits and account phase are verified",
            "Credentials unlock automatically after delivery",
          ].map((step, index) => (
            <div key={step} className="flex items-center gap-3">
              <span
                className={`flex h-6 w-6 items-center justify-center rounded-full border text-[10px] font-bold ${
                  index === 0
                    ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-300"
                    : "border-white/10 bg-white/[0.03] text-neutral-500"
                }`}
              >
                {index === 0 ? <IconCheck size={12} /> : index + 1}
              </span>
              <span>{step}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/** How stale the dashboard may be before refocusing the window reloads it. */
const REFRESH_ON_FOCUS_MS = 60_000;

export default function DashboardContainer({
  initialTab = "overview",
  isCrmPortal = false,
}: {
  initialTab?: string;
  isCrmPortal?: boolean;
}) {
  const params = useParams();
  const locale = params?.locale || "en";

  // Turns off every animation/transition/backdrop blur (see globals.css).
  useEffect(() => {
    const root = document.documentElement;
    root.classList.add("dashboard-static");
    return () => root.classList.remove("dashboard-static");
  }, []);

  // Each tab has its own URL: /dashboard/<tab> (or /crm-portal/<tab>), served
  // by the [[...tab]] catch-all route. Switching tabs uses history.pushState,
  // which Next keeps in sync with usePathname — so the container never
  // remounts, the loaded data stays, and back/forward/refresh all work.
  const pathname = usePathname() || "";
  const routeSegment = isCrmPortal ? "crm-portal" : "dashboard";
  const splitDashboardPath = useCallback(
    (path: string) => {
      const parts = path.split("/");
      const index = parts.indexOf(routeSegment);
      if (index === -1) return { base: path.replace(/\/$/, ""), tab: "" };
      return {
        base: parts.slice(0, index + 1).join("/"),
        tab: decodeURIComponent(parts[index + 1] || ""),
      };
    },
    [routeSegment],
  );
  const activeTab = splitDashboardPath(pathname).tab || initialTab;
  const setActiveTab = useCallback(
    (tab: string) => {
      const { base } = splitDashboardPath(window.location.pathname);
      const target = tab === initialTab ? base : `${base}/${tab}`;
      if (window.location.pathname !== target) {
        window.history.pushState(null, "", target);
      }
    },
    [splitDashboardPath, initialTab],
  );
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [activeAccountId, setActiveAccountId] = useState<string>("");
  const [graphAccountId, setGraphAccountId] = useState<string | null>(null);
  const [trades, setTrades] = useState<Record<string, Trade[]>>(initialTrades);
  const [payouts, setPayouts] = useState<Payout[]>([]);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [kycStatus, setKycStatus] = useState<
    "Unsubmitted" | "Pending" | "Verified" | "Rejected"
  >("Unsubmitted");
  const [kycData, setKycData] = useState<any>(null);
  const [certificates, setCertificates] = useState<any[]>([]);

  // Empty until /api/auth/me resolves — the whole dashboard is behind the
  // `authLoading` skeleton until then, so no placeholder identity can leak.
  const [profile, setProfile] = useState({
    fullName: "",
    email: "",
    twoFactorEnabled: true,
    marketingEmails: false,
    securityAlerts: true,
    referralCode: "ALEX888",
    referralsCount: 4,
    referralsEarnings: 250,
  });

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userRole, setUserRole] = useState("trader");
  const [userId, setUserId] = useState("");
  const [authLoading, setAuthLoading] = useState(true);

  const loadDashboardData = async (preferredAccountId?: string) => {
    try {
      const resMe = await fetch("/api/auth/me");
      if (!resMe.ok) {
        if (isCrmPortal) {
          window.location.href = `/${locale}/crm-portal/signin`;
        } else {
          window.location.href = "/auth/signin";
        }
        return;
      }
      const dataMe = await resMe.json();
      const userObj = dataMe.user;
      if (!userObj) throw new Error("Authentication user object empty");

      if (
        isCrmPortal &&
        userObj.role !== "admin" &&
        userObj.role !== "support"
      ) {
        window.location.href = `/${locale}/crm-portal/signin?error=unauthorized`;
        return;
      }

      if (!isCrmPortal && userObj.role === "collaborator") {
        window.location.href = `/${locale}/collaborator`;
        return;
      }

      setUserRole(userObj.role);
      setUserId(userObj.id);

      // Everything below depends only on the session, not on each other, so
      // fire all six requests now and await them where they are needed. They
      // used to run as a strict `await` chain - six sequential round trips
      // where one would do - which was most of the dashboard's load time.
      // Each resolves to null rather than rejecting, so a single failing
      // endpoint cannot take the whole dashboard down with an unhandled
      // rejection; the blocks below already tolerate missing data.
      const requestJson = (url: string) =>
        fetch(url)
          .then((r) => r.json())
          .catch(() => null);

      const affiliateRequest = requestJson("/api/affiliate");
      const certificatesRequest = requestJson("/api/certificates");
      const accountsRequest = requestJson("/api/accounts");
      const kycRequest = requestJson("/api/kyc");
      const payoutsRequest = requestJson("/api/payouts");
      const notificationsRequest = requestJson("/api/notifications");

      let affiliateCode = "ALEX888";
      let referralsCount = 0;
      let referralsEarnings = 0;
      try {
        const dataAff = await affiliateRequest;
        if (dataAff?.success && dataAff.affiliate) {
          affiliateCode = dataAff.affiliate.referralCode;
          referralsCount = dataAff.metrics?.totalReferrals || 0;
          referralsEarnings = dataAff.metrics?.totalEarned || 0;
        }
      } catch (affErr) {
        console.error("Error fetching affiliate details:", affErr);
      }

      setProfile({
        fullName: userObj.name,
        email: userObj.email,
        twoFactorEnabled: true,
        marketingEmails: false,
        securityAlerts: true,
        referralCode: affiliateCode,
        referralsCount: referralsCount,
        referralsEarnings: referralsEarnings,
      });

      // Fetch certificates
      try {
        const dataCerts = await certificatesRequest;
        if (dataCerts?.success) {
          setCertificates(dataCerts.certificates || []);
        }
      } catch (certErr) {
        console.error("Error loading certificates:", certErr);
      }

      // Fetch trading accounts
      try {
        const dataAccs = await accountsRequest;
        if (dataAccs?.success) {
          const list = (dataAccs.accounts || []).map((acc: any) => {
            const size = acc.size || acc.balance || 100000;
            const target =
              acc.target !== undefined
                ? acc.target
                : acc.profitTarget !== undefined
                  ? acc.profitTarget
                  : size * 0.1;
            const type =
              acc.accountType ||
              acc.type ||
              (size >= 100000 ? "Two Step" : "One Step");
            const phase = acc.phase || "Not assigned";
            const ruleVersion = acc.legacyRules ? "legacy" : "current";
            const fallbackRule = getChallengeRule(type, ruleVersion);
            const fallbackLimits = getDrawdownLimits(fallbackRule, phase, acc.status, ruleVersion);

            return enrichAccountWithStatistics({
              ...acc,
              size,
              target,
              type,
              phase,
              legacyRules: Boolean(acc.legacyRules),
              dailyLossLimit: size * (fallbackLimits.dailyDrawdownPercent / 100),
              maxDrawdown: size * (fallbackLimits.overallDrawdownPercent / 100),
              currentDailyLoss: acc.currentDailyLoss || 0,
              currentMaxDrawdown: acc.currentMaxDrawdown || 0,
              minTradingDays:
                acc.minTradingDays !== undefined ? acc.minTradingDays : 3,
              currentTradingDays: acc.currentTradingDays || 0,
              consistencyRule:
                acc.consistencyRule !== undefined ? acc.consistencyRule : true,
              newsRule: acc.newsRule !== undefined ? acc.newsRule : true,
              weekendHoldingAddon: Boolean(acc.weekendHoldingAddon),
              ruleChecks: acc.ruleChecks || [],
              ruleAlerts: acc.ruleAlerts || [],
              newsViolations: acc.newsViolations || [],
              newsProfitToDeduct: Number(acc.newsProfitToDeduct) || 0,
            });
          });
          setAccounts(list);
          const nextTrades: Record<string, Trade[]> = { ...initialTrades };
          list.forEach((account: Account) => {
            const statisticsTrades = mapStatisticsTrades(
              account.statisticsPayload,
            );
            if (statisticsTrades.length > 0)
              nextTrades[account.id] = statisticsTrades;
          });
          setTrades(nextTrades);
          const selectable = selectCurrentAccounts(list);
          if (selectable.length > 0) {
            setActiveAccountId((prev) => {
              if (
                preferredAccountId &&
                selectable.find((a) => a.id === preferredAccountId)
              ) {
                return preferredAccountId;
              }
              const activeExists = selectable.find((a) => a.id === prev);
              return activeExists ? prev : selectable[0].id;
            });
          }
        }
      } catch (accErr) {
        console.error("Error loading accounts:", accErr);
      }

      // Fetch KYC
      try {
        const dataKyc = await kycRequest;
        if (dataKyc?.success && dataKyc.kyc) {
          const statusMap: Record<string, string> = {
            pending: "Pending",
            approved: "Verified",
            rejected: "Rejected",
            needs_review: "Pending",
          };
          setKycStatus((statusMap[dataKyc.kyc.status] || "Unsubmitted") as any);
          setKycData(dataKyc.kyc);
        } else {
          setKycStatus("Unsubmitted");
          setKycData(null);
        }
      } catch (kycErr) {
        console.error("Error loading KYC:", kycErr);
      }

      // Fetch payouts
      try {
        const dataPayouts = await payoutsRequest;
        if (dataPayouts?.success) {
          const list = (dataPayouts.payouts || []).map((p: any) => ({
            id: p.id,
            accountId: p.accountId,
            date: p.createdAt
              ? p.createdAt.substring(0, 10)
              : new Date().toISOString().substring(0, 10),
            amount: p.amount,
            status:
              p.status === "paid"
                ? "Paid"
                : p.status === "approved"
                  ? "Approved"
                  : p.status === "rejected"
                    ? "Rejected"
                    : "Pending",
            method: p.paymentMethod,
            details: p.paymentDetails,
          }));
          setPayouts(list);
        }
      } catch (payErr) {
        console.error("Error loading payouts:", payErr);
      }

      // Fetch notifications
      try {
        const dataNotifs = await notificationsRequest;
        if (dataNotifs?.success) {
          const list = (dataNotifs.notifications || []).map((n: any) => ({
            id: n.id,
            title: n.title,
            message: n.message,
            type: n.type,
            date: n.sentAt ? n.sentAt.replace("T", " ").substring(0, 16) : "",
            read: n.read,
          }));
          setNotifications(list);
        }
      } catch (notifErr) {
        console.error("Error loading notifications:", notifErr);
      }
    } catch (err) {
      console.error("Error loading dashboard data:", err);
    } finally {
      setAuthLoading(false);
    }
  };

  useEffect(() => {
    // Legacy ?tab=<id> links (e.g. the pricing CTA) become /dashboard/<id>.
    // Other params such as ?coupon= are kept for the tab that reads them.
    // Mount-only: the URL carries the query exactly once.
    const searchParams = new URLSearchParams(window.location.search);
    const tabQuery = searchParams.get("tab");
    if (!tabQuery) return;
    searchParams.delete("tab");
    const rest = searchParams.toString();
    const { base } = splitDashboardPath(window.location.pathname);
    window.history.replaceState(
      null,
      "",
      `${base}/${tabQuery}${rest ? `?${rest}` : ""}`,
    );
  }, [splitDashboardPath]);

  // Every tab reads from the same loaded datasets, so they load once per
  // mount. This used to depend on `activeTab`, which re-fired all seven
  // requests on every tab switch - so opening Buy Challenge raced a second
  // full dashboard reload against the tab's own fetches. Mutations that
  // change server state still call `loadDashboardData()` directly.
  useEffect(() => {
    loadDashboardData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Tab switching no longer refetches, so a trader waiting on something the
  // back office changes - a delivered account, an approved payout - needs
  // another way to see it without a hard reload. Coming back to the window
  // refreshes, throttled so a quick alt-tab does not re-fire the six reads.
  useEffect(() => {
    let lastRefresh = Date.now();
    const onVisible = () => {
      if (document.visibilityState !== "visible") return;
      if (Date.now() - lastRefresh < REFRESH_ON_FOCUS_MS) return;
      lastRefresh = Date.now();
      loadDashboardData();
    };
    document.addEventListener("visibilitychange", onVisible);
    return () => document.removeEventListener("visibilitychange", onVisible);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);


  const visibleAccounts = useMemo(() => selectCurrentAccounts(accounts), [accounts]);

  // A trader who has just signed up has no accounts, so the only place left to
  // go is Buy Challenge: warm its catalog as soon as we know the list is empty
  // so the account sizes are in hand before the tab mounts.
  useEffect(() => {
    if (authLoading || visibleAccounts.length > 0) return;
    prefetchBuyCatalog();
  }, [authLoading, visibleAccounts.length]);

  // ...and then send them there, rather than leaving them on an Overview that
  // can only show an empty-state card. Deliberately narrow:
  //  - once per mount, so navigating back to Overview on purpose is not undone
  //    on the next render - that would lock the trader out of the tab;
  //  - only from the tab they landed on, so a deep link like /dashboard/payouts
  //    still opens where it was asked to;
  //  - traders only, since an admin or support account legitimately has no
  //    trading accounts of its own.
  // KYC stays reachable from the sidebar, and the Buy tab shows the KYC status
  // in its order summary, so the empty-state card's second button is not lost.
  const autoOpenedBuyTab = useRef(false);
  useEffect(() => {
    if (isCrmPortal || authLoading || autoOpenedBuyTab.current) return;
    if (userRole !== "trader" && userRole !== "affiliate") return;
    if (visibleAccounts.length > 0 || activeTab !== initialTab) return;
    autoOpenedBuyTab.current = true;
    setActiveTab("buy");
  }, [
    isCrmPortal,
    authLoading,
    userRole,
    visibleAccounts.length,
    activeTab,
    initialTab,
    setActiveTab,
  ]);

  // Active account utility
  const activeAccount =
    visibleAccounts.find((acc) => acc.id === activeAccountId) ||
    visibleAccounts[0];
  const graphAccount = graphAccountId
    ? accounts.find((acc) => acc.id === graphAccountId)
    : null;

  const saveUserNotification = async (
    title: string,
    message: string,
    type: "warning" | "success" | "info" | "error",
  ) => {
    try {
      const res = await fetch("/api/notifications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          targetUserId: userId,
          title,
          message,
          type,
          channel: "in_app",
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to save notification.");
      }
      await loadDashboardData();
    } catch (err) {
      console.error("Error saving notification:", err);
    }
  };

  // Switch active account handler
  const handleAccountSwitch = (accountId: string) => {
    setActiveAccountId(accountId);
  };


  // Requesting payout handler via API
  const handleRequestPayout = async (
    amount: number,
    method: string,
    details: string,
  ) => {
    try {
      const res = await fetch("/api/payouts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          accountId: activeAccountId,
          amount,
          paymentMethod: method,
          paymentDetails: details,
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        await saveUserNotification(
          "Payout Requested",
          data.withdrawal?.wasAdjusted
            ? `Your request was adjusted to $${data.withdrawal.adjustedAmount.toLocaleString()} under the 6% payout-period cap and is pending review.`
            : `Payout of $${data.payout.amount.toLocaleString()} is now pending review.`,
          "success",
        );
        await loadDashboardData();
      } else {
        alert(data.error || "Failed to submit payout request.");
      }
    } catch (err) {
      console.error("Error requesting payout:", err);
      alert("Failed to submit payout request.");
    }
  };

  // Update Profile Info via API
  const handleUpdateProfile = async (fields: Partial<typeof profile>) => {
    try {
      const res = await fetch("/api/auth/me", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: fields.fullName,
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        await saveUserNotification(
          "Profile Settings Saved",
          "Your information has been successfully updated.",
          "success",
        );
        await loadDashboardData();
      } else {
        alert(data.error || "Failed to update profile settings.");
      }
    } catch (err) {
      console.error("Error updating profile:", err);
      alert("Failed to update profile settings.");
    }
  };

  // Mark all notifications as read via API
  const handleMarkNotificationsRead = async () => {
    try {
      const unread = notifications.filter((n) => !n.read);
      await Promise.all(
        unread.map((n) =>
          fetch("/api/notifications", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id: n.id, read: true }),
          }),
        ),
      );
      await loadDashboardData();
    } catch (err) {
      console.error("Error marking notifications read:", err);
    }
  };

  // Render current tab component
  const renderTabContent = () => {
    // Guard for tabs that require an active trading account
    const requiresAccount = [
      "overview",
      "performance",
      "history",
      "rules",
      "payouts",
    ].includes(activeTab);
    if (requiresAccount && !activeAccount) {
      return (
        <div className="max-w-xl mx-auto my-12 p-8 rounded-2xl bg-gradient-to-br from-neutral-950/80 to-neutral-900/60 border border-white/10 backdrop-blur-xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] text-center space-y-6 animate-fade-in relative z-10">
          <div className="mx-auto w-16 h-16 rounded-full bg-brand-primary/10 flex items-center justify-center border border-brand-primary/20 text-brand-primary">
            <IconBriefcase size={28} strokeWidth={1.7} />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-clash-display font-semibold text-white tracking-tight">
              No Active Accounts
            </h2>
            <p className="text-neutral-400 text-sm leading-relaxed max-w-sm mx-auto">
              You don't have any active trading accounts yet. Complete your
              identity verification (KYC), then purchase a challenge plan to get
              started.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <button
              onClick={() => setActiveTab("kyc")}
              className="w-full sm:w-auto px-5 py-2.5 bg-neutral-800 hover:bg-neutral-700 text-white border border-neutral-750 text-xs font-semibold rounded-lg transition-all cursor-pointer"
            >
              Complete KYC Verification
            </button>
            <button
              onClick={() => setActiveTab("buy")}
              onMouseEnter={prefetchBuyCatalog}
              onFocus={prefetchBuyCatalog}
              className="w-full sm:w-auto px-5 py-2.5 bg-white text-black hover:bg-neutral-200 text-xs font-semibold rounded-lg shadow-md transition-all cursor-pointer"
            >
              Buy a Challenge
            </button>
          </div>
        </div>
      );
    }

    // Intercept when credentials delivery is pending
    if (
      requiresAccount &&
      activeAccount &&
      activeAccount.deliveryStatus === "pending"
    ) {
      return <PendingDeliveryPanel account={activeAccount} />;
    }

    switch (activeTab) {
      case "overview":
        return (
          <OverviewTab
            account={activeAccount}
            relatedAccounts={accounts}
            recentTrades={trades[activeAccount.id] || []}
            setActiveTab={setActiveTab}
            onUpgradeRequested={loadDashboardData}
            onStatsRefreshDue={() => loadDashboardData(activeAccount.id)}
            userName={profile.fullName}
          />
        );
      case "accounts":
        return (
          <AccountsTab
            accounts={visibleAccounts}
            activeAccountId={activeAccountId}
            onSelectAccount={handleAccountSwitch}
            onNavigateBuy={() => setActiveTab("buy")}
            onOpenGraph={setGraphAccountId}
            onAccountsChanged={loadDashboardData}
          />
        );
      case "offers":
        return (
          <OffersTab
            onSelectAccount={(accountId) => {
              handleAccountSwitch(accountId);
              setActiveTab("accounts");
            }}
            onNavigateBuy={() => setActiveTab("buy")}
          />
        );
      case "performance":
        return (
          <PerformanceTab
            account={activeAccount}
            trades={trades[activeAccount.id] || []}
          />
        );
      case "history":
        return (
          <HistoryTab
            trades={trades[activeAccount.id] || []}
            accountId={activeAccount.id}
          />
        );
      case "rules":
        return <RulesTab account={activeAccount} />;
      case "payouts":
        return (
          <PayoutsTab
            account={activeAccount}
            payouts={payouts}
            onRequestPayout={handleRequestPayout}
            kycStatus={kycStatus}
          />
        );
      case "referrals":
        return <ReferralsTab />;
      case "buy":
        return (
          <BuyChallengeTab
            onPurchaseComplete={async () => {
              await loadDashboardData();
              setActiveTab("accounts");
            }}
            kycStatus={kycStatus}
          />
        );

      case "kyc":
        return (
          <KycTab
            status={kycStatus}
            kycData={kycData}
            accounts={accounts}
            onRefreshKyc={loadDashboardData}
          />
        );
      case "achievements":
        return (
          <AchievementsTab
            accounts={accounts}
            certificates={certificates}
            userName={profile.fullName}
          />
        );
      case "news":
        return <NewsTab />;
      case "notifications":
        return (
          <NotificationsTab
            notifications={notifications}
            onMarkAllRead={handleMarkNotificationsRead}
          />
        );
      case "settings":
        return (
          <SettingsTab
            profile={profile}
            certificates={certificates}
            notifications={notifications}
            onUpdateProfile={handleUpdateProfile}
          />
        );
      case "admin":
      case "admin-telemetry":
      case "admin-users":
      case "admin-kyc":
      case "admin-accounts":
      case "admin-orders":
      case "admin-plans":
      case "admin-pricing":
      case "admin-coupons":
      case "admin-offers":
      case "admin-payouts":
      case "admin-collaborators":
      case "admin-affiliates":
      case "admin-promotions":
      case "admin-notifications":
      case "admin-pixel-events":
      case "admin-trustpilot":
      case "admin-news-calendar":
      case "admin-audit": {
        if (activeTab === "admin-news-calendar") return <NewsCalendarTab />;
        if (activeTab === "admin-collaborators") return <CollaboratorSalesTab />;
        if (activeTab === "admin-pixel-events") return <PixelEventsTab />;
        if (activeTab === "admin-trustpilot") return <TrustpilotInvitesTab />;
        const subTab = activeTab.replace("admin-", "") || "telemetry";
        return (
          <AdminCrmTab
            forcedSubTab={subTab === "admin" ? "telemetry" : subTab}
            isCrmPortal={isCrmPortal}
            onNavigate={setActiveTab}
          />
        );
      }
      default:
        return <div className="text-text-primary p-6">Tab not found.</div>;
    }
  };

  if (authLoading) {
    return <DashboardLoadingSkeleton isCrmPortal={isCrmPortal} />;
  }

  return (
    <div className={`dashboard-clash-font dash-shell flex h-screen w-screen overflow-hidden text-text-primary select-none antialiased relative crm-portal-readable ${isCrmPortal ? "" : "trader-dashboard dashboard-scale"}`}>
      {/* Sidebar Navigation */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        notifications={notifications}
        mobileOpen={mobileMenuOpen}
        setMobileOpen={setMobileMenuOpen}
        userRole={userRole}
        isCrmPortal={isCrmPortal}
        kycPending={kycStatus !== "Verified"}
      />

      <div className="flex-1 flex flex-col h-full overflow-hidden min-w-0 relative z-10">
        {/* Trader Header Bar */}
        {!isCrmPortal && (
          <Header
          accounts={visibleAccounts}
          activeAccountId={activeAccountId}
          onSwitchAccount={handleAccountSwitch}
          notifications={notifications}
          onMarkAllRead={handleMarkNotificationsRead}
          profileName={profile.fullName}
          profileEmail={profile.email}
          onNavigateSettings={() => setActiveTab("settings")}
          onNavigateNotifications={() => setActiveTab("notifications")}
          onNavigateBuyChallenge={() => setActiveTab("buy")}
          mobileMenuOpen={mobileMenuOpen}
          setMobileMenuOpen={setMobileMenuOpen}
          title={TAB_TITLES[activeTab]}
        />
        )}

        {/* CRM portal has no trader header, so phones need their own way to open the menu. */}
        {isCrmPortal && (
          <div className="flex h-14 flex-shrink-0 items-center gap-3 border-b border-border-secondary/50 bg-bg-dark/80 px-3 md:hidden">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              aria-label="Open menu"
              className="rounded-lg border border-border-secondary/50 p-2 text-text-secondary transition-all hover:bg-surface-hover/30 hover:text-white"
            >
              <MenuIcon size={18} />
            </button>
            <Logo size="sm" asLink className="flex items-center" />
            <span className="ml-auto rounded-full border border-brand-primary/25 bg-brand-primary/10 px-2.5 py-1 text-[9px] font-bold uppercase tracking-wider text-brand-primary">
              CRM
            </span>
          </div>
        )}

        {/* Scrollable Tab Viewport */}
        <main className="flex-1 overflow-y-auto p-3 pb-6 md:p-3 md:pb-6">
          {renderTabContent()}
        </main>
      </div>

      {graphAccount && (
        <AccountGraphModal
          account={graphAccount}
          trades={trades[graphAccount.id] || []}
          onClose={() => setGraphAccountId(null)}
          hideDiagnostics
        />
      )}
    </div>
  );
}

/** Page names shown in the header, keyed by sidebar tab id. */
const TAB_TITLES: Record<string, string> = {
  overview: "Overview",
  accounts: "My Accounts",
  buy: "Buy Challenge",
  offers: "Offers",
  performance: "Analytics",
  history: "Trade Log",
  rules: "Rule Book",
  achievements: "Achievements",
  kyc: "KYC",
  payouts: "Withdraw",
  referrals: "Referrals",
  settings: "Settings",
  notifications: "Alerts",
  news: "News",
};

// Inline fallback Notifications Tab so we don't have to create a trivial file.
// It matches the exact visual aesthetic.
function NotificationsTab({
  notifications,
  onMarkAllRead,
}: {
  notifications: NotificationItem[];
  onMarkAllRead: () => void;
}) {
  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border-secondary pb-4">
        <div>
          <h1 className="text-3xl font-clash-display font-semibold tracking-tight text-white">
            Notifications
          </h1>
          <p className="text-text-secondary text-sm">
            Stay updated with rule compliance, withdrawals, and account status
            updates.
          </p>
        </div>
        <button
          onClick={onMarkAllRead}
          className="px-4 py-2 text-xs font-semibold rounded bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 text-white transition-colors cursor-pointer self-start"
        >
          Mark all as read
        </button>
      </div>

      <div className="space-y-4">
        {notifications.length === 0 ? (
          <div className="text-center py-12 border border-dashed border-border-secondary rounded-lg text-text-secondary">
            No notifications available.
          </div>
        ) : (
          notifications.map((notif) => (
            <div
              key={notif.id}
              className={`p-4 rounded-lg border transition-all ${
                notif.read
                  ? "bg-neutral-950/20 border-neutral-800/60"
                  : "bg-neutral-950/50 border-neutral-700/80 shadow-md"
              } flex gap-4`}
            >
              <div className="mt-1 flex-shrink-0">
                {notif.type === "success" && (
                  <span className="flex h-3 w-3 relative">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                  </span>
                )}
                {notif.type === "warning" && (
                  <span className="flex h-3 w-3 relative">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-500"></span>
                  </span>
                )}
                {notif.type === "error" && (
                  <span className="flex h-3 w-3 relative">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-rose-500"></span>
                  </span>
                )}
                {notif.type === "info" && (
                  <span className="flex h-3 w-3 relative">
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-blue-500"></span>
                  </span>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-4">
                  <h3 className="font-semibold text-white text-sm">
                    {notif.title}
                  </h3>
                  <span className="text-[10px] text-text-secondary">
                    {notif.date}
                  </span>
                </div>
                <p className="text-text-secondary text-sm mt-1">
                  {notif.message}
                </p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
