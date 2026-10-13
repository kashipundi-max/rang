"use client";

import { useRef } from "react";
import { useInView } from "framer-motion";
import { cn } from "@/lib/utils";
import { rail, type Step } from "../config/steps";

interface StepCardProps {
  step: Step;
  /** Which edge the content hugs; the rail always sits on the opposite side. */
  align?: "left" | "right";
  /** Compact layouts show the step number here instead of as a ghost numeral. */
  showNumber?: boolean;
  className?: string;
}

/**
 * One step of the journey. The card sits dim until the reader scrolls it into
 * the middle of the viewport, then lights its tint, border glow and icon ring —
 * the same beat the rail beam passes it.
 */
export function StepCard({
  step,
  align = "left",
  showNumber = false,
  className,
}: StepCardProps) {
  const ref = useRef<HTMLDivElement>(null);
  // Lights up once the card's top crosses ~70% of the viewport — the same
  // trigger point the rail beam uses, and monotonic so a jump-scroll (an anchor
  // link, say) can never skip a card and leave it permanently dim.
  const isActive = useInView(ref, { once: true, margin: "0px 0px -30% 0px" });
  const Icon = step.icon;

  return (
    <div
      ref={ref}
      className={cn(
        "relative flex flex-col justify-center overflow-hidden rounded-2xl border p-6",
        "transition-[border-color,box-shadow] duration-500 ease-out",
        isActive
          ? "border-brand-primary/40 shadow-[0_-4px_16px_2px_color-mix(in_srgb,var(--color-brand-primary)_18%,transparent),0_4px_16px_2px_color-mix(in_srgb,var(--color-brand-primary)_18%,transparent)]"
          : "border-white/8 shadow-none",
        className
      )}
      style={{ backgroundColor: "var(--color-card-bg)" }}
    >
      {/* Tint + inner rim, both faded in on activation */}
      <span
        aria-hidden="true"
        className={cn(
          "pointer-events-none absolute inset-0 rounded-2xl transition-opacity duration-500 ease-out",
          isActive ? "opacity-100" : "opacity-0"
        )}
        style={{
          backgroundImage:
            "linear-gradient(180deg, color-mix(in srgb, var(--color-brand-primary) 14%, transparent) 0%, transparent 100%)",
        }}
      />
      <span
        aria-hidden="true"
        className={cn(
          "pointer-events-none absolute inset-0 rounded-2xl transition-opacity duration-500 ease-out",
          "shadow-[inset_0_4px_10px_0_color-mix(in_srgb,var(--color-brand-primary)_30%,transparent)]",
          isActive ? "opacity-100" : "opacity-0"
        )}
      />

      <div
        className={cn(
          "relative flex h-full flex-col justify-between gap-5",
          align === "right" ? "items-end text-right" : "items-start text-left"
        )}
      >
        <div
          className={cn(
            "flex w-full items-center justify-between gap-3",
            align === "right" && "flex-row-reverse"
          )}
        >
          <span
            className={cn(
              "relative flex size-12 shrink-0 items-center justify-center rounded-full",
              "bg-brand-primary text-white ring-2 transition-[box-shadow,--tw-ring-color] duration-500 ease-out",
              isActive ? "ring-brand-primary-light/70" : "ring-white/10"
            )}
            style={isActive ? { boxShadow: rail.glow } : undefined}
          >
            <Icon className="size-6" stroke={1.75} aria-hidden="true" />
          </span>

          {showNumber && (
            <span
              aria-hidden="true"
              className="font-clash-display bg-gradient-to-b from-white/45 to-white/0 bg-clip-text text-[44px] leading-none font-normal tracking-[-0.04em] text-transparent select-none"
            >
              {String(step.number).padStart(2, "0")}
            </span>
          )}
        </div>

        <div
          className={cn(
            "flex w-full flex-col gap-3",
            align === "right" ? "items-end" : "items-start"
          )}
        >
          <h3 className="font-clash-display w-full text-2xl leading-tight font-normal text-white sm:text-[28px] lg:text-[30px]">
            {step.title}
          </h3>
          <p className="font-dm-sans text-text-body w-full text-sm leading-relaxed sm:text-base lg:text-lg">
            {step.description}
          </p>
        </div>
      </div>
    </div>
  );
}
