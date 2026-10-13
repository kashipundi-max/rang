"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

export function SignInLink() {
  const t = useTranslations("SignUpPage.form");

  return (
    <p className="mt-6 text-center text-sm text-text-body font-dm-sans">
      {t("hasAccount")}{" "}
      <Link
        href="/auth/signin"
        className="text-brand-primary hover:text-brand-primary-light font-semibold transition-colors"
      >
        {t("signIn")}
      </Link>
    </p>
  );
}
