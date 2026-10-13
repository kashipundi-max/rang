"use client";

import React from "react";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import { BlogCategory } from "../config/data";
import { Button } from "@/components/ui/button";

interface BlogCategoriesProps {
  categories: BlogCategory[];
  selectedCategory: BlogCategory;
  onSelect: (category: BlogCategory) => void;
  counts: Record<BlogCategory, number>;
}

export function BlogCategories({
  categories,
  selectedCategory,
  onSelect,
  counts,
}: BlogCategoriesProps) {
  const t = useTranslations("BlogPage.categories");

  return (
    <div className="flex flex-wrap gap-2 sm:gap-3">
      {categories.map((category) => (
        <Button
          key={category}
          onClick={() => onSelect(category)}
          variant={selectedCategory === category ? "default" : "outline"}
          size="sm"
          className="font-dm-sans"
        >
          {t(category)}
          <span
            className={cn(
              "ms-2 text-xs",
              selectedCategory === category
                ? "text-white/80"
                : "text-text-muted"
            )}
          >
            ({counts[category]})
          </span>
        </Button>
      ))}
    </div>
  );
}
