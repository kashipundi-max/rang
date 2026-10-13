/* eslint-disable @typescript-eslint/ban-ts-comment */
"use client";
import React from "react";

interface SpotlightProps {
  width: string;
  left: string;
  rotation: number;
  opacity?: number;
  color?: string;
  blur?: number;
  className?: string;
  animate?: "pulse" | "sway" | "none";
  delay?: number;
  intensity?: number;
  volumetric?: boolean;
}

/**
 * A volumetric light cone.
 *
 * Deliberately composited with normal blending. Each cone used to carry
 * `mix-blend-mode: screen`, which forces the browser to re-blend the element
 * against its backdrop every frame; that defeats the texture cache a blurred
 * layer would otherwise get, so the hero's 24 blurred cones were re-composited
 * continuously while they swayed. Over the hero's near-black `#05000f` ground
 * screen blending is arithmetically a no-op anyway - screen(0.02, a) lands
 * within ~2% of a - and side-by-side screenshots are indistinguishable.
 *
 * The cone blur radii are also deliberately modest (0.5x and 0.9x of `blur`,
 * down from 0.8x and 1.5x). Rasterizing a blurred layer costs roughly its area
 * times its radius, and these are the largest layers in the hero; halving the
 * radius halves that cost. The edges still read as soft - dropping the blur
 * entirely does not, it turns the rays into hard-edged triangles.
 */
export default function Spotlight({
  width,
  left,
  rotation,
  opacity = 0.7,
  color = "255,255,240",
  blur = 35,
  className = "",
  animate = "none",
  delay = 0,
  intensity = 1,
  volumetric = true,
}: SpotlightProps) {
  const animationDuration = animate === "sway" ? "4s" : "8s";
  let animationName = "";

  switch (animate) {
    case "pulse":
      animationName = "realistic-pulse";
      break;
    case "sway":
      animationName = "realistic-sway";
      break;
    case "none":
    default:
      animationName = "";
      break;
  }

  return (
    <>
      <div
        className={`absolute ${className} animate-fade-in`}
        style={{
          top: "-25%",
          width: width,
          left: left,
          height: "120%",
          // translateZ(0) already promotes this to its own layer. The
          // `will-change: transform, opacity` that used to sit here as well was
          // redundant and actively wasteful: this wrapper is static - only the
          // cones inside it animate - so it reserved a permanent compositor
          // layer for something that never changes, once per spotlight.
          transform: `rotate(${rotation}deg) translateZ(0)`,
          transformOrigin: "top center",
          zIndex: 1,
          transition: "none",
        }}
      >
        {/* Realistic light source with heat distortion effect */}
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 z-20"
          style={{
            width: "8px",
            height: "8px",
            background: `radial-gradient(circle, rgba(${color}, 1) 0%, rgba(${color}, 0.8) 30%, rgba(${color}, 0.4) 70%, transparent 100%)`,
            borderRadius: "50%",
            boxShadow: `
              0 0 8px 2px rgba(${color}, 0.8),
              0 0 15px 5px rgba(${color}, 0.4),
              0 0 25px 8px rgba(${color}, 0.2)
            `,
            filter: `blur(0.5px)`,
          }}
        />

        {/* Main volumetric light cone */}
        <div
          className="absolute top-0 left-0 w-full"
          style={{
            height: "100%",
            transformOrigin: "top center",
          }}
        >
          {/* Primary light cone */}
          <div
            className="absolute top-0 left-1/2 -translate-x-1/2 animate-smooth-fade-in"
            style={
              {
                width: "4%",
                height: "100%",
                clipPath: "polygon(0% 0%, 100% 0%, 900% 100%, -800% 100%)",
                background: `linear-gradient(
                to bottom,
                rgba(${color}, ${opacity * intensity * 1.4}) 0%,
                rgba(${color}, ${opacity * intensity * 1.1}) 5%,
                rgba(${color}, ${opacity * intensity * 0.9}) 15%,
                rgba(${color}, ${opacity * intensity * 0.7}) 30%,
                rgba(${color}, ${opacity * intensity * 0.5}) 50%,
                rgba(${color}, ${opacity * intensity * 0.3}) 70%,
                rgba(${color}, ${opacity * intensity * 0.1}) 85%,
                rgba(${color}, 0) 100%
              )`,
                filter: `blur(${blur * 0.5}px)`,
                ...(animate !== "none" && {
                  animationName: animationName,
                  animationDuration: animationDuration,
                  animationTimingFunction: "ease-in-out",
                  animationIterationCount: "infinite",
                  animationDelay: `${delay}s`,
                }),
                transition:
                  "opacity 0.7s cubic-bezier(0.4,0,0.2,1), filter 0.7s cubic-bezier(0.4,0,0.2,1)",
                // @ts-ignore
                "--base-opacity": `${opacity * intensity}`,
                // @ts-ignore
                "--target-opacity": `${opacity * intensity}`,
                // @ts-ignore
                "--base-blur": `${blur * 0.5}px`,
              } as React.CSSProperties
            }
          />

          {/* Secondary softer cone for volume */}
          {volumetric && (
            <div
              className="absolute top-0 left-1/2 -translate-x-1/2 animate-smooth-fade-in"
              style={
                {
                  width: "6%",
                  height: "100%",
                  clipPath: "polygon(0% 0%, 100% 0%, 1000% 100%, -900% 100%)",
                  background: `linear-gradient(
                  to bottom,
                  rgba(${color}, ${opacity * intensity * 0.6}) 0%,
                  rgba(${color}, ${opacity * intensity * 0.4}) 20%,
                  rgba(${color}, ${opacity * intensity * 0.25}) 40%,
                  rgba(${color}, ${opacity * intensity * 0.15}) 60%,
                  rgba(${color}, ${opacity * intensity * 0.08}) 80%,
                  rgba(${color}, 0) 100%
                )`,
                  filter: `blur(${blur * 0.9}px)`,
                  ...(animate !== "none" && {
                    animationName: animationName,
                    animationDuration: `${
                      parseFloat(animationDuration) * 1.2
                    }s`,
                    animationTimingFunction: "ease-in-out",
                    animationIterationCount: "infinite",
                    animationDelay: `${delay + 0.3}s`,
                  }),
                  transition:
                    "opacity 0.7s cubic-bezier(0.4,0,0.2,1), filter 0.7s cubic-bezier(0.4,0,0.2,1)",
                  // @ts-ignore
                  "--base-opacity": `${opacity * intensity * 0.4}`,
                  // @ts-ignore
                  "--target-opacity": `${opacity * intensity * 0.4}`,
                  // @ts-ignore
                  "--base-blur": `${blur * 0.9}px`,
                } as React.CSSProperties
              }
            />
          )}

          {/* The third "edge highlight" cone that used to sit here is gone.
              Each spotlight rendered three overlapping blurred cones; this one
              was 2% wide at blur x 0.3, and hiding all six of them side by side
              produced no visible difference in the hero. Dropping it removes a
              third of the blurred layers the hero has to rasterize at load. */}
        </div>

      </div>
    </>
  );
}
