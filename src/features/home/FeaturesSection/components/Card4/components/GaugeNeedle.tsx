"use client";

import React, { forwardRef } from "react";
import { getNeedleTipPosition, GAUGE_CONFIG } from "../config";

const { cx, cy, needleAngle, needleLength } = GAUGE_CONFIG;
const { needleTipX, needleTipY } = getNeedleTipPosition(
  cx,
  cy,
  needleAngle,
  needleLength
);

interface GaugeNeedleProps {
  className?: string;
}

export const GaugeNeedle = forwardRef<SVGGElement, GaugeNeedleProps>(
  function GaugeNeedle(props, ref) {
    return (
      <g ref={ref}>
        {/* Needle shadow/depth polygon */}
        <polygon
          points={`${cx - 4},${cy + 2} ${cx + 4},${cy + 2} ${
            needleTipX + 3
          },${needleTipY} ${needleTipX - 3},${needleTipY}`}
          fill="url(#needleGrad)"
        />
        {/* Main needle body - triangular shape from pivot to tip */}
        <polygon
          points={`${cx - 6},${cy} ${cx + 6},${cy} ${needleTipX},${needleTipY}`}
          fill="var(--color-brand-glow)"
          stroke="var(--color-brand-surface)"
          strokeWidth="1"
        />
        {/* Green glowing tip of the needle */}
        <circle
          cx={needleTipX}
          cy={needleTipY}
          r="6"
          fill="url(#greenTipGrad)"
          filter="url(#glowFilter)"
        />
        {/* Inner bright core of the green tip */}
        <circle
          cx={needleTipX}
          cy={needleTipY}
          r="3"
          fill="var(--color-accent)"
        />
      </g>
    );
  }
);
