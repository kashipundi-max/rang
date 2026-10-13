"use client";

import React from "react";
import { motion } from "framer-motion";
import { useDirection } from "@/hooks/locale/useDirection";
import { useCardHover, useViewportCallback } from "./hooks";
import {
  cardVariants,
  contentVariants,
  fadeVariants,
  STAGGER_STEP,
} from "./config";
import {
  SpotlightEffect,
  GlareEffect,
  AnimatedBorder,
  GridPattern,
  FloatingParticles,
  GlowEffect,
  CardBorder,
  BottomFadeOverlay,
  CardTextContent,
} from "./components";

interface CardLayoutProps {
  children: React.ReactNode;
  className?: string;
  title?: string;
  description?: string;
  index?: number;
  onHoverChange?: (isHovered: boolean) => void;
  onInView?: () => void;
}

export default function CardLayout({
  children,
  className,
  title,
  description,
  index = 0,
  onHoverChange,
  onInView,
}: CardLayoutProps) {
  const { isRTL } = useDirection();

  const {
    cardRef,
    isHovered,
    spotlightX,
    spotlightY,
    glareX,
    glareY,
    handleMouseMove,
    handleMouseEnter,
    handleMouseLeave,
  } = useCardHover(onHoverChange);

  const { handleViewportEnter } = useViewportCallback(onInView);

  const staggerDelay = index * STAGGER_STEP;

  return (
    <motion.div
      ref={cardRef}
      className={`relative w-full h-full rounded-[20px] overflow-hidden ${className}`}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.2, margin: "-50px" }}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onViewportEnter={handleViewportEnter}
    >
      {/* Main Card Container */}
      <motion.div
        className="relative w-full h-full bg-card-bg rounded-[20px] overflow-hidden"
        variants={cardVariants}
        custom={staggerDelay}
      >
        {/* Dynamic spotlight that follows cursor */}
        <SpotlightEffect
          spotlightX={spotlightX}
          spotlightY={spotlightY}
          isHovered={isHovered}
        />

        {/* Holographic glare effect */}
        <GlareEffect
          glareX={glareX}
          glareY={glareY}
          isHovered={isHovered}
          isRTL={isRTL}
        />

        {/* Animated border glow */}
        <AnimatedBorder isHovered={isHovered} />

        {/* Inner card background */}
        <div className="absolute inset-px bg-card-bg-inner rounded-[19px] z-2" />

        {/* Animated grid pattern */}
        <GridPattern staggerDelay={staggerDelay} />

        {/* Floating ambient particles */}
        <FloatingParticles isHovered={isHovered} />

        {/* Glow Effect - Top Start with breathing animation */}
        <GlowEffect isHovered={isHovered} />

        {/* Card Content with stagger animation */}
        <motion.div
          className="absolute inset-0 z-10"
          variants={contentVariants}
          custom={staggerDelay}
        >
          {children}
        </motion.div>

        {/* Bottom Fade Overlay */}
        <BottomFadeOverlay />

        {/* Border with silver shine */}
        <CardBorder isHovered={isHovered} index={index} />

        {/* Title and Description */}
        <CardTextContent
          title={title}
          description={description}
          staggerDelay={staggerDelay}
        />
      </motion.div>
    </motion.div>
  );
}
