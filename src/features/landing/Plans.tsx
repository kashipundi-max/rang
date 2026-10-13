"use client";

import { useEffect, useMemo, useState } from "react";
import { IconArrowRight, IconCheck, IconCopy } from "@tabler/icons-react";
import { ComingSoonModal } from "@/components/ComingSoonModal";
import {
  CHALLENGE_RULES,
  FUNDED_DRAWDOWN_LIMITS,
  type ChallengeRuleKey,
  getChallengeRule,
} from "@/lib/rulebook";
import { cn } from "@/lib/utils";
import { CheckIcon, Container, SectionHeading, splitTitle } from "./ui";

type Platform = "MT5" | "MT4";

type CatalogPlan = {
  id: string;
  model: string;
  size: number;
  price: number;
  status?: string;
};

type CatalogCoupon = {
  code: string;
  discountPercent: number;
  status?: string;
  expiresAt?: string;
};

const PLATFORMS: { key: Platform; name: string }[] = [
  { key: "MT5", name: "MetaTrader 5" },
  { key: "MT4", name: "MetaTrader 4" },
];

const CHALLENGE_OPTIONS: {
  key: ChallengeRuleKey;
  label: string;
  eyebrow: string;
  description: string;
}[] = [
  {
    key: "one_step_pro",
    label: "One Step",
    eyebrow: "Fast evaluation",
    description: "One simulated evaluation target and a clear performance path.",
  },
  {
    key: "two_step_standard",
    label: "Two Step",
    eyebrow: "Classic challenge",
    description: "Two evaluation phases with balanced performance limits.",
  },
  {
    key: "instant_funding",
    label: "Instant",
    eyebrow: "Direct program",
    description: "Begin an advanced educational simulation under defined program guidelines.",
  },
];

function formatSize(size: number) {
  return size >= 1_000_000 ? `${size / 1_000_000}M` : `${size / 1000}K`;
}

