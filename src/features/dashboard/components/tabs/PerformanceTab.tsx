"use client";

import React from "react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";
import {
  IconTrendingUp,
  IconClock,
  IconTrophy,
  IconChartBar,
} from "../Icons";
import { Account, Trade } from "../../index";
import { buildPerformanceSeries } from "@/lib/tradingStatistics";

interface PerformanceTabProps {
  account: Account;
  trades: Trade[];
}

// Compact axis labels (e.g. 102.5k) so tick values fit on narrow phone charts.
function formatAxisMoney(value: number) {
  const abs = Math.abs(value);
  if (abs >= 1_000_000) return `${+(value / 1_000_000).toFixed(1)}m`;
  if (abs >= 1_000) return `${+(value / 1_000).toFixed(1)}k`;
  return String(value);
}

export default function PerformanceTab({ account, trades }: PerformanceTabProps) {
  const statisticsPayload = (account as any).statisticsPayload;
  const advancedStats = statisticsPayload?.statistics?.advanced_statistics || {};
  const dailyPerformance = statisticsPayload?.statistics?.equity_curve?.daily_performance;
  const symbolBreakdown = statisticsPayload?.statistics?.by_symbol;

  // Statistical calculations
  const totalTrades = Number(advancedStats.total_trades ?? trades.length);
  const winningTrades = trades.filter((t) => t.pl > 0);
  const losingTrades = trades.filter((t) => t.pl < 0);

  const suppliedWinRate = Number(advancedStats.win_rate);
  const winRate =
    Number.isFinite(suppliedWinRate)
      ? suppliedWinRate >= 0 && suppliedWinRate <= 1
        ? suppliedWinRate * 100
        : suppliedWinRate
      : totalTrades > 0
        ? (winningTrades.length / totalTrades) * 100
        : 0;

  const totalWins = winningTrades.reduce((acc, t) => acc + t.pl, 0);
  const totalLosses = Math.abs(losingTrades.reduce((acc, t) => acc + t.pl, 0));

  const avgWin = Number(advancedStats.avg_win?.profit ?? (winningTrades.length > 0 ? totalWins / winningTrades.length : 0));
  const avgLoss = Math.abs(Number(advancedStats.avg_loss?.profit ?? (losingTrades.length > 0 ? totalLosses / losingTrades.length : 0)));
  const rrRatio = avgLoss > 0 ? avgWin / avgLoss : 0;

  const profitFactor =
    advancedStats.profit_factor !== undefined
      ? Number(advancedStats.profit_factor)
      : totalLosses > 0
        ? totalWins / totalLosses
        : totalWins > 0
          ? 9.9
          : 0;

  // Best / Worst trades
  const sortedByPl = [...trades].sort((a, b) => b.pl - a.pl);
  const bestTrade = sortedByPl[0] || null;
  const worstTrade = sortedByPl[sortedByPl.length - 1] || null;

  const providerSeries = buildPerformanceSeries({
    payload: statisticsPayload,
    initialBalance: account.size,
    currentBalance: account.balance,
    currentEquity: account.equity,
    currentTotalProfit: account.totalPl,
  });

  // Chart 1: Equity Curve Data
  const getEquityData = () => {
    if (providerSeries.length > 0) {
      return providerSeries.map((point) => ({
        name: point.name === "Current" ? point.name : point.date.substring(5),
        Equity: point.equity,
      }));
    }

    let runningBalance = account.size;
    const points = [{ name: "Start", Equity: runningBalance }];
    const chronTrades = [...trades].sort((left, right) => {
      const leftTime = new Date(left.date).getTime();
      const rightTime = new Date(right.date).getTime();
      if (Number.isNaN(leftTime) || Number.isNaN(rightTime)) return 0;
      return leftTime - rightTime;
    });

    chronTrades.forEach((trade, index) => {
      runningBalance += trade.pl;
      points.push({
        name: `T${index + 1}`,
        Equity: Number(runningBalance.toFixed(2)),
      });
    });

    const currentPoint = { name: "Current", Equity: account.equity };
    if (points.length === 1) points.push(currentPoint);
    else points[points.length - 1] = currentPoint;
    return points;
  };

  const equityData = getEquityData();

  // Chart 2: Daily P&L uses the day's net result, never cumulative period profit.
  const getDailyPlData = () => {
    if (providerSeries.length > 0) {
      return providerSeries
        .filter((point) => point.date !== "Current")
        .map((point) => ({
          Date: point.date.substring(5),
          Pl: point.dailyProfit,
        }));
    }

    const dailyMap: Record<string, number> = {};
    trades.forEach((trade) => {
      const dateKey = trade.date.split(" ")[0];
      dailyMap[dateKey] = (dailyMap[dateKey] || 0) + trade.pl;
    });

    const dates = Object.keys(dailyMap).sort();
    if (dates.length === 0) return [{ Date: "No Data", Pl: 0 }];
    return dates.map((date) => ({
      Date: date.substring(5),
      Pl: Number(dailyMap[date].toFixed(2)),
    }));
  };

  const dailyPlData = getDailyPlData();
  // Symbol Breakdown
  const getSymbolStats = () => {
    if (symbolBreakdown && typeof symbolBreakdown === "object") {
      return Object.entries(symbolBreakdown)
        .map(([symbol, stat]: [string, any]) => ({
          symbol,
          pl: Number(stat.total?.profit ?? 0),
          trades: Number(stat.total?.trades ?? 0),
        }))
        .sort((a, b) => b.pl - a.pl);
    }

    const symbolMap: Record<string, { pl: number; trades: number }> = {};
    trades.forEach((t) => {
      if (!symbolMap[t.symbol]) {
        symbolMap[t.symbol] = { pl: 0, trades: 0 };
      }
      symbolMap[t.symbol].pl += t.pl;
      symbolMap[t.symbol].trades += 1;
    });

    return Object.entries(symbolMap)
      .map(([symbol, stat]) => ({
        symbol,
        pl: Number(stat.pl.toFixed(2)),
        trades: stat.trades,
      }))
      .sort((a, b) => b.pl - a.pl);
  };

  const symbolStats = getSymbolStats();

  // Assign every closed trade to one non-overlapping UTC session for exact totals.
  const sessionDefinitions = [
    { name: "Asian Session", time: "00:00 - 08:00 UTC", start: 0, end: 8, color: "border-neutral-900" },
    { name: "London Session", time: "08:00 - 13:00 UTC", start: 8, end: 13, color: "border-neutral-700" },
    { name: "New York Session", time: "13:00 - 22:00 UTC", start: 13, end: 22, color: "border-white/40" },
    { name: "Rollover", time: "22:00 - 00:00 UTC", start: 22, end: 24, color: "border-neutral-800" },
  ];
  const sessionStats = sessionDefinitions.map((session) => {
    const sessionTrades = trades.filter((trade) => {
      const normalized = /(?:Z|[+-]\d{2}:?\d{2})$/.test(trade.date)
        ? trade.date
        : `${trade.date.replace(" ", "T")}Z`;
      const closedAt = new Date(normalized);
      if (Number.isNaN(closedAt.getTime())) return false;
      const hour = closedAt.getUTCHours();
      return hour >= session.start && hour < session.end;
    });
    return {
      name: session.name,
      time: session.time,
      color: session.color,
      trades: sessionTrades.length,
      pl: Number(sessionTrades.reduce((sum, trade) => sum + trade.pl, 0).toFixed(2)),
    };
  });

  return (
    <div className="space-y-6 md:space-y-8 animate-fade-in">
      {/* Title */}
      <div className="border-b border-border-secondary pb-4">
        <h1 className="text-3xl font-clash-display font-semibold tracking-tight text-white">
          Trading Performance & Analytics
        </h1>
        <p className="text-text-secondary text-sm">
          Deep dive into your account analytics, symbol win ratios, and session performance.
        </p>
      </div>

      {/* Numerical Metrics Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="dash-card p-4">
          <span className="text-[10px] text-text-secondary uppercase tracking-wider font-mono">Win Rate</span>
          <h2 className="text-2xl font-semibold font-mono text-white mt-2">{winRate.toFixed(1)}%</h2>
          <p className="text-[10px] text-text-muted mt-1 font-mono">
            {winningTrades.length} W / {losingTrades.length} L
          </p>
        </div>

        <div className="dash-card p-4">
          <span className="text-[10px] text-text-secondary uppercase tracking-wider font-mono">Profit Factor</span>
          <h2 className="text-2xl font-semibold font-mono text-white mt-2">{profitFactor.toFixed(2)}</h2>
          <p className="text-[10px] text-text-muted mt-1 font-mono">Gross return ratio</p>
        </div>

        <div className="dash-card p-4">
          <span className="text-[10px] text-text-secondary uppercase tracking-wider font-mono">Avg Win / Loss</span>
          <h2 className="text-xl font-semibold font-mono text-white mt-2">
            ${avgWin.toFixed(0)} / -${avgLoss.toFixed(0)}
          </h2>
          <p className="text-[10px] text-text-muted mt-1 font-mono">Average size of closed positions</p>
        </div>

        <div className="dash-card p-4">
          <span className="text-[10px] text-text-secondary uppercase tracking-wider font-mono">Risk-Reward Ratio</span>
          <h2 className="text-2xl font-semibold font-mono text-white mt-2">{rrRatio.toFixed(2)}:1</h2>
          <p className="text-[10px] text-text-muted mt-1 font-mono">Payout risk ratio</p>
        </div>
      </div>

      {/* Core charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Equity curve */}
        <div className="dash-card p-5 flex flex-col h-[350px]">
          <div className="mb-4">
            <h3 className="text-sm font-semibold text-white flex items-center gap-2">
              <IconTrendingUp size={16} />
              <span>Equity Curve Growth</span>
            </h3>
            <p className="text-[10px] text-text-secondary">Visual progression of equity values over closed trades</p>
          </div>
          <div className="flex-1 min-h-0 w-full font-mono text-xs">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={equityData} margin={{ top: 10, right: 24, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1c1c1f" />
                <XAxis dataKey="name" stroke="#52525b" tick={{ fontSize: 10 }} interval="preserveStartEnd" />
                <YAxis stroke="#52525b" domain={["auto", "auto"]} width={44} tick={{ fontSize: 10 }} tickFormatter={formatAxisMoney} />
                <Tooltip
                  contentStyle={{ backgroundColor: "#0a0a0a", borderColor: "#27272a" }}
                  labelStyle={{ color: "#a5a5a5" }}
                  itemStyle={{ color: "#ffffff" }}
                  formatter={(val) => [`$${Number(val).toLocaleString()}`, "Equity"]}
                />
                <Line
                  type="monotone"
                  dataKey="Equity"
                  stroke="#ffffff"
                  strokeWidth={2.5}
                  dot={{ r: 3, strokeWidth: 1, fill: "#000" }}
                  activeDot={{ r: 5 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Daily P&L bar chart */}
        <div className="dash-card p-5 flex flex-col h-[350px]">
          <div className="mb-4">
            <h3 className="text-sm font-semibold text-white flex items-center gap-2">
              <IconChartBar size={16} />
              <span>Daily P&L Performance</span>
            </h3>
            <p className="text-[10px] text-text-secondary">Net profits/losses grouped by calendar day</p>
          </div>
          <div className="flex-1 min-h-0 w-full font-mono text-xs">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dailyPlData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1c1c1f" />
                <XAxis dataKey="Date" stroke="#52525b" tick={{ fontSize: 10 }} />
                <YAxis stroke="#52525b" width={44} tick={{ fontSize: 10 }} tickFormatter={formatAxisMoney} />
                <Tooltip
                  contentStyle={{ backgroundColor: "#0a0a0a", borderColor: "#27272a" }}
                  labelStyle={{ color: "#a5a5a5" }}
                  itemStyle={{ color: "#ffffff" }}
                  formatter={(val) => [`$${val.toLocaleString()}`, "Net Return"]}
                />
                <ReferenceLine y={0} stroke="#52525b" />
                <Bar
                  dataKey="Pl"
                  fill="#ffffff"
                  radius={[4, 4, 0, 0]}
                  // Dynamic coloring logic via Recharts cell or simply color bars based on value (Recharts bar fill fallback)
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Trade statistics tables and session metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Best / Worst Trade stats */}
        <div className="dash-card p-5 flex flex-col justify-between">
          <div className="mb-4">
            <h3 className="text-sm font-semibold text-white flex items-center gap-2">
              <IconTrophy size={16} />
              <span>Trade Extrema</span>
            </h3>
            <p className="text-[10px] text-text-secondary">Best and worst trades for active account</p>
          </div>

          <div className="space-y-4 flex-1 flex flex-col justify-center">
            {/* Best Trade */}
            <div className="p-3 rounded bg-neutral-950 border border-neutral-900/60">
              <span className="text-[9px] uppercase font-bold text-emerald-400 font-mono">Best Trade</span>
              {bestTrade ? (
                <div className="flex items-center justify-between mt-2 font-mono">
                  <div>
                    <span className="text-xs font-bold text-white">{bestTrade.symbol}</span>
                    <span className="text-[9px] text-neutral-500 block">{bestTrade.date}</span>
                  </div>
                  <span className="text-sm font-semibold text-emerald-400">
                    +${bestTrade.pl.toLocaleString()}
                  </span>
                </div>
              ) : (
                <div className="text-xs text-neutral-500 mt-2">No trades available</div>
              )}
            </div>

            {/* Worst Trade */}
            <div className="p-3 rounded bg-neutral-950 border border-neutral-900/60">
              <span className="text-[9px] uppercase font-bold text-rose-400 font-mono">Worst Trade</span>
              {worstTrade ? (
                <div className="flex items-center justify-between mt-2 font-mono">
                  <div>
                    <span className="text-xs font-bold text-white">{worstTrade.symbol}</span>
                    <span className="text-[9px] text-neutral-500 block">{worstTrade.date}</span>
                  </div>
                  <span className="text-sm font-semibold text-rose-400">
                    ${worstTrade.pl.toLocaleString()}
                  </span>
                </div>
              ) : (
                <div className="text-xs text-neutral-500 mt-2">No trades available</div>
              )}
            </div>
          </div>
        </div>

        {/* Symbol breakdown */}
        <div className="dash-card p-5">
          <div className="mb-4">
            <h3 className="text-sm font-semibold text-white">Performance by Symbol</h3>
            <p className="text-[10px] text-text-secondary">P&L distribution per asset symbol</p>
          </div>

          <div className="space-y-3 max-h-52 overflow-y-auto custom-scrollbar pr-1">
            {symbolStats.length === 0 ? (
              <div className="text-center py-8 text-xs text-neutral-500">No assets traded yet.</div>
            ) : (
              symbolStats.map((stat) => (
                <div
                  key={stat.symbol}
                  className="flex items-center justify-between p-2.5 rounded bg-neutral-950 border border-neutral-900/60 font-mono text-xs"
                >
                  <div>
                    <span className="font-bold text-white">{stat.symbol}</span>
                    <span className="text-[9px] text-neutral-500 block">{stat.trades} Trades</span>
                  </div>
                  <span className={`font-semibold ${stat.pl >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
                    {stat.pl >= 0 ? "+" : ""}
                    ${stat.pl.toLocaleString()}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Session breakdown */}
        <div className="dash-card p-5">
          <div className="mb-4">
            <h3 className="text-sm font-semibold text-white flex items-center gap-2">
              <IconClock size={16} />
              <span>Trading by Session</span>
            </h3>
            <p className="text-[10px] text-text-secondary">P&L generated during global market sessions</p>
          </div>

          <div className="space-y-3">
            {sessionStats.map((sess) => (
              <div
                key={sess.name}
                className={`p-2.5 rounded border ${sess.color} bg-neutral-950/60 flex items-center justify-between text-xs`}
              >
                <div>
                  <h4 className="font-semibold text-white">{sess.name}</h4>
                  <span className="text-[9px] text-neutral-500 font-mono block mt-0.5">{sess.time}</span>
                </div>
                <div className="text-right font-mono">
                  <span className={`font-semibold ${sess.pl >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
                    {sess.pl >= 0 ? "+" : ""}
                    ${sess.pl.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                  </span>
                  <span className="text-[9px] text-neutral-500 block mt-0.5">{sess.trades} Trades</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
