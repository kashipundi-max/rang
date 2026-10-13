"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

export default function BottomSection() {
  const t = useTranslations("Footer");

  return (
    <div className="pt-8 border-t border-border-secondary/60 flex flex-col md:flex-row justify-between items-center gap-4">
      <p className="text-text-muted text-sm">
        {t("copyright", { year: new Date().getFullYear() })}
      </p>

      <div className="flex items-center gap-1 text-sm">
        <span className="text-text-muted">{t("madeWith")}</span>
        <Link
          href="/"
          className="text-brand-primary-light hover:text-brand-primary transition-colors"
        >
          Range4ex
        </Link>
      </div>
    </div>
  );
}
