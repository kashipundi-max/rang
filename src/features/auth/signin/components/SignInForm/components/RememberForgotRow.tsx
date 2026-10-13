"use client";

import { useTranslations } from "next-intl";
import { Checkbox } from "@/components/ui/Checkbox";
import { Link } from "@/i18n/navigation";

interface RememberForgotRowProps {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
}

export function RememberForgotRow({
  checked,
  onCheckedChange,
}: RememberForgotRowProps) {
  const t = useTranslations("SignInPage.form");

  return (
    <div className="flex items-center justify-between">
      <Checkbox
        id="rememberMe"
        checked={checked}
        onCheckedChange={onCheckedChange}
        label={t("rememberMe")}
      />
      <Link
        href="/auth/forgot-password"
        className="text-sm text-white/70 transition-all hover:text-white hover:underline"
      >
        {t("forgotPassword")}
      </Link>
    </div>
  );
}
