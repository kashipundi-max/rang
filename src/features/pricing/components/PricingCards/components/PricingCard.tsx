"use client";

import React from "react";
import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { CardHeader } from "./CardHeader";
import { PriceDisplay } from "./PriceDisplay";
import { SocialProof } from "./SocialProof";
import { FeatureList } from "./FeatureList";
import type { PlanType } from "../config";

interface PricingCardProps {
  plan: PlanType;
  isAnnual: boolean;
  price: number;
  index: number;
  isHovered: boolean;
  onHover: () => void;
  onLeave: () => void;
}

export function PricingCard({
  plan,
  isAnnual,
  price,
  index,
  isHovered,
  onHover,
  onLeave,
}: PricingCardProps) {
  const t = useTranslations("PricingPage");

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className="price-card-wrapper"
      onMouseEnter={onHover}
      onMouseLeave={onLeave}
    >
      <div
        className={cn(
          "relative p-px rounded-2xl h-full transition-all duration-300",
          plan.popular
            ? "bg-linear-to-b from-brand-primary/60 via-brand-primary/40 to-brand-primary/60 lg:scale-105 z-10"
            : "bg-linear-to-b from-border-primary/40 via-border-primary/20 to-border-primary/40",
          isHovered &&
            !plan.popular &&
            "from-brand-primary/30 via-brand-primary/20 to-brand-primary/30"
        )}
      >
        {/* Popular Badge */}
        {plan.popular && (
          <div className="absolute -top-4 inset-x-0 flex justify-center">
            <span className="px-4 py-1.5 text-xs font-semibold text-white bg-brand-primary rounded-full shadow-lg shadow-brand-primary/25">
              {t("cards.popular")}
            </span>
          </div>
        )}

        <div className="relative h-full rounded-[15px] bg-bg-card p-6 md:p-8 flex flex-col">
          <CardHeader plan={plan} planName={t(`cards.${plan.id}.name`)} />

          {/* Description */}
          <p className="text-text-body text-sm mb-6 leading-relaxed">
            {t(`cards.${plan.id}.description`)}
          </p>

          <PriceDisplay price={price} isAnnual={isAnnual} />
          <SocialProof companiesCount={plan.companies} />
          <FeatureList
            features={plan.features}
            notIncluded={plan.notIncluded}
            getFeatureLabel={(key) => t(`cards.${plan.id}.features.${key}`)}
            getNotIncludedLabel={(key) => t(`cards.features.${key}`)}
          />

          {/* CTA */}
          <Button
            href="/auth/signup"
            className={cn(
              "w-full py-6 text-base font-semibold transition-all duration-300",
              plan.popular
                ? "bg-brand-primary hover:bg-brand-primary-dark text-white shadow-lg shadow-brand-primary/25"
                : "bg-bg-dark hover:bg-bg-dark/80 text-text-primary border border-border-primary/30"
            )}
          >
            {t(`cards.${plan.id}.cta`)}
          </Button>
        </div>
      </div>
    </motion.div>
  );
}
