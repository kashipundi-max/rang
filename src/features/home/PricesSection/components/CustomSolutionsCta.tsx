"use client";

import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";

export function CustomSolutionsCta() {
  const t = useTranslations("PricesSection");

  return (
    <div className="mt-8 sm:mt-10 md:mt-13 px-4 sm:px-8 md:px-15 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 sm:gap-6 relative z-10">
      <div className="flex-1">
        <h4 className="text-white text-lg sm:text-xl font-bold mb-2 sm:mb-3 font-clash-display">
          {t("customSolutions.title")}
        </h4>
        <p className="text-gray-200 max-w-full sm:max-w-xl text-sm sm:text-base mb-4 sm:mb-6 font-dm-sans">
          {t("customSolutions.description")}
        </p>
      </div>
      <Button variant="outline" className="w-full sm:w-auto shrink-0">
        {t("customSolutions.cta")}
      </Button>
    </div>
  );
}
