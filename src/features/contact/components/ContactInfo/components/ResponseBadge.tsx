"use client";

import { useTranslations } from "next-intl";
import { Badge } from "@/components/ui/Badge";

export function ResponseBadge() {
  const t = useTranslations("ContactSection.info");

  return (
    <Badge
      variant="outline"
      className="mt-4"
      size="xs"
      showPulse
      pulseColor="emerald"
    >
      {t("responseTime")}
    </Badge>
  );
}
