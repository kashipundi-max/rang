"use client";

import { useInView } from "react-intersection-observer";
import { useTranslations } from "next-intl";
import SectionHeader from "@/components/shared/SectionHeader";
import { AnimatedNumber } from "@/components/AnimatedNumber";
import { getBrandFilter } from "@/features/home/HeroSection/utils";

interface StatCardProps {
  value?: number;
  suffix?: string;
  label?: string;
  description?: string;
  isLast?: boolean;
  startValue?: number;
  divider?: boolean;
}

function StatCard({ value, suffix, label, description }: StatCardProps) {
  const { ref, inView } = useInView({
    threshold: 0.3,
    triggerOnce: true,
  });

  // Determine if value has decimals
  const hasDecimals = value !== undefined && value % 1 !== 0;

  return (
    <div
      ref={ref}
      className={`w-full text-center py-6 md:py-6 px-6 md:px-8 relative flex-1 min-w-0`}
    >
      {/* Dark background for text readability - more transparent */}
      <div className="w-full absolute inset-0 bg-gray-900/20 sm:bg-bg-dark/20 backdrop-blur-md rounded-lg" />

      <div className="relative z-10">
        <h3 className="text-gray-200 text-lg sm:text-xl md:text-xl font-medium mb-3 md:mb-2">
          {label}
        </h3>
        <div className="text-4xl sm:text-5xl md:text-5xl lg:text-6xl xl:text-7xl font-clash-display font-[500] min-h-[80px] sm:min-h-[90px] md:min-h-[96px] lg:min-h-[112px] xl:min-h-[128px] flex items-center justify-center">
          <AnimatedNumber
            value={inView ? value ?? 0 : 0}
            prefix="+"
            suffix={suffix}
            animateOnMount={false}
            className="text-white"
            format={{
              useGrouping: false, // Prevents comma grouping, each digit animates individually
              minimumFractionDigits: hasDecimals ? 1 : 0,
              maximumFractionDigits: hasDecimals ? 1 : 0,
            }}
          />
        </div>
        <p className="text-gray-400 text-base sm:text-lg md:text-base">
          {description}
        </p>
      </div>
    </div>
  );
}

export default function StatisticsSection() {
  const t = useTranslations("StatisticsSection");

  const stats = [
    {
      value: 10000,
      labelKey: "stats.stat1.label",
      descriptionKey: "stats.stat1.description",
      startValue: 9800,
    },
    {
      divider: true,
    },
    {
      value: 350,
      suffix: "%",
      labelKey: "stats.stat2.label",
      descriptionKey: "stats.stat2.description",
      startValue: 320,
    },
    {
      divider: true,
    },
    {
      value: 99.9,
      suffix: "%",
      labelKey: "stats.stat3.label",
      descriptionKey: "stats.stat3.description",
      startValue: 99.1,
    },
  ];

  const brandFilter = getBrandFilter();

  return (
    <section id="about" className="scroll-mt-24 landing-mode-section relative bg-bg-dark py-8 sm:py-10 md:py-12 lg:py-10 overflow-hidden max-w-[1250px] mx-auto border-[0.5px] border-slate-800/0 rounded-[12px]">
      {/* Background Image */}
      <div
        className="absolute left-0 top-0 -translate-x-[20%] translate-y-[10%] h-[120%] w-[140%] opacity-10 md:opacity-10"
        style={{
          backgroundImage: "url('/images/hero_3d.webp')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          filter: brandFilter,
        }}
      />

      {/* Enhanced Creative Geometric Strips Overlay */}
      <div className="absolute inset-0">
        {/* Lighter diagonal strips for clearer background */}
        <div className="absolute top-0 left-0 w-full h-32 md:h-64 bg-gradient-to-br from-bg-dark/60 via-bg-dark/20 to-transparent -skew-y-3 -translate-y-10 md:-translate-y-20 blur-sm" />
        <div className="absolute top-0 left-0 w-full h-24 md:h-48 bg-gradient-to-br from-bg-dark/50 via-bg-dark/30 to-transparent -skew-y-2 -translate-y-8 md:-translate-y-16" />
        <div className="absolute top-0 left-0 w-full h-16 md:h-32 bg-gradient-to-br from-bg-dark/40 via-bg-dark/20 to-transparent -skew-y-1 -translate-y-4 md:-translate-y-8" />

        <div className="absolute bottom-0 right-0 w-full h-32 md:h-64 bg-gradient-to-tl from-bg-dark/60 via-bg-dark/20 to-transparent skew-y-3 translate-y-10 md:translate-y-20 blur-sm" />
        <div className="absolute bottom-0 right-0 w-full h-24 md:h-48 bg-gradient-to-tl from-bg-dark/50 via-bg-dark/30 to-transparent skew-y-2 translate-y-8 md:translate-y-16" />
        <div className="absolute bottom-0 right-0 w-full h-16 md:h-32 bg-gradient-to-tl from-bg-dark/40 via-bg-dark/20 to-transparent skew-y-1 translate-y-4 md:translate-y-8" />

        {/* Lighter central overlay for clearer visibility */}
        <div className="absolute inset-0 bg-gradient-to-r from-bg-dark/80 via-bg-dark/10 to-bg-dark/80" />
        <div className="absolute inset-0 bg-gradient-to-b from-bg-dark/90 via-bg-dark/50 to-bg-dark/90" />
      </div>

      {/* Targeted dark overlay specifically for header section */}
      <div className="absolute top-0 left-0 right-0 h-[200px] md:h-[300px] bg-gradient-to-b from-bg-dark/80 via-bg-dark/60 to-transparent" />

      <div className="relative z-10 max-w-7xl mx-auto px-6 sm:px-6">
        <div className="relative z-10">
          <SectionHeader
            badge={t("badge")}
            title={t("title")}
            description={t("description")}
            className="sm:mb-5"
          />
        </div>

        <div className="flex flex-col md:flex-row items-center justify-center gap-4 md:gap-0 max-w-5xl mx-auto mt-2 sm:mt-4">
          {stats.map((stat, index) =>
            stat.divider ? (
              <div
                key={index}
                className="hidden md:block h-[70px] lg:h-[90px] w-[1px] bg-gray-700/40 mx-2 lg:mx-4"
              />
            ) : (
              <StatCard
                key={stat.labelKey}
                value={stat.value}
                suffix={stat.suffix}
                label={t(stat.labelKey!)}
                description={t(stat.descriptionKey!)}
                startValue={stat.startValue}
                isLast={index === stats.length - 1}
              />
            )
          )}
        </div>
      </div>
    </section>
  );
}

