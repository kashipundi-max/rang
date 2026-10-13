"use client";

import { useTranslations } from "next-intl";
import { IconLoader2, IconCheck, IconX } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";

type SubmitStatus = "idle" | "submitting" | "success" | "error";

interface SubmitButtonProps {
  submitStatus: SubmitStatus;
  isDisabled: boolean;
}

export function SubmitButton({ submitStatus, isDisabled }: SubmitButtonProps) {
  const t = useTranslations("ForgotPasswordPage.form");

  const getVariant = () => {
    switch (submitStatus) {
      case "success":
        return "success";
      case "error":
        return "error";
      default:
        return "default";
    }
  };

  const getButtonContent = () => {
    switch (submitStatus) {
      case "submitting":
        return (
          <>
            <IconLoader2 className="w-5 h-5 animate-spin" />
            {t("submitting")}
          </>
        );
      case "success":
        return (
          <>
            <IconCheck className="w-5 h-5" />
            {t("success")}
          </>
        );
      case "error":
        return (
          <>
            <IconX className="w-5 h-5" />
            {t("error")}
          </>
        );
      default:
        return t("submit");
    }
  };

  return (
    <div className="pt-1">
      <Button
        type="submit"
        disabled={isDisabled}
        variant={getVariant()}
        className="auth-submit w-full gap-2 font-semibold"
      >
        {getButtonContent()}
      </Button>
    </div>
  );
}

export default SubmitButton;
