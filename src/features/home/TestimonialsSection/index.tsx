"use client";

import { useTranslations } from "next-intl";
import SectionHeader from "@/components/shared/SectionHeader";
import TestimonialsCarousel from "./components/TestimonialsCarousel";
import { useTestimonialsCarousel } from "./hooks/useTestimonialsCarousel";

export default function TestimonialsSection() {
  const t = useTranslations("TestimonialsSection");
  const {
    emblaRef,
    canScrollPrev,
    canScrollNext,
    scrollPrev,
    scrollNext,
    translatedTestimonials,
  } = useTestimonialsCarousel();

  return (
    <section id="payouts" className="scroll-mt-24 bg-bg-dark relative select-none overflow-hidden">
      <div className="max-w-[95vw] sm:max-w-[90vw] md:max-w-[1250px] mx-auto py-8 sm:py-12 md:py-15 px-4 sm:px-6 relative overflow-hidden z-20 border-[0.5px] border-slate-800/0 rounded-xl">
        {/* Section Header */}
        <SectionHeader
          className="mb-9!"
          badge={t("badge")}
          title={t("title")}
          useAnimatedBackground
          description={t("description")}
        />

        {/* Testimonials Carousel */}
        <TestimonialsCarousel
          emblaRef={emblaRef}
          testimonials={translatedTestimonials}
          canScrollPrev={canScrollPrev}
          canScrollNext={canScrollNext}
          onScrollPrev={scrollPrev}
          onScrollNext={scrollNext}
        />
      </div>
    </section>
  );
}

