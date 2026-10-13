"use client";

import React from "react";
import { useTranslations } from "next-intl";

export function FormHeader() {
  const t = useTranslations("ContactSection.form");

  return (
    <div className="relative z-10 mb-8">
      <h3 className="text-2xl sm:text-3xl font-clash-display font-normal text-text-primary mb-3">
        {t("title")}
      </h3>
      <p className="text-text-body/90 font-dm-sans text-sm sm:text-base leading-relaxed">
        {t("subtitle")}
      </p>
    </div>
  );
}
