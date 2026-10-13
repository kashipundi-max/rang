"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslations } from "next-intl";
import { CategoryRow } from "./CategoryRow";
import { FeatureRow } from "./FeatureRow";
import type {
  ComparisonFeature,
  FeatureComparisonCategory,
} from "../../../config/types";

interface CategorySectionProps {
  category: FeatureComparisonCategory;
  features: ComparisonFeature[];
  isExpanded: boolean;
  onToggle: () => void;
}

export function CategorySection({
  category,
  features,
  isExpanded,
  onToggle,
}: CategorySectionProps) {
  const t = useTranslations("PricingPage");

  return (
    <div>
      <CategoryRow
        category={category}
        label={t(`comparison.categories.${category}`)}
        featureCount={features.length}
        featuresCountLabel={t("comparison.featuresCount")}
        isExpanded={isExpanded}
        onToggle={onToggle}
      />

      <AnimatePresence initial={false}>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            {features.map((feature, index) => (
              <FeatureRow
                key={feature.id}
                feature={feature}
                featureLabel={t(`comparison.featuresList.${feature.id}`)}
                isOdd={index % 2 !== 0}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
