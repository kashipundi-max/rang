"use client";

import { useLayoutEffect, useState } from "react";

// Dashboard dimensions - must match DashboardMockup exactly
const DASHBOARD_WIDTH = 1296;
const DASHBOARD_HEIGHT = 990;
const DASHBOARD_SCALE_PADDING = 64;
const DASHBOARD_MIN_SCALE = 0.1;

function calculateScale(): number {
  if (typeof window === "undefined") return 1;

  if (window.innerWidth >= 1440) {
    return 1;
  }

  const screenWidth = window.innerWidth - DASHBOARD_SCALE_PADDING;
  let calculatedScale = Math.min(screenWidth / DASHBOARD_WIDTH, 1);

  if (window.innerWidth <= 640) {
    calculatedScale = calculatedScale * 0.75;
  }

  const minRequiredScale = (window.innerWidth - 32) / DASHBOARD_WIDTH;
  return Math.max(
    calculatedScale,
    Math.max(minRequiredScale, DASHBOARD_MIN_SCALE)
  );
}

// Calculate the actual height the dashboard occupies in the layout
// Must match getContainerStyle from DashboardMockup/utils/styles.ts
function calculateOccupiedHeight(scale: number): number {
  // Height = scaled height + marginBottom adjustment
  // marginBottom: scale < 1 ? (1 - scale) * -1000 : 0
  const scaledHeight = DASHBOARD_HEIGHT * scale;
  const marginBottomAdjustment = scale < 1 ? (1 - scale) * -1000 : 0;
  return scaledHeight + marginBottomAdjustment;
}

export default function DashboardLoadingPlaceholder() {
  const [mounted, setMounted] = useState(false);
  const [scale, setScale] = useState(1); // Default to 1 (large screen)
  const [isLargeScreen, setIsLargeScreen] = useState(true); // Default to true to prevent flash

  useLayoutEffect(() => {
    const updateScale = () => {
      const isLarge = window.innerWidth >= 1440;
      setIsLargeScreen(isLarge);
      setScale(calculateScale());
    };

    updateScale();
    setMounted(true);

    window.addEventListener("resize", updateScale);
    return () => window.removeEventListener("resize", updateScale);
  }, []);

  // Calculate styles to match exactly with DashboardMockup
  // Use centered layout as default (before mount) to prevent flash on large screens
  const useCenteredLayout = !mounted || isLargeScreen;

  const containerStyle = {
    width: DASHBOARD_WIDTH,
    height: DASHBOARD_HEIGHT,
    transformOrigin: useCenteredLayout ? "top center" : "top left",
    transform: `scale(${scale})`,
    marginBottom: scale < 1 ? `${(1 - scale) * -1000}px` : "0px",
    marginLeft: useCenteredLayout ? "auto" : 16,
    marginRight: useCenteredLayout ? "auto" : 0,
    borderRadius: 20,
    opacity: mounted ? 1 : 0,
  };

  return (
    <div dir="ltr">
      <div
        className="relative flex flex-col rounded-[20px] z-10"
        style={containerStyle}
      >
        {/* Minimal skeleton - just showing loading state */}
        <div className="flex h-full rounded-[20px] overflow-hidden">
          <div className="w-[72px] h-full bg-bg-dark/30" />
          <div className="flex-1 h-full bg-bg-card/20 rounded-tr-[20px] rounded-br-[20px]" />
        </div>
      </div>
    </div>
  );
}
