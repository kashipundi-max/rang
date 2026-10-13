"use client";

import { motion } from "framer-motion";

interface FloatingTooltipProps {
  isVisible: boolean;
  vsLastQuarterText: string;
}

export default function FloatingTooltip({
  isVisible,
  vsLastQuarterText,
}: FloatingTooltipProps) {
  return (
    <motion.div
      className="absolute top-8 end-6 z-10"
      initial={{ opacity: 0, y: 10, scale: 0.9 }}
      animate={
        isVisible
          ? { opacity: 1, y: 0, scale: 1 }
          : { opacity: 0, y: 10, scale: 0.9 }
      }
      transition={{ duration: 0.3, delay: 0.5 }}
    >
      <div className="relative bg-card-surface/90 backdrop-blur-sm border border-card-highlight-border rounded-lg px-3 py-2 shadow-lg">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-brand-primary-light shadow-[0_0_8px_rgba(74,222,128,0.6)]" />
          <span className="text-brand-primary-light text-xs font-semibold">
            +127%
          </span>
        </div>
        <p className="text-white/60 text-[10px] mt-0.5">{vsLastQuarterText}</p>
        {/* Arrow */}
        <div className="absolute -bottom-1.5 end-4 w-3 h-3 bg-card-surface/90 border-e border-b border-card-highlight-border rotate-45" />
      </div>
    </motion.div>
  );
}
