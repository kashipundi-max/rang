"use client";

import { useTranslations } from "next-intl";
import { PricingPlan, FeatureCategory } from "../config/types";
import { plans, testimonials } from "../config/data";
import { PlanCard } from "./PlanCard";

interface PricingGridProps {
  containerRef: React.RefObject<HTMLDivElement | null>;
  selectedCategory: FeatureCategory | null;
  onSelectPlan: (plan: PricingPlan) => void;
}

export function PricingGrid({
  containerRef,
  selectedCategory,
  onSelectPlan,
}: PricingGridProps) {
  return (
    <div
      ref={containerRef}
      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-6 mx-auto max-w-6xl relative z-10"
    >
      {plans.map((plan, index) => (
        <div key={plan.name} className="price-card-wrapper opacity-0 h-full">
          <PlanCard
            plan={plan}
            index={index}
            testimonials={testimonials}
            selectedCategory={selectedCategory}
            onPurchase={() => onSelectPlan(plan)}
          />
        </div>
      ))}
    </div>
  );
}
