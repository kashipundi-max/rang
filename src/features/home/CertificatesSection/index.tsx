"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import SectionHeader from "@/components/shared/SectionHeader";
import DepthCarousel from "@/components/DepthCarousel";
import { certificates } from "./config/certificates";

export default function CertificatesSection() {
  const t = useTranslations("CertificatesSection");

  // The card is sized in pixels because the stack is laid out in 3D space, so
  // it cannot come from a CSS breakpoint. 3:2 matches the 1536x1024 source art
  // exactly, which keeps `object-fit: cover` from cropping the certificates.
  const [card, setCard] = useState({ width: 420, height: 280 });

  useEffect(() => {
    const fit = () => {
      const width = Math.round(
        Math.min(420, Math.max(230, window.innerWidth * 0.62))
      );
      setCard({ width, height: Math.round((width * 2) / 3) });
    };
    fit();
    window.addEventListener("resize", fit);
    return () => window.removeEventListener("resize", fit);
  }, []);

  return (
    <section
      id="payout-certificates"
      className="scroll-mt-24 bg-bg-dark relative select-none overflow-hidden"
    >
      <div className="max-w-[95vw] sm:max-w-[90vw] md:max-w-[1250px] mx-auto py-8 sm:py-12 md:py-15 px-4 sm:px-6 relative z-20">
        <SectionHeader
          className="mb-9!"
          badge={t("badge")}
          title={t("title")}
          useAnimatedBackground
          description={t("description")}
        />

        <div className="h-[360px] sm:h-[420px] md:h-[480px]">
          <DepthCarousel
            items={certificates}
            label={t("title")}
            cardWidth={card.width}
            cardHeight={card.height}
            radius={16}
            tint="#05000f"
            depth={210}
            spread={86}
            tilt={22}
            tiltDirection="right"
            perspective={1400}
            visibleCards={4}
            falloff={0.2}
            blur={4}
            duration={700}
            ease="power3.out"
            autoplay
            autoplayDelay={2000}
            loop
            showControls
            showIndicators
          />
        </div>

        <p className="mt-4 text-center text-[11px] sm:text-xs text-text-muted">
          {t("hint")}
        </p>
      </div>
    </section>
  );
}
