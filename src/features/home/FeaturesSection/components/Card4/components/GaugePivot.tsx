"use client";

import React from "react";
import { GAUGE_CONFIG } from "../config";

const { cx, cy } = GAUGE_CONFIG;

export function GaugePivot() {
  return (
    <>
      {/* Shadow under the needle pivot area */}
      <ellipse
        cx={cx}
        cy={cy + 5}
        rx="35"
        ry="8"
        fill="rgba(0,0,0,0.4)"
        filter="url(#glowFilter)"
      />
      {/* Outer dark ring of the pivot point - covers needle base */}
      <circle
        cx={cx}
        cy={cy}
        r="14"
        fill="var(--color-brand-glow)"
        stroke="var(--color-brand-surface)"
        strokeWidth="2"
      />
      {/* Middle glowing ring of the pivot point */}
      <circle cx={cx} cy={cy} r="8" fill="url(#centerGlow)" />
      {/* indicator origin - The white dot that is the CENTER of rotation */}
      <circle cx={cx} cy={cy} r="4" fill="var(--color-accent)" opacity="0.9" />
    </>
  );
}
