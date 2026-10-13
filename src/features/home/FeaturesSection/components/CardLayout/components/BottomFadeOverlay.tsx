"use client";

import React from "react";

export function BottomFadeOverlay() {
  return (
    <>
      {/* Bottom Fade Overlay - stronger on mobile for better text readability */}
      <div
        className="absolute bottom-0 start-0 end-0 h-[60%] sm:h-[50%] pointer-events-none z-20"
        style={{
          background:
            "linear-gradient(to bottom, transparent 0%, var(--color-card-overlay) 30%, var(--color-card-bg) 70%)",
        }}
      />
      {/* Additional mobile overlay for text clarity */}
      <div
        className="absolute bottom-0 start-0 end-0 h-[45%] pointer-events-none z-20 sm:hidden"
        style={{
          background:
            "linear-gradient(to bottom, transparent 0%, var(--color-card-bg) 60%)",
        }}
      />
    </>
  );
}
