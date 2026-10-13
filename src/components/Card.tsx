import * as React from "react";
import { cn } from "@/lib/utils";

interface CardProps {
  /** Enable framer-motion animation (lazy loaded) */
  animated?: boolean;
  /** Show decorative gradient orbs in corners */
  showOrbs?: boolean;
  /** Custom animation settings when animated=true */
  animationConfig?: {
    initial?: { opacity?: number; y?: number; x?: number; scale?: number };
    animate?: { opacity?: number; y?: number; x?: number; scale?: number };
    duration?: number;
  };
  /** Additional class names */
  className?: string;
  /** Card content */
  children: React.ReactNode;
}

// Lazy load motion component to reduce bundle size
const MotionDiv = React.lazy(() =>
  import("framer-motion").then((mod) => ({
    default: mod.motion.div,
  }))
);

function DecorativeOrbs() {
  return (
    <>
      <div
        className="absolute -top-20 -end-20 w-40 h-40 bg-brand-primary/20 rounded-full blur-3xl pointer-events-none"
        aria-hidden="true"
      />
      <div
        className="absolute -bottom-20 -start-20 w-40 h-40 bg-brand-glow/30 rounded-full blur-3xl pointer-events-none"
        aria-hidden="true"
      />
    </>
  );
}

function Card({
  className,
  animated = false,
  showOrbs = false,
  animationConfig,
  children,
}: CardProps) {
  const baseClasses = cn(
    "relative dash-card p-6 sm:p-8 overflow-hidden",
    className
  );

  const defaultAnimation = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    duration: 0.5,
  };

  const animation = animationConfig
    ? { ...defaultAnimation, ...animationConfig }
    : defaultAnimation;

  const content = (
    <>
      {showOrbs && <DecorativeOrbs />}
      {children}
    </>
  );

  if (animated) {
    return (
      <React.Suspense fallback={<div className={baseClasses}>{content}</div>}>
        <MotionDiv
          className={baseClasses}
          initial={animation.initial}
          animate={animation.animate}
          transition={{ duration: animation.duration }}
        >
          {content}
        </MotionDiv>
      </React.Suspense>
    );
  }

  return <div className={baseClasses}>{content}</div>;
}

export { Card, DecorativeOrbs };
export type { CardProps };
