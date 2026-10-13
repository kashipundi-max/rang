"use client";

import React from "react";
import { motion } from "framer-motion";
import { gridVariants } from "../config";

interface GridPatternProps {
  staggerDelay: number;
}

export function GridPattern({ staggerDelay }: GridPatternProps) {
  return (
    <motion.div
      className="absolute inset-0 opacity-[0.08] z-3"
      style={{
        backgroundImage: `
          linear-gradient(to right, var(--color-card-grid) 1px, transparent 1px),
          linear-gradient(to bottom, var(--color-card-grid) 1px, transparent 1px)
        `,
        backgroundSize: "28px 28px",
        maskImage: "linear-gradient(to bottom, black 40%, transparent 80%)",
      }}
      variants={gridVariants}
      custom={staggerDelay}
    />
  );
}
