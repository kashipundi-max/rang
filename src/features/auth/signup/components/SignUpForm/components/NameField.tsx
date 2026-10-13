"use client";

import { useTranslations } from "next-intl";
import { IconUser } from "@tabler/icons-react";
import { Input } from "@/components/ui/input/Input";
import type { FieldErrors, UseFormRegister } from "react-hook-form";
import type { SignUpFormData } from "@/features/auth/signup/config/schema";

interface NameFieldProps {
  register: UseFormRegister<SignUpFormData>;
  errors: FieldErrors<SignUpFormData>;
}

export function NameField({ register, errors }: NameFieldProps) {
  const t = useTranslations("SignUpPage.form");

  return (
    <Input
      id="name"
      label={t("name.label")}
      placeholder={t("name.placeholder")}
      startIcon={<IconUser className="w-5 h-5" />}
      error={errors.name?.message}
      autoComplete="name"
      required
      {...register("name")}
    />
  );
}
