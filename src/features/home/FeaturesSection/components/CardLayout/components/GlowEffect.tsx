"use client";

import React from "react";
import { motion } from "framer-motion";

interface GlowEffectProps {
  isHovered: boolean;
}

export function GlowEffect({ isHovered }: GlowEffectProps) {
  return (
    <motion.div
      className="absolute -top-32 -start-32 w-[400px] h-[400px] z-3"
      style={{
        background:
          "radial-gradient(circle, var(--color-card-glow) 0%, var(--color-card-glow-secondary) 60%)",
        filter: "blur(60px)",
      }}
      initial={{ opacity: 0.25, scale: 1 }}
      animate={
        isHovered
          ? {
              opacity: [0.25, 0.4, 0.25],
              scale: [1, 1.1, 1],
            }
          : { opacity: 0.25, scale: 1 }
      }
      transition={
        isHovered
          ? {
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut",
            }
          : { duration: 0.3 }
      }
    />
  );
}
