import { cn } from "@/lib/utils";
import React from "react";

interface GridBgProps {
  mask_size?: number;
  pattern_size?: number;
  dot_size?: number;
  pattern_type?: "grid" | "dots" | "cross";
  opacity?: number;
  className?: string;
  invertMask?: boolean;
  left?: string;
  top?: string;
  right?: string;
  bottom?: string;
}

/**
 * A versatile background pattern component with multiple pattern options
 * Uses CSS variables from globals.css for theme-aware colors
 */
export function GridBg({
  mask_size = 600,
  pattern_size = 80,
  dot_size = 1,
  pattern_type = "grid",
  opacity = 0.1,
  className = "",
  invertMask = false,
  left,
  top,
  right,
  bottom,
}: GridBgProps) {
  // Create CSS variable references with opacity directly applied
  // This approach will automatically update when the theme changes
  const lineColor = `var(--grid-line-color)`;
  const lightLineColor = `var(--grid-line-color-light)`;
  
  // Create the background pattern based on type
  const getBackgroundImage = () => {
     
    switch (pattern_type) {
      case "dots":
        return {
          backgroundImage: `radial-gradient(circle, ${lineColor} ${dot_size}px, transparent 0)`,
          backgroundSize: `${pattern_size}px ${pattern_size}px`,
          opacity: opacity, // Apply opacity directly
        };
      
      case "cross":
        return {
          backgroundImage: `
            linear-gradient(to right, ${lineColor} 1px, transparent 1px),
            linear-gradient(to bottom, ${lineColor} 1px, transparent 1px),
            linear-gradient(45deg, transparent calc(50% - 0.5px), ${lightLineColor} calc(50% - 0.5px), ${lightLineColor} calc(50% + 0.5px), transparent calc(50% + 0.5px)),
            linear-gradient(-45deg, transparent calc(50% - 0.5px), ${lightLineColor} calc(50% - 0.5px), ${lightLineColor} calc(50% + 0.5px), transparent calc(50% + 0.5px))
          `,
          backgroundSize: `${pattern_size}px ${pattern_size}px, ${pattern_size}px ${pattern_size}px, ${pattern_size}px ${pattern_size}px, ${pattern_size}px ${pattern_size}px`,
          backgroundPosition: `0 0, 0 0, 0 0, 0 0`,
          opacity: opacity, // Apply opacity directly
        };
      
      default:
        return {
          backgroundImage: `
            linear-gradient(to right, ${lineColor} 1px, transparent 1px),
            linear-gradient(to bottom, ${lineColor} 1px, transparent 1px)
          `,
          backgroundSize: `${pattern_size}px ${pattern_size}px`,
          opacity: opacity, // Apply opacity directly
        };
    }
  };

  // Create mask image based on invertMask prop
  const maskImage = invertMask
    ? `radial-gradient(${mask_size}px, transparent, #000)`
    : `radial-gradient(${mask_size}px, #000, transparent)`;

  return (
    <div
      className={cn(
        "absolute inset-0 w-full h-full pointer-events-none z-0", 
        className
      )}
      style={{
        ...getBackgroundImage(),
        maskImage,
        WebkitMaskImage: maskImage,
        position: "absolute",
        left,
        top,
        right,
        bottom,
      }}
    />
  );
}