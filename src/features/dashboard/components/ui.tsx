import React from "react";

/*
 * Small building blocks for the dashboard's flat, bold layout: one panel
 * surface, one section label, one status chip and one progress bar, so every
 * tab reads the same way. Styling for .dash-panel / .dash-tile lives in
 * styles/surface.css.
 */

export function Panel({
  className = "",
  children,
  ...rest
}: React.HTMLAttributes<HTMLElement>) {
  return (
    <section className={`dash-panel ${className}`} {...rest}>
      {children}
    </section>
  );
}

/** Panel heading, optionally with a numbered step badge. */
export function SectionLabel({
  index,
  children,
  className = "",
  action,
}: {
  index?: number | string;
  children: React.ReactNode;
  className?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className={`flex items-center justify-between gap-3 ${className}`}>
      <h2 className="flex items-center gap-2.5 text-lg font-semibold text-white md:text-xl">
        {index !== undefined && (
          <span className="flex h-7 min-w-7 items-center justify-center rounded-lg bg-brand-primary/15 px-1.5 text-[13px] font-bold text-brand-primary">
            {index}
          </span>
        )}
        <span>{children}</span>
      </h2>
      {action}
    </div>
  );
}

/** Big page title + one line of help text. */
export function PageHeader({
  title,
  subtitle,
  actions,
}: {
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  actions?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
      <div className="min-w-0">
        <h1 className="text-xl font-semibold text-white md:text-2xl">{title}</h1>
        {subtitle && <p className="mt-1 text-sm text-white/50">{subtitle}</p>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2.5">{actions}</div>}
    </div>
  );
}

export type ChipTone = "neutral" | "success" | "warning" | "danger" | "info" | "brand";

const CHIP_TONES: Record<ChipTone, string> = {
  neutral: "border-white/15 bg-white/[0.06] text-white",
  success: "border-emerald-500/30 bg-emerald-500/10 text-emerald-400",
  warning: "border-amber-500/30 bg-amber-500/10 text-amber-300",
  danger: "border-rose-500/30 bg-rose-500/10 text-rose-400",
  info: "border-sky-500/30 bg-sky-500/10 text-sky-300",
  brand: "border-brand-primary/35 bg-brand-primary/10 text-brand-primary",
};

export function Chip({
  tone = "neutral",
  icon,
  children,
  className = "",
}: {
  tone?: ChipTone;
  icon?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span
      className={`inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-lg border px-2.5 py-1 text-[13px] font-semibold ${CHIP_TONES[tone]} ${className}`}
    >
      {icon}
      {children}
    </span>
  );
}

const BAR_TONES: Record<Exclude<ChipTone, "neutral">, string> = {
  success: "bg-emerald-500",
  warning: "bg-amber-400",
  danger: "bg-rose-500",
  info: "bg-sky-400",
  brand: "bg-brand-primary",
};

export function ProgressBar({
  percent,
  tone = "brand",
}: {
  percent: number;
  tone?: Exclude<ChipTone, "neutral">;
}) {
  const width = Math.min(100, Math.max(0, Number.isFinite(percent) ? percent : 0));
  return (
    <div className="h-2.5 w-full overflow-hidden rounded-full bg-white/[0.07]">
      <div className={`h-full rounded-full ${BAR_TONES[tone]}`} style={{ width: `${width}%` }} />
    </div>
  );
}

/** Uppercase label over a large bold value — the stat-strip cell. */
export function Stat({
  icon,
  label,
  value,
  valueClassName = "text-white",
  hint,
}: {
  icon?: React.ReactNode;
  label: React.ReactNode;
  value: React.ReactNode;
  valueClassName?: string;
  hint?: React.ReactNode;
}) {
  return (
    <div className="min-w-0 p-4 md:p-5">
      <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-white/50">
        {icon && <span className="text-brand-primary">{icon}</span>}
        <span className="truncate">{label}</span>
      </div>
      <div className={`mt-2 truncate text-2xl font-bold tabular-nums md:text-3xl ${valueClassName}`}>
        {value}
      </div>
      {hint && <div className="mt-2 text-[13px] text-text-muted">{hint}</div>}
    </div>
  );
}

export const formatMoney = (value: number, digits = 2) =>
  `$${(Number.isFinite(value) ? value : 0).toLocaleString(undefined, {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  })}`;
