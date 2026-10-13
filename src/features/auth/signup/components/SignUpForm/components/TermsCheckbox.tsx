"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Checkbox } from "@/components/ui/Checkbox";
import type { FieldErrors } from "react-hook-form";
import type { SignUpFormData } from "../types";

interface TermsCheckboxProps {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  error?: FieldErrors<SignUpFormData>["terms"];
}

export function TermsCheckbox({
  checked,
  onCheckedChange,
  error,
}: TermsCheckboxProps) {
  const t = useTranslations("SignUpPage.form");

  return (
    <Checkbox
      id="terms"
      checked={checked}
      onCheckedChange={(value) => onCheckedChange(value === true)}
      error={error?.message}
      label={
        <>
          {t("terms.label")}{" "}
          <Link
            href="/legal/terms"
            className="text-brand-primary hover:text-brand-primary-light underline"
          >
            {t("terms.link")}
          </Link>
        </>
      }
    />
  );
}
