"use client";

import { useTranslations, useLocale } from "next-intl";
import { Link } from "@/i18n/navigation";
import { IconArrowLeft } from "@tabler/icons-react";

export function BackToSignInLink() {
  const t = useTranslations("ForgotPasswordPage.form");
  const locale = useLocale();
  const isRTL = locale === "ar";

  return (
    <div className="mt-6 text-center">
      <Link
        href="/auth/signin"
        className="inline-flex items-center gap-2 text-sm text-text-secondary hover:text-brand-primary transition-colors"
      >
        <IconArrowLeft className={`w-4 h-4 ${isRTL ? "rotate-180" : ""}`} />
        <span>{t("backToSignIn")}</span>
      </Link>
    </div>
  );
}

export default BackToSignInLink;
