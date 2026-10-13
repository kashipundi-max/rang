"use client";

import { motion } from "framer-motion";
import MagneticButton from "@/components/MagneticButton";
import LogoIcon from "./LogoIcon";

interface FollowerCardProps {
  username: string;
  isHighlighted: boolean;
  index: number;
  startedFollowingText: string;
  viewText: string;
}

export default function FollowerCard({
  username,
  isHighlighted,
  index,
  startedFollowingText,
  viewText,
}: FollowerCardProps) {
  return (
    <motion.div
      className={`flex items-center justify-between px-2 sm:px-3 py-2 sm:py-2.5 rounded-xl border transition-colors ${
        isHighlighted
          ? "bg-card-highlight-bg border-card-highlight-border shadow-lg shadow-brand-glow/20"
          : "bg-white/[0.03] border-card-border/80"
      }`}
      initial={{ opacity: 0, x: -30, filter: "blur(4px)" }}
      whileInView={{
        opacity: 1,
        x: 0,
        filter: "blur(0px)",
      }}
      viewport={{ once: true }}
      transition={{
        type: "spring",
        stiffness: 100,
        damping: 20,
        delay: index * 0.1 + 0.3,
      }}
      whileHover={{
        backgroundColor: isHighlighted
          ? "var(--color-card-highlight-bg)"
          : "rgba(255, 255, 255, 0.05)",
        borderColor: "var(--color-card-border-hover)",
        x: 4,
        transition: { duration: 0.2 },
      }}
    >
      <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
        <motion.div
          className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl bg-card-highlight-bg flex items-center justify-center border border-card-highlight-border/50 shrink-0"
          whileHover={{ scale: 1.1, rotate: 5 }}
          transition={{ type: "spring", stiffness: 400, damping: 17 }}
        >
          <LogoIcon />
        </motion.div>
        <div className="flex flex-col gap-0.5 min-w-0">
          <span className="text-white text-xs sm:text-sm font-semibold tracking-tight truncate">
            {username}
          </span>
          <span className="text-text-muted text-[10px] sm:text-xs truncate">
            {startedFollowingText}
          </span>
        </div>
      </div>
      <div className="hidden sm:block shrink-0 ms-2">
        <MagneticButton>{viewText}</MagneticButton>
      </div>
    </motion.div>
  );
}
