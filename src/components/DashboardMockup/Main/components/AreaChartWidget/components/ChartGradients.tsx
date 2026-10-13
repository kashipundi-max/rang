"use client";

import React from "react";

export function ChartGradients() {
  return (
    <defs>
      {/* Area Gradient - uses brand colors from theme.css */}
      <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
        <stop
          offset="0%"
          stopColor="var(--color-brand-primary-light)"
          stopOpacity={0.6}
        />
        <stop
          offset="30%"
          stopColor="var(--color-brand-primary)"
          stopOpacity={0.4}
        />
        <stop
          offset="70%"
          stopColor="var(--color-brand-primary)"
          stopOpacity={0.2}
        />
        <stop
          offset="100%"
          stopColor="var(--color-brand-glow)"
          stopOpacity={0.05}
        />
      </linearGradient>

      {/* Bar Gradient */}
      <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#475569" stopOpacity={0.8} />
        <stop offset="100%" stopColor="#334155" stopOpacity={0.6} />
      </linearGradient>
    </defs>
  );
}
