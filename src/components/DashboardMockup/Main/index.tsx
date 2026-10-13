"use client";

import {
  IconArrowUpRight,
  IconCheck,
  IconClock,
  IconServer,
  IconTrendingUp,
} from "@tabler/icons-react";
import { GradientBackground } from "./components/GradientBackground";

const mockAccount = {
  id: "487401",
  server: "Range4ex-Live01",
  phase: "Phase 1 (Evaluation)",
  model: "Two Step",
  status: "Passed",
  target: 8874.06,
  balance: 110925.08,
  equity: 110925.08,
  todayPl: 0,
  totalPl: 45292.68,
  split: 80,
};

const roadmapStages = [
  { number: 1, title: "Phase 1", state: "Current" },
  { number: 2, title: "Phase 2", state: "Locked" },
  { number: 3, title: "Funded Live", state: "Locked" },
];

const kpis = [
  {
    label: "Account Balance",
    value: `$${mockAccount.balance.toLocaleString()}`,
    detail: "Initial size: $100,000",
  },
  {
    label: "Equity",
    value: `$${mockAccount.equity.toLocaleString()}`,
    detail: "Live equity value",
  },
  {
    label: "Today's P&L",
    value: "+$0.00",
    detail: "Today's profit share",
    highlight: true,
  },
  {
    label: "Total P&L",
    value: `+$${mockAccount.totalPl.toLocaleString()}`,
    detail: "Overall phase return",
    highlight: true,
  },
];

const recentTrades = [
  { symbol: "XAUUSD", side: "Buy", pl: "+$2,140", status: "Closed" },
  { symbol: "EURUSD", side: "Sell", pl: "+$840", status: "Closed" },
  { symbol: "NAS100", side: "Buy", pl: "-$310", status: "Reviewed" },
];

