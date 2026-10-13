"use client";

import React from "react";
import { IconChevronDown } from "@tabler/icons-react";
import { cn } from "@/lib/utils";
import type { FeatureComparisonCategory } from "../../../config/types";

interface CategoryRowProps {
  category: FeatureComparisonCategory;
  label: string;
  featureCount: number;
  featuresCountLabel: string;
  isExpanded: boolean;
  onToggle: () => void;
}

export function CategoryRow({
  category,
  label,
  featureCount,
  featuresCountLabel,
  isExpanded,
  onToggle,
}: CategoryRowProps) {
  return (
    <button
      onClick={onToggle}
      className="w-full grid grid-cols-4 bg-bg-dark/30 border-b border-border-primary/20 hover:bg-bg-dark/50 transition-colors"
    >
      <div className="p-4 flex items-center gap-2 col-span-4">
        <IconChevronDown
          className={cn(
            "w-4 h-4 text-text-body transition-transform",
            isExpanded && "rotate-180"
          )}
        />
        <span className="text-text-primary font-semibold text-sm uppercase tracking-wider">
          {label}
        </span>
        <span className="text-text-body text-xs">
          ({featureCount} {featuresCountLabel})
        </span>
      </div>
    </button>
  );
}
