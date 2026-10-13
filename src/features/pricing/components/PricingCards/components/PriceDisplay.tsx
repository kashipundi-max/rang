"use client";

import React from "react";
import { useTranslations } from "next-intl";

interface PriceDisplayProps {
  price: number;
  isAnnual: boolean;
}

export function PriceDisplay({ price, isAnnual }: PriceDisplayProps) {
  const t = useTranslations("PricingPage");

  return (
    <div className="mb-6">
      <div className="flex items-end gap-1">
        <span className="text-4xl md:text-5xl font-bold text-text-primary font-clash-display">
          ${price}
        </span>
        <span className="text-text-body text-sm mb-2">
          /{isAnnual ? t("billing.year") : t("billing.month")}
        </span>
      </div>
      {isAnnual && (
        <p className="text-brand-primary text-sm mt-1">
          {t("billing.annualNote", { months: 2 })}
        </p>
      )}
    </div>
  );
}
