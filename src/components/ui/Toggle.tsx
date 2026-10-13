"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface ToggleProps {
  enabled: boolean;
  onToggle: (enabled: boolean) => void;
  size?: "sm" | "md" | "lg";
  className?: string;
  ariaLabel?: string;
}

const sizeConfig = {
  sm: {
    track: "w-10 h-5",
    thumb: "w-3.5 h-3.5",
    thumbOffset: { enabled: "calc(100% - 18px)", disabled: "3px" },
    topOffset: "top-[3px]",
  },
  md: {
    track: "w-14 h-7",
    thumb: "w-5 h-5",
    thumbOffset: { enabled: "calc(100% - 24px)", disabled: "4px" },
    topOffset: "top-1",
  },
  lg: {
    track: "w-16 h-8",
    thumb: "w-6 h-6",
    thumbOffset: { enabled: "calc(100% - 28px)", disabled: "4px" },
    topOffset: "top-1",
  },
};

export function Toggle({
  enabled,
  onToggle,
  size = "md",
  className,
  ariaLabel = "Toggle",
}: ToggleProps) {
  const config = sizeConfig[size];

  return (
    <button
      onClick={() => onToggle(!enabled)}
      className={cn(
        "relative rounded-full bg-bg-card border border-border-primary/30 transition-colors duration-200",
        config.track,
        className
      )}
      aria-label={ariaLabel}
      role="switch"
      aria-checked={enabled}
    >
      <motion.div
        className={cn(
          "absolute rounded-full bg-brand-primary",
          config.thumb,
          config.topOffset
        )}
        animate={{
          left: enabled
            ? config.thumbOffset.enabled
            : config.thumbOffset.disabled,
        }}
        transition={{ type: "spring", stiffness: 500, damping: 30 }}
      />
    </button>
  );
}
