"use client";

import React, { forwardRef, useId } from "react";
import { cn } from "@/lib/utils";

export interface LiquidGlassProps {
  children: React.ReactNode;
  className?: string;
  /** Border radius in pixels */
  borderRadius?: number;
  /** Blur amount (1-20) */
  blurRadius?: number;
  /** Edge refraction intensity (0-1) */
  edgeIntensity?: number;
  /** Enable refraction distortion */
  enableRefraction?: boolean;
  /** Tint opacity (0-1) */
  tintOpacity?: number;
  /** Highlight intensity at top (0-1) */
  highlightIntensity?: number;
  /** Shape type */
  shape?: "rounded" | "pill" | "circle";
  /** Show inner shadow/depth */
  enableDepth?: boolean;
  /** Enable/disable the entire glass effect (content still visible) */
  enabled?: boolean;
}

/**
 * LiquidGlass - Realistic glass morphism effect with refraction
 * Uses SVG filters for glass distortion and backdrop-filter for blur
 */
export const LiquidGlass = forwardRef<HTMLDivElement, LiquidGlassProps>(
  (
    {
      children,
      className,
      borderRadius = 24,
      blurRadius = 12,
      edgeIntensity = 0.3,
      enableRefraction = true,
      tintOpacity = 0.1,
      highlightIntensity = 0.15,
      shape = "rounded",
      enableDepth = true,
      enabled = true,
    },
    ref
  ) => {
    const filterId = useId().replace(/:/g, "");
    const actualBorderRadius = shape === "pill" ? 9999 : borderRadius;

    return (
      <>
        {/* SVG Filter for glass refraction effect */}
        <svg
          className="absolute w-0 h-0 overflow-hidden"
          aria-hidden="true"
          style={{ position: "absolute", width: 0, height: 0 }}
        >
          <defs>
            {/* Glass refraction displacement filter */}
            <filter
              id={`glass-refract-${filterId}`}
              x="-20%"
              y="-20%"
              width="140%"
              height="140%"
              colorInterpolationFilters="sRGB"
            >
              {/* Create organic noise for glass distortion */}
              <feTurbulence
                type="fractalNoise"
                baseFrequency="0.015 0.015"
                numOctaves="3"
                seed="42"
                result="noise"
              />
              {/* Displacement for refraction */}
              <feDisplacementMap
                in="SourceGraphic"
                in2="noise"
                scale={edgeIntensity * 15}
                xChannelSelector="R"
                yChannelSelector="G"
                result="displaced"
              />
              {/* Slight blur for smoother refraction */}
              <feGaussianBlur
                in="displaced"
                stdDeviation="0.3"
                result="smoothed"
              />
              <feComposite in="smoothed" in2="SourceGraphic" operator="atop" />
            </filter>
          </defs>
        </svg>

        <div
          ref={ref}
          className={cn("relative", className)}
          style={{
            borderRadius: `${actualBorderRadius}px`,
          }}
        >
          {/* Main glass layer with backdrop blur and refraction */}
          <div
            className="absolute inset-0 pointer-events-none transition-all duration-300"
            style={{
              borderRadius: `${actualBorderRadius}px`,
              backdropFilter: enabled
                ? `blur(${blurRadius}px) saturate(180%) brightness(1.05)`
                : "none",
              WebkitBackdropFilter: enabled
                ? `blur(${blurRadius}px) saturate(180%) brightness(1.05)`
                : "none",
              filter:
                enabled && enableRefraction
                  ? `url(#glass-refract-${filterId})`
                  : undefined,
              backgroundColor: enabled
                ? `rgba(255, 255, 255, ${tintOpacity * 0.4})`
                : "transparent",
            }}
          />

          {/* Subtle top highlight for 3D glass effect */}
          <div
            className="absolute inset-0 pointer-events-none transition-opacity duration-300"
            style={{
              borderRadius: `${actualBorderRadius}px`,
              background: enabled
                ? `linear-gradient(180deg, rgba(255, 255, 255, ${highlightIntensity}) 0%, transparent 40%)`
                : "transparent",
              opacity: enabled ? 1 : 0,
            }}
          />

          {/* Glass border with subtle glow */}
          <div
            className="absolute inset-0 pointer-events-none transition-opacity duration-300"
            style={{
              borderRadius: `${actualBorderRadius}px`,
              border: `1px solid rgba(255, 255, 255, ${
                enabled ? highlightIntensity * 0.6 : 0
              })`,
            }}
          />

          {/* Inner edge glow/reflection for depth */}
          {enableDepth && (
            <div
              className="absolute inset-0 pointer-events-none transition-opacity duration-300"
              style={{
                borderRadius: `${actualBorderRadius}px`,
                boxShadow: enabled
                  ? `inset 0 1px 2px rgba(255, 255, 255, 0.2), inset 0 -1px 1px rgba(0, 0, 0, 0.15)`
                  : "none",
              }}
            />
          )}

          {/* Content */}
          <div className="relative z-10">{children}</div>
        </div>
      </>
    );
  }
);

LiquidGlass.displayName = "LiquidGlass";
