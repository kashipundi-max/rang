"use client";

import { useTranslations } from "next-intl";

interface FormHeaderProps {
  className?: string;
}

export function FormHeader({ className }: FormHeaderProps) {
  const t = useTranslations("SignInPage.form");

  return (
    <div className={className}>
      <h1 className="text-2xl sm:text-3xl font-clash-display font-medium text-text-primary mb-2">
        {t("title")}
      </h1>
      <p className="text-text-body/90 font-dm-sans text-sm">{t("subtitle")}</p>
    </div>
  );
}
