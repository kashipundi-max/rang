"use client";

import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";

interface SubmitButtonProps {
  isDisabled: boolean;
}

export function SubmitButton({ isDisabled }: SubmitButtonProps) {
  const t = useTranslations("ContactSection.form");

  return (
    <div className="pt-2">
      <Button type="submit" disabled={isDisabled} className="w-full">
        {t("submit")}
      </Button>
    </div>
  );
}