function formatMoney(value: number) {
  return `$${value.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function formatPercent(value: number) {
  return value > 0 ? `${value}%` : "None";
}

function RuleRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex w-full items-center justify-between gap-2 px-2 py-1.5">
      <span className="truncate text-sm leading-5 text-(--brand-text-secondary)">{label}</span>
      <span className="text-right text-base leading-6 font-medium whitespace-nowrap text-(--brand-text-primary)">
        {value}
      </span>
    </div>
  );
}

function RuleCard({ title, rows }: { title: string; rows: { label: string; value: string }[] }) {
  return (
    <div className="flex min-w-0 flex-1 flex-col gap-3 rounded-md border border-(--brand-border-card) bg-[rgba(11,6,22,0.5)] p-4">
      <p className="text-sm leading-5 font-semibold text-(--brand-text-secondary)">{title}</p>
      <div className="flex w-full flex-col">
        {rows.map((row) => (
          <RuleRow key={row.label} {...row} />
        ))}
      </div>
    </div>
  );
}

/** Segmented two-option switch (platform picker). */
function PlatformTabs({
  value,
  onChange,
  className,
}: {
  value: Platform;
  onChange: (value: Platform) => void;
  className?: string;
}) {
  return (
    <div className={cn("relative flex w-50 items-stretch rounded-md border border-(--brand-border-card) bg-(--brand-primary-surface)", className)}>
      {PLATFORMS.map((platform) => {
        const active = platform.key === value;
        return (
          <button
            key={platform.key}
            type="button"
            onClick={() => onChange(platform.key)}
            className={cn(
              "relative flex h-11 flex-1 cursor-pointer items-center justify-center rounded-md px-3 py-2 text-base leading-6 font-semibold transition-colors",
              active ? "text-(--brand-text-secondary)" : "text-(--brand-text-muted) hover:text-(--brand-text-secondary)"
            )}
          >
            {active && <span className="skin-selected pointer-events-none absolute inset-0 rounded-md" />}
            <span className="relative z-10">{platform.key}</span>
          </button>
        );
      })}
    </div>
  );
}

/**
 * Two sections sharing one selection state:
 * "Choose your platform" (platform tiles + evaluation path cards) and the
 * plan configurator (path, size, rules and price summary). Prices and the
 * coupon come from the live catalog APIs. The biggest active coupon is
 * applied automatically, matching the dashboard Buy Challenge tab.
 */
export default function Plans() {
  const [challenge, setChallenge] = useState<ChallengeRuleKey>("two_step_standard");
  const [platform, setPlatform] = useState<Platform>("MT5");
  const [size, setSize] = useState(50000);
  const [modalOpen, setModalOpen] = useState(false);
  const [plans, setPlans] = useState<CatalogPlan[]>([]);
  const [coupon, setCoupon] = useState<CatalogCoupon | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const controller = new AbortController();

    async function load() {
      try {
        setLoading(true);
        setError("");
        const [planRes, couponRes] = await Promise.all([
          fetch("/api/pricing-plans", { cache: "no-store", signal: controller.signal }),
          fetch("/api/coupons", { cache: "no-store", signal: controller.signal }),
        ]);
        const [planBody, couponBody] = await Promise.all([planRes.json(), couponRes.json()]);

        if (!planRes.ok || !planBody.success || !Array.isArray(planBody.plans)) {
          throw new Error(planBody.error || "Unable to load pricing plans");
        }
        setPlans(planBody.plans);

        if (couponRes.ok && couponBody.success) {
          const now = Date.now();
          const best = (couponBody.coupons || [])
            .filter(
              (item: CatalogCoupon) =>
                item.status === "active" &&
                Number(item.discountPercent) > 0 &&
                (!item.expiresAt || new Date(item.expiresAt).getTime() > now)
            )
            .reduce(
              (top: CatalogCoupon | null, item: CatalogCoupon) =>
                !top || Number(item.discountPercent) > Number(top.discountPercent) ? item : top,
              null
            );
          setCoupon(best ? { ...best, code: String(best.code).toUpperCase() } : null);
        }
      } catch (err) {
        if ((err as Error).name !== "AbortError") {
          setError("Pricing is temporarily unavailable. Please try again shortly.");
        }
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }

    load();
    return () => controller.abort();
  }, []);

  useEffect(() => {
    if (!copied) return;
    const timer = window.setTimeout(() => setCopied(false), 1800);
    return () => window.clearTimeout(timer);
  }, [copied]);

  const availablePlans = useMemo(() => {
    const bySize = new Map<number, CatalogPlan>();
    plans
      .filter((plan) => String(plan.status || "active").toLowerCase() === "active")
      .filter((plan) => getChallengeRule(plan.model).key === challenge)
      .map((plan) => ({ ...plan, size: Number(plan.size), price: Number(plan.price) }))
      .filter((plan) => Number.isFinite(plan.size) && plan.size > 0 && Number.isFinite(plan.price) && plan.price >= 0)
      .sort((a, b) => a.size - b.size || a.price - b.price)
      .forEach((plan) => {
        if (!bySize.has(plan.size)) bySize.set(plan.size, plan);
      });
    return Array.from(bySize.values());
  }, [plans, challenge]);

  useEffect(() => {
    if (availablePlans.length > 0 && !availablePlans.some((plan) => plan.size === size)) {
      setSize(availablePlans[0].size);
    }
  }, [availablePlans, size]);

  const option = CHALLENGE_OPTIONS.find((item) => item.key === challenge) || CHALLENGE_OPTIONS[1];
  const rule = CHALLENGE_RULES[challenge];
  const activePlan = availablePlans.find((plan) => plan.size === size) || availablePlans[0];
  const shownSize = activePlan?.size ?? size;
  const discount = Number(coupon?.discountPercent || 0);
  const finalPrice = (price: number) => (coupon ? Math.ceil(price - price * (discount / 100)) : price);

  const evaluationRows = [
    { label: rule.phase2TargetPercent ? "Phase 1 objective" : "Main objective", value: formatPercent(rule.phase1TargetPercent) },
    { label: "Phase 2 objective", value: formatPercent(rule.phase2TargetPercent) },
    { label: "Daily limit", value: `${rule.dailyDrawdownPercent}%` },
    { label: "Overall limit", value: `${rule.overallDrawdownPercent}%` },
    { label: "Minimum trading days", value: rule.minTradingDaysEvaluation ? `${rule.minTradingDaysEvaluation} days` : "None" },
    { label: "Drawdown type", value: "Static" },
  ];

  const fundedRows = [
    { label: "Performance split", value: `${rule.profitSplitPercent}%` },
    { label: "Daily limit", value: `${FUNDED_DRAWDOWN_LIMITS.dailyDrawdownPercent}%` },
    { label: "Overall limit", value: `${FUNDED_DRAWDOWN_LIMITS.overallDrawdownPercent}%` },
    { label: "Days before first payout", value: `${rule.minTradingDaysFundedFirstPayout} days` },
    { label: "Weekend holding", value: rule.fundedWeekendHolding ? "Allowed" : "Add-on" },
    { label: "Platform", value: platform },
  ];

  const chooseChallenge = (key: ChallengeRuleKey) => {
    setChallenge(key);
    document.getElementById("evaluation-plans")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const copyCode = async () => {
    if (!coupon) return;
    try {
      await navigator.clipboard.writeText(coupon.code);
      setCopied(true);
    } catch {
      setCopied(false);
    }
  };

  return (
    <>
      {/* Choose your platform */}
      <section id="platforms" className="w-full scroll-mt-24 py-16 sm:py-24">
        <Container className="flex flex-col gap-10 sm:gap-16">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:gap-8">
            <div className="flex flex-col items-start gap-2 lg:gap-5 lg:whitespace-nowrap">
              <h2 className="text-4xl leading-[1.2] font-semibold tracking-[-0.02em] text-(--brand-text-primary) sm:text-5xl">
                Choose
                <br />
                <span className="skin-gradient-text">your platform</span>
              </h2>
              <p className="text-base leading-7 text-(--brand-text-secondary) sm:text-lg">
                Select your preferred platform before checkout.
              </p>
            </div>

            <div className="hidden flex-1 flex-row gap-5 self-stretch lg:flex">
              {PLATFORMS.map((item) => {
                const active = item.key === platform;
                return (
                  <button
                    key={item.key}
                    type="button"
                    onClick={() => setPlatform(item.key)}
                    className={cn(
                      "group relative flex flex-1 cursor-pointer flex-col gap-3 rounded-xl border border-(--brand-border-card) p-5 text-left transition-colors duration-200",
                      active ? "bg-(--brand-border-strong)" : "bg-(--brand-surface-card) hover:bg-[#1f1036]"
                    )}
                  >
                    <span className="flex flex-col gap-1">
                      <span className="font-heading text-xl font-semibold text-(--brand-text-primary) sm:text-2xl">{item.key}</span>
                      <span className="text-sm leading-5 text-(--brand-text-secondary)">{item.name}</span>
                    </span>
                    <span className="mt-auto inline-flex items-center gap-1 self-end rounded-full px-3 py-1.5 text-xs font-semibold text-(--brand-text-secondary) group-hover:text-(--brand-text-primary)">
                      {active ? "Selected" : "Select"}
                      <IconArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
                    </span>
                  </button>
                );
              })}
            </div>

            <div className="flex flex-col gap-3 lg:hidden">
              <PlatformTabs value={platform} onChange={setPlatform} />
              <div className="flex w-full rounded-xl bg-(--brand-surface-card) p-4">
                <p className="w-full text-sm leading-5 font-medium text-(--brand-text-secondary)">
                  {PLATFORMS.find((item) => item.key === platform)?.name}
                </p>
              </div>
            </div>
          </div>

          <div className="-mx-4 flex snap-x gap-3 overflow-x-auto px-4 pb-1 sm:mx-0 sm:px-0 lg:gap-5 lg:overflow-visible">
            {CHALLENGE_OPTIONS.map((item) => {
              const active = item.key === challenge;
              return (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => chooseChallenge(item.key)}
                  className={cn(
                    "relative flex w-[280px] shrink-0 snap-start cursor-pointer flex-col gap-3 rounded-xl border bg-linear-to-b from-(--brand-surface-card) to-(--brand-primary-surface) p-5 text-left transition-colors duration-300 hover:border-(--brand-border-strong) lg:w-auto lg:flex-1 lg:shrink",
                    active ? "border-(--brand-border-strong)" : "border-(--brand-border-card)"
                  )}
                >
                  {active && (
                    <span className="absolute top-4 right-4 rounded-md border border-(--brand-border-strong) bg-(--brand-border-strong) py-0.5 pr-1.5 pl-1.5 text-xs leading-[18px] font-medium text-(--brand-text-primary)">
                      Selected
                    </span>
                  )}
                  <span className="flex flex-col gap-1">
                    <span className="font-heading text-xl font-semibold text-(--brand-text-primary) sm:text-2xl">{item.label}</span>
                    <span className="text-sm leading-5 text-(--brand-text-secondary)">{item.description}</span>
                  </span>
                  <span className="flex flex-col gap-1.5">
                    {CHALLENGE_RULES[item.key].features.slice(0, 3).map((feature) => (
                      <span key={feature} className="flex items-start gap-1.5 text-xs leading-[18px] text-(--brand-text-muted)">
                        <CheckIcon className="mt-0.5 text-(--brand-check)" />
                        <span>{feature}</span>
                      </span>
                    ))}
                  </span>
                </button>
              );
            })}
          </div>
        </Container>
      </section>

      {/* Plan configurator */}
      <section id="evaluation-plans" className="pricing-section w-full scroll-mt-24 py-12 sm:py-16 lg:py-24">
        <Container>
          <div className="flex flex-col items-center gap-10">
            <SectionHeading
              align="start"
              lead={splitTitle("Compare structured skills-evaluation programs")[0]}
              accent={splitTitle("Compare structured skills-evaluation programs")[1]}
              description="Select an evaluation path, simulation level, and platform. Compare objectives and guidelines before enrolling."
            />

            <div className="flex w-full flex-col gap-4">
              <PlatformTabs value={platform} onChange={setPlatform} />

              {/* Evaluation path */}
              <div className="flex w-full gap-2 overflow-x-auto pb-1 md:grid md:grid-cols-3 md:overflow-visible md:pb-0">
                {CHALLENGE_OPTIONS.map((item) => {
                  const active = item.key === challenge;
                  return (
                    <button
                      key={item.key}
                      type="button"
                      onClick={() => setChallenge(item.key)}
                      className={cn(
                        "relative flex min-w-27 shrink-0 cursor-pointer flex-col items-start gap-1 rounded-md px-3 py-2.5 text-left transition-colors md:min-h-25 md:min-w-0 md:gap-2 md:rounded-xl md:p-5",
                        active ? "skin-selected-card" : "border border-transparent bg-(--brand-surface-card) hover:bg-[#1f1036]"
                      )}
                    >
                      <span className="font-heading text-base leading-6 font-semibold text-(--brand-accent-from) md:text-2xl md:leading-8">
                        {item.label}
                      </span>
                      <span className="hidden text-sm leading-5 text-(--brand-text-secondary) md:block">{item.eyebrow}</span>
                    </button>
                  );
                })}
              </div>

              {/* Simulation level */}
              <div className="grid w-full grid-cols-2 gap-2 sm:grid-cols-[repeat(auto-fit,minmax(140px,1fr))]">
                {loading &&
                  [0, 1, 2, 3].map((item) => (
                    <div key={item} className="h-[106px] rounded-md bg-(--brand-surface-card)" />
                  ))}

                {!loading && error && (
                  <div className="col-span-full rounded-md border border-red-400/20 bg-red-400/5 px-4 py-5 text-sm text-(--brand-text-secondary)">
                    {error}
                  </div>
                )}

                {!loading && !error && availablePlans.length === 0 && (
                  <div className="col-span-full rounded-md bg-(--brand-surface-card) px-4 py-5 text-sm text-(--brand-text-secondary)">
                    No active plans are currently available for this evaluation.
                  </div>
                )}

                {!loading &&
                  !error &&
                  availablePlans.map((plan) => {
                    const active = plan.size === shownSize;
                    return (
                      <button
                        key={plan.id}
                        type="button"
                        onClick={() => setSize(plan.size)}
                        className={cn(
                          "relative flex cursor-pointer flex-col items-start gap-3 rounded-md p-3 text-left transition-colors",
                          active ? "skin-selected-card" : "border border-transparent bg-(--brand-surface-card) hover:bg-[#1f1036]"
                        )}
                      >
                        <span className="flex flex-col items-start">
                          <span className="text-sm leading-5 font-semibold text-(--brand-text-secondary)">Account</span>
                          <span className="font-heading text-[30px] leading-[38px] font-semibold text-(--brand-text-primary)">
                            {formatSize(plan.size)}
                          </span>
                        </span>
                        <span className="flex w-full items-center gap-2 whitespace-nowrap">
                          <span className="text-xs leading-[18px] font-semibold text-(--brand-positive)">
                            {formatMoney(finalPrice(plan.price))}
                          </span>
                          {coupon && (
                            <span className="text-xs leading-[18px] font-medium text-(--brand-text-muted) line-through">
                              {formatMoney(plan.price)}
                            </span>
                          )}
                        </span>
                      </button>
                    );
                  })}
              </div>

              {/* Rules + summary */}
              <div className="relative isolate flex w-full flex-col gap-5 overflow-clip rounded-xl border border-(--brand-border-card) bg-(--brand-surface-card) bg-[radial-gradient(123.57%_123.06%_at_-14.36%_-21.59%,rgba(168,85,247,0.5)_0%,rgba(147,51,234,0.375)_25%,rgba(91,33,182,0.25)_50%,rgba(42,18,80,0.125)_75%,rgba(21,11,38,0)_100%)] p-4 lg:p-6">
                <div className="flex w-full flex-wrap items-center justify-between gap-4">
                  <p className="text-base leading-6 font-medium text-(--brand-text-secondary)">
                    {rule.displayName} Guidelines
                  </p>
                  {coupon && (
                  <div className="inline-flex items-center gap-2 rounded-full border border-(--brand-800) bg-[#1a0d2e] py-1 pr-1 pl-2">
                    <span className="text-xs leading-[18px] font-medium whitespace-nowrap text-[#d0a8ff]">
                      {`${discount}% off applied`}
                    </span>
                    <button
                      type="button"
                      onClick={copyCode}
                      aria-label={copied ? "Promo code copied" : `Copy promo code ${coupon.code}`}
                      className="inline-flex cursor-pointer items-center gap-1 rounded-full border border-(--brand-border-strong) bg-(--brand-surface-card) px-2 py-1 transition-colors hover:bg-[#1f1036]"
                    >
                      <span className="text-xs leading-[18px] font-semibold text-(--brand-text-secondary)">
                        {coupon.code}
                      </span>
                      {copied ? (
                        <IconCheck className="size-3.5 text-(--brand-text-secondary)" />
                      ) : (
                        <IconCopy className="size-3.5 text-(--brand-text-secondary)" />
                      )}
                    </button>
                  </div>
                  )}
                </div>

                <div className="flex w-full flex-col gap-4 lg:flex-row lg:items-stretch">
                  <div className="flex flex-1 flex-col gap-4 lg:flex-2 lg:flex-row lg:items-stretch">
                    <RuleCard title="Evaluation Rules" rows={evaluationRows} />
                    <RuleCard title="Funded & Reward Rules" rows={fundedRows} />
                  </div>

                  <div className="flex flex-1 flex-col items-start justify-center gap-4 self-stretch p-1 lg:p-5">
                    <div className="flex w-full flex-col items-start gap-3">
                      <div className="flex w-full flex-wrap items-center justify-between gap-2">
                        <p className="text-lg leading-7 font-semibold whitespace-nowrap text-(--brand-text-secondary)">
                          {option.label} {formatSize(shownSize)}
                        </p>
                        {activePlan && (
                          <div className="flex items-center gap-2 whitespace-nowrap">
                            {coupon && (
                              <span className="text-base leading-6 text-(--brand-text-muted) line-through">
                                {formatMoney(activePlan.price)}
                              </span>
                            )}
                            <span className="font-heading text-[30px] leading-9.5 font-semibold text-(--brand-text-primary)">
                              {formatMoney(finalPrice(activePlan.price))}
                            </span>
                          </div>
                        )}
                      </div>

                      <div className="h-px w-full bg-(--brand-border-card)" />

                      <div className="flex w-full flex-col gap-2">
                        <p className="text-sm leading-5 font-semibold text-(--brand-text-primary)">What&apos;s included</p>
                        {rule.features.map((feature) => (
                          <div key={feature} className="flex items-start gap-1.5 text-xs leading-[18px]">
                            <CheckIcon className="mt-0.5 text-(--brand-positive)" />
                            <span className="text-(--brand-text-secondary)">{feature}</span>
                          </div>
                        ))}
                      </div>

                      <div className="h-px w-full bg-(--brand-border-card)" />

                      <div className="flex w-full items-start justify-between gap-4 whitespace-nowrap">
                        <span className="flex-1 truncate text-base leading-6 font-semibold text-(--brand-text-primary)">
                          Total amount
                        </span>
                        <div className="flex flex-col items-end">
                          <span className="text-right text-lg leading-7 font-semibold text-(--brand-text-primary)">
                            {activePlan ? formatMoney(finalPrice(activePlan.price)) : "—"}
                          </span>
                          <span className="text-xs leading-4.5 font-medium text-(--brand-text-muted)">one-time fee</span>
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => setModalOpen(true)}
                      disabled={!activePlan || loading}
                      className="skin-btn-primary w-full"
                    >
                      <span className="relative">{loading ? "Loading prices..." : activePlan ? "Start Challenge" : "Unavailable"}</span>
                      {activePlan && !loading && <IconArrowRight className="relative size-5" />}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Container>

        <ComingSoonModal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          title="Evaluation checkout"
          description={`$${formatSize(shownSize)} ${option.label} ${platform} evaluation selected.${coupon ? ` Coupon ${coupon.code} gives ${discount}% off this account.` : ""} Sign in from the dashboard to complete checkout.`}
          ctaText="Open dashboard"
          ctaHref={`/dashboard?tab=buy${coupon ? `&coupon=${encodeURIComponent(coupon.code)}` : ""}`}
          ariaLabels={{
            closeButton: "Close evaluation checkout",
            contactButton: "Open dashboard",
          }}
        />
      </section>
    </>
  );
}
