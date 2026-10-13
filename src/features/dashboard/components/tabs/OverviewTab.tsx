"use client";

import React, { useState } from "react";
import {
  IconArrowUpRight,
  IconArrowDownRight,
  IconTarget,
  IconAlertCircle,
  IconCheck,
  IconServer,
  IconClock,
} from "../Icons";
import {
  AreaChart,
  Area,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import { Account, Trade } from "../../index";
import { getChallengeRule } from "@/lib/rulebook";
import { PHASE_TWO, getNextStagePhase } from "@/lib/challengeStages";
import { buildPerformanceSeries } from "@/lib/tradingStatistics";
import StatsSyncTimer from "../StatsSyncTimer";
import UpcomingNewsWidget from "../UpcomingNewsWidget";
import {
  MINIMUM_HOLDING_RELAXATIONS,
  MINIMUM_HOLDING_SECONDS,
  PROFITABLE_DAY_THRESHOLD_PERCENT,
  getAllMinimumHoldingViolationIds,
  getOpenStatisticsTrades,
} from "@/lib/accountTradingRules";
import {
  MAX_CONCURRENT_LAYERS,
  TRADE_LAYERING_WINDOW_MS,
  detectStatisticsTradeLayering,
  getMaxConcurrentLayers,
  getStatisticsTrades,
} from "@/lib/tradeLayering";
import { NEWS_RESTRICTED_MINUTES_EACH_SIDE, SINGLE_TRADE_LOSS_LIMIT_PERCENT } from "@/lib/rulebook";
import {
  IconActivity,
  IconCircleCheck,
  IconPercentage,
  IconStack2,
  IconTrendingUp,
  IconWallet,
} from "@tabler/icons-react";
import { Chip, Panel, ProgressBar, SectionLabel, Stat, formatMoney } from "../ui";

interface OverviewTabProps {
  account: Account;
  relatedAccounts?: Account[];
  recentTrades: Trade[];
  setActiveTab: (tab: string) => void;
  onUpgradeRequested: (accountId?: string) => void;
  /** Signed-in trader's full name; the greeting uses the first word of it. */
  userName?: string;
  /** Called when the 30-minute statistics sync window has elapsed. */
  onStatsRefreshDue?: () => void | Promise<void>;
}

export default function OverviewTab({
  account,
  relatedAccounts = [],
  recentTrades,
  setActiveTab,
  onUpgradeRequested,
  userName,
  onStatsRefreshDue,
}: OverviewTabProps) {
  // Greet by first name, and drop the name entirely rather than greeting an
  // empty string if the profile has no name on it.
  const firstName = userName?.trim().split(/\s+/)[0] ?? "";
  const [requestingUpgrade, setRequestingUpgrade] = useState(false);
  const [activeChartMetric, setActiveChartMetric] = useState<
    "Equity" | "Profit" | "Drawdown" | "Balance"
  >("Equity");
  const statisticsPayload = (account as any).statisticsPayload;
  const accountStats = statisticsPayload?.statistics?.account_stats || {};
  const advancedStats =
    statisticsPayload?.statistics?.advanced_statistics || {};
  const dailyPerformance =
    statisticsPayload?.statistics?.equity_curve?.daily_performance;

  const handleRequestNextPhase = async () => {
    try {
      setRequestingUpgrade(true);
      const res = await fetch("/api/accounts/request-next", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ accountId: account.id }),
      });
      const data = await res.json();
      if (res.ok) {
        onUpgradeRequested(data.accountId);
      } else {
        alert(data.error || "Failed to request next phase.");
      }
    } catch (err) {
      alert("Network error requesting next phase.");
    } finally {
      setRequestingUpgrade(false);
    }
  };

  // Profit Target progress calculations
  const targetProgressPl = Number(accountStats.profit ?? account.totalPl);
  const targetPercent =
    account.target > 0
      ? Math.min(100, Math.max(0, (targetProgressPl / account.target) * 100))
      : 100;

  // Daily Loss calculation
  const dailyLossPercent = account.dailyLossLimit > 0
    ? Math.min(100, Math.max(0, (account.currentDailyLoss / account.dailyLossLimit) * 100))
    : 0;

  // Max Drawdown calculation
  const maxDrawdownPercent = account.maxDrawdown > 0
    ? Math.min(100, Math.max(0, (account.currentMaxDrawdown / account.maxDrawdown) * 100))
    : 0;

  // Win rate and metrics for Overview
  const totalTradesCount = Number(
    advancedStats.total_trades ?? recentTrades.length,
  );
  const winningTrades = recentTrades.filter((t) => t.pl > 0);
  const winRate =
    advancedStats.win_rate !== undefined
      ? Number(advancedStats.win_rate)
      : totalTradesCount > 0
        ? (winningTrades.length / totalTradesCount) * 100
        : 0;

  const totalWinAmount = winningTrades.reduce((acc, t) => acc + t.pl, 0);
  const totalLossAmount = Math.abs(
    recentTrades.filter((t) => t.pl < 0).reduce((acc, t) => acc + t.pl, 0),
  );
  const profitFactor =
    advancedStats.profit_factor !== undefined
      ? Number(advancedStats.profit_factor)
      : totalLossAmount > 0
        ? totalWinAmount / totalLossAmount
        : totalWinAmount > 0
          ? 9.9
          : 0;

  // Normalize provider statistics once so every graph uses daily rather than cumulative values correctly.
  const providerSeries = buildPerformanceSeries({
    payload: statisticsPayload,
    initialBalance: account.size,
    currentBalance: account.balance,
    currentEquity: account.equity,
    currentTotalProfit: account.totalPl,
  });

  const generateChartData = () => {
    if (providerSeries.length > 0) {
      return providerSeries.map((point) => ({
        name: point.name,
        Equity: point.equity,
        Balance: point.balance,
        Profit: point.cumulativeProfit,
        Drawdown: point.drawdown,
      }));
    }

    let runningBalance = account.size;
    let cumulativeProfit = 0;
    let peakBalance = account.size;
    const points = [
      {
        name: "Start",
        Equity: runningBalance,
        Balance: runningBalance,
        Profit: 0,
        Drawdown: 0,
      },
    ];

    const chronTrades = [...recentTrades].sort((left, right) => {
      const leftTime = new Date(left.date).getTime();
      const rightTime = new Date(right.date).getTime();
      if (Number.isNaN(leftTime) || Number.isNaN(rightTime)) return 0;
      return leftTime - rightTime;
    });
    chronTrades.forEach((trade, index) => {
      runningBalance += trade.pl;
      cumulativeProfit += trade.pl;
      peakBalance = Math.max(peakBalance, runningBalance);
      points.push({
        name: `Trade ${index + 1}`,
        Equity: Number(runningBalance.toFixed(2)),
        Balance: Number(runningBalance.toFixed(2)),
        Profit: Number(cumulativeProfit.toFixed(2)),
        Drawdown: Number(Math.min(0, runningBalance - peakBalance).toFixed(2)),
      });
    });

    const currentPoint = {
      name: "Current",
      Equity: account.equity,
      Balance: account.balance,
      Profit: account.totalPl,
      Drawdown: -Math.abs(account.currentMaxDrawdown),
    };
    if (points.length === 1) points.push(currentPoint);
    else points[points.length - 1] = currentPoint;
    return points;
  };

  const chartData = generateChartData();
  const chartMetricConfig = {
    Equity: {
      label: "Equity",
      title: "Equity Curve",
      description: "Live equity progression for this account.",
      stroke: "#ffffff",
      stop: "#ffffff",
    },
    Profit: {
      label: "Profit",
      title: "Profit Curve",
      description: "Cumulative profit and loss across recent account activity.",
      stroke: "#34d399",
      stop: "#34d399",
    },
    Drawdown: {
      label: "Drawdown",
      title: "Drawdown Curve",
      description:
        "Peak-to-trough drawdown shown as negative account movement.",
      stroke: "#fb7185",
      stop: "#fb7185",
    },
    Balance: {
      label: "Balance",
      title: "Balance Curve",
      description: "Closed balance progression excluding floating movement.",
      stroke: "#60a5fa",
      stop: "#60a5fa",
    },
  } as const;
  const activeChartConfig = chartMetricConfig[activeChartMetric];
  const activeRuleAlerts = account.ruleAlerts || [];
  const breachAlerts = activeRuleAlerts.filter(
    (alert) => alert.type === "error",
  );
  const warningAlerts = activeRuleAlerts.filter(
    (alert) => alert.type === "warning",
  );
  const isBreached = account.status === "Failed" || breachAlerts.length > 0;
  // A failed account already gets the full "You Are Breached" banner below, so the
  // generic alert stack must not print the same error alerts a second time.
  const showsBreachBanner = account.status === "Failed";
  const inlineRuleAlerts = showsBreachBanner
    ? activeRuleAlerts.filter((alert) => alert.type !== "error")
    : activeRuleAlerts;
  const maxDrawdownBoundary = account.size - account.maxDrawdown;
  const challengeRule = getChallengeRule(account.type, account.legacyRules ? "legacy" : "current");
  const backendPhase = (account.phase || "").trim();
  const currentPhaseName = backendPhase || account.status;
  // One Step and Instant plans have no verification stage — Evaluation upgrades straight to Funded.
  const nextRequestPhase = getNextStagePhase(account.type, account.phase);
  const requestedNextAccount = nextRequestPhase
    ? relatedAccounts.find((relatedAccount) => {
        const belongsToSameOrder =
          account.orderId && relatedAccount.orderId
            ? relatedAccount.orderId === account.orderId
            : relatedAccount.id !== account.id &&
              relatedAccount.type === account.type &&
              relatedAccount.size === account.size;

        return (
          relatedAccount.id !== account.id &&
          belongsToSameOrder &&
          relatedAccount.phase === nextRequestPhase
        );
      })
    : undefined;
  const hasRequestedNextAccount = Boolean(requestedNextAccount);
  const nextRequestLabel =
    nextRequestPhase === PHASE_TWO ? "Phase 2 account" : "Funded account";
  const nextRequestPending =
    requestedNextAccount?.deliveryStatus === "pending" ||
    requestedNextAccount?.server === "Range4ex-PendingServer";

  const roadmapStages = (() => {
    if (challengeRule.key === "instant_funding") {
      return [
        {
          id: "funded",
          title: "Funded Live",
          detail: "Instant funded account",
          target: "No evaluation target",
          phaseMatch: ["Funded (Live)"],
        },
        {
          id: "payout",
          title: "First Payout",
          detail: `${challengeRule.minTradingDaysFundedFirstPayout} profitable funded days (0.5% each)`,
          target: `${challengeRule.profitSplitPercent}% split`,
          phaseMatch: [],
        },
      ];
    }

    if (challengeRule.key === "one_step_pro") {
      return [
        {
          id: "phase1",
          title: "Evaluation",
          detail: `${challengeRule.phase1TargetPercent}% profit target`,
          target: `${challengeRule.minTradingDaysEvaluation} profitable days (0.5% each)`,
          phaseMatch: ["Phase 1 (Evaluation)"],
        },
        {
          id: "funded",
          title: "Funded Live",
          detail: "Live funded account",
          target: `${challengeRule.profitSplitPercent}% split`,
          phaseMatch: ["Funded (Live)"],
        },
      ];
    }

    return [
      {
        id: "phase1",
        title: "Phase 1",
        detail: `${challengeRule.phase1TargetPercent}% profit target`,
        target: `${challengeRule.minTradingDaysEvaluation} profitable days (0.5% each)`,
        phaseMatch: ["Phase 1 (Evaluation)"],
      },
      {
        id: "phase2",
        title: "Phase 2",
        detail: `${challengeRule.phase2TargetPercent}% profit target`,
        target: `${challengeRule.minTradingDaysEvaluation} profitable days (0.5% each)`,
        phaseMatch: ["Phase 2 (Verification)"],
      },
      {
        id: "funded",
        title: "Funded Live",
        detail: "Live funded account",
        target: `${challengeRule.profitSplitPercent}% split`,
        phaseMatch: ["Funded (Live)"],
      },
    ];
  })();

  const currentRoadmapIndex = (() => {
    if (account.status === "Failed")
      return roadmapStages.findIndex((stage) =>
        stage.phaseMatch.includes(account.phase),
      );
    if (account.status === "Funded" || account.phase === "Funded (Live)") {
      return roadmapStages.findIndex((stage) => stage.id === "funded");
    }
    const matchedIndex = roadmapStages.findIndex((stage) =>
      stage.phaseMatch.includes(account.phase),
    );
    return matchedIndex >= 0 ? matchedIndex : 0;
  })();

  // Live-stage rules (Funded and Instant). Pass / breach status comes from the
  // backend's rule checks — it is the authority — while the numbers on each
  // card are read from the same statistics feed the backend evaluates.
  const isInstant = challengeRule.key === "instant_funding";
  const isLiveStage =
    isInstant || account.status === "Funded" || account.phase === "Funded (Live)";
  // Accounts pinned to the legacy rulebook only keep minimum holding time.
  const newRulesApply = !account.legacyRules;
  const ruleStatus = (id: string) =>
    account.ruleChecks?.find((rule) => rule.id === id)?.status ?? "pending";
  const closedStatTrades = getStatisticsTrades(statisticsPayload);
  const openStatTrades = getOpenStatisticsTrades(statisticsPayload);
  const hasTradeHistory = closedStatTrades.length + openStatTrades.length > 0;

  const layeringMinutes = Math.round(TRADE_LAYERING_WINDOW_MS / 60_000);
  const layeringViolationCount = detectStatisticsTradeLayering(statisticsPayload).length;
  const concurrentPeak = isInstant
    ? getMaxConcurrentLayers(closedStatTrades, openStatTrades).maxOverlap
    : 0;
  const layeringStatus =
    ruleStatus("trade-layering") === "failed" || (isInstant && ruleStatus("concurrent-layering") === "failed")
      ? "failed"
      : ruleStatus("trade-layering");

  const holdingMinutes = Math.round(MINIMUM_HOLDING_SECONDS / 60);
  const holdingViolationCount = getAllMinimumHoldingViolationIds(statisticsPayload).length;
  const holdingStatus = ruleStatus("minimum-holding-time");

  const singleTradeLossLimit = account.size * (SINGLE_TRADE_LOSS_LIMIT_PERCENT / 100);
  const worstTradeLoss = [...closedStatTrades, ...openStatTrades].reduce((worst, trade) => {
    const profit = Number(trade?.net_profit ?? trade?.profit ?? trade?.pnl);
    return Number.isFinite(profit) && profit < 0 ? Math.max(worst, -profit) : worst;
  }, 0);
  const singleTradeLossPercent =
    singleTradeLossLimit > 0 ? (worstTradeLoss / singleTradeLossLimit) * 100 : 0;

  const newsStatus = ruleStatus("news-trading");
  const newsFlaggedTrades = new Set((account.newsViolations || []).map((v) => v.ticket)).size;

  const money = (value: number) => formatMoney(value);
  const pctOfSize = (value: number) =>
    account.size > 0 ? `${+((value / account.size) * 100).toFixed(1)}%` : "—";
  const profitNow = targetProgressPl;
  const toGo = Math.max(0, account.target - profitNow);
  const dailyLossUsed = Math.abs(account.currentDailyLoss);
  const maxLossUsed = Math.abs(account.currentMaxDrawdown);
  const daysRequired = account.minTradingDays || 0;
  const daysDone = account.currentTradingDays || 0;
  const daysPercent = daysRequired > 0 ? (daysDone / daysRequired) * 100 : 100;
  const lossTone = (percent: number): "success" | "warning" | "danger" =>
    percent >= 100 ? "danger" : percent >= 70 ? "warning" : "success";
  const lossChip = (percent: number) => {
    const tone = lossTone(percent);
    return (
      <Chip tone={tone} icon={tone === "success" ? <IconCircleCheck size={15} /> : <IconAlertCircle size={15} />}>
        {tone === "danger" ? "Breached" : tone === "warning" ? "Near limit" : "Safe"}
      </Chip>
    );
  };
  const statusChip = (status: string, hasData: boolean) =>
    status === "failed" ? (
      <Chip tone="danger" icon={<IconAlertCircle size={15} />}>Breached</Chip>
    ) : status === "warning" ? (
      <Chip tone="warning" icon={<IconAlertCircle size={15} />}>Warning</Chip>
    ) : status === "passed" && hasData ? (
      <Chip tone="success" icon={<IconCircleCheck size={15} />}>Safe</Chip>
    ) : (
      <Chip tone="info">No trades yet</Chip>
    );
  const statusTone =
    account.status === "Failed"
      ? "danger"
      : account.status === "Passed"
        ? "info"
        : "success";
  const rulesChip = isBreached ? (
    <Chip tone="danger" icon={<IconAlertCircle size={15} />}>Rule breached</Chip>
  ) : warningAlerts.length > 0 ? (
    <Chip tone="warning" icon={<IconAlertCircle size={15} />}>Near a rule limit</Chip>
  ) : (
    <Chip tone="success" icon={<IconCircleCheck size={15} />}>All rules on track</Chip>
  );
  const startedOn = account.createdAt
    ? new Date(account.createdAt).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })
    : "";

  return (
    <div className="mx-auto max-w-[1480px] space-y-6">
      {/* Greeting */}
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
            {firstName ? `Welcome back, ${firstName}` : "Welcome back"}
          </h1>
          <p className="mt-1 text-[15px] text-text-secondary">Your account at a glance.</p>
        </div>
        {onStatsRefreshDue && (
          <StatsSyncTimer account={account} onRefreshDue={onStatsRefreshDue} />
        )}
      </div>

      {/* Account card + stat strip */}
      <Panel className="overflow-hidden">
        <div className="flex flex-col gap-5 p-6 sm:p-8 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex min-w-0 items-center gap-5">
            <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-brand-primary text-button-text sm:h-[72px] sm:w-[72px]">
              <IconStack2 size={32} stroke={1.8} />
            </span>
            <div className="min-w-0">
              <p className="text-[16px] font-medium text-text-secondary">{challengeRule.displayName} challenge</p>
              <p className="text-[38px] font-extrabold leading-tight tracking-tight text-white sm:text-[44px]">
                ${account.size.toLocaleString()}
              </p>
              <p className="mt-1 truncate text-[15px] text-text-muted">
                #{account.id} · {account.platform === "MT5" ? "MetaTrader 5" : account.platform === "MT4" ? "MetaTrader 4" : account.platform}
                {account.server ? ` · ${account.server}` : ""}
                {startedOn ? ` · ${startedOn}` : ""}
              </p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2.5 lg:justify-end">
            <Chip>{currentPhaseName}</Chip>
            <Chip tone={statusTone}>{account.status}</Chip>
            {rulesChip}
          </div>
        </div>
        <div className="grid grid-cols-1 divide-y divide-white/[0.08] border-t border-white/[0.08] sm:grid-cols-2 sm:divide-x lg:grid-cols-4 lg:divide-y-0">
          <Stat icon={<IconWallet size={17} />} label="Balance" value={money(account.balance)} />
          <Stat icon={<IconActivity size={17} />} label="Equity" value={money(account.equity)} />
          <Stat
            icon={<IconTrendingUp size={17} />}
            label="Profit"
            value={`${account.totalPl >= 0 ? "+" : "-"}${money(Math.abs(account.totalPl))}`}
            valueClassName={account.totalPl >= 0 ? "text-emerald-400" : "text-rose-400"}
            hint={`Today ${account.todayPl >= 0 ? "+" : "-"}${money(Math.abs(account.todayPl))}`}
          />
          <Stat icon={<IconPercentage size={17} />} label="Profit split" value={`${challengeRule.profitSplitPercent}%`} />
        </div>
      </Panel>

      {/* Alerts */}
      {inlineRuleAlerts.length > 0 && (
        <div className="space-y-3">
          {inlineRuleAlerts.map((alert) => (
            <div
              key={alert.id}
              className={`flex items-start gap-4 rounded-3xl border p-5 ${
                alert.type === "error"
                  ? "border-rose-500/30 bg-rose-500/10"
                  : alert.type === "warning"
                    ? "border-amber-500/30 bg-amber-500/10"
                    : "border-sky-500/30 bg-sky-500/10"
              }`}
            >
              <IconAlertCircle
                size={24}
                className={`mt-0.5 shrink-0 ${
                  alert.type === "error" ? "text-rose-400" : alert.type === "warning" ? "text-amber-400" : "text-sky-400"
                }`}
              />
              <div>
                <h3 className="text-[16px] font-bold text-white">{alert.title}</h3>
                <p className="mt-1 text-[14px] leading-relaxed text-text-secondary">{alert.message}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Passed */}
      {account.status === "Passed" && (
        <div className="flex flex-col gap-5 rounded-3xl border border-emerald-500/30 bg-emerald-500/10 p-6 md:flex-row md:items-center md:justify-between">
          <div className="flex items-start gap-4">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-emerald-500 text-black">
              <IconCheck size={24} />
            </span>
            <div>
              <h3 className="text-[19px] font-bold text-white">
                {hasRequestedNextAccount
                  ? nextRequestPending
                    ? `${nextRequestLabel} request submitted`
                    : `${nextRequestLabel} already requested`
                  : "You passed this phase!"}
              </h3>
              <p className="mt-1 max-w-2xl text-[14px] leading-relaxed text-text-secondary">
                {hasRequestedNextAccount
                  ? nextRequestPending
                    ? `Your ${nextRequestLabel} request is waiting for admin delivery. Login details will appear here once it is issued.`
                    : `Your ${nextRequestLabel} has been requested. Switch to it from My accounts when it is ready.`
                  : nextRequestPhase === PHASE_TWO
                    ? "You hit the profit target and kept every rule. Request your Phase 2 account to continue."
                    : nextRequestPhase
                      ? "You passed the final evaluation. Request your funded account to start trading live."
                      : "You completed your challenge objectives."}
              </p>
            </div>
          </div>
          {nextRequestPhase && (
            <button
              onClick={handleRequestNextPhase}
              disabled={requestingUpgrade || hasRequestedNextAccount}
              className={`flex w-full shrink-0 items-center justify-center gap-2 rounded-2xl px-6 py-3.5 text-[15px] font-bold md:w-auto ${
                hasRequestedNextAccount
                  ? "cursor-not-allowed border border-emerald-500/30 text-emerald-200"
                  : "cursor-pointer bg-white text-black hover:bg-neutral-200"
              }`}
            >
              {hasRequestedNextAccount ? (
                <>
                  <IconClock size={17} />
                  <span>{nextRequestPending ? "Pending delivery" : "Already requested"}</span>
                </>
              ) : requestingUpgrade ? (
                <>
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-neutral-400 border-t-black" />
                  <span>Processing...</span>
                </>
              ) : (
                <span>{nextRequestPhase === PHASE_TWO ? "Request Phase 2 account" : "Request funded account"}</span>
              )}
            </button>
          )}
        </div>
      )}

      {/* Failed */}
      {account.status === "Failed" && (
        <div className="flex flex-col gap-5 rounded-3xl border border-rose-500/30 bg-rose-500/10 p-6 md:flex-row md:items-center md:justify-between">
          <div className="flex items-start gap-4">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-rose-500 text-xl font-bold text-white">!</span>
            <div className="max-w-2xl">
              <h3 className="text-[19px] font-bold text-white">
                This account is breached
                {breachAlerts.length > 1 ? ` — ${breachAlerts.length} rules broken` : ""}
              </h3>
              {breachAlerts.length > 0 ? (
                <div className="mt-2 space-y-2">
                  {breachAlerts.map((alert) => (
                    <div key={alert.id}>
                      <p className="text-[15px] font-semibold text-rose-300">{alert.title}</p>
                      <p className="text-[14px] leading-relaxed text-text-secondary">{alert.message}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="mt-1 text-[14px] leading-relaxed text-text-secondary">
                  A hard account rule was broken. If you think this is a mistake, reach out to our team for a review.
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Rule cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4 xl:gap-5">
        <RuleCard
          title={account.target > 0 ? `Profit target · ${pctOfSize(account.target)}` : "Profit target"}
          chip={
            account.target <= 0 ? (
              <Chip>Not required</Chip>
            ) : targetPercent >= 100 ? (
              <Chip tone="success" icon={<IconCircleCheck size={15} />}>Reached</Chip>
            ) : (
              <Chip tone="info">In progress</Chip>
            )
          }
          value={money(Math.max(0, profitNow))}
          of={account.target > 0 ? `of ${money(account.target)}` : "No target on this stage"}
          percent={account.target > 0 ? targetPercent : 0}
          tone={account.target > 0 && targetPercent >= 100 ? "success" : "brand"}
          footer={account.target > 0 ? (toGo > 0 ? `${money(toGo)} to go` : "Target reached") : ""}
        />
        <RuleCard
          title={`Daily loss · ${pctOfSize(account.dailyLossLimit)}`}
          chip={lossChip(dailyLossPercent)}
          value={money(dailyLossUsed)}
          of={`of ${money(account.dailyLossLimit)}`}
          percent={dailyLossPercent}
          tone={lossTone(dailyLossPercent)}
          footer="Resets 00:00 UTC"
        />
        <RuleCard
          title={`Max loss · ${pctOfSize(account.maxDrawdown)}`}
          chip={lossChip(maxDrawdownPercent)}
          value={money(maxLossUsed)}
          of={`of ${money(account.maxDrawdown)}`}
          percent={maxDrawdownPercent}
          tone={lossTone(maxDrawdownPercent)}
          footer={`Floor ${money(maxDrawdownBoundary)}`}
        />
        <RuleCard
          title="Profitable days"
          chip={
            daysRequired === 0 ? (
              <Chip>Not required</Chip>
            ) : daysDone >= daysRequired ? (
              <Chip tone="success" icon={<IconCircleCheck size={15} />}>Done</Chip>
            ) : (
              <Chip tone="info">In progress</Chip>
            )
          }
          value={String(daysDone)}
          of={daysRequired > 0 ? `of ${daysRequired} days` : "No minimum"}
          percent={daysPercent}
          tone={daysDone >= daysRequired ? "success" : "brand"}
          footer={`A day counts when you close +${PROFITABLE_DAY_THRESHOLD_PERCENT}% (${money(account.size * (PROFITABLE_DAY_THRESHOLD_PERCENT / 100))}) or more`}
        />
      </div>

      {isLiveStage && (
        <section className="space-y-4">
          <SectionLabel>Live account rules</SectionLabel>
          <div
            className={`grid grid-cols-1 gap-4 sm:grid-cols-2 xl:gap-5 ${
              newRulesApply ? (isInstant ? "xl:grid-cols-4" : "xl:grid-cols-3") : ""
            }`}
          >
            {newRulesApply && (
              <RuleCard
                title={`Trade layering · ${layeringMinutes} min`}
                chip={statusChip(layeringStatus, hasTradeHistory)}
                value={String(layeringViolationCount)}
                of="violations · none allowed"
                footer={
                  isInstant
                    ? `Wait ${layeringMinutes} min between entries. Max ${MAX_CONCURRENT_LAYERS} open on one pair & direction — now ${concurrentPeak}.`
                    : `Wait ${layeringMinutes} min after opening a trade before opening the next one.`
                }
              />
            )}
            <RuleCard
              title={`Min. holding time · ${holdingMinutes} min`}
              chip={statusChip(holdingStatus, hasTradeHistory)}
              value={String(holdingViolationCount)}
              of={MINIMUM_HOLDING_RELAXATIONS > 0 ? `early closes · ${MINIMUM_HOLDING_RELAXATIONS} free pass` : "early closes · none allowed"}
              percent={Math.min(100, (holdingViolationCount / (MINIMUM_HOLDING_RELAXATIONS + 1)) * 100)}
              tone={holdingViolationCount > MINIMUM_HOLDING_RELAXATIONS ? "danger" : holdingViolationCount > 0 ? "warning" : "success"}
              footer={`Keep every trade open at least ${holdingMinutes} minutes.`}
            />
            {newRulesApply && isInstant && (
              <RuleCard
                title={`Single trade loss · ${SINGLE_TRADE_LOSS_LIMIT_PERCENT}%`}
                chip={statusChip(ruleStatus("single-trade-loss"), hasTradeHistory)}
                value={money(worstTradeLoss)}
                of={`worst trade · max ${money(singleTradeLossLimit)}`}
                percent={singleTradeLossPercent}
                tone={lossTone(singleTradeLossPercent)}
                footer="Counts open (floating) losses too."
              />
            )}
            {newRulesApply && (
              <RuleCard
                title="News trading"
                chip={
                  newsStatus === "failed" ? (
                    <Chip tone="danger" icon={<IconAlertCircle size={15} />}>Breached</Chip>
                  ) : newsFlaggedTrades > 0 ? (
                    <Chip tone="warning" icon={<IconAlertCircle size={15} />}>Soft breach</Chip>
                  ) : (
                    <Chip tone="neutral">Restricted</Chip>
                  )
                }
                value={
                  newsFlaggedTrades > 0
                    ? String(newsFlaggedTrades)
                    : `±${NEWS_RESTRICTED_MINUTES_EACH_SIDE} min`
                }
                of={
                  newsFlaggedTrades > 0
                    ? `trade${newsFlaggedTrades === 1 ? "" : "s"} flagged · ${money(account.newsProfitToDeduct || 0)} not withdrawable`
                    : "around high-impact news"
                }
                footer={`Don't open or close trades on affected pairs ${NEWS_RESTRICTED_MINUTES_EACH_SIDE} min either side of red-folder news. Soft breach: profit is removed, the account stays open.`}
              />
            )}
          </div>
          {newRulesApply && <UpcomingNewsWidget />}
        </section>
      )}

      {/* Stages */}
      <Panel className="p-6">
        <SectionLabel>Challenge progress</SectionLabel>
        <ol
          className="mt-5 grid gap-3 sm:[grid-template-columns:repeat(var(--stages),minmax(0,1fr))]"
          style={{ "--stages": roadmapStages.length } as React.CSSProperties}
        >
          {roadmapStages.map((stage, index) => {
            const isCompleted = account.status !== "Failed" && index < currentRoadmapIndex;
            const isCurrent = index === currentRoadmapIndex;
            const isFailedStage = account.status === "Failed" && isCurrent;
            return (
              <li
                key={stage.id}
                className={`rounded-2xl border p-4 ${
                  isFailedStage
                    ? "border-rose-500/35 bg-rose-500/10"
                    : isCompleted
                      ? "border-emerald-500/30 bg-emerald-500/10"
                      : isCurrent
                        ? "border-brand-primary/45 bg-brand-primary/10"
                        : "border-white/[0.08]"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <span
                    className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[13px] font-bold ${
                      isFailedStage
                        ? "bg-rose-500 text-white"
                        : isCompleted
                          ? "bg-emerald-500 text-black"
                          : isCurrent
                            ? "bg-brand-primary text-button-text"
                            : "bg-white/[0.08] text-text-muted"
                    }`}
                  >
                    {isCompleted ? <IconCheck size={14} /> : isFailedStage ? "!" : index + 1}
                  </span>
                  <span className="truncate text-[16px] font-bold text-white">{stage.title}</span>
                </div>
                <p className="mt-2 text-[13px] text-text-secondary">{stage.detail}</p>
                <p className="text-[13px] text-text-muted">{stage.target}</p>
              </li>
            );
          })}
        </ol>
      </Panel>

      {/* Chart + quick stats */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        <Panel className={`flex h-[380px] flex-col p-6 lg:col-span-2 ${isBreached ? "!border-rose-500/35" : ""}`}>
          <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 className="text-[18px] font-bold text-white">{activeChartConfig.title}</h3>
              <p className="text-[14px] text-text-secondary">{activeChartConfig.description}</p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {(Object.keys(chartMetricConfig) as Array<keyof typeof chartMetricConfig>).map((metric) => (
                <button
                  key={metric}
                  type="button"
                  onClick={() => setActiveChartMetric(metric)}
                  className={`cursor-pointer rounded-xl border px-3 py-1.5 text-[13px] font-semibold ${
                    activeChartMetric === metric
                      ? "border-white bg-white text-black"
                      : "border-white/10 text-text-secondary hover:text-white"
                  }`}
                >
                  {chartMetricConfig[metric].label}
                </button>
              ))}
            </div>
          </div>
          <div className="min-h-0 w-full flex-1 text-xs">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="overviewMetricGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={activeChartConfig.stop} stopOpacity={0.18} />
                    <stop offset="95%" stopColor={activeChartConfig.stop} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <Tooltip
                  contentStyle={{ backgroundColor: "#0a0a0a", borderColor: "#27272a", borderRadius: 12 }}
                  labelStyle={{ color: "#a5a5a5" }}
                  itemStyle={{ color: "#ffffff" }}
                  formatter={(val) => [`$${Number(val).toLocaleString()}`, activeChartConfig.label]}
                />
                <Area
                  type="monotone"
                  dataKey={activeChartMetric}
                  stroke={activeChartConfig.stroke}
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#overviewMetricGrad)"
                  isAnimationActive={false}
                />
                {activeChartMetric === "Equity" && Number.isFinite(maxDrawdownBoundary) && account.maxDrawdown > 0 && (
                  <ReferenceLine
                    y={maxDrawdownBoundary}
                    stroke="#fb7185"
                    strokeDasharray="4 4"
                    label={{ value: "Breach floor", position: "insideBottomRight", fill: "#fb7185", fontSize: 11 }}
                  />
                )}
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Panel>

        <Panel className="flex flex-col p-6">
          <div className="mb-2 flex items-center justify-between">
            <h3 className="text-[18px] font-bold text-white">Quick stats</h3>
            <button
              onClick={() => setActiveTab("performance")}
              className="cursor-pointer text-[14px] font-semibold text-brand-primary hover:underline"
            >
              Full analytics →
            </button>
          </div>
          <dl className="flex flex-1 flex-col justify-center divide-y divide-white/[0.08]">
            {[
              ["Win rate", `${winRate.toFixed(1)}%`],
              ["Profit factor", profitFactor.toFixed(2)],
              ["Total trades", String(totalTradesCount)],
              ["Target", account.target > 0 ? money(account.target) : "None"],
            ].map(([label, value]) => (
              <div key={label} className="flex items-center justify-between py-4">
                <dt className="text-[15px] text-text-secondary">{label}</dt>
                <dd className="text-[18px] font-bold text-white">{value}</dd>
              </div>
            ))}
          </dl>
        </Panel>
      </div>

      {/* Recent trades */}
      <div>
        <Panel className="p-6">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-[18px] font-bold text-white">Recent trades</h3>
            <button
              onClick={() => setActiveTab("history")}
              className="cursor-pointer text-[14px] font-semibold text-brand-primary hover:underline"
            >
              See all →
            </button>
          </div>
          <div className="space-y-2.5">
            {recentTrades.slice(0, 5).map((trade) => (
              <div key={trade.id} className="dash-tile flex items-center justify-between gap-3 px-4 py-3.5">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-[15px] font-bold text-white">{trade.symbol}</span>
                    <Chip tone={trade.direction === "Buy" ? "success" : "danger"}>{trade.direction}</Chip>
                    <span className="text-[13px] text-text-muted">{trade.lots} lot</span>
                  </div>
                  <span className="mt-1 block text-[13px] text-text-secondary">{trade.date}</span>
                </div>
                <div className="text-right">
                  <span className={`text-[16px] font-bold ${trade.pl >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
                    {trade.pl >= 0 ? "+" : "-"}{money(Math.abs(trade.pl))}
                  </span>
                  <span className="mt-1 block text-[12px] text-text-muted">{trade.duration}</span>
                </div>
              </div>
            ))}
            {recentTrades.length === 0 && (
              <div className="py-12 text-center text-[15px] text-text-secondary">No trades on this account yet.</div>
            )}
          </div>
        </Panel>
      </div>
    </div>
  );
}

function RuleCard({
  title,
  chip,
  value,
  of,
  percent,
  tone,
  footer,
}: {
  title: string;
  chip: React.ReactNode;
  value: string;
  of: string;
  percent?: number;
  tone?: "success" | "warning" | "danger" | "brand";
  footer: string;
}) {
  return (
    <Panel className="flex flex-col p-6">
      <div className="flex items-center justify-between gap-2">
        <h3 className="min-w-0 truncate text-[12px] font-bold uppercase tracking-[0.12em] text-text-secondary" title={title}>{title}</h3>
        {chip}
      </div>
      <p className="mt-6 text-[32px] font-extrabold leading-none tracking-tight text-white">{value}</p>
      <p className="mt-2 text-[15px] text-text-muted">{of}</p>
      {percent !== undefined && (
        <div className="mt-5">
          <ProgressBar percent={percent} tone={tone} />
        </div>
      )}
      {footer && <p className="mt-4 text-[14px] text-text-secondary">{footer}</p>}
    </Panel>
  );
}
