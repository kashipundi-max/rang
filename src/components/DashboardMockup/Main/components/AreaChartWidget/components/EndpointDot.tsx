"use client";

import React from "react";

interface EndpointDotProps {
  visible: boolean;
}

export function EndpointDot({ visible }: EndpointDotProps) {
  if (!visible) return null;

  return (
    <div
      className="absolute pointer-events-none animate-fade-in"
      style={{
        right: "3.5%",
        top: "27.5%",
      }}
    >
      <div className="relative">
        {/* Outer glow */}
        <div className="absolute w-6 h-6 bg-brand-primary-light rounded-full opacity-40 blur-sm -translate-x-1/2 -translate-y-1/2" />
        {/* Main dot */}
        <div
          className="relative w-3 h-3 bg-brand-primary-light rounded-full border border-accent -translate-x-1/2 -translate-y-1/2"
          style={{
            boxShadow: "0 0 12px var(--color-brand-primary-light)",
          }}
        />
      </div>
    </div>
  );
}
