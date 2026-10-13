"use client";

import { useTranslations } from "next-intl";
import { plans, testimonials } from "./config";
import { PricingCard, PricingFeature } from "@/components/PricingCard";

interface PricingCardsProps {
  isAnnual: boolean;
}

export function PricingCards({ isAnnual }: PricingCardsProps) {
  const t = useTranslations("PricingPage");

  const calculatePrice = (basePrice: number) => {
    if (isAnnual) {
      return Math.round(basePrice * 10); // 2 months free
    }
    return basePrice;
  };

  // Transform plan features to PricingFeature format
  const transformFeatures = (
    planId: string,
    features: string[]
  ): PricingFeature[] => {
    return features.map((key) => ({
      key,
      label: t(`cards.${planId}.features.${key}`),
    }));
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 max-w-6xl mx-auto mb-20">
      {plans.map((plan) => (
        <div key={plan.id} className="price-card-wrapper h-full">
          <PricingCard
            id={plan.id}
            name={t(`cards.${plan.id}.name`)}
            description={t(`cards.${plan.id}.description`)}
            price={calculatePrice(plan.price)}
            priceSuffix={isAnnual ? t("cards.perYear") : t("cards.perMonth")}
            billingNote={isAnnual ? t("cards.billedAnnually") : undefined}
            featured={plan.popular}
            badge={plan.popular ? t("cards.popular") : null}
            ctaText={t(`cards.${plan.id}.cta`)}
            ctaHref="/auth/signup"
            companiesCount={plan.companies}
            socialProofText={t("cards.usedByTeams", { count: plan.companies })}
            features={transformFeatures(plan.id, plan.features)}
            featuresTitle={t("cards.whatsIncluded")}
            testimonials={testimonials}
          />
        </div>
      ))}
    </div>
  );
}
