"use client";

import React from "react";
import { useTranslations } from "next-intl";

interface TableHeaderProps {
  plans: Array<{
    id: string;
    name: string;
    price: string;
    highlighted?: boolean;
  }>;
}

export function TableHeader({ plans }: TableHeaderProps) {
  const t = useTranslations("PricingPage");

  return (
    <div className="grid grid-cols-4 bg-bg-dark/50 border-b border-border-primary/20">
      <div className="p-4 md:p-6">
        <span className="text-text-body text-sm font-medium">
          {t("comparison.features")}
        </span>
      </div>
      {plans.map((plan) => (
        <div
          key={plan.id}
          className={`p-4 md:p-6 text-center border-s border-border-primary/20 ${
            plan.highlighted ? "bg-brand-primary/5" : ""
          }`}
        >
          <span
            className={`font-semibold ${
              plan.highlighted ? "text-brand-primary" : "text-text-primary"
            }`}
          >
            {plan.name}
          </span>
          <p className="text-text-body text-xs mt-1">{plan.price}</p>
        </div>
      ))}
    </div>
  );
}
