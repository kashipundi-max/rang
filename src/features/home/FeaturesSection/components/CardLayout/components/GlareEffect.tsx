"use client";

import React from "react";
import { motion, useTransform, MotionValue } from "framer-motion";

interface GlareEffectProps {
  glareX: MotionValue<number>;
  glareY: MotionValue<number>;
  isHovered: boolean;
  isRTL: boolean;
}

export function GlareEffect({
  glareX,
  glareY,
  isHovered,
  isRTL,
}: GlareEffectProps) {
  return (
    <motion.div
      className="absolute inset-0 pointer-events-none z-6"
      style={{
        background: useTransform([glareX, glareY], ([x, y]) => {
          const gradientAngle = isRTL ? "225deg" : "135deg";
          return `linear-gradient(${gradientAngle}, transparent 0%, transparent ${
            Number(x) - 20
          }%, rgba(255,255,255,0.03) ${x}%, rgba(255,255,255,0.06) ${
            Number(x) + 5
          }%, transparent ${Number(x) + 20}%, transparent 100%)`;
        }),
        opacity: isHovered ? 1 : 0,
      }}
    />
  );
}
