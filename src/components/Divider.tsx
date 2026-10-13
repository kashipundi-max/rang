"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface DividerProps {
  /** Text label displayed in the divider */
  text?: string;
  /** Orientation of the divider */
  orientation?: "horizontal" | "vertical";
  /** Enable framer-motion animation (lazy loaded) */
  animated?: boolean;
  /** Animation delay in seconds */
  animationDelay?: number;
  /** Additional class names */
  className?: string;
}

// Lazy load motion component to reduce bundle size
const MotionDiv = React.lazy(() =>
  import("framer-motion").then((mod) => ({
    default: mod.motion.div,
  }))
);

function HorizontalDivider({
  text,
  className,
}: {
  text?: string;
  className?: string;
}) {
  return (
    <div className={cn("relative my-8", className)}>
      <div className="absolute inset-0 flex items-center">
        <div className="w-full border-t border-border-secondary/30" />
      </div>
      {text && (
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-bg-dark py-1 px-4 text-text-muted font-dm-sans">
            {text}
          </span>
        </div>
      )}
    </div>
  );
}

function VerticalDivider({
  text,
  className,
}: {
  text?: string;
  className?: string;
}) {
  return (
    <div
      className={cn("flex items-center justify-center self-stretch", className)}
    >
      <div className="relative h-full min-h-[200px] flex items-center justify-center">
        {/* Vertical line */}
        <div
          className="absolute inset-y-0 w-px bg-border-secondary/30"
          aria-hidden="true"
        />
        {/* Text label */}
        {text && (
          <div className="relative bg-bg-dark py-3 px-1 z-10">
            <span className="text-xs uppercase text-text-muted font-dm-sans whitespace-nowrap tracking-wider [writing-mode:vertical-lr] rotate-180">
              {text}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * Reusable divider component with horizontal or vertical orientation
 * Supports optional text label and animation
 */
function Divider({
  text,
  orientation = "horizontal",
  animated = false,
  animationDelay = 0.3,
  className,
}: DividerProps) {
  const content =
    orientation === "vertical" ? (
      <VerticalDivider text={text} className={className} />
    ) : (
      <HorizontalDivider text={text} className={className} />
    );

  if (animated) {
    return (
      <React.Suspense fallback={content}>
        <MotionDiv
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: animationDelay }}
        >
          {content}
        </MotionDiv>
      </React.Suspense>
    );
  }

  return content;
}

export { Divider };
export type { DividerProps };
