import {
  IconBook2,
  IconChartBar,
  IconChartLine,
  IconCopy,
  IconHistory,
  IconLayoutGrid,
  IconLock,
  IconPlus,
  IconShare,
  IconShoppingCart,
  IconTrophy,
  IconWallet,
} from "@tabler/icons-react";
import { Logo } from "@/components/Logo";
import { CHALLENGE_RULES } from "@/lib/rulebook";
import { cn } from "@/lib/utils";

const NAV = [
  { label: "Dashboard", icon: IconLayoutGrid, active: true },
  { label: "My accounts", icon: IconChartBar },
  { label: "Buy challenge", icon: IconShoppingCart },
  { label: "Analytics", icon: IconChartLine },
  { label: "Trade log", icon: IconHistory },
  { label: "Rule book", icon: IconBook2 },
  { label: "Achievements", icon: IconTrophy },
  { label: "Withdraw", icon: IconWallet },
];

// Illustrative equity curve for the preview; not live account data.
const CURVE = [4, 9, 7, 14, 12, 19, 17, 24, 22, 30, 28, 36, 41, 38, 47, 52];

function EquityCurve() {
  const max = Math.max(...CURVE);
  const step = 100 / (CURVE.length - 1);
  const points = CURVE.map((v, i) => `${(i * step).toFixed(2)},${(40 - (v / max) * 34).toFixed(2)}`);
  const line = `M${points.join(" L")}`;

  return (
    <svg viewBox="0 0 100 40" preserveAspectRatio="none" className="h-full w-full" aria-hidden>
      <defs>
        <linearGradient id="dash-mock-fill" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="#a855f7" stopOpacity="0.35" />
          <stop offset="100%" stopColor="#a855f7" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={`${line} L100,40 L0,40 Z`} fill="url(#dash-mock-fill)" />
      <path d={line} fill="none" stroke="#a855f7" strokeWidth="0.6" vectorEffect="non-scaling-stroke" />
    </svg>
  );
}

/**
 * Static preview of the trader dashboard, framed as a browser window. Pure
 * markup (no screenshot), so it stays sharp and follows the rulebook numbers.
 */
