"use client";

import React from "react";
import { CustomTooltipProps } from "../types";

export function ChartTooltip({ active, payload, label }: CustomTooltipProps) {
  if (active && payload && payload.length) {
    return (
      <div className="bg-brand-surface/95 backdrop-blur-sm border border-brand-border/50 rounded-lg p-3 shadow-xl">
        <p className="text-text-body text-sm font-medium mb-2">{label}</p>
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-brand-primary-light rounded-full"></div>
            <span className="text-white text-sm font-semibold">
              Users: {payload[0]?.value}k
            </span>
          </div>
          {payload[1] && (
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-text-muted rounded-sm"></div>
              <span className="text-text-body text-sm">
                Sessions: {payload[1]?.value}k
              </span>
            </div>
          )}
        </div>
      </div>
    );
  }
  return null;
}
