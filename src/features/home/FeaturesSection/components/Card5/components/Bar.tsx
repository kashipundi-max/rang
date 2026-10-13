"use client";

import React from "react";
import { motion } from "framer-motion";

interface BarProps {
  height: number;
  isHighlighted: boolean;
  index: number;
  isInView: boolean;
  isCardHovered: boolean;
}

export function Bar({
  height,
  isHighlighted,
  index,
  isInView,
  isCardHovered,
}: BarProps) {
  return (
    <motion.div
      className="relative flex flex-col items-center"
      initial={{ scaleY: 0, opacity: 0 }}
      animate={
        isInView
          ? {
              scaleY: 1,
              opacity: 1,
              y: isCardHovered ? -8 : 0,
            }
          : { scaleY: 0, opacity: 0 }
      }
      transition={{
        scaleY: {
          duration: 0.6,
          delay: index * 0.1,
          ease: [0.34, 1.56, 0.64, 1], // spring-like bounce
        },
        opacity: {
          duration: 0.4,
          delay: index * 0.1,
        },
        y: {
          duration: 0.3,
          ease: "easeOut",
        },
      }}
      style={{ originY: 1 }} // Scale from bottom
      whileHover={{
        scale: 1.06,
        y: -3,
        transition: { duration: 0.2 },
      }}
    >
      {/* Highlighted dot indicator */}
      {isHighlighted && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-20">
          <div className="relative">
            <div
              className="absolute w-5 h-5 rounded-full -translate-x-1/2 -translate-y-1/2 left-1/2 top-1/2"
              style={{
                background: "var(--color-card-glow)",
                filter: "blur(4px)",
              }}
            />
            <div className="relative w-2.5 h-2.5 bg-white rounded-full" />
          </div>
        </div>
      )}

      {/* Bar body */}
      <div
        className="relative w-[37px] rounded-lg overflow-hidden"
        style={{
          height: `${height * 1.8}px`,
          background: isHighlighted
            ? `linear-gradient(180deg, var(--color-brand-primary) 0%, var(--color-brand-glow) 100%)`
            : `linear-gradient(180deg, var(--color-brand-glow) 0%, transparent 100%)`,
        }}
      >
        {/* Diagonal stripe pattern */}
        <div
          className="absolute inset-0 opacity-30"
          style={{
            backgroundImage: `repeating-linear-gradient(-45deg, transparent, transparent 3px, rgba(255,255,255,0.2) 3px, rgba(255,255,255,0.2) 4px)`,
          }}
        />
        {/* Border gradient */}
        <div
          className="absolute inset-0 rounded-lg"
          style={{
            border: "1px solid transparent",
            background: isHighlighted
              ? `linear-gradient(180deg, rgba(255,255,255,0.3) 0%, var(--color-card-glow-secondary) 100%) border-box`
              : `linear-gradient(180deg, var(--color-card-particle) 0%, var(--color-card-glow-secondary) 100%) border-box`,
            WebkitMask:
              "linear-gradient(#fff 0 0) padding-box, linear-gradient(#fff 0 0)",
            WebkitMaskComposite: "xor",
            maskComposite: "exclude",
          }}
        />
      </div>
    </motion.div>
  );
}
