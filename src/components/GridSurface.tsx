import * as React from "react";
import { cn } from "@/lib/utils";

interface GridSurfaceProps {
  children: React.ReactNode;
  className?: string;
  /** "outer" is the page-level panel, "inner" the nested sub-panels */
  variant?: "outer" | "inner";
  /** Radial brand glow in the top-start corner */
  glow?: boolean;
  /** Grid cell size in pixels */
  gridSize?: number;
  id?: string;
}

/**
 * Static card surface sharing the Evaluation Features card skin - card
 * background, animated-looking grid pattern and brand glow - without the
 * cursor-tracking effects, so it can wrap interactive content of any height.
 */
export function GridSurface({
  children,
  className,
  variant = "outer",
  glow = false,
  gridSize = 28,
  id,
}: GridSurfaceProps) {
  return (
    <div
      id={id}
      className={cn(
        "relative overflow-hidden rounded-[20px] border",
        variant === "outer"
          ? "border-card-border bg-card-bg"
          : "border-card-border/70 bg-card-surface",
        className
      )}
    >
      {/* Inner surface */}
      <div
        className="pointer-events-none absolute inset-px rounded-[19px] bg-card-bg-inner"
        aria-hidden="true"
      />

      {/* Grid pattern */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.08]"
        style={{
          backgroundImage: `
            linear-gradient(to right, var(--color-card-grid) 1px, transparent 1px),
            linear-gradient(to bottom, var(--color-card-grid) 1px, transparent 1px)
          `,
          backgroundSize: `${gridSize}px ${gridSize}px`,
          maskImage: "linear-gradient(to bottom, black 35%, transparent 85%)",
          WebkitMaskImage:
            "linear-gradient(to bottom, black 35%, transparent 85%)",
        }}
        aria-hidden="true"
      />

      {glow && (
        <div
          className="pointer-events-none absolute -top-24 start-[-60px] h-[280px] w-[280px] rounded-full"
          style={{
            background:
              "radial-gradient(circle, var(--color-card-spotlight) 0%, transparent 70%)",
            filter: "blur(30px)",
          }}
          aria-hidden="true"
        />
      )}

      <div className="relative z-10">{children}</div>
    </div>
  );
}

export default GridSurface;
