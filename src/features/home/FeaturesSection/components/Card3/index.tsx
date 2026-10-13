"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import CardLayout from "../CardLayout";
import StatsBadges from "./components/StatsBadges";
import FloatingTooltip from "./components/FloatingTooltip";
import GrowthChart from "./components/GrowthChart";

interface Card3Props {
  className?: string;
  title?: string;
  description?: string;
  index?: number;
}

export default function Card3({
  className,
  title,
  description,
  index = 0,
}: Card3Props) {
  const [isInView, setIsInView] = useState(false);
  const t = useTranslations("FeaturesSection");

  return (
    <CardLayout
      className={className}
      title={title}
      description={description}
      index={index}
      onInView={() => setIsInView(true)}
    >
      <StatsBadges
        isVisible={isInView}
        growthRateText={t("card3.growthRate")}
        targetText={t("card3.target")}
      />

      <FloatingTooltip
        isVisible={isInView}
        vsLastQuarterText={t("card3.vsLastQuarter")}
      />

      <GrowthChart />
    </CardLayout>
  );
}
