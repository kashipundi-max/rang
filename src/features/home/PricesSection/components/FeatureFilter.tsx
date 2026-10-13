"use client";

import { useTranslations } from "next-intl";
import { FeatureCategory } from "../config/types";
import { Tabs, TabItem } from "@/components/ui/Tabs";

interface FeatureFilterProps {
  allCategories: FeatureCategory[];
  selectedCategory: FeatureCategory | null;
  setSelectedCategory: (category: FeatureCategory | null) => void;
}

export function FeatureFilter({
  allCategories,
  selectedCategory,
  setSelectedCategory,
}: FeatureFilterProps) {
  const t = useTranslations("PricesSection.categories");

  // Map category to translation key
  const getCategoryLabel = (category: FeatureCategory) => {
    const categoryMap: Record<FeatureCategory, string> = {
      Design: "design",
      Development: "development",
      Support: "support",
      Growth: "growth",
    };
    return t(categoryMap[category]);
  };

  // Fixed: Use the correct generic type notation for TabItem
  const tabItems: TabItem[] = [
    { id: "null", label: t("all") },
    ...allCategories.map((category) => ({
      id: category,
      label: getCategoryLabel(category),
    })),
  ];

  // Handler to convert between TabItem value and FeatureCategory
  const handleValueChange = (value: string) => {
    setSelectedCategory(value === "null" ? null : (value as FeatureCategory));
  };

  return (
    <div className="mt-12 sm:mt-8 flex flex-col items-center">
      <Tabs
        items={tabItems}
        value={selectedCategory === null ? "null" : selectedCategory}
        onValueChange={handleValueChange}
        className="mb-5 sm:mb-15 z-50"
      />
    </div>
  );
}
