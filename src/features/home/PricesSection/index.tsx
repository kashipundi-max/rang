"use client";

import { useEffect, useMemo, useState, type ComponentType } from "react";
import {
  IconBolt,
  IconCheck,
  IconChevronRight,
  IconStack2,
  IconTargetArrow,
} from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { ComingSoonModal } from "@/components/ComingSoonModal";
import { GridSurface } from "@/components/GridSurface";
import {
  CHALLENGE_RULES,
  ChallengeRuleKey,
  getChallengeRule,
} from "@/lib/rulebook";
import { usePricingAnimation } from "./hooks/usePricingAnimation";

type Platform = "MT5" | "MT4";

type ChallengeOption = {
  key: ChallengeRuleKey;
  label: string;
  eyebrow: string;
  description: string;
  icon: ComponentType<{ className?: string }>;
};

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

const LANDING_COUPON_CODE = "RANGE60";

const challengeOptions: ChallengeOption[] = [
  {
    key: "one_step_pro",
    label: "One Step",
    eyebrow: "Fast evaluation",
    description: "One simulated evaluation target and a clear performance path.",
    icon: IconTargetArrow,
  },
  {
    key: "two_step_standard",
    label: "Two Step",
    eyebrow: "Classic challenge",
    description: "Two evaluation phases with balanced performance limits.",
    icon: IconStack2,
  },
  {
    key: "instant_funding",
    label: "Instant",
    eyebrow: "Direct program",
    description: "Begin an advanced educational simulation under defined program guidelines.",
    icon: IconBolt,
  },
];

const EYEBROW =
  "text-[11px] font-semibold uppercase tracking-[0.18em] text-brand-primary-light";

function formatAccountSize(size: number) {
  return `$${size >= 1000000 ? `${size / 1000000}M` : `${size / 1000}K`}`;
}

function formatPercent(value: number) {
  return value > 0 ? `${value}%` : "None";
}

