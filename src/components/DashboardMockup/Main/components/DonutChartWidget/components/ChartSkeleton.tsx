"use client";

import React from "react";

export function ChartSkeleton() {
  return (
    <div className="relative h-full w-full max-h-[380px] rounded-xl border border-brand-border/50 p-6 bg-brand-surface/60">
      <div className="animate-pulse h-full w-full bg-brand-surface/50 rounded" />
    </div>
  );
}
