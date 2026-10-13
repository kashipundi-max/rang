"use client";

import { motion, useTransform, type MotionValue } from "framer-motion";
import { cn } from "@/lib/utils";
import { rail } from "../config/steps";

interface RailBeamProps {
  /** 0 → 1 scroll progress for the column this rail belongs to. */
  progress: MotionValue<number>;
  className?: string;
}

/**
 * The 1px vertical spine: a static dim track, a beam that scales down it, and a
 * glowing head that rides the tip. Everything animates on `transform`/`opacity`
 * only, so the whole thing stays on the compositor while scrolling.
 */
export function RailBeam({ progress, className }: RailBeamProps) {
  const headTop = useTransform(progress, (value) => `${value * 100}%`);
  const headOpacity = useTransform(progress, [0, 0.02, 0.97, 1], [0, 1, 1, 0]);

  return (
    <div
      aria-hidden="true"
      className={cn(
        "relative flex w-px shrink-0 flex-col items-center self-stretch",
        className
      )}
    >
      <span
        className="absolute inset-y-0 left-1/2 w-px -translate-x-1/2"
        style={{ backgroundImage: rail.track }}
      />

      <motion.span
        className="absolute top-0 left-1/2 h-full w-px origin-top -translate-x-1/2 will-change-transform"
        style={{ scaleY: progress, backgroundImage: rail.beam }}
      />

      <motion.span
        className="absolute left-1/2 size-[5px] rounded-full bg-brand-primary-light"
        style={{
          top: headTop,
          opacity: headOpacity,
          translateX: "-50%",
          translateY: "-50%",
          boxShadow: rail.glow,
        }}
      />
    </div>
  );
}
