"use client";

import React from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";

export function HeroButtons() {
  const t = useTranslations("HeroSection");

  return (
    <div
      className="flex flex-col sm:flex-row gap-3 sm:gap-3 items-stretch sm:items-center justify-start md:justify-center w-full md:max-w-[456px] mt-4 sm:mt-4"
    >
      <Button href="/auth/signup" className="w-full sm:w-auto">
        {t("cta")}
      </Button>
      <Button className="w-full sm:w-auto" variant="secondary">
        {t("ctaSecondary")}
      </Button>
    </div>
  );
}
