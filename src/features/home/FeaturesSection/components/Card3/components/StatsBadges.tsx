"use client";

import { motion } from "framer-motion";

interface StatsBadgesProps {
  isVisible: boolean;
  growthRateText: string;
  targetText: string;
}

export default function StatsBadges({
  isVisible,
  growthRateText,
  targetText,
}: StatsBadgesProps) {
  return (
    <div className="absolute top-8 start-6 flex flex-col gap-2 z-10">
      <motion.div
        className="flex items-center gap-2 bg-card-surface/80 backdrop-blur-sm border border-card-highlight-border rounded-full px-3 py-1.5"
        initial={{ opacity: 0, x: -20 }}
        animate={isVisible ? { opacity: 1, x: 0 } : { opacity: 0, x: -20 }}
        transition={{ duration: 0.4, delay: 0.3 }}
      >
        <svg
          className="w-3 h-3 text-card-accent"
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path
            fillRule="evenodd"
            d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L11 10.586 14.586 7H12z"
            clipRule="evenodd"
          />
        </svg>
        <span className="text-white/80 text-[10px] font-medium">
          {growthRateText}
        </span>
      </motion.div>
      <motion.div
        className="flex items-center gap-2 bg-card-surface/80 backdrop-blur-sm border border-card-highlight-border rounded-full px-3 py-1.5"
        initial={{ opacity: 0, x: -20 }}
        animate={isVisible ? { opacity: 1, x: 0 } : { opacity: 0, x: -20 }}
        transition={{ duration: 0.4, delay: 0.45 }}
      >
        <span className="text-card-accent text-xs font-bold">95%</span>
        <span className="text-white/50 text-[10px]">{targetText}</span>
      </motion.div>
    </div>
  );
}
