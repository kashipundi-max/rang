"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import { comparisonFeatures } from "../../config/data";
import { FeatureComparisonCategory } from "../../config/types";
import { TableHeader, CategorySection } from "./components";
import SectionHeader from "@/components/shared/SectionHeader";

const categories: FeatureComparisonCategory[] = [
  "core",
  "analytics",
  "integrations",
  "support",
  "security",
];

export function ComparisonTable() {
  const t = useTranslations("PricingPage");
  const [expandedCategories, setExpandedCategories] =
    useState<FeatureComparisonCategory[]>(categories);

  const toggleCategory = (category: FeatureComparisonCategory) => {
    setExpandedCategories((prev) =>
      prev.includes(category)
        ? prev.filter((c) => c !== category)
        : [...prev, category]
    );
  };

  const plans = [
    {
      id: "starter",
      name: t("comparison.starter"),
      price: `$29/${t("billing.month")}`,
    },
    {
      id: "growth",
      name: t("comparison.growth"),
      price: `$79/${t("billing.month")}`,
      highlighted: true,
    },
    {
      id: "enterprise",
      name: t("comparison.enterprise"),
      price: t("comparison.custom"),
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      className="max-w-5xl mx-auto mb-20"
    >
      <SectionHeader
        title={t("comparison.title")}
        description={t("comparison.description")}
        useAnimatedBackground
      />

      {/* Table */}
      <div className="rounded-2xl border border-border-primary/20 overflow-hidden bg-bg-card/50 backdrop-blur-sm">
        <TableHeader plans={plans} />

        {/* Categories */}
        {categories.map((category) => {
          const categoryFeatures = comparisonFeatures.filter(
            (f) => f.category === category
          );

          return (
            <CategorySection
              key={category}
              category={category}
              features={categoryFeatures}
              isExpanded={expandedCategories.includes(category)}
              onToggle={() => toggleCategory(category)}
            />
          );
        })}
      </div>
    </motion.div>
  );
}
