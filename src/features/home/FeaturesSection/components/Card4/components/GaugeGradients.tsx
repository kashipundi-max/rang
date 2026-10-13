"use client";

import React from "react";

export function GaugeGradients() {
  return (
    <defs>
      <linearGradient id="outerArcGrad" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stopColor="var(--color-brand-glow)" />
        <stop offset="25%" stopColor="var(--color-brand-surface)" />
        <stop offset="50%" stopColor="var(--color-brand-primary)" />
        <stop offset="75%" stopColor="var(--color-brand-primary-light)" />
        <stop offset="100%" stopColor="var(--color-accent)" />
      </linearGradient>
      <linearGradient id="innerArcGrad" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stopColor="var(--color-brand-surface)" />
        <stop offset="30%" stopColor="var(--color-brand-primary)" />
        <stop offset="60%" stopColor="var(--color-brand-primary-light)" />
        <stop offset="100%" stopColor="var(--color-accent)" />
      </linearGradient>
      <filter id="glowFilter" x="-50%" y="-50%" width="200%" height="200%">
        <feGaussianBlur stdDeviation="4" result="blur" />
        <feMerge>
          <feMergeNode in="blur" />
          <feMergeNode in="SourceGraphic" />
        </feMerge>
      </filter>
      <linearGradient id="needleGrad" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stopColor="var(--color-brand-glow)" />
        <stop offset="100%" stopColor="var(--color-brand-surface)" />
      </linearGradient>
      <linearGradient id="greenTipGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="var(--color-brand-primary-light)" />
        <stop offset="100%" stopColor="var(--color-brand-primary)" />
      </linearGradient>
      <radialGradient id="centerGlow" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stopColor="#FFFFFF" />
        <stop offset="40%" stopColor="var(--color-accent)" />
        <stop offset="100%" stopColor="var(--color-brand-surface)" />
      </radialGradient>
      <filter id="arcShadow" x="-20%" y="-20%" width="140%" height="140%">
        <feDropShadow
          dx="0"
          dy="2"
          stdDeviation="3"
          floodColor="#000"
          floodOpacity="0.5"
        />
      </filter>
    </defs>
  );
}
