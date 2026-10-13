"use client";

import { useScroll, useSpring, type MotionValue } from "framer-motion";
import type { RefObject } from "react";

/**
 * Scroll progress (0 → 1) for a timeline column, smoothed by a spring so the
 * beam keeps travelling for a beat after the wheel stops instead of snapping.
 *
 * The offset starts the beam once the column's top reaches ~70% of the viewport
 * and finishes it just before the column leaves, so the head lines up with the
 * card the reader is actually looking at.
 */
export function useRailProgress(
  ref: RefObject<HTMLElement | null>
): MotionValue<number> {
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start 70%", "end 65%"],
  });

  return useSpring(scrollYProgress, {
    stiffness: 90,
    damping: 26,
    restDelta: 0.001,
  });
}
