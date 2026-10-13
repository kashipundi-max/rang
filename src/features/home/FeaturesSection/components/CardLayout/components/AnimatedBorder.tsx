"use client";

import React from "react";
import { motion } from "framer-motion";

interface AnimatedBorderProps {
  isHovered: boolean;
}

export function AnimatedBorder({ isHovered }: AnimatedBorderProps) {
  return (
    <motion.div
      className="absolute -inset-px rounded-[21px] pointer-events-none z-1"
      style={{
        background: `linear-gradient(135deg, 
          rgba(220, 225, 255, 0.1) 0%, 
          rgba(255, 255, 255, 0.25) 25%, 
          rgba(220, 225, 255, 0.35) 50%, 
          rgba(255, 255, 255, 0.25) 75%, 
          rgba(220, 225, 255, 0.1) 100%)`,
        opacity: isHovered ? 1 : 0,
        filter: "blur(2px)",
      }}
      animate={
        isHovered
          ? {
              backgroundPosition: ["0% 0%", "100% 100%"],
            }
          : {}
      }
      transition={{
        duration: 3,
        repeat: Infinity,
        repeatType: "reverse",
        ease: "linear",
      }}
    />
  );
}
