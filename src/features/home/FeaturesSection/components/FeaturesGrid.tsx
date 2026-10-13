"use client";

import { useTranslations } from "next-intl";
import { features, CardComponents, Feature } from "../config/features";

interface FeatureCardProps {
  feature: Feature;
  index: number;
}

function FeatureCard({ feature, index }: FeatureCardProps) {
  const t = useTranslations("FeaturesSection");
  const Component = CardComponents[feature.card];

  return (
    <Component
      title={t(feature.titleKey)}
      description={t(feature.descriptionKey)}
      index={index}
    />
  );
}

export default function FeaturesGrid() {
  const firstRow = features.slice(0, 2);
  const secondRow = features.slice(2);

  return (
    <>
      {/* First row: 2 cards */}
      <div className="flex flex-col sm:flex-row justify-between w-full gap-3 sm:gap-4 md:gap-6">
        {firstRow.map((feature, idx) => (
          <div
            key={feature.id}
            className="w-full sm:w-[48%] md:w-[49%] h-[340px] sm:h-80 md:h-[367px] shrink-0"
          >
            <FeatureCard feature={feature} index={idx} />
          </div>
        ))}
      </div>

      {/* Second row: 3 cards */}
      <div className="mt-4 sm:mt-6 md:mt-8 flex flex-col sm:flex-row justify-between w-full gap-3 sm:gap-4 md:gap-6">
        {secondRow.map((feature, idx) => (
          <div
            key={feature.id}
            className="w-full sm:w-[31%] md:w-[32%] h-[340px] sm:h-80 md:h-[367px] shrink-0"
          >
            <FeatureCard feature={feature} index={idx + 2} />
          </div>
        ))}
      </div>
    </>
  );
}
