"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

export function SignUpLink() {
  const t = useTranslations("SignInPage.form");

  return (
    <p className="mt-8 text-center text-sm text-white/50">
      {t("noAccount")}{" "}
      <Link
        href="/auth/signup"
        className="font-semibold text-white transition-opacity hover:opacity-80"
      >
        {t("signUp")}
      </Link>
    </p>
  );
}
