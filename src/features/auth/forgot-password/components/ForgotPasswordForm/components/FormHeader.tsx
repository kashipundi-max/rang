"use client";

import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";

interface FormHeaderProps {
  className?: string;
}

export function FormHeader({ className }: FormHeaderProps) {
  const t = useTranslations("ForgotPasswordPage.form");

  return (
    <div className={cn("space-y-2", className)}>
      <h2 className="text-2xl sm:text-3xl font-bold text-text-primary">
        {t("title")}
      </h2>
      <p className="text-text-secondary text-sm sm:text-base">
        {t("subtitle")}
      </p>
    </div>
  );
}

export default FormHeader;
