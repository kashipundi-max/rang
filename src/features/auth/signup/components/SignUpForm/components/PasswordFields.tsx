"use client";

import { useTranslations } from "next-intl";
import { IconLock } from "@tabler/icons-react";
import { Input } from "@/components/ui/input/Input";
import type { FieldErrors, UseFormRegister } from "react-hook-form";
import type { SignUpFormData } from "../../../config/schema";

interface PasswordFieldsProps {
  register: UseFormRegister<SignUpFormData>;
  errors: FieldErrors<SignUpFormData>;
}

export function PasswordFields({ register, errors }: PasswordFieldsProps) {
  const t = useTranslations("SignUpPage.form");

  return (
    <Input
      id="password"
      type="password"
      label={t("password.label")}
      placeholder={t("password.placeholder")}
      startIcon={<IconLock className="w-5 h-5" />}
      error={errors.password?.message}
      autoComplete="new-password"
      required
      {...register("password")}
    />
  );
}
