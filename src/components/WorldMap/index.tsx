/* eslint-disable @next/next/no-img-element */
"use client";

import { useRef, useEffect, useState } from "react";
 
interface MapProps {
  points?: Array<{
    x: number;
    y: number;
  }>;
  pointColor?: string;
  coverMode?: boolean;
  className?: string;
}

export default function WorldMap({
  points = [],
  pointColor = "var(--color-brand-primary)",
  coverMode = false,
  className = "",
}: MapProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener("resize", checkMobile);
    
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  return (
    <div
      className={`${
        coverMode ? "absolute inset-0" : "w-full aspect-2/1"
      } rounded-lg ${className}`}
    >
      <img
        src="/images/world-map.svg"
        className={`${
          coverMode
            ? `object-cover h-full w-full ${isMobile ? "scale-150" : "scale-110 sm:scale-125"}`
            : "h-full w-full"
        } pointer-events-none select-none ${isMobile ? "opacity-60" : "opacity-40 sm:opacity-50"}`}
        alt="world map"
        height="495"
        width="1056"
        loading="lazy"
        decoding="async"
        draggable={false}
        style={{
          filter: isMobile 
            ? "brightness(1.4) contrast(1.2) sepia(0.1) hue-rotate(200deg)"
            : "brightness(1.2) contrast(1.1) sepia(0.1) hue-rotate(200deg)",
        }}
      />
      <svg
        ref={svgRef}
        viewBox="0 0 800 400"
        className="w-full h-full absolute inset-0 pointer-events-none select-none"
        preserveAspectRatio={coverMode ? "xMidYMid slice" : "xMidYMid meet"}
      >
        <defs>
          <linearGradient id="point-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor={pointColor} stopOpacity="1" />
            <stop offset="100%" stopColor={pointColor} stopOpacity="0.5" />
          </linearGradient>
          <filter id="glow">
            <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
            <feMerge> 
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>

        {points.map((point, i) => (
          <g key={`point-${i}`}>
            <circle cx={point.x} cy={point.y} r="2" fill={pointColor} filter="url(#glow)" />
            <circle
              cx={point.x}
              cy={point.y}
              r="8"
              fill={pointColor}
              opacity="0.3"
            >
              <animate
                attributeName="r"
                from="2"
                to="12"
                dur="2s"
                begin="0s"
                repeatCount="indefinite"
              />
              <animate
                attributeName="opacity"
                from="0.6"
                to="0"
                dur="2s"
                begin="0s"
                repeatCount="indefinite"
              />
            </circle>
          </g>
        ))}
      </svg>
    </div>
  );
}
