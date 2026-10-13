"use client";

import { useRef } from "react";
import { steps } from "../config/steps";
import { useRailProgress } from "../hooks/useRailProgress";
import { RailBeam } from "./RailBeam";
import { StepCard } from "./StepCard";
import { GhostNumber } from "./GhostNumber";
import { RailEndCap } from "./RailEndCap";

/**
 * Zig-zag timeline for lg+ screens: cards alternate sides of a centre rail and
 * the empty half of each row carries the oversized step numeral.
 */
export function DesktopTimeline() {
  const containerRef = useRef<HTMLDivElement>(null);
  const progress = useRailProgress(containerRef);

  return (
    <div
      ref={containerRef}
      className="relative hidden w-full max-w-7xl px-10 lg:block"
    >
      <div className="grid grid-cols-[1fr_auto_1fr] items-stretch gap-10">
        <div className="flex flex-col gap-28 xl:gap-36">
          {steps.map((step, index) =>
            index % 2 === 0 ? (
              <GhostNumber key={step.number} number={step.number} align="right" />
            ) : (
              <div key={step.number} className="flex justify-end">
                <StepCard step={step} align="right" className="h-60 w-full max-w-[520px]" />
              </div>
            )
          )}
        </div>

        <RailBeam progress={progress} />

        <div className="flex flex-col gap-28 xl:gap-36">
          {steps.map((step, index) =>
            index % 2 === 0 ? (
              <div key={step.number} className="flex justify-start">
                <StepCard step={step} align="left" className="h-60 w-full max-w-[520px]" />
              </div>
            ) : (
              <GhostNumber key={step.number} number={step.number} align="left" />
            )
          )}
        </div>
      </div>

      <RailEndCap progress={progress} />
    </div>
  );
}
