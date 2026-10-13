"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { IconArrowRight } from "@tabler/icons-react";

interface MagneticButtonProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

export default function MagneticButton({
  children,
  className,
  onClick,
}: MagneticButtonProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e: React.MouseEvent<HTMLButtonElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    setMousePosition({ x: x * 0.3, y: y * 0.3 });
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setMousePosition({ x: 0, y: 0 });
  };

  return (
    <motion.button
      className={`relative px-5 py-2.5 rounded-xl text-button-text text-xs font-semibold overflow-hidden group ${className}`}
      aria-label="View follower"
      onClick={onClick}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={handleMouseLeave}
      animate={{
        x: mousePosition.x,
        y: mousePosition.y,
      }}
      whileTap={{ scale: 0.92 }}
      transition={{ type: "spring", stiffness: 400, damping: 17 }}
    >
      {/* Base background */}
      <div
        className="absolute inset-0 rounded-xl"
        style={{
          background:
            "color-mix(in srgb, var(--color-brand-primary) 50%, transparent)",
        }}
      />

      {/* Animated gradient border */}
      <motion.div
        className="absolute -inset-px rounded-xl opacity-0"
        style={{
          background:
            "linear-gradient(90deg, var(--color-brand-primary), var(--color-brand-primary-light), var(--color-brand-primary), var(--color-brand-primary-light))",
          backgroundSize: "300% 100%",
        }}
        animate={
          isHovered
            ? {
                opacity: 1,
                backgroundPosition: ["0% 0%", "100% 0%"],
              }
            : { opacity: 0 }
        }
        transition={{
          backgroundPosition: {
            duration: 2,
            repeat: Infinity,
            ease: "linear",
          },
          opacity: { duration: 0.3 },
        }}
      />

      {/* Inner background to create border effect */}
      <div
        className="absolute inset-px rounded-[10px]"
        style={{
          background:
            "color-mix(in srgb, var(--color-brand-primary) 50%, transparent)",
        }}
      />

      {/* Radial glow on hover */}
      <motion.div
        className="absolute inset-0 rounded-xl"
        style={{
          background:
            "radial-gradient(circle at center, var(--color-card-spotlight) 0%, transparent 70%)",
        }}
        initial={{ opacity: 0, scale: 0.8 }}
        animate={
          isHovered ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.8 }
        }
        transition={{ duration: 0.3 }}
      />

      {/* Shimmer sweep effect */}
      <motion.div
        className="absolute inset-0 rounded-xl"
        style={{
          background:
            "linear-gradient(120deg, transparent 0%, transparent 40%, rgba(255,255,255,0.15) 50%, transparent 60%, transparent 100%)",
        }}
        initial={{ x: "-100%" }}
        animate={isHovered ? { x: "100%" } : { x: "-100%" }}
        transition={{ duration: 0.6, ease: "easeInOut" }}
      />

      {/* Sparkle particles on hover */}
      <AnimatePresence>
        {isHovered && (
          <>
            {[...Array(4)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-1 h-1 rounded-full bg-white"
                initial={{
                  opacity: 0,
                  scale: 0,
                  x: "50%",
                  y: "50%",
                }}
                animate={{
                  opacity: [0, 1, 0],
                  scale: [0, 1, 0],
                  x: `${50 + (Math.random() - 0.5) * 100}%`,
                  y: `${50 + (Math.random() - 0.5) * 100}%`,
                }}
                exit={{ opacity: 0, scale: 0 }}
                transition={{
                  duration: 0.8,
                  delay: i * 0.1,
                  repeat: Infinity,
                  repeatDelay: 0.5,
                }}
              />
            ))}
          </>
        )}
      </AnimatePresence>

      {/* Button text with icon */}
      <motion.span
        className="relative z-10 flex items-center gap-1.5"
        animate={isHovered ? { scale: 1.05 } : { scale: 1 }}
        transition={{ type: "spring", stiffness: 400, damping: 17 }}
      >
        {children}
        <motion.span
          animate={isHovered ? { x: 3 } : { x: 0 }}
          transition={{ type: "spring", stiffness: 400, damping: 17 }}
        >
          <IconArrowRight className="w-3.5 h-3.5 rtl:rotate-180" stroke={2} />
        </motion.span>
      </motion.span>
    </motion.button>
  );
}
