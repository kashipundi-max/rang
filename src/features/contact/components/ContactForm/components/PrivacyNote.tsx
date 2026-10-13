"use client";

import React from "react";
import { useTranslations } from "next-intl";

export function PrivacyNote() {
  const t = useTranslations("ContactSection.form");

  return (
    <p className="text-xs text-text-body/70 text-center font-dm-sans pt-2">
      {t("privacyNote")}
    </p>
  );
}
