"use client";

import React from "react";
import { useTranslations } from "next-intl";

export function SearchHeader() {
  const t = useTranslations("FeaturesSection.card5");

  return (
    <div
      className="relative w-full rounded-xl border overflow-hidden"
      style={{
        background:
          "linear-gradient(180deg, var(--color-card-spotlight) 0%, transparent 100%)",
        borderColor: "var(--color-card-particle)",
      }}
    >
      <div
        className="absolute top-[41px] start-0 end-0 h-[1px]"
        style={{
          background:
            "color-mix(in srgb, var(--color-accent) 10%, transparent)",
        }}
      />
      <div className="px-4 py-3 flex items-center justify-between">
        <span className="text-accent text-sm font-medium tracking-wide">
          {t("searchPlaceholder")}
        </span>
        <svg
          className="w-4 h-4 text-accent"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
      </div>
    </div>
  );
}
