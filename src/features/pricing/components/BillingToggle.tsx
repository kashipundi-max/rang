"use client";

import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import { Toggle } from "@/components/ui/Toggle";
import { Button } from "@/components/ui/button";

interface BillingToggleProps {
  isAnnual: boolean;
  onToggle: (isAnnual: boolean) => void;
}

export function BillingToggle({ isAnnual, onToggle }: BillingToggleProps) {
  const t = useTranslations("PricingPage");

  return (
    <div className="flex items-center justify-center gap-4 mb-12">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => onToggle(false)}
        className={cn(
          "text-sm font-medium transition-colors duration-200",
          !isAnnual
            ? "text-text-primary"
            : "text-text-body hover:text-text-primary"
        )}
      >
        {t("billing.monthly")}
      </Button>

      {/* Toggle Switch */}
      <Toggle
        enabled={isAnnual}
        onToggle={onToggle}
        ariaLabel="Toggle billing period"
      />

      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onToggle(true)}
          className={cn(
            "text-sm font-medium transition-colors duration-200",
            isAnnual
              ? "text-text-primary"
              : "text-text-body hover:text-text-primary"
          )}
        >
          {t("billing.annual")}
        </Button>
        <span className="text-xs font-medium text-brand-primary bg-brand-primary/10 px-2 py-1 rounded-full">
          {t("billing.save")}
        </span>
      </div>
    </div>
  );
}
