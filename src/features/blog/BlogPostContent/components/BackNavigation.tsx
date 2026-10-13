"use client";

import React from "react";
import { IconArrowLeft } from "@tabler/icons-react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

export function BackNavigation() {
  const t = useTranslations("BlogPost");

  return (
    <section className="relative pt-24 sm:pt-28">
      <div className="container mx-auto max-w-[95vw] sm:max-w-[90vw] lg:max-w-[1100px] px-4 sm:px-6">
        <Link
          href="/blog"
          className="inline-flex items-center gap-2 text-text-body hover:text-brand-primary font-dm-sans text-sm transition-colors"
        >
          <IconArrowLeft className="w-4 h-4 rtl:rotate-180" />
          {t("backToBlog")}
        </Link>
      </div>
    </section>
  );
}
