"use client";



import { useEffect, useState } from "react";
import {
  IconArrowUpRight,
  IconLock,
  IconMailCheck,
  IconShieldCheck,
  IconTrendingUp,
} from "@tabler/icons-react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

export type AuthShowcaseType = "signin" | "signup" | "forgot" | "verify";

const signupData = [
  { label: "Mon", value: 42 },
  { label: "Tue", value: 58 },
  { label: "Wed", value: 71 },
  { label: "Thu", value: 86 },
  { label: "Fri", value: 96 },
  { label: "Sat", value: 118 },
];

const signinData = [
  { label: "00", value: 96 },
  { label: "04", value: 98 },
  { label: "08", value: 99 },
  { label: "12", value: 99.2 },
  { label: "16", value: 99.6 },
  { label: "20", value: 99.9 },
];

const forgotData = [
  { label: "1m", value: 35 },
  { label: "2m", value: 52 },
  { label: "3m", value: 76 },
  { label: "4m", value: 88 },
  { label: "5m", value: 94 },
  { label: "6m", value: 98 },
];

const verifyData = [
  { label: "ID", value: 28 },
  { label: "Face", value: 55 },
  { label: "Risk", value: 78 },
  { label: "Review", value: 91 },
  { label: "Done", value: 100 },
];

const showcaseConfig = {
  signup: {
    badge: "Account Growth",
    title: "Start your funded",
    accent: "trading path.",
    description: "Create your profile, complete verification, and choose a challenge account when you are ready.",
    stat: "$200K",
    statLabel: "max account size",
    trend: "+118%",
    icon: IconTrendingUp,
    data: signupData,
    chart: "area",
  },
  signin: {
    badge: "Secure Access",
    title: "Return to your",
    accent: "trader dashboard.",
    description: "Monitor accounts, phase progress, payout requests, and platform credentials from one console.",
    stat: "99.9%",
    statLabel: "session uptime",
    trend: "Live",
    icon: IconShieldCheck,
    data: signinData,
    chart: "line",
  },
  forgot: {
    badge: "Password Recovery",
    title: "Recover access",
    accent: "without friction.",
    description: "Reset your console password and return to your account with a clean, secure recovery flow.",
    stat: "6 min",
    statLabel: "avg recovery",
    trend: "Secure",
    icon: IconLock,
    data: forgotData,
    chart: "bar",
  },
  verify: {
    badge: "Email Verification",
    title: "Confirm identity",
    accent: "and continue.",
    description: "Verification keeps the account owner, trading access, and payout profile aligned.",
    stat: "100%",
    statLabel: "verification path",
    trend: "Ready",
    icon: IconMailCheck,
    data: verifyData,
    chart: "area",
  },
} as const;

function ShowcaseChart({ type }: { type: AuthShowcaseType }) {
  const config = showcaseConfig[type];
  const gradientId = `authShowcaseGradient-${type}`;

  const tooltipStyle = {
    backgroundColor: "var(--color-bg-dark)",
    border: "1px solid color-mix(in srgb, var(--color-brand-primary) 28%, transparent)",
    borderRadius: "10px",
    color: "var(--color-text-primary)",
    fontSize: "12px",
  };

  if (config.chart === "bar") {
    return (
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={config.data} margin={{ top: 8, right: 8, left: -24, bottom: 0 }}>
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--color-brand-primary-light)" stopOpacity={0.9} />
              <stop offset="100%" stopColor="var(--color-brand-primary)" stopOpacity={0.25} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke="rgba(255,255,255,0.06)" vertical={false} />
          <XAxis dataKey="label" tickLine={false} axisLine={false} tick={{ fill: "rgba(255,255,255,0.45)", fontSize: 11 }} />
          <YAxis hide domain={[0, 100]} />
          <Tooltip contentStyle={tooltipStyle} cursor={{ fill: "rgba(255,255,255,0.04)" }} formatter={(value: number) => [`${value}%`, "Progress"]} />
          <Bar dataKey="value" fill={`url(#${gradientId})`} radius={[8, 8, 3, 3]} />
        </BarChart>
      </ResponsiveContainer>
    );
  }

  if (config.chart === "line") {
    return (
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={config.data} margin={{ top: 8, right: 10, left: -24, bottom: 0 }}>
          <CartesianGrid stroke="rgba(255,255,255,0.06)" vertical={false} />
          <XAxis dataKey="label" tickLine={false} axisLine={false} tick={{ fill: "rgba(255,255,255,0.45)", fontSize: 11 }} />
          <YAxis hide domain={[95, 100]} />
          <Tooltip contentStyle={tooltipStyle} formatter={(value: number) => [`${value}%`, "Uptime"]} />
          <Line
            type="monotone"
            dataKey="value"
            stroke="var(--color-brand-primary-light)"
            strokeWidth={3}
            dot={{ r: 3, fill: "var(--color-brand-primary-light)", strokeWidth: 0 }}
            activeDot={{ r: 5 }}
          />
        </LineChart>
      </ResponsiveContainer>
    );
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={config.data} margin={{ top: 8, right: 10, left: -24, bottom: 0 }}>
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--color-brand-primary-light)" stopOpacity={0.42} />
            <stop offset="100%" stopColor="var(--color-brand-primary)" stopOpacity={0.02} />
          </linearGradient>
        </defs>
        <CartesianGrid stroke="rgba(255,255,255,0.06)" vertical={false} />
        <XAxis dataKey="label" tickLine={false} axisLine={false} tick={{ fill: "rgba(255,255,255,0.45)", fontSize: 11 }} />
        <YAxis hide domain={[0, "dataMax + 8"]} />
        <Tooltip contentStyle={tooltipStyle} formatter={(value: number) => [value, "Score"]} />
        <Area
          type="monotone"
          dataKey="value"
          stroke="var(--color-brand-primary-light)"
          strokeWidth={3}
          fill={`url(#${gradientId})`}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}

export function AuthShowcase({ type }: { type: AuthShowcaseType }) {

  const config = showcaseConfig[type];
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <aside className="relative flex h-full w-full flex-col justify-center">
      <div className="max-w-xl">
        <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.035] p-5 shadow-[0_24px_80px_rgba(0,0,0,0.24)]">
          <div className="mb-5 flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-text-muted">
                Console Activity
              </p>
              <div className="mt-2 flex items-end gap-3">
                <span className="text-4xl font-black text-white">{config.stat}</span>
                <span className="pb-1 text-sm text-text-body">{config.statLabel}</span>
              </div>
            </div>
            <div className="inline-flex items-center gap-1 rounded-full border border-brand-primary/20 bg-brand-primary/10 px-3 py-1 text-xs font-bold text-brand-primary-light">
              {config.trend}
              <IconArrowUpRight className="h-3.5 w-3.5" />
            </div>
          </div>

          <div className="h-[230px] min-h-[230px] w-full">
            {mounted && <ShowcaseChart type={type} />}
          </div>
        </div>
      </div>
    </aside>
  );
}
