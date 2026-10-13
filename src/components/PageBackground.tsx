"use client";

import { cn } from "@/lib/utils";

interface PageBackgroundProps {
  /** Additional class names */
  className?: string;
  /** Show grid pattern overlay */
  showGrid?: boolean;
  /** Show radial glow effects */
  showGlow?: boolean;
  /** Grid size in pixels */
  gridSize?: number;
  /** Grid line opacity (0-1) */
  gridOpacity?: number;
}

/**
 * Reusable page background with grid pattern and radial glow effects
 * Used for auth pages, error pages, and other full-page layouts
 */
export function PageBackground({
  className,
  showGrid = true,
  showGlow = true,
  gridSize = 60,
  gridOpacity = 0.02,
}: PageBackgroundProps) {
  return (
    <div
      className={cn(
        "absolute inset-0 pointer-events-none overflow-hidden",
        className
      )}
    >
      {/* Grid pattern */}
      {showGrid && (
        <div
          className="absolute inset-0"
          style={{
            opacity: gridOpacity,
            backgroundImage: `linear-gradient(to right, rgba(255,255,255,0.1) 1px, transparent 1px),
                             linear-gradient(to bottom, rgba(255,255,255,0.1) 1px, transparent 1px)`,
            backgroundSize: `${gridSize}px ${gridSize}px`,
          }}
          aria-hidden="true"
        />
      )}

      {/* Radial glow effects */}
      {showGlow && (
        <>
          <div
            className="absolute top-1/4 start-1/4 w-[500px] h-[500px] bg-brand-primary/5 rounded-full blur-[120px]"
            aria-hidden="true"
          />
          <div
            className="absolute bottom-1/4 end-1/4 w-[400px] h-[400px] bg-brand-primary/5 rounded-full blur-[100px]"
            aria-hidden="true"
          />
        </>
      )}
    </div>
  );
}
