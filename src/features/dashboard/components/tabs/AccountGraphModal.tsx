"use client";

import React, { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { Account, Trade } from "../../index";
import { IconRefresh, IconX } from "../Icons";
import { calculateDrawdownSnapshot } from "@/lib/drawdown";
import { getChallengeRule, getDrawdownLimits } from "@/lib/rulebook";
import { getTodayClosedLoss } from "@/lib/tradingStatistics";
import { parseStatisticsDate, statisticsTradeOpenedAt } from "@/lib/statisticsTime";
import OverviewTab from "./OverviewTab";
import PerformanceTab from "./PerformanceTab";
import HistoryTab from "./HistoryTab";

interface AccountGraphModalProps {
  account: Account;
  trades?: Trade[];
  onClose: () => void;
  hideDiagnostics?: boolean;
  /** Admin only: re-pull ShowMyTrades now instead of waiting for the 30 min window. */
  onRefreshNow?: () => Promise<void>;
}

function asNumber(value: any, fallback = 0) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function hasObjectData(value: any) {
  return Boolean(value && typeof value === "object" && !Array.isArray(value) && Object.keys(value).length > 0);
}

function hasUsableStatisticsPayload(payload: any) {
  if (!payload || typeof payload !== "object") return false;
  if (hasObjectData(payload.account_info)) return true;
  if (hasObjectData(payload.statistics?.account_stats)) return true;
  if (hasObjectData(payload.statistics?.advanced_statistics)) return true;
  if (Array.isArray(payload.statistics?.equity_curve?.daily_performance) && payload.statistics.equity_curve.daily_performance.length > 0) return true;
  if (Array.isArray(payload.statistics?.advanced_statistics?.charts?.recent_trades_duration) && payload.statistics.advanced_statistics.charts.recent_trades_duration.length > 0) return true;
  return false;
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

function mapStatisticsTrades(payload: any): Trade[] {
  const rows = payload?.statistics?.advanced_statistics?.charts?.recent_trades_duration;
  if (!Array.isArray(rows)) return [];

  return rows.map((trade: any, index: number) => ({
    id: String(trade.ticket || `stat-${index + 1}`),
    date: formatStatsDate(trade.close_time || trade.open_time),
    openDate: formatStatsDate(statisticsTradeOpenedAt(trade)?.toISOString()),
    symbol: String(trade.symbol || "N/A"),
    direction: (trade.type || trade.direction || trade.side || "Buy").toString().toLowerCase().includes("sell") ? "Sell" : "Buy",
    lots: asNumber(trade.volume, 0),
    entryPrice: asNumber(trade.entry_price ?? trade.open_price, 0),
    exitPrice: asNumber(trade.exit_price ?? trade.close_price, 0),
    pl: asNumber(trade.net_profit ?? trade.profit, 0),
    duration: formatDuration(trade.duration),
  }));
}

function normalizeAccountForGraph(account: Account, hasStatisticsData: boolean): Account {
  const payload = (account as any).statisticsPayload;
  const info = payload?.account_info || {};
  const accountStats = payload?.statistics?.account_stats || {};
  const periodReturns = payload?.statistics?.monthly_yearly_performance?.period_returns || {};
  const today = periodReturns.today || {};
  const dailyPerformance = payload?.statistics?.equity_curve?.daily_performance;

  const size = asNumber((account as any).size ?? (account as any).balance ?? info.balance ?? accountStats.balance, 100000);
  const balance = asNumber(info.balance ?? accountStats.balance ?? (account as any).balance, size);
  const equity = asNumber(info.equity ?? accountStats.equity ?? (account as any).equity, balance);
  const totalPl = asNumber(accountStats.profit ?? info.profit ?? (account as any).totalPl, 0);
  const type = (account as any).accountType || (account as any).type || (size >= 100000 ? "Two Step" : "One Step");
  const phase = (account as any).phase || ((account as any).status === "Funded" ? "Funded (Live)" : "Phase 1 (Evaluation)");
  const status = (account as any).status || "Active";
  // Legacy-pinned accounts must measure violations against the old rulebook — the
  // drawdown floor drawn on the chart and the "X of Y max" figures both come from
  // these limits.
  const ruleVersion: "legacy" | "current" = (account as any).legacyRules ? "legacy" : "current";
  const fallbackLimits = getDrawdownLimits(getChallengeRule(type, ruleVersion), phase, status, ruleVersion);
  const dailyLossLimit = size * (fallbackLimits.dailyDrawdownPercent / 100);
  const maxDrawdown = size * (fallbackLimits.overallDrawdownPercent / 100);
  const todayClosedPl = asNumber(today.profit ?? (account as any).todayPl, 0);
  const todayClosedLoss = getTodayClosedLoss(payload, todayClosedPl);
  const drawdownSnapshot = calculateDrawdownSnapshot({
    initialBalance: size,
    balance,
    equity,
    todayClosedPl: -todayClosedLoss,
  });

  return {
    ...account,
    id: String((account as any).id || (account as any).login || "account"),
    type,
    size,
    phase,
    status,
    balance,
    equity,
    todayPl: todayClosedPl,
    totalPl,
    platform: (account as any).platform || "MT5",
    login: String((account as any).login || (account as any).id || ""),
    server: (account as any).server || info.server || "N/A",
    target: asNumber((account as any).target ?? (account as any).profitTarget, size * 0.1),
    dailyLossLimit,
    maxDrawdown,
    currentDailyLoss: drawdownSnapshot.currentDailyLoss,
    currentMaxDrawdown: drawdownSnapshot.currentOverallLoss,
    minTradingDays: asNumber((account as any).minTradingDays, 3),
    currentTradingDays: asNumber(
      (account as any).currentTradingDays,
      Array.isArray(dailyPerformance) ? dailyPerformance.length : 0
    ),
    consistencyRule: (account as any).consistencyRule ?? true,
    newsRule: (account as any).newsRule ?? true,
    weekendHoldingAddon: (account as any).weekendHoldingAddon,
    legacyRules: (account as any).legacyRules,
    deliveryStatus: (account as any).deliveryStatus,
    externalStatisticsId: (account as any).externalStatisticsId,
    statisticsPayload: (account as any).statisticsPayload,
    statisticsUpdatedAt: (account as any).statisticsUpdatedAt,
  };
}

function formatSyncedAt(value?: string) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

export default function AccountGraphModal({ account, trades = [], onClose, hideDiagnostics = false, onRefreshNow }: AccountGraphModalProps) {
  const [mounted, setMounted] = useState(false);
  const [refreshingNow, setRefreshingNow] = useState(false);
  const lastSyncedAt = formatSyncedAt((account as any).statisticsUpdatedAt);

  const handleRefreshNow = async () => {
    if (!onRefreshNow || refreshingNow) return;
    setRefreshingNow(true);
    try {
      await onRefreshNow();
    } finally {
      setRefreshingNow(false);
    }
  };
  const [activeGraphTab, setActiveGraphTab] = useState<"overview" | "performance" | "history">("overview");
  const sourceStatisticsPayload = (account as any).statisticsPayload;
  const hasStatisticsData = hasUsableStatisticsPayload(sourceStatisticsPayload);
  const graphAccount = useMemo(() => normalizeAccountForGraph(account, hasStatisticsData), [account, hasStatisticsData]);
  const statisticsPayload = hasStatisticsData ? (graphAccount as any).statisticsPayload : null;
  const hasStatisticsResponse = Boolean(sourceStatisticsPayload);
  const statisticsResponseText = useMemo(() => {
    if (!sourceStatisticsPayload) return "";
    try {
      return JSON.stringify(sourceStatisticsPayload, null, 2);
    } catch {
      return String(sourceStatisticsPayload);
    }
  }, [sourceStatisticsPayload]);
  const graphTrades = useMemo(() => {
    if (!hasStatisticsData) return trades;
    const statisticsTrades = mapStatisticsTrades(statisticsPayload);
    return statisticsTrades.length > 0 ? statisticsTrades : trades;
  }, [hasStatisticsData, statisticsPayload, trades]);
  const graphRuleAlerts = graphAccount.ruleAlerts || [];
  const graphBreachAlerts = graphRuleAlerts.filter((alert) => alert.type === "error");
  const graphWarningAlerts = graphRuleAlerts.filter((alert) => alert.type === "warning");
  const graphHasBreach = graphAccount.status === "Failed" || graphBreachAlerts.length > 0;

  const switchGraphTab = (tab: string) => {
    if (tab === "performance" || tab === "history" || tab === "overview") {
      setActiveGraphTab(tab);
    }
  };

  useEffect(() => {
    setMounted(true);
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, []);

  const modal = (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center overflow-hidden bg-black/90 p-3 sm:p-5">
      <button
        type="button"
        className="absolute inset-0 h-full w-full cursor-default"
        aria-label="Close graph backdrop"
        onClick={onClose}
      />
      <div
        className="relative z-10 flex h-[88vh] w-full max-w-[min(1280px,96vw)] min-w-0 flex-col overflow-hidden rounded-2xl border border-white/15 bg-neutral-950 shadow-[0_30px_120px_rgba(0,0,0,0.9)]"
        role="dialog"
        aria-modal="true"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex shrink-0 flex-col gap-3 border-b border-white/10 bg-neutral-950 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-sm font-semibold text-white font-clash-display">Graph: Account #{graphAccount.login || graphAccount.id}</h3>
              {graphHasBreach && (
                <span className="rounded border border-rose-500/30 bg-rose-500/10 px-2 py-0.5 font-mono text-[9px] font-bold uppercase tracking-wider text-rose-300">
                  You are breached
                </span>
              )}
              {!graphHasBreach && graphWarningAlerts.length > 0 && (
                <span className="rounded border border-amber-500/30 bg-amber-500/10 px-2 py-0.5 font-mono text-[9px] font-bold uppercase tracking-wider text-amber-300">
                  Rule warning
                </span>
              )}
            </div>
            <p className="truncate text-[11px] text-neutral-500 font-mono">
              {graphAccount.platform} | {graphAccount.server} | {graphAccount.phase}
            </p>
          </div>
          <div className="flex shrink-0 flex-wrap items-center gap-2">
            {onRefreshNow && (
              <button
                type="button"
                onClick={handleRefreshNow}
                disabled={refreshingNow}
                title={lastSyncedAt ? `Last synced at ${lastSyncedAt}` : "Not synced yet"}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-emerald-500/30 bg-emerald-500/10 text-[10px] font-bold uppercase text-emerald-300 transition-colors hover:bg-emerald-500/20 disabled:cursor-wait disabled:opacity-60 cursor-pointer"
              >
                <IconRefresh size={12} className={refreshingNow ? "animate-spin" : ""} />
                {refreshingNow ? "Refreshing…" : "Refresh now"}
                {lastSyncedAt && !refreshingNow && (
                  <span className="font-mono font-normal normal-case text-emerald-300/60">· {lastSyncedAt}</span>
                )}
              </button>
            )}
            {[
              { id: "overview", label: "Overview" },
              { id: "performance", label: "Analytics" },
              { id: "history", label: "Trading Log" },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveGraphTab(tab.id as any)}
                className={`px-3 py-1.5 rounded-lg border text-[10px] font-bold uppercase transition-colors cursor-pointer ${
                  activeGraphTab === tab.id
                    ? "bg-white text-black border-white"
                    : "bg-neutral-900 text-neutral-400 border-white/5 hover:text-white"
                }`}
              >
                {tab.label}
              </button>
            ))}
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-lg border border-white/5 bg-neutral-900 text-neutral-400 hover:text-white cursor-pointer"
              aria-label="Close graph"
            >
              <IconX size={16} />
            </button>
          </div>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain bg-neutral-900/30 p-4 sm:p-6">
          {graphRuleAlerts.length > 0 && (
            <div className="mb-4 space-y-2">
              {graphRuleAlerts.map((alert) => (
                <div
                  key={alert.id}
                  className={`rounded-xl border p-4 ${
                    alert.type === "error"
                      ? "border-rose-500/30 bg-rose-500/10"
                      : alert.type === "warning"
                      ? "border-amber-500/30 bg-amber-500/10"
                      : "border-blue-500/30 bg-blue-500/10"
                  }`}
                >
                  <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <p className="font-mono text-[10px] font-bold uppercase tracking-wider text-white">
                        {alert.type === "error" ? "You are breached" : "Rule alert"}
                      </p>
                      <h4 className="mt-1 text-sm font-semibold text-white">{alert.title}</h4>
                    </div>
                    <span
                      className={`w-fit rounded border px-2 py-0.5 font-mono text-[9px] font-bold uppercase ${
                        alert.type === "error"
                          ? "border-rose-500/30 text-rose-300"
                          : alert.type === "warning"
                          ? "border-amber-500/30 text-amber-300"
                          : "border-blue-500/30 text-blue-300"
                      }`}
                    >
                      {alert.type === "error" ? "breach" : alert.type}
                    </span>
                  </div>
                  <p className="mt-2 text-xs leading-relaxed text-neutral-300">{alert.message}</p>
                </div>
              ))}
            </div>
          )}
          {!hasStatisticsData && (
            <div className="mb-4 rounded-xl border border-amber-500/25 bg-amber-500/10 p-5 font-mono text-xs text-amber-100">
              {hideDiagnostics ? (
                <div className="space-y-1">
                  <span className="block font-bold uppercase tracking-wide">Due to technical issue, stats are not showing.</span>
                  <p className="text-[11px] text-amber-100/80">
                    Please check again later while our team restores account statistics.
                  </p>
                </div>
              ) : (
                <>
                  <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                    <span className="font-bold uppercase tracking-wide">ShowMyTrades response</span>
                    <span className="text-[10px] text-amber-200/70">
                      Graph ID: {(graphAccount as any).externalStatisticsId || "Not assigned"}
                    </span>
                  </div>
                  {hasStatisticsResponse ? (
                    <pre className="mt-3 max-h-48 overflow-auto whitespace-pre-wrap rounded-lg border border-amber-500/15 bg-black/30 p-3 text-[11px] leading-relaxed text-amber-50">
                      {statisticsResponseText}
                    </pre>
                  ) : (
                    <p className="mt-2 text-[11px] text-amber-100/80">
                      No statistics payload has been saved yet. Add a Graph ID in admin credentials and refresh the account list.
                    </p>
                  )}
                </>
              )}
            </div>
          )}
          <div className="relative">
            {!hasStatisticsData && (
              <div className="pointer-events-none absolute inset-0 z-10 flex items-start justify-center rounded-2xl bg-neutral-950/35 pt-10 backdrop-blur-[2px]">
                <span className="rounded-full border border-amber-400/20 bg-amber-400/10 px-4 py-2 font-mono text-[10px] font-bold uppercase tracking-wider text-amber-200">
                  {hideDiagnostics ? "Due to technical issue, stats are not showing." : "Endpoint returned no statistics. Values are locked at zero."}
                </span>
              </div>
            )}
            <div className={!hasStatisticsData ? "blur-[2px] opacity-55 select-none" : ""}>
              {activeGraphTab === "overview" && (
                <OverviewTab
                  account={graphAccount}
                  recentTrades={graphTrades}
                  setActiveTab={switchGraphTab}
                  onUpgradeRequested={() => undefined}
                />
              )}
              {activeGraphTab === "performance" && (
                <PerformanceTab account={graphAccount} trades={graphTrades} />
              )}
              {activeGraphTab === "history" && (
                <HistoryTab trades={graphTrades} accountId={graphAccount.id} />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  if (!mounted) return null;

  return createPortal(modal, document.body);
}
