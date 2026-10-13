"use client";

import React from "react";
import {
  IconShield,
  IconScale,
  IconClock,
  IconNews,
  IconCalendar,
  IconInfoCircle,
} from "../Icons";
import { Account } from "../../index";
import { NEWS_RESTRICTED_MINUTES_EACH_SIDE } from "@/lib/rulebook";

interface RulesTabProps {
  account: Account;
}

export default function RulesTab({ account }: RulesTabProps) {
  // Live usage math
  const dailyLossPercent = account.dailyLossLimit > 0
    ? Math.min(100, Math.max(0, (account.currentDailyLoss / account.dailyLossLimit) * 100))
    : 0;

  const maxDrawdownPercent = account.maxDrawdown > 0
    ? Math.min(100, Math.max(0, (account.currentMaxDrawdown / account.maxDrawdown) * 100))
    : 0;

  const targetPercent =
    account.target > 0
      ? Math.min(100, Math.max(0, (account.totalPl / account.target) * 100))
      : 100;

  const parameters = [
    { label: "Challenge Type", value: account.type },
    { label: "Account Size", value: `$${account.size.toLocaleString()}` },
    { label: "Account ID", value: account.id },
    { label: "Brokerage Platform", value: account.platform },
    { label: "Leverage Rate", value: "1:100 across every asset class" },
    { label: "Profit Share Split", value: account.status === "Funded" ? "80% first / 85% second / 90% thereafter" : "N/A (Evaluation phase)" },
    { label: "Withdrawal Cap", value: account.status === "Funded" ? `6% per payout period ($${(account.size * 0.06).toLocaleString()})` : "N/A (Evaluation phase)" },
  ];

  return (
    <div className="space-y-6 md:space-y-8 animate-fade-in">
      {/* Title */}
      <div className="border-b border-border-secondary pb-4">
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-3xl font-clash-display font-semibold tracking-tight text-white">
            Rules & Challenge Specifications
          </h1>
          {account.legacyRules && (
            <span className="rounded-full border border-amber-500/30 bg-amber-500/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-amber-300">
              Legacy rules
            </span>
          )}
        </div>
        <p className="text-text-secondary text-sm">
          {account.legacyRules
            ? "This account is evaluated against the earlier rulebook it was purchased under."
            : "Familiarize yourself with the active objectives, strict drawdown guidelines, and account metrics."}
        </p>
      </div>

      {/* Live Drawdown & Profit Limits Indicators */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Daily loss */}
        <div className="dash-card p-5 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs text-text-secondary font-mono uppercase tracking-wider">
              Daily Loss Threshold
            </span>
            <span className="text-xs font-mono text-white">
              ${Math.abs(account.currentDailyLoss).toLocaleString()} / ${account.dailyLossLimit.toLocaleString()}
            </span>
          </div>
          <div className="h-2.5 w-full bg-neutral-800 rounded-full overflow-hidden">
            <div
              style={{ width: `${dailyLossPercent}%` }}
              className={`h-full rounded-full transition-all duration-300 ${
                dailyLossPercent > 80 ? "bg-rose-500 shadow-[0_0_10px_rgba(239,68,68,0.4)]" : "bg-white"
              }`}
            />
          </div>
          <div className="flex items-center justify-between text-[10px] text-text-muted">
            <span>Daily Drawdown Limit: {((account.dailyLossLimit / account.size) * 100).toFixed(1)}%</span>
            <span>Used: {dailyLossPercent.toFixed(1)}%</span>
          </div>
        </div>

        {/* Max loss */}
        <div className="dash-card p-5 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs text-text-secondary font-mono uppercase tracking-wider">
              Maximum Drawdown
            </span>
            <span className="text-xs font-mono text-white">
              ${Math.abs(account.currentMaxDrawdown).toLocaleString()} / ${account.maxDrawdown.toLocaleString()}
            </span>
          </div>
          <div className="h-2.5 w-full bg-neutral-800 rounded-full overflow-hidden">
            <div
              style={{ width: `${maxDrawdownPercent}%` }}
              className={`h-full rounded-full transition-all duration-300 ${
                maxDrawdownPercent > 80 ? "bg-rose-500 shadow-[0_0_10px_rgba(239,68,68,0.4)]" : "bg-white"
              }`}
            />
          </div>
          <div className="flex items-center justify-between text-[10px] text-text-muted">
            <span>Max Drawdown Limit: {((account.maxDrawdown / account.size) * 100).toFixed(1)}%</span>
            <span>Used: {maxDrawdownPercent.toFixed(1)}%</span>
          </div>
        </div>

        {/* Profit target */}
        <div className="dash-card p-5 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs text-text-secondary font-mono uppercase tracking-wider">
              Profit Target
            </span>
            <span className="text-xs font-mono text-white">
              {account.target > 0 ? `$${account.totalPl.toLocaleString()} / $${account.target.toLocaleString()}` : "N/A"}
            </span>
          </div>
          <div className="h-2.5 w-full bg-neutral-800 rounded-full overflow-hidden">
            <div
              style={{ width: `${targetPercent}%` }}
              className="h-full bg-white rounded-full transition-all duration-300 shadow-[0_0_10px_rgba(255,255,255,0.2)]"
            />
          </div>
          <div className="flex items-center justify-between text-[10px] text-text-muted">
            <span>Target: {account.target > 0 ? `${((account.target / account.size) * 100).toFixed(0)}%` : "N/A"}</span>
            <span>Progress: {targetPercent.toFixed(1)}%</span>
          </div>
        </div>
      </div>

      {/* Rules list explanation */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Core Rules details */}
        <div className="space-y-4">
          <h3 className="text-base font-semibold text-white">Critical Trading Rules</h3>
          
          <div className="dash-card p-4 flex gap-4">
            <div className="h-9 w-9 rounded-lg bg-neutral-900 border border-neutral-800 text-white flex items-center justify-center flex-shrink-0">
              <IconClock size={18} />
            </div>
            <div>
              <h4 className="text-xs font-semibold text-white">Minimum Profitable / Qualifying Days</h4>
              <p className="text-xs text-text-secondary mt-1">
                Step 1 and Step 2 need 3 profitable days, each closing at least 0.5% of the initial balance. Instant and every Funded stage need 5 qualifying days in total: those 3 profitable days plus 2 more that can be plain trading days.
              </p>
            </div>
          </div>

          <div className="dash-card p-4 flex gap-4">
            <div className="h-9 w-9 rounded-lg bg-neutral-900 border border-neutral-800 text-white flex items-center justify-center flex-shrink-0">
              <IconScale size={18} />
            </div>
            <div>
              <h4 className="text-xs font-semibold text-white">Tick Scalping — Hard Breach</h4>
              <p className="text-xs text-text-secondary mt-1">
                Closing 3 or more trades that were each held for less than 10 seconds inside any one-hour window is an immediate hard breach and fails the account.
              </p>
            </div>
          </div>

          <div className="dash-card p-4 flex gap-4">
            <div className="h-9 w-9 rounded-lg bg-neutral-900 border border-neutral-800 text-white flex items-center justify-center flex-shrink-0">
              <IconCalendar size={18} />
            </div>
            <div>
              <h4 className="text-xs font-semibold text-white">Inactivity — 30 Days</h4>
              <p className="text-xs text-text-secondary mt-1">
                At least one trade must be executed every 30 consecutive days, counted from the first executed trade, or the account is closed for breach.
              </p>
            </div>
          </div>

          <div className="dash-card p-4 flex gap-4">
            <div className="h-9 w-9 rounded-lg bg-neutral-900 border border-neutral-800 text-white flex items-center justify-center flex-shrink-0">
              <IconNews size={18} />
            </div>
            <div>
              <h4 className="text-xs font-semibold text-white">News Trading</h4>
              <p className="text-xs text-text-secondary mt-1">
                Unrestricted during the Step 1 / Step 2 challenge. On Funded and Instant accounts, opening or closing (manually, TP or SL) a trade on an affected instrument within {NEWS_RESTRICTED_MINUTES_EACH_SIDE} minutes before or after high-impact news is a soft breach: the account stays open, but that trade&apos;s profit is not withdrawable.
              </p>
              {(account.newsViolations?.length ?? 0) > 0 && (
                <div className="mt-3 space-y-2">
                  <p className="text-xs font-semibold text-amber-300">
                    {new Set(account.newsViolations!.map((v) => v.ticket)).size} trade(s) flagged ·{" "}
                    ${(account.newsProfitToDeduct || 0).toLocaleString(undefined, { maximumFractionDigits: 2 })} not withdrawable
                  </p>
                  <ul className="divide-y divide-white/5 rounded-lg border border-white/10">
                    {account.newsViolations!.map((v) => (
                      <li key={`${v.ticket}-${v.eventTime}-${v.type}`} className="flex flex-wrap items-center justify-between gap-2 px-3 py-2 text-xs">
                        <span className="text-white">
                          <span className="font-mono">{v.symbol} #{v.ticket}</span>{" "}
                          <span className="text-text-secondary">
                            {v.type === "opened_in_window" ? "opened" : "closed"}{" "}
                            {v.secondsFromEvent === 0
                              ? "at"
                              : `${Math.abs(v.secondsFromEvent)}s ${v.secondsFromEvent < 0 ? "before" : "after"}`}{" "}
                            {v.currency} {v.eventTitle}
                          </span>
                        </span>
                        <span className="text-text-secondary">
                          {new Date(v.eventTime).toISOString().slice(0, 16).replace("T", " ")} UTC ·{" "}
                          <span className={v.profit > 0 ? "text-rose-300" : ""}>
                            {v.profit > 0 ? `−$${v.profit.toLocaleString(undefined, { maximumFractionDigits: 2 })}` : "no deduction"}
                          </span>
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Detailed technical breakdown */}
        <div className="space-y-6">
          <div className="dash-card p-5">
            <h3 className="text-sm font-semibold text-white mb-4">Account Properties</h3>
            <div className="divide-y divide-neutral-900/60 font-mono text-xs">
              {parameters.map((param) => (
                <div key={param.label} className="flex justify-between py-2.5">
                  <span className="text-text-secondary">{param.label}</span>
                  <span className="text-white font-semibold">{param.value}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="dash-card p-5 space-y-4">
            <div>
              <h3 className="text-sm font-semibold text-white">Trade Layering — 5 Minutes</h3>
              <p className="mt-1 text-xs leading-normal text-text-secondary">
                On Instant Funded and Funded accounts, opening any trade — any instrument, any direction — within 5 minutes of the previous trade&apos;s opening time is a hard breach and fails the account, even if the first trade was already closed. Instant Funded accounts additionally cap same-instrument, same-direction positions at 2 held open at once — opening a 3rd fails the account even if every entry was more than 5 minutes apart.
              </p>
            </div>
            {account.type === "Instant" && !account.legacyRules && (
              <div>
                <h3 className="text-sm font-semibold text-white">Single Trade Loss Limit — 1%</h3>
                <p className="mt-1 text-xs leading-normal text-text-secondary">
                  On Instant accounts, no single trade may lose more than 1% of the Initial Account Balance (${(account.size * 0.01).toLocaleString()}). This applies to both realized loss on a closed trade and floating loss while it is still open — if a trade&apos;s floating loss touches this limit at any point, the account fails immediately, even if that trade is later closed at a smaller loss or in profit.
                </p>
              </div>
            )}
            <div>
              <h3 className="text-sm font-semibold text-white">Minimum Holding Time - 3 Minutes</h3>
              <p className="mt-1 text-xs leading-normal text-text-secondary">
                Instant Funded and Funded trades must remain open for 180 seconds. The first lifetime violation receives a warning; the second fails the account.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white">Weekend Holding</h3>
              <p className="mt-1 text-xs leading-normal text-text-secondary">
                {account.weekendHoldingAddon
                  ? "The Weekend Holding add-on is active on this account, so positions may be held through the weekend closure. Every other risk rule still applies and you accept full weekend-gap risk."
                  : "Holding any position through the weekend closure is not allowed by default on any account type or stage. It is only permitted with the optional paid Weekend Holding add-on purchased at checkout."}
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white">6% Withdrawal Cap</h3>
              <p className="mt-1 text-xs leading-normal text-text-secondary">
                Gross withdrawals are capped at 6% of the initial account balance per payout period. Any excess profit stays in the account for a future eligible period.
              </p>
            </div>
          </div>
          <div className="dash-card p-5 flex gap-3">
            <IconInfoCircle size={22} className="text-neutral-400 mt-0.5 flex-shrink-0" />
            <div className="text-xs leading-normal">
              <h4 className="font-semibold text-white mb-1">Daily Drawdown Calculation</h4>
              <p className="text-text-secondary">
                The permitted daily loss is fixed from the initial account balance and resets at 00:00 UTC.
                Current Daily Loss equals closed losses recorded today plus current floating loss; both Balance and Equity are monitored, and profits do not increase the limit.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