export function DashboardMock({
  className,
  framed = true,
  sidebar = true,
}: {
  className?: string;
  framed?: boolean;
  /** Hide the nav column when the preview is rendered small. */
  sidebar?: boolean;
}) {
  const rule = CHALLENGE_RULES.two_step_standard;

  const body = (
    <div className="relative flex aspect-[1050/585] w-full overflow-hidden rounded-xl border border-[#22262f] bg-[#0a0514] text-left sm:rounded-2xl">
      {/* Sidebar */}
      <aside
        className={cn(
          "hidden w-[19%] shrink-0 flex-col gap-1 border-r border-(--brand-border-card) bg-[#0f0820] p-3",
          sidebar && "sm:flex"
        )}
      >
        <div className="mb-3 origin-left scale-75">
          <Logo size="sm" />
        </div>
        <p className="px-2 pb-1 text-[9px] font-semibold tracking-wider text-(--brand-text-muted) uppercase">Main</p>
        {NAV.map(({ label, icon: Icon, active }) => (
          <span
            key={label}
            className={cn(
              "flex items-center gap-2 truncate rounded-md px-2 py-1.5 text-[10px] font-medium whitespace-nowrap",
              active
                ? "bg-(--brand-border-card) text-(--brand-text-primary)"
                : "text-(--brand-text-secondary)"
            )}
          >
            <Icon size={12} stroke={1.8} className="shrink-0" />
            {label}
          </span>
        ))}
      </aside>

      {/* Main */}
      <div className="flex min-w-0 flex-1 flex-col gap-3 p-3 sm:p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[11px] font-semibold text-(--brand-text-primary) sm:text-sm">Dashboard</p>
            <p className="text-[9px] text-(--brand-text-muted) sm:text-[10px]">Welcome back, Trader</p>
          </div>
          <span className="rounded-full bg-linear-63 from-(--primary-800) to-(--brand-300) px-2.5 py-1 text-[9px] font-semibold text-white sm:text-[10px]">
            + New Challenge
          </span>
        </div>

        <div className="grid grid-cols-3 gap-2 sm:gap-3">
          {[
            { label: "Balance", value: "$104,812.40", delta: "+4.81%" },
            { label: "Equity", value: "$104,630.15", delta: "+4.63%" },
            { label: "Today", value: "+$1,240.55", delta: "+1.20%" },
          ].map((stat) => (
            <div key={stat.label} className="rounded-lg border border-(--brand-border-card) bg-(--brand-surface-card) p-2 sm:p-3">
              <p className="text-[9px] text-(--brand-text-muted) sm:text-[10px]">{stat.label}</p>
              <p className="mt-0.5 font-heading text-[11px] font-semibold text-(--brand-text-primary) sm:text-lg">{stat.value}</p>
              <p className="text-[9px] font-semibold text-(--brand-positive) sm:text-[10px]">{stat.delta}</p>
            </div>
          ))}
        </div>

        <div className="grid min-h-0 flex-1 grid-cols-3 gap-2 sm:gap-3">
          <div className="col-span-2 flex min-h-0 flex-col rounded-lg border border-(--brand-border-card) bg-(--brand-surface-card) p-2 sm:p-3">
            <div className="flex items-center justify-between">
              <p className="text-[10px] font-semibold text-(--brand-text-primary) sm:text-xs">Equity curve</p>
              <span className="rounded bg-(--brand-border-card) px-1.5 py-0.5 text-[8px] text-(--brand-text-secondary) sm:text-[9px]">
                {rule.displayName} · $100K
              </span>
            </div>
            <div className="mt-2 min-h-0 flex-1">
              <EquityCurve />
            </div>
          </div>

          <div className="flex min-h-0 flex-col gap-2 rounded-lg border border-(--brand-border-card) bg-(--brand-surface-card) p-2 sm:p-3">
            <p className="text-[10px] font-semibold text-(--brand-text-primary) sm:text-xs">Objectives</p>
            {[
              { label: "Profit target", value: `${rule.phase1TargetPercent}%`, pct: 60 },
              { label: "Daily limit", value: `${rule.dailyDrawdownPercent}%`, pct: 22 },
              { label: "Overall limit", value: `${rule.overallDrawdownPercent}%`, pct: 14 },
              { label: "Trading days", value: `${rule.minTradingDaysEvaluation}`, pct: 100 },
            ].map((row) => (
              <div key={row.label}>
                <div className="flex justify-between text-[8px] text-(--brand-text-secondary) sm:text-[10px]">
                  <span>{row.label}</span>
                  <span className="text-(--brand-text-primary)">{row.value}</span>
                </div>
                <div className="mt-1 h-1 overflow-hidden rounded-full bg-(--brand-border-card)">
                  <div className="h-full rounded-full bg-(--brand-300)" style={{ width: `${row.pct}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  if (!framed) return <div className={className}>{body}</div>;

  return (
    <div
      className={cn(
        "skin-glow-card relative rounded-2xl border border-(--brand-700) bg-(--brand-surface-card) p-2 sm:rounded-3xl sm:px-3 sm:py-1",
        className
      )}
    >
      <div className="skin-glow-inset" />
      <div className="relative flex items-center gap-2 p-2 sm:gap-4 sm:p-3">
        <div className="flex flex-1 items-center gap-1.5">
          <span className="size-2.5 rounded-full bg-[#ff5f57] sm:size-3" />
          <span className="size-2.5 rounded-full bg-[#febc2e] sm:size-3" />
          <span className="size-2.5 rounded-full bg-[#28c840] sm:size-3" />
        </div>
        <div className="flex min-w-0 items-center gap-1.5">
          <IconLock className="size-3.5 shrink-0 text-[#cecfd2] sm:size-4" />
          <span className="truncate text-xs leading-6 text-[#cdb8ea] sm:text-base">range4ex.com/dashboard</span>
        </div>
        <div className="flex flex-1 items-center justify-end gap-2 text-[#cecfd2]">
          <IconShare className="hidden size-4 sm:block" />
          <IconPlus className="hidden size-4 sm:block" />
          <IconCopy className="size-3.5 sm:size-4" />
        </div>
      </div>
      {body}
    </div>
  );
}
