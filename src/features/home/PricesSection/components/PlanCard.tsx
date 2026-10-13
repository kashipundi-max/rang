"use client";

import { useTranslations } from "next-intl";
import { PricingCard, PricingFeature } from "@/components/PricingCard";
import { PricingPlan, FeatureCategory } from "../config/types";
import { Testimonial } from "../config/types";

interface PlanCardProps {
  plan: PricingPlan;
  index: number;
  testimonials: Testimonial[];
  selectedCategory: FeatureCategory | null;
  onPurchase: () => void;
}

export function PlanCard({
  plan,
  testimonials,
  selectedCategory,
  onPurchase,
}: PlanCardProps) {
  const t = useTranslations("PricesSection");

  // Filter features by selected category and transform to PricingFeature format
  const getFeatures = (): PricingFeature[] => {
    const filteredFeatures = selectedCategory
      ? plan.features.filter((feature) => feature.category === selectedCategory)
      : plan.features;

    return filteredFeatures.map((feature) => ({
      key: feature.textKey,
      label: t(`plans.${plan.id}.features.${feature.textKey}`),
      highlighted: feature.highlighted,
      tooltip: feature.tooltip,
    }));
  };

  return (
    <PricingCard
      id={plan.id}
      name={t(`plans.${plan.id}.name`)}
      description={t(`plans.${plan.id}.description`)}
      price={plan.price}
      priceSuffix={t("perMonth")}
      billingNote={t("billingNote")}
      featured={plan.featured}
      badge={plan.badge ? t(`plans.${plan.id}.badge`) : null}
      ctaText={t(`plans.${plan.id}.cta`)}
      onCtaClick={onPurchase}
      companiesCount={plan.companies}
      socialProofText={t("usedByTeams", { count: plan.companies })}
      features={getFeatures()}
      featuresTitle={t("whatsIncluded")}
      testimonials={testimonials}
    />
  );
}
