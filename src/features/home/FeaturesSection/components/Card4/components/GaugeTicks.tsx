"use client";

import React from "react";
import { getTickPosition, TICK_ANGLES, GAUGE_CONFIG } from "../config";

const { cx, cy, outerRadius } = GAUGE_CONFIG;

export function GaugeTicks() {
  return (
    <>
      {TICK_ANGLES.map((angle, i) => {
        const { x1, y1, x2, y2 } = getTickPosition(cx, cy, outerRadius, angle);
        return (
          <line
            key={i}
            x1={x1}
            y1={y1}
            x2={x2}
            y2={y2}
            stroke="rgba(0,5,20,0.8)"
            strokeWidth="2"
          />
        );
      })}
    </>
  );
}
