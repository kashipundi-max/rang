"use client";

import { IconShoppingCart } from "@tabler/icons-react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";

export default function BuyTemplateCta() {
  const t = useTranslations("Footer");

  return (
    <div className="max-w-7xl mx-auto bg-linear-to-r from-transparent via-brand-surface/30 to-transparent py-4 px-6">
      <div className="flex flex-col sm:flex-row items-center justify-center gap-4 text-center">
        <div className="flex items-center gap-2">
          <span className="text-white font-medium text-sm">
            {t("cta.love")}
          </span>
          <span className="text-white/90 text-sm">{t("cta.getSource")}</span>
        </div>
        <Button
          href="/pricing"
          variant="secondary"
          className="text-sm px-6 py-1 h-[30px] bg-white text-gray-900 hover:bg-gray-100 font-medium"
        >
          {t("cta.buyTemplate")} <IconShoppingCart size={15} />
        </Button>
      </div>
    </div>
  );
}
