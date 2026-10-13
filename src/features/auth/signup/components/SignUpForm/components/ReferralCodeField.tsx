"use client";

import { useTranslations } from "next-intl";
import { IconGift } from "@tabler/icons-react";
import { Input } from "@/components/ui/input/Input";
import type { FieldErrors, UseFormRegister } from "react-hook-form";
import type { SignUpFormData } from "@/features/auth/signup/config/schema";

interface ReferralCodeFieldProps {
  register: UseFormRegister<SignUpFormData>;
  errors: FieldErrors<SignUpFormData>;
}

export function ReferralCodeField({ register, errors }: ReferralCodeFieldProps) {
  const t = useTranslations("SignUpPage.form");

  return (
    <Input
      id="referralCode"
      type="text"
      label={t("referralCode.label")}
      placeholder={t("referralCode.placeholder")}
      startIcon={<IconGift className="w-5 h-5" />}
      error={errors.referralCode?.message}
      autoComplete="off"
      {...register("referralCode")}
    />
  );
}
