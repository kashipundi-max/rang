"use client";

import React from "react";
import { DonutDataItem } from "../types";

interface ChartLegendProps {
  data: DonutDataItem[];
}

export function ChartLegend({ data }: ChartLegendProps) {
  return (
    <div className="flex-1 ml-2 mt-13">
      <div className="space-y-1">
        {data.map((item, index) => (
          <div key={index} className="flex items-center gap-2">
            <div
              className="w-3 h-3 rounded-sm"
              style={{ backgroundColor: item.color }}
            />
            <span className="text-white text-sm font-medium">{item.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
