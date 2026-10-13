"use client";

import { Tabs, TabItem } from "@/components/ui/Tabs";
import { FaqCategory } from "../config/data";
import { useTranslations } from "next-intl";

interface FaqCategoriesProps {
  categories: FaqCategory[];
  selectedCategory: FaqCategory;
  setSelectedCategory: (category: FaqCategory) => void;
  categoryCounts: Record<string, number>;
}

export default function FaqCategories({
  categories,
  selectedCategory,
  setSelectedCategory,
  categoryCounts,
}: FaqCategoriesProps) {
  const t = useTranslations("FaqSection.categories");

  // Convert categories to TabItem format with translations
  const tabItems: TabItem<FaqCategory>[] = categories.map((category) => ({
    id: category,
    label: t(category),
    count: categoryCounts[category],
  }));

  return (
    <Tabs
      items={tabItems}
      value={selectedCategory}
      onValueChange={setSelectedCategory}
      variant="pill"
      size="md"
      className="mb-6 sm:mb-8 px-1 overflow-x-auto pb-2 scrollbar-hide"
      inactiveTabClassName="bg-transparent text-text-muted hover:text-text-body hover:bg-brand-surface/30 border border-border-secondary/50"
    />
  );
}
