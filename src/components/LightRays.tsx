"use client";

import React from "react";
import dynamic from "next/dynamic";
import Spotlight from "./Spotlight";
import { useDevicePerformance } from "@/hooks/useDevicePerformance";

const DustParticlesWebGL = dynamic(() => import("./DustParticlesWebGL"), {
  ssr: false,
});

export interface SpotlightProps {
  width: string;
  left: string;
  rotation: number;
  color: "light" | "medium" | "dark";
  opacity: number;
  blur: number;
  animate?: "sway" | "pulse";
  delay: number;
}

interface RaysLightsProps {
  className?: string;
  spotlights?: Array<SpotlightProps>;
}

export const defaultSpotlights: Array<SpotlightProps> = [
  {
    width: "25%",
    left: "68%",
    rotation: 45,
    color: "dark",
    opacity: 0.6,
    blur: 25,
    animate: "sway",
    delay: 0.8,
  },
  {
    width: "38%",
    left: "65.5%",
    rotation: 35,
    color: "dark",
    opacity: 0.3,
    blur: 25,
    animate: "sway",
    delay: 1.2,
  },
  {
    width: "55%",
    left: "52%",
    rotation: 15,
    color: "dark",
    opacity: 0.6,
    blur: 25,
    animate: "sway",
    delay: 0.4,
  },
  {
    width: "28%",
    left: "65.5%",
    rotation: 40,
    color: "dark",
    opacity: 0.2,
    blur: 15,
    delay: 1.6,
  },
  {
    width: "48%",
    left: "46%",
    rotation: -15,
    color: "dark",
    opacity: 0.3,
    blur: 25,
    animate: "sway",
    delay: 0.6,
  },
  {
    width: "28%",
    left: "63%",
    rotation: -15,
    color: "dark",
    opacity: 0.5,
    blur: 25,
    animate: "sway",
    delay: 1.0,
  },
];

// Convert hex to RGB string (e.g., "#22c55e" -> "34,197,94")
function hexToRgb(hex: string): string {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) return "255,255,255";
  return `${parseInt(result[1], 16)},${parseInt(result[2], 16)},${parseInt(
    result[3],
    16
  )}`;
}

export default function LightRays({
  className = "",
  spotlights = defaultSpotlights,
}: RaysLightsProps) {
  const { isLowEnd, hasReducedMotion } = useDevicePerformance();
  // ============================================================
  // PERFORMANCE MODE CHECK
  // ============================================================
  // Checks localStorage for "template-performance-mode".
  // When set to "on", dust particles and animations are disabled.
  // Controlled by ThemeColorSwitcher (demo only).
  //
  // For production: Just set this to true or false:
  //   const [performanceMode, setPerformanceMode] = React.useState(false);
  // ============================================================
  const [performanceMode, setPerformanceMode] = React.useState(false);

  React.useEffect(() => {
    setPerformanceMode(
      localStorage.getItem("template-performance-mode") === "on"
    );
  }, []);

  // Get theme colors from CSS variables
  const getThemeColor = (varName: string, fallback: string): string => {
    if (typeof window === "undefined") return fallback;
    const value = getComputedStyle(document.documentElement)
      .getPropertyValue(varName)
      .trim();
    return value || fallback;
  };

  // Use brand colors from theme - these will be read at render time
  // Fallback to neutral gray so there's no color flash before theme loads
  const [colors, setColors] = React.useState({
    light: "120,120,120", // fallback gray
    medium: "80,80,80", // fallback gray
    dark: "50,50,50", // fallback gray
  });

  React.useEffect(() => {
    const updateColors = () => {
      // Read actual theme colors with neutral fallbacks
      const primaryLight = getThemeColor(
        "--color-brand-primary-light",
        "#a0a0a0"
      );
      const primary = getThemeColor("--color-brand-primary", "#808080");
      const surface = getThemeColor("--color-brand-surface", "#404040");

      setColors({
        light: hexToRgb(primaryLight),
        medium: hexToRgb(primary),
        dark: hexToRgb(surface),
      });
    };

    // Initial read
    updateColors();

    // Watch for theme changes via MutationObserver on documentElement style/class changes
    const observer = new MutationObserver(() => {
      updateColors();
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["style", "class", "data-theme"],
    });

    return () => observer.disconnect();
  }, []);

  return (
    <div
      className={`absolute inset-0 w-full h-full ${className}`}
      style={{ opacity: 1 }}
    >
      {/* Dark background base */}
      <div className="absolute inset-0 bg-bg-dark" />

      {/* Render spotlights using map */}
      {spotlights.map((spotlight, index) => (
        <Spotlight
          key={`spotlight-${index}`}
          width={spotlight.width}
          left={spotlight.left}
          rotation={spotlight.rotation}
          color={colors[spotlight.color]}
          opacity={spotlight.opacity}
          blur={spotlight.blur}
          animate={performanceMode ? "none" : spotlight.animate}
          delay={spotlight.delay}
          // The secondary cone carries the widest blur of the three (blur x 1.5)
          // over the largest area, so it is the most expensive layer per
          // spotlight and the least visible. Phones and low-end machines - which
          // form the first impression on the slowest hardware - render the
          // primary and edge cones only.
          volumetric={!isLowEnd}
        />
      ))}

      {/* Dust particles component - WebGL powered */}
      {!isLowEnd && !hasReducedMotion && !performanceMode && (
        <DustParticlesWebGL enabled />
      )}

      {/* Light atmosphere with brand color tint */}
      <div
        className={`absolute top-0 left-0 w-full h-full opacity-15 ${
          performanceMode ? "" : "animate-pulse-slow"
        }`}
        style={{
          // No blur. A radial gradient is already perfectly smooth, and this
          // one fades to fully transparent well inside its own box, so there
          // was no edge for a blur to soften - at 15% opacity the 40px filter
          // that used to sit here changed nothing visible while forcing a
          // full-hero (~0.67 MPx) layer to be rasterized through it.
          background: `radial-gradient(ellipse at top center, 
            rgba(${colors.light}, 0.2) 0%, 
            rgba(${colors.light}, 0) 70%)`,
        }}
      />
    </div>
  );
}