export function Main() {
  return (
    <section className="flex-1 relative flex flex-col overflow-hidden">
      <GradientBackground />

      <div className="flex-1 overflow-hidden p-6 relative z-10 min-w-0">
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight text-white">
              Welcome Back, Alex
            </h1>
            <p className="mt-1 text-sm text-text-secondary">
              Here is your trading metrics summary for account{" "}
              <span className="font-mono font-semibold text-white">
                #{mockAccount.id}
              </span>
              .
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 rounded-lg border border-white/10 bg-neutral-900/70 px-3 py-2 font-mono text-xs text-neutral-300">
              <IconServer size={15} />
              {mockAccount.server}
            </div>
            <div className="flex items-center gap-2 rounded-lg border border-white/10 bg-neutral-900/70 px-3 py-2 font-mono text-xs text-neutral-300">
              <IconClock size={15} />
              {mockAccount.phase}
            </div>
          </div>
        </div>

        <div className="mb-6 rounded-2xl border border-white/10 bg-neutral-950/50 p-5 shadow-xl">
          <div className="flex items-center justify-between gap-6">
            <div className="flex min-w-0 flex-wrap items-center gap-3">
              <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-500">
                Stage
              </span>
              <h2 className="text-lg font-semibold text-white">
                {mockAccount.phase}
              </h2>
              <span className="h-5 w-px bg-white/10" />
              <span className="rounded-lg border border-white/10 bg-white/[0.04] px-3 py-1.5 font-mono text-[10px] font-bold uppercase tracking-wider text-neutral-300">
                {mockAccount.model}
              </span>
              <span className="rounded-lg border border-brand-primary/25 bg-brand-primary/10 px-3 py-1.5 font-mono text-[10px] font-bold uppercase text-brand-primary-light">
                {mockAccount.status}
              </span>
              <span className="rounded-lg border border-white/10 bg-white/[0.04] px-3 py-1.5 font-mono text-[10px] text-neutral-400">
                Target:{" "}
                <span className="font-bold text-white">
                  ${mockAccount.target.toLocaleString()}
                </span>
              </span>
            </div>

            <div className="flex items-center gap-2">
              {roadmapStages.map((stage, index) => {
                const isCurrent = index === 0;
                return (
                  <div key={stage.title} className="flex items-center gap-2">
                    {index > 0 && <span className="h-px w-8 bg-white/10" />}
                    <div
                      className={`flex items-center gap-2 rounded-xl border px-3 py-2 ${
                        isCurrent
                          ? "border-white/20 bg-white/[0.08]"
                          : "border-white/5 bg-neutral-900/50"
                      }`}
                    >
                      <span
                        className={`flex h-7 w-7 items-center justify-center rounded-lg border text-xs font-bold ${
                          isCurrent
                            ? "border-white/20 bg-white/10 text-white"
                            : "border-white/5 bg-neutral-950 text-neutral-500"
                        }`}
                      >
                        {stage.number}
                      </span>
                      <div className="leading-tight">
                        <span className="block text-sm font-semibold text-white">
                          {stage.title}
                        </span>
                        <span className="font-mono text-[9px] uppercase text-neutral-500">
                          {stage.state}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="mb-6 flex items-center justify-between gap-6 rounded-2xl border border-brand-primary/30 bg-brand-primary/10 p-5 shadow-[0_8px_40px_color-mix(in_srgb,var(--color-brand-primary)_14%,transparent)]">
          <div className="flex items-center gap-4">
            <span className="flex h-14 w-14 items-center justify-center rounded-full border border-brand-primary/30 bg-brand-primary/15 text-brand-primary">
              <IconCheck size={28} />
            </span>
            <div>
              <h3 className="text-xl font-semibold text-white">
                Evaluation Objectives Passed!
              </h3>
              <p className="mt-1 max-w-3xl text-sm leading-relaxed text-neutral-300">
                Profit target reached and all Phase 1 rules are complete. The
                trader is eligible to request a Phase 2 Verification account.
              </p>
            </div>
          </div>
          <button className="shrink-0 rounded-xl bg-white px-5 py-3 text-sm font-bold text-black shadow-lg">
            Request Phase 2 Account
          </button>
        </div>

        <div className="mb-6 grid grid-cols-4 gap-5">
          {kpis.map((kpi) => (
            <div
              key={kpi.label}
              className="rounded-2xl border border-white/5 bg-neutral-950/55 p-5 shadow-xl"
            >
              <div className="mb-6 flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-neutral-500">
                  {kpi.label}
                </span>
                {kpi.highlight && (
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-primary/10 text-brand-primary">
                    <IconArrowUpRight size={18} />
                  </span>
                )}
              </div>
              <div
                className={`text-3xl font-semibold tracking-tight ${
                  kpi.highlight ? "text-brand-primary" : "text-white"
                }`}
              >
                {kpi.value}
              </div>
              <p className="mt-2 text-xs uppercase tracking-wide text-neutral-500">
                {kpi.detail}
              </p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-[1fr_340px] gap-6">
          <div className="rounded-2xl border border-white/5 bg-neutral-950/55 p-5 shadow-xl">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-white">
                  Equity Curve
                </h3>
                <p className="text-xs text-neutral-500">
                  Mock progression for the landing page preview.
                </p>
              </div>
              <span className="flex items-center gap-1 rounded-full border border-brand-primary/20 bg-brand-primary/10 px-3 py-1 font-mono text-[10px] font-bold text-brand-primary">
                <IconTrendingUp size={14} />
                +10.9%
              </span>
            </div>
            <div className="h-[210px] min-w-0" aria-label="Account equity increased from $100,000 to $110,925">
              <svg
                viewBox="0 0 720 210"
                className="h-full w-full overflow-visible"
                role="img"
                aria-hidden="true"
                preserveAspectRatio="none"
              >
                <defs>
                  <linearGradient id="mockEquity" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="5%" stopColor="var(--color-brand-primary)" stopOpacity="0.35" />
                    <stop offset="95%" stopColor="var(--color-brand-primary)" stopOpacity="0" />
                  </linearGradient>
                </defs>
                {[42, 84, 126, 168].map((y) => (
                  <line
                    key={y}
                    x1="0"
                    x2="720"
                    y1={y}
                    y2={y}
                    stroke="rgba(255,255,255,0.06)"
                    vectorEffect="non-scaling-stroke"
                  />
                ))}
                <path
                  d="M 0 176 C 70 170, 102 157, 144 153 S 245 130, 288 125 S 385 96, 432 94 S 532 62, 576 57 S 670 30, 720 24 L 720 210 L 0 210 Z"
                  fill="url(#mockEquity)"
                />
                <path
                  d="M 0 176 C 70 170, 102 157, 144 153 S 245 130, 288 125 S 385 96, 432 94 S 532 62, 576 57 S 670 30, 720 24"
                  fill="none"
                  stroke="var(--color-brand-primary)"
                  strokeWidth="3"
                  strokeLinecap="round"
                  vectorEffect="non-scaling-stroke"
                />
                <circle cx="720" cy="24" r="5" fill="var(--color-brand-primary)" />
              </svg>
            </div>
          </div>

          <div className="rounded-2xl border border-white/5 bg-neutral-950/55 p-5 shadow-xl">
            <h3 className="text-lg font-semibold text-white">Recent Trades</h3>
            <div className="mt-4 space-y-3">
              {recentTrades.map((trade) => (
                <div
                  key={trade.symbol}
                  className="flex items-center justify-between rounded-xl border border-white/5 bg-neutral-900/55 p-3"
                >
                  <div>
                    <span className="block text-sm font-bold text-white">
                      {trade.symbol}
                    </span>
                    <span className="font-mono text-[10px] uppercase text-neutral-500">
                      {trade.side} / {trade.status}
                    </span>
                  </div>
                  <span
                    className={`font-mono text-sm font-bold ${
                      trade.pl.startsWith("+")
                        ? "text-brand-primary"
                        : "text-rose-300"
                    }`}
                  >
                    {trade.pl}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Main;
