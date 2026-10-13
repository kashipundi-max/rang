"use client";

import React from "react";
import { describeArc, getHighlightSegmentPath, GAUGE_CONFIG } from "../config";

const { cx, cy, outerRadius, innerRadius, startAngle, endAngle } = GAUGE_CONFIG;

export function GaugeArcs() {
  return (
    <>
      {/* OUTER ARC - Shadow layer for depth effect */}
      <path
        d={describeArc(cx, cy, outerRadius, startAngle, endAngle)}
        stroke="var(--color-brand-glow)"
        strokeWidth="28"
        fill="none"
        strokeLinecap="round"
        filter="url(#arcShadow)"
      />
      {/* OUTER ARC - Main colored arc with gradient */}
      <path
        d={describeArc(cx, cy, outerRadius, startAngle, endAngle)}
        stroke="url(#outerArcGrad)"
        strokeWidth="24"
        fill="none"
        strokeLinecap="round"
      />
      {/* OUTER ARC - Thin highlight ring outside */}
      <path
        d={describeArc(cx, cy, outerRadius + 10, startAngle, endAngle)}
        stroke="var(--color-card-particle)"
        strokeWidth="2"
        fill="none"
        strokeLinecap="round"
      />
      {/* INNER ARC - Dark background layer */}
      <path
        d={describeArc(cx, cy, innerRadius, startAngle, endAngle)}
        stroke="var(--color-bg-card)"
        strokeWidth="18"
        fill="none"
        strokeLinecap="round"
      />
      {/* INNER ARC - Gradient colored arc */}
      <path
        d={describeArc(cx, cy, innerRadius, startAngle, endAngle)}
        stroke="url(#innerArcGrad)"
        strokeWidth="14"
        fill="none"
        strokeLinecap="round"
        opacity="0.8"
      />
      {/* HIGHLIGHT SEGMENT - Glowing section on the outer arc (36° to 72°) */}
      <path
        d={getHighlightSegmentPath(cx, cy, outerRadius)}
        stroke="var(--color-brand-primary-light)"
        strokeWidth="26"
        fill="none"
        strokeLinecap="butt"
        opacity="0.5"
        filter="url(#glowFilter)"
      />
    </>
  );
}
