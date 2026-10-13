"use client";

import { useTranslations } from "next-intl";
import { Input } from "@/components/ui/input/Input";
import type { FieldErrors, UseFormRegister } from "react-hook-form";
import type { SignInFormData } from "../../../config/schema";

interface PasswordFieldProps {
  register: UseFormRegister<SignInFormData>;
  errors: FieldErrors<SignInFormData>;
}

export function PasswordField({ register, errors }: PasswordFieldProps) {
  const t = useTranslations("SignInPage.form");

  return (
    <Input
      id="password"
      type="password"
      aria-label={t("password.label")}
      placeholder={t("password.placeholder")}
      error={errors.password?.message}
      autoComplete="current-password"
      required
      {...register("password")}
    />
  );
}