export default function PricesSection() {
  const [selectedChallenge, setSelectedChallenge] =
    useState<ChallengeRuleKey>("two_step_standard");
  const [selectedPlatform, setSelectedPlatform] = useState<Platform>("MT5");
  const [selectedSize, setSelectedSize] = useState(50000);
  const [modalOpen, setModalOpen] = useState(false);
  const [catalogPlans, setCatalogPlans] = useState<CatalogPlan[]>([]);
  const [activeCoupon, setActiveCoupon] = useState<CatalogCoupon | null>(null);
  const [loadingPlans, setLoadingPlans] = useState(true);
  const [plansError, setPlansError] = useState("");
  const containerRef = usePricingAnimation();

  useEffect(() => {
    const controller = new AbortController();

    async function loadPricingPlans() {
      try {
        setLoadingPlans(true);
        setPlansError("");
        const [response, couponResponse] = await Promise.all([
          fetch("/api/pricing-plans", {
            cache: "no-store",
            signal: controller.signal,
          }),
          fetch("/api/coupons", {
            cache: "no-store",
            signal: controller.signal,
          }),
        ]);
        const [payload, couponPayload] = await Promise.all([
          response.json(),
          couponResponse.json(),
        ]);

        if (!response.ok || !payload.success || !Array.isArray(payload.plans)) {
          throw new Error(payload.error || "Unable to load pricing plans");
        }

        setCatalogPlans(payload.plans);
        if (couponResponse.ok && couponPayload.success) {
          const now = Date.now();
          const coupon = (couponPayload.coupons || []).find(
            (item: CatalogCoupon) =>
              item.code.toUpperCase() === LANDING_COUPON_CODE &&
              item.status === "active" &&
              (!item.expiresAt || new Date(item.expiresAt).getTime() > now)
          );
          setActiveCoupon(coupon || null);
        }
      } catch (error) {
        if ((error as Error).name !== "AbortError") {
          setPlansError("Pricing is temporarily unavailable. Please try again shortly.");
        }
      } finally {
        if (!controller.signal.aborted) setLoadingPlans(false);
      }
    }

    loadPricingPlans();
    return () => controller.abort();
  }, []);

  const activeCatalogPlans = useMemo(
    () =>
      catalogPlans.filter(
        (plan) => String(plan.status || "active").toLowerCase() === "active"
      ),
    [catalogPlans]
  );

  const availablePlans = useMemo(() => {
    const matchedPlans = activeCatalogPlans
      .filter((plan) => getChallengeRule(plan.model).key === selectedChallenge)
      .map((plan) => ({
        ...plan,
        size: Number(plan.size),
        price: Number(plan.price),
      }))
      .filter(
        (plan) =>
          Number.isFinite(plan.size) &&
          plan.size > 0 &&
          Number.isFinite(plan.price) &&
          plan.price >= 0
      )
      .sort((a, b) => a.size - b.size || a.price - b.price);

    const uniqueSizes = new Map<number, CatalogPlan>();
    matchedPlans.forEach((plan) => {
      if (!uniqueSizes.has(plan.size)) uniqueSizes.set(plan.size, plan);
    });
    return Array.from(uniqueSizes.values());
  }, [activeCatalogPlans, selectedChallenge]);

  useEffect(() => {
    if (
      availablePlans.length > 0 &&
      !availablePlans.some((plan) => plan.size === selectedSize)
    ) {
      setSelectedSize(availablePlans[0].size);
    }
  }, [availablePlans, selectedSize]);

  const activeOption = useMemo(
    () =>
      challengeOptions.find((option) => option.key === selectedChallenge) ||
      challengeOptions[1],
    [selectedChallenge]
  );
  const activeRule = CHALLENGE_RULES[activeOption.key];
  const activePlan =
    availablePlans.find((plan) => plan.size === selectedSize) ||
    availablePlans[0];
  const displayedSize = activePlan?.size ?? selectedSize;
  const discountPercent = Number(activeCoupon?.discountPercent || 0);
  const discountedPrice = (price: number) =>
    Math.ceil(price - price * (discountPercent / 100));

  const ruleStats = [
    {
      label: activeRule.phase2TargetPercent ? "Phase 1 objective" : "Main objective",
      value: formatPercent(activeRule.phase1TargetPercent),
    },
    {
      label: "Phase 2 objective",
      value: formatPercent(activeRule.phase2TargetPercent),
    },
    {
      label: "Daily limit",
      value: `${activeRule.dailyDrawdownPercent}%`,
    },
    {
      label: "Overall limit",
      value: `${activeRule.overallDrawdownPercent}%`,
    },
  ];

  return (
    <section id="evaluation-plans" className="landing-mode-section pricing-section relative bg-bg-dark py-10 sm:py-12 md:py-16 overflow-hidden">
      <div className="max-w-[95vw] sm:max-w-[90vw] md:max-w-[1180px] mx-auto px-4 sm:px-6 relative z-20">
        <div className="text-center max-w-3xl mx-auto mb-8 sm:mb-10">
          <span className="inline-flex items-center rounded-full border border-brand-primary/30 bg-brand-primary/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.22em] text-brand-primary-light">
            Evaluation Plans
          </span>
          <h2 className="mt-4 text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-clash-display font-normal text-text-primary tracking-normal leading-tight">
            Compare structured skills-evaluation programs
          </h2>
          <p className="mt-3 text-sm sm:text-base text-text-body font-dm-sans leading-relaxed">
            Select an evaluation path, simulation level, and platform. Compare
            objectives and guidelines before enrolling.
          </p>
        </div>

        <div ref={containerRef}>
          <GridSurface
            glow
            className="price-card-wrapper opacity-100 rounded-[24px] p-4 shadow-[0_24px_90px_rgba(0,0,0,0.35)] sm:p-5 md:p-6"
          >
            <div className="grid grid-cols-1 gap-4 sm:gap-5 lg:grid-cols-[0.9fr_1.1fr]">
            <GridSurface
              variant="inner"
              gridSize={22}
              className="flex flex-col border-card-highlight-border/60 p-5 sm:p-6"
            >
            <aside className="flex flex-col">
            <div className="flex flex-wrap items-center gap-2 mb-5">
              <span className="rounded-full bg-brand-primary/15 border border-brand-primary/30 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.16em] text-brand-primary-light">
                {activeOption.label}
              </span>
              <span className="rounded-full bg-white/5 border border-white/10 px-3 py-1 text-[11px] font-semibold text-text-body">
                {selectedPlatform}
              </span>
              <span className="rounded-full bg-white/5 border border-white/10 px-3 py-1 text-[11px] font-semibold text-text-body">
                {formatAccountSize(displayedSize)}
              </span>
            </div>

            <h3 className="text-2xl sm:text-[28px] font-clash-display font-semibold text-text-primary leading-tight">
              {activeRule.displayName} Guidelines
            </h3>
            <p className="mt-2 text-sm text-text-body leading-relaxed">
              {activeOption.description}
            </p>

            <div className="grid grid-cols-2 gap-3 mt-6">
              {ruleStats.map((stat) => (
                <div
                  key={stat.label}
                  className="rounded-[14px] border border-brand-primary/15 bg-black/30 px-4 py-3"
                >
                  <p className="text-[10px] uppercase tracking-[0.16em] text-text-muted">
                    {stat.label}
                  </p>
                  <p className="mt-1 font-clash-display text-lg font-semibold text-text-primary">
                    {stat.value}
                  </p>
                </div>
              ))}
            </div>

            <div className="mt-6 space-y-3 border-t border-brand-primary/10 pt-5">
              {activeRule.features.map((feature) => (
                <div key={feature} className="flex items-start gap-3">
                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-brand-primary/20 text-brand-primary-light">
                    <IconCheck className="h-3.5 w-3.5" />
                  </span>
                  <span className="text-sm text-text-body leading-relaxed">
                    {feature}
                  </span>
                </div>
              ))}
            </div>
            </aside>
            </GridSurface>

            <GridSurface
              variant="inner"
              gridSize={22}
              className="flex flex-col p-4 sm:p-5"
            >
            <div className="flex flex-col gap-4">
            <div>
            <p className={EYEBROW}>Evaluation path</p>
            <div className="mt-3 grid grid-cols-1 sm:grid-cols-3 gap-3">
              {challengeOptions.map((option) => {
                const isActive = option.key === selectedChallenge;
                const OptionIcon = option.icon;
                return (
                  <button
                    key={option.key}
                    type="button"
                    onClick={() => setSelectedChallenge(option.key)}
                    className={`group relative text-left rounded-[16px] border p-4 transition duration-200 ${
                      isActive
                        ? "border-brand-primary/60 bg-[linear-gradient(150deg,rgba(168,85,247,0.22),rgba(168,85,247,0.06))] shadow-[0_14px_40px_rgba(168,85,247,0.22)]"
                        : "border-brand-primary/15 bg-white/[0.02] hover:-translate-y-0.5 hover:border-brand-primary/35 hover:bg-white/[0.04]"
                    }`}
                  >
                    {isActive && (
                      <span className="absolute right-3 top-3 flex h-5 w-5 items-center justify-center rounded-full bg-brand-primary text-button-text">
                        <IconCheck className="h-3 w-3" />
                      </span>
                    )}
                    <span
                      className={`flex h-10 w-10 items-center justify-center rounded-xl border text-brand-primary-light transition ${
                        isActive
                          ? "border-brand-primary/50 bg-brand-primary/20"
                          : "border-brand-primary/25 bg-brand-primary/10"
                      }`}
                    >
                      <OptionIcon className="h-5 w-5" />
                    </span>
                    <p className="mt-3 font-clash-display text-base font-semibold text-text-primary">
                      {option.label}
                    </p>
                    <p className="mt-1 text-xs text-text-muted">
                      {option.eyebrow}
                    </p>
                  </button>
                );
              })}
            </div>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 rounded-[16px] border border-brand-primary/15 bg-white/[0.02] p-3.5">
              <div>
                <p className="text-sm font-semibold text-text-primary">
                  Simulation platform
                </p>
                <p className="text-xs text-text-muted">
                  Select your preferred platform before checkout.
                </p>
              </div>
              <div className="grid grid-cols-2 gap-1.5 rounded-xl border border-brand-primary/15 bg-black/30 p-1 sm:w-[210px]">
                {(["MT5", "MT4"] as Platform[]).map((platform) => (
                  <button
                    key={platform}
                    type="button"
                    onClick={() => setSelectedPlatform(platform)}
                    className={`rounded-lg px-4 py-2 text-sm font-semibold transition ${
                      selectedPlatform === platform
                        ? "bg-brand-primary text-button-text shadow-[0_8px_24px_rgba(168,85,247,0.25)]"
                        : "text-text-body hover:bg-white/5"
                    }`}
                  >
                    {platform}
                  </button>
                ))}
              </div>
            </div>

            <div>
            <p className={EYEBROW}>Simulation level</p>
            <div className="mt-3 space-y-2.5">
              {loadingPlans &&
                [0, 1, 2].map((item) => (
                  <div
                    key={item}
                    className="h-[74px] animate-pulse rounded-[16px] border border-brand-primary/12 bg-white/[0.03]"
                  />
                ))}

              {!loadingPlans && plansError && (
                <div className="rounded-[16px] border border-red-400/20 bg-red-400/5 px-4 py-5 text-sm text-text-body">
                  {plansError}
                </div>
              )}

              {!loadingPlans && !plansError && availablePlans.length === 0 && (
                <div className="rounded-[16px] border border-brand-primary/12 bg-white/[0.025] px-4 py-5 text-sm text-text-body">
                  No active plans are currently available for this evaluation.
                </div>
              )}

              {!loadingPlans && !plansError && availablePlans.map((plan) => {
                const isActive = plan.size === displayedSize;
                return (
                  <button
                    key={plan.id}
                    type="button"
                    onClick={() => setSelectedSize(plan.size)}
                    className={`w-full rounded-[16px] border px-4 py-3.5 text-left transition duration-200 ${
                      isActive
                        ? "border-brand-primary/55 bg-[linear-gradient(120deg,rgba(168,85,247,0.18),rgba(168,85,247,0.04))]"
                        : "border-brand-primary/12 bg-white/[0.02] hover:border-brand-primary/30 hover:bg-white/[0.04]"
                    }`}
                  >
                    <span className="flex items-center justify-between gap-4">
                      <span className="flex items-center gap-3">
                        <span
                          className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border ${
                            isActive
                              ? "border-brand-primary bg-brand-primary text-button-text"
                              : "border-white/25 text-transparent"
                          }`}
                        >
                          <IconCheck className="h-3 w-3" />
                        </span>
                        <span>
                          <span className="block text-sm font-semibold text-text-primary">
                            {formatAccountSize(plan.size)} Simulation
                          </span>
                          <span className="block text-xs text-text-muted">
                            {activeRule.profitSplitPercent}% performance level
                          </span>
                        </span>
                      </span>
                      <span className="text-right">
                        <span className="block font-clash-display text-lg font-semibold text-text-primary">
                          {activeCoupon && (
                            <span className="mr-2 text-sm font-medium text-text-muted line-through">
                              ${plan.price.toLocaleString()}
                            </span>
                          )}
                          ${(activeCoupon
                            ? discountedPrice(plan.price)
                            : plan.price
                          ).toLocaleString()}
                        </span>
                        <span className="block text-xs text-text-muted">
                          one-time fee
                        </span>
                      </span>
                    </span>
                  </button>
                );
              })}
            </div>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 rounded-[16px] border border-brand-primary/30 bg-[linear-gradient(120deg,rgba(168,85,247,0.20),rgba(168,85,247,0.05))] p-4">
              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-brand-primary-light">
                  Selected plan
                </p>
                <p className="mt-1 text-lg font-bold text-text-primary">
                  {formatAccountSize(displayedSize)} {activeOption.label} on{" "}
                  {selectedPlatform}
                </p>
                {activeCoupon && (
                  <p className="mt-1 text-xs font-semibold text-emerald-300">
                    {activeCoupon.code} applied · {discountPercent}% off every account type
                  </p>
                )}
              </div>
              <Button
                size="lg"
                onClick={() => setModalOpen(true)}
                disabled={!activePlan || loadingPlans}
                endIcon={<IconChevronRight className="h-4 w-4" />}
                className="w-full sm:w-auto"
              >
                {loadingPlans
                  ? "Loading prices..."
                  : activePlan
                    ? `Start for $${(
                        activeCoupon
                          ? discountedPrice(activePlan.price)
                          : activePlan.price
                      ).toLocaleString()}`
                    : "Unavailable"}
              </Button>
            </div>
            </div>
            </GridSurface>
            </div>
          </GridSurface>
        </div>

        <ComingSoonModal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          title="Evaluation checkout"
          description={`${formatAccountSize(displayedSize)} ${activeOption.label} ${selectedPlatform} evaluation selected.${activeCoupon ? ` Coupon ${activeCoupon.code} gives ${discountPercent}% off this account.` : ""} Sign in from the dashboard to complete checkout.`}
          ctaText="Open dashboard"
          ctaHref={`/dashboard?tab=buy${activeCoupon ? `&coupon=${encodeURIComponent(activeCoupon.code)}` : ""}`}
          ariaLabels={{
            closeButton: "Close evaluation checkout",
            contactButton: "Open dashboard",
          }}
        />
      </div>
    </section>
  );
}

