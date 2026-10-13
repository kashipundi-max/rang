"use client";

import { motion, useTransform, type MotionValue } from "framer-motion";
import { IconCheck } from "@tabler/icons-react";
import { cn } from "@/lib/utils";
import { rail } from "../config/steps";

interface RailEndCapProps {
  /** Same progress value that drives the rail beam. */
  progress: MotionValue<number>;
  className?: string;
}

/**
 * Terminating badge under the rail. It stays dim until the beam has almost
 * finished its run, then lights up to close the sequence.
 */
export function RailEndCap({ progress, className }: RailEndCapProps) {
  const opacity = useTransform(progress, [0.75, 0.98], [0.2, 1]);
  const scale = useTransform(progress, [0.75, 0.98], [0.85, 1]);

  return (
    <div
      aria-hidden="true"
      className={cn(
        "pointer-events-none relative flex h-24 w-full items-end justify-center",
        className
      )}
    >
      <span
        className="absolute top-0 bottom-12 left-1/2 w-px -translate-x-1/2"
        style={{ backgroundImage: rail.track }}
      />
      <motion.span
        className="relative flex size-12 items-center justify-center rounded-full bg-brand-primary text-white ring-2 ring-brand-primary-light/70"
        style={{ opacity, scale, boxShadow: rail.glow }}
      >
        <IconCheck className="size-6" stroke={2.25} />
      </motion.span>
    </div>
  );
}
