"use client";

import React from "react";
import { motion } from "framer-motion";

interface CardBorderProps {
  isHovered: boolean;
  index: number;
}

export function CardBorder({ isHovered, index }: CardBorderProps) {
  return (
    <>
      {/* Border */}
      <motion.div
        className="absolute inset-0 rounded-[20px] pointer-events-none z-30"
        style={{
          border: "1px solid",
          borderColor: "var(--color-card-border)",
        }}
        transition={{ duration: 0.3 }}
      />

      {/* Silver shine effect on top border */}
      <svg
        className="absolute inset-0 w-full h-full pointer-events-none z-30"
        preserveAspectRatio="none"
      >
        <defs>
          <linearGradient
            id={`silverShineTop-${index}`}
            x1="0%"
            y1="0%"
            x2="100%"
            y2="0%"
          >
            <stop offset="0%" stopColor="transparent" />
            <stop offset="5%" stopColor="transparent" />
            <stop offset="12%" stopColor="rgba(220,225,255,0.2)" />
            <stop offset="28%" stopColor="rgba(255,255,255,0.35)" />
            <stop offset="34%" stopColor="rgba(220,225,255,0.2)" />
            <stop offset="50%" stopColor="transparent" />
            <stop offset="100%" stopColor="transparent" />
          </linearGradient>
          <clipPath id={`topBorderClip-${index}`}>
            <rect x="0" y="0" width="100%" height="21" />
          </clipPath>
        </defs>
        <rect
          x="0.5"
          y="0.5"
          width="calc(100% - 1px)"
          height="calc(100% - 1px)"
          rx="20"
          ry="20"
          fill="none"
          stroke={`url(#silverShineTop-${index})`}
          strokeWidth="1"
          clipPath={`url(#topBorderClip-${index})`}
        />
      </svg>
    </>
  );
}
