"use client";

import React from "react";
import { motion } from "framer-motion";

interface FloatingParticlesProps {
  isHovered: boolean;
}

export function FloatingParticles({ isHovered }: FloatingParticlesProps) {
  if (!isHovered) return null;

  return (
    <>
      {[...Array(6)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-1 h-1 rounded-full bg-card-particle z-4"
          initial={{
            x: `${20 + i * 15}%`,
            y: "100%",
            opacity: 0,
            scale: 0,
          }}
          animate={{
            y: "-20%",
            opacity: [0, 0.8, 0],
            scale: [0, 1, 0.5],
          }}
          transition={{
            duration: 2 + i * 0.3,
            repeat: Infinity,
            delay: i * 0.2,
            ease: "easeOut",
          }}
        />
      ))}
    </>
  );
}
