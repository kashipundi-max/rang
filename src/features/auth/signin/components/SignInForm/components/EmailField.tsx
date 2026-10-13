"use client";

import { useTranslations } from "next-intl";
import { Input } from "@/components/ui/input/Input";
import type { FieldErrors, UseFormRegister } from "react-hook-form";
import type { SignInFormData } from "../../../config/schema";

interface EmailFieldProps {
  register: UseFormRegister<SignInFormData>;
  errors: FieldErrors<SignInFormData>;
}

export function EmailField({ register, errors }: EmailFieldProps) {
  const t = useTranslations("SignInPage.form");

  return (
    <Input
      id="email"
      type="email"
      aria-label={t("email.label")}
      placeholder={t("email.placeholder")}
      error={errors.email?.message}
      autoComplete="email"
      required
      {...register("email")}
    />
  );
}
