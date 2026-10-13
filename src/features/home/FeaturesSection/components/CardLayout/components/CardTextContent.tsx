"use client";

import React from "react";
import { motion } from "framer-motion";
import {
  textContainerVariants,
  titleVariants,
  descriptionVariants,
} from "../config";

interface CardTextContentProps {
  title?: string;
  description?: string;
  staggerDelay: number;
}

export function CardTextContent({
  title,
  description,
  staggerDelay,
}: CardTextContentProps) {
  if (!title && !description) return null;

  return (
    <motion.div
      className="absolute bottom-0 start-0 end-0 z-30 p-8 pt-0"
      variants={textContainerVariants}
      custom={staggerDelay}
    >
      <div
        className="absolute inset-0 -top-8 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 80% 60% at 50% 80%, var(--color-card-overlay) 0%, transparent 70%)",
        }}
      />
      {title && (
        <motion.h3
          className="relative text-[rgb(245,245,245)] text-center text-xl font-bold mb-3 font-clash-display"
          variants={titleVariants}
          custom={staggerDelay}
        >
          {title}
        </motion.h3>
      )}
      {description && (
        <motion.p
          className="relative text-text-body/80 text-center text-base leading-relaxed font-dm-sans"
          variants={descriptionVariants}
          custom={staggerDelay}
        >
          {description}
        </motion.p>
      )}
    </motion.div>
  );
}
