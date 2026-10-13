"use client";

import React from "react";

export function KpiSectionSkeleton() {
  return (
    <div className="mb-6 relative">
      <div className="flex gap-4 pb-2">
        {[...Array(5)].map((_, index) => (
          <div
            key={index}
            className="bg-brand-surface/60 p-4 min-h-[86px] rounded-lg border border-brand-border/50 shadow-xs h-full"
            style={{
              width: "calc(20% - 13px)",
              flexShrink: 0,
            }}
          >
            <div className="animate-pulse">
              <div className="flex items-center justify-between mb-2">
                <div className="h-3 bg-brand-surface rounded w-16"></div>
                <div className="h-4 bg-brand-surface rounded w-4"></div>
              </div>
              <div className="flex items-baseline justify-between">
                <div className="h-6 bg-brand-surface rounded w-12"></div>
                <div className="flex items-center space-x-1">
                  <div className="h-3 bg-brand-surface rounded w-3"></div>
                  <div className="h-3 bg-brand-surface rounded w-6"></div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
