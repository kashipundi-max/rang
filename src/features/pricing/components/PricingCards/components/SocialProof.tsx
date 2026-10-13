"use client";

import React from "react";
import { useTranslations } from "next-intl";
import { AnimatedTooltip } from "@/components/ui/AnimatedTooltip";
import { testimonials } from "../config";

interface SocialProofProps {
  companiesCount: string;
}

export function SocialProof({ companiesCount }: SocialProofProps) {
  const t = useTranslations("PricingPage");

  return (
    <div className="flex items-center gap-3 mb-6 pb-6 border-b border-border-primary/20">
      <div className="flex -space-x-2">
        <AnimatedTooltip items={testimonials.slice(0, 3)} />
      </div>
      <span className="text-text-body text-sm">
        {t("cards.usedBy", { count: companiesCount })}
      </span>
    </div>
  );
}
