"use client";

import { useTranslations } from "next-intl";
import { IconMail } from "@tabler/icons-react";
import { Input } from "@/components/ui/input/Input";
import type { FieldErrors, UseFormRegister } from "react-hook-form";
import type { SignUpFormData } from "@/features/auth/signup/config/schema";

interface EmailFieldProps {
  register: UseFormRegister<SignUpFormData>;
  errors: FieldErrors<SignUpFormData>;
}

export function EmailField({ register, errors }: EmailFieldProps) {
  const t = useTranslations("SignUpPage.form");

  return (
    <Input
      id="email"
      type="email"
      label={t("email.label")}
      placeholder={t("email.placeholder")}
      startIcon={<IconMail className="w-5 h-5" />}
      error={errors.email?.message}
      autoComplete="email"
      required
      {...register("email")}
    />
  );
}
