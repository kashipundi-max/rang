"use client";

import React from "react";
import { DonutDataItem } from "../types";

interface CenterContentProps {
  data: DonutDataItem[];
  activeIndex: number | null;
}

export function CenterContent({ data, activeIndex }: CenterContentProps) {
  const item = activeIndex !== null ? data[activeIndex] : data[0];

  return (
    <div className="absolute inset-0 flex items-center justify-center -ml-2 mt-0 pointer-events-none">
      <div className="text-center">
        <div
          className="text-3xl font-bold transition-all duration-300"
          style={{ color: item.color }}
        >
          {item.value}%
        </div>
        <div className="text-xs text-text-muted mt-1">{item.name}</div>
      </div>
    </div>
  );
}
