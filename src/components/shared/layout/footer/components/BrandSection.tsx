"use client";

import { useTranslations } from "next-intl";
import { Logo } from "@/components/Logo";
import SocialLinks from "./SocialLinks";

export default function BrandSection() {
  const t = useTranslations("Footer");

  return (
    <div className="col-span-2 lg:col-span-2">
      <div className="mb-4">
        <Logo size="lg" />
      </div>
      <p className="text-text-body text-sm leading-relaxed max-w-sm mb-6">
        {t("description")}
      </p>

      {/* Social links */}
      <SocialLinks />
    </div>
  );
}
