"use client";

import React from "react";
import { motion, useTransform, MotionValue } from "framer-motion";

interface SpotlightEffectProps {
  spotlightX: MotionValue<number>;
  spotlightY: MotionValue<number>;
  isHovered: boolean;
}

export function SpotlightEffect({
  spotlightX,
  spotlightY,
  isHovered,
}: SpotlightEffectProps) {
  return (
    <motion.div
      className="absolute inset-0 pointer-events-none z-5 opacity-0"
      style={{
        background: useTransform(
          [spotlightX, spotlightY],
          ([x, y]) =>
            `radial-gradient(600px circle at ${x}% ${y}%, var(--color-card-spotlight), transparent 40%)`
        ),
        opacity: isHovered ? 1 : 0,
      }}
      transition={{ duration: 0.3 }}
    />
  );
}
