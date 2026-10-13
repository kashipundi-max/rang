"use client";

import { cn } from "@/lib/utils";
import { forwardRef } from "react";

export type BadgeVariant = "primary" | "outline" | "glass";
export type BadgeSize = "xs" | "sm" | "md" | "lg";

export interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  size?: BadgeSize;
  className?: string;
  /** Enable enhanced glass effect */
  enableGlassEffect?: boolean;
  /** Enable shine animation that sweeps across the badge */
  enableShine?: boolean;
  /** Show a pulsing indicator dot before the content */
  showPulse?: boolean;
  /** Color of the pulse indicator (default: emerald) */
  pulseColor?: "emerald" | "brand" | "amber" | "red";
}

const variantStyles: Record<BadgeVariant, string> = {
  primary:
    "bg-brand-primary/20 border-brand-primary-light/50 text-brand-primary-light",
  outline: "bg-brand-surface border-brand-border text-brand-primary-light",
  glass:
    "bg-white/5 backdrop-blur-md border-white/10 text-brand-primary-light shadow-[0_0_20px_rgba(255,255,255,0.05),inset_0_1px_0_rgba(255,255,255,0.1)]",
};

const sizeStyles: Record<BadgeSize, string> = {
  xs: "px-2 py-0.5 text-[8px] sm:text-[9px] tracking-[0.7px] leading-[12px] sm:leading-[14px]",
  sm: "px-2 py-0.5 text-[9px] sm:text-[10px] tracking-[0.8px] leading-[14px] sm:leading-[16px]",
  md: "px-3 py-1 text-[10px] sm:text-xs tracking-[0.98px] leading-[16px] sm:leading-[18px]",
  lg: "px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm tracking-[0.98px] leading-[18px] sm:leading-[20px]",
};

const pulseColors = {
  emerald: { ping: "bg-emerald-400", dot: "bg-emerald-500" },
  brand: { ping: "bg-brand-primary", dot: "bg-brand-primary" },
  amber: { ping: "bg-amber-400", dot: "bg-amber-500" },
  red: { ping: "bg-red-400", dot: "bg-red-500" },
};

// Glass effect styles matching CSSGlassEffect component
const glassStyles =
  "bg-transparent backdrop-blur-[12px] border-none text-brand-primary-light";

/**
 * Reusable Badge component for labels, tags, and category indicators
 */
export const Badge = forwardRef<HTMLSpanElement, BadgeProps>(
  (
    {
      children,
      variant = "primary",
      size = "md",
      className,
      enableGlassEffect = false,
      enableShine = false,
      showPulse = false,
      pulseColor = "emerald",
      ...props
    },
    ref
  ) => {
    const baseStyles =
      "inline-flex items-center justify-center font-medium uppercase rounded-full font-dm-sans relative overflow-hidden";

    const pulse = pulseColors[pulseColor];

    return (
      <span
        ref={ref}
        className={cn(
          baseStyles,
          enableGlassEffect ? glassStyles : ["border", variantStyles[variant]],
          sizeStyles[size],
          showPulse && "gap-2",
          className
        )}
        {...props}
      >
        {/* Glass effect overlays */}
        {enableGlassEffect && (
          <>
            {/* Top highlight gradient */}
            <span
              className="absolute inset-x-0 top-0 h-1/2 pointer-events-none rounded-t-full"
              style={{
                background:
                  "linear-gradient(180deg, rgba(255, 255, 255, 0.12) 0%, transparent 100%)",
              }}
            />
            {/* Edge highlight */}
            <span
              className="absolute inset-0 pointer-events-none rounded-full"
              style={{
                boxShadow:
                  "inset 0 1px 0 rgba(255, 255, 255, 0.1), inset 0 -1px 0 rgba(0, 0, 0, 0.05)",
              }}
            />
          </>
        )}

        {/* Pulse indicator */}
        {showPulse && (
          <span className="relative flex h-2 w-2 z-10">
            <span
              className={cn(
                "animate-ping absolute inline-flex h-full w-full rounded-full opacity-75",
                pulse.ping
              )}
            />
            <span
              className={cn(
                "relative inline-flex rounded-full h-2 w-2",
                pulse.dot
              )}
            />
          </span>
        )}

        {/* Content */}
        <span className="relative z-10">{children}</span>

        {/* Shine animation overlay */}
        {enableShine && (
          <span
            className="absolute inset-0 z-20 pointer-events-none rounded-full animate-[badge-shine_4s_ease-in-out_infinite]"
            style={{
              background:
                "linear-gradient(105deg, transparent 20%, rgba(255,255,255,0.15) 50%, transparent 80%)",
            }}
          />
        )}
      </span>
    );
  }
);

Badge.displayName = "Badge";

export default Badge;
