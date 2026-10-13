"use client";

import SectionHeader from "@/components/shared/SectionHeader";
import { useTranslations } from "next-intl";
import FeaturesGrid from "./components/FeaturesGrid";

export default function FeaturesSection() {
  const t = useTranslations("FeaturesSection");

  return (
    <section className="bg-bg-dark pb-6 sm:pb-8 md:pb-10 overflow-hidden">
      <div className="max-w-[95vw] sm:max-w-[90vw] w-[1250px] mx-auto overflow-hidden pt-0 sm:pt-12 md:pt-15 pb-8 sm:pb-12 md:pb-15 border-t-[0.5px] border-slate-800/0 rounded-[0] px-4 sm:px-6">
        <SectionHeader
          badge={t("badge")}
          title={t("title")}
          description={t("description")}
          useAnimatedBackground
          className="mb-2! sm:mb-8!"
        />
        <FeaturesGrid />
      </div>
    </section>
  );
}
