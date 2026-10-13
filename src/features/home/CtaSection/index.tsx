"use client";

import SectionHeader from "@/components/shared/SectionHeader";
import { useTranslations } from "next-intl";
import MapContent from "./components/MapContent";

export default function CtaSection() {
  const t = useTranslations("CtaSection");

  return (
    <section
      id="contact"
      className="landing-mode-section cta-map-section mx-auto max-w-[95vw] sm:max-w-[90vw] md:max-w-[1250px] border-[0.5px] border-slate-800/0 rounded-xl py-0 sm:py-12 md:py-16 pb-0 sm:pb-20 md:pb-25 relative w-full px-4 sm:px-6 overflow-hidden"
    >
      <div className="relative z-10">
        <SectionHeader
          className="mb-0!"
          badge={t("badge")}
          title={t("title")}
          useAnimatedBackground
          description={t("description")}
        />

        <div className="relative mx-auto max-w-7xl z-20 w-full mt-6 sm:mt-8">
          <MapContent />
        </div>
      </div>
    </section>
  );
}
