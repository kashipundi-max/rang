"use client";

import { useRef } from "react";
import { steps } from "../config/steps";
import { useRailProgress } from "../hooks/useRailProgress";
import { RailBeam } from "./RailBeam";
import { StepCard } from "./StepCard";

/**
 * Single-column variant for below lg: the same rail runs down the left edge
 * with every card stacked beside it.
 */
export function MobileTimeline() {
  const containerRef = useRef<HTMLDivElement>(null);
  const progress = useRailProgress(containerRef);

  return (
    <div
      ref={containerRef}
      className="relative w-full max-w-[560px] px-4 sm:px-6 lg:hidden"
    >
      <div className="flex gap-4 sm:gap-5">
        <RailBeam progress={progress} />

        <div className="flex min-w-0 flex-1 flex-col gap-8 sm:gap-10">
          {steps.map((step) => (
            <StepCard
              key={step.number}
              step={step}
              align="left"
              showNumber
              className="min-h-[190px] w-full"
            />
          ))}
        </div>
      </div>
    </div>
  );
}
