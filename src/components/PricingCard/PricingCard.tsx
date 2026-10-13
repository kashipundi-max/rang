"use client";

import React from "react";
import { IconCheck } from "@tabler/icons-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { AnimatedTooltip } from "@/components/ui/AnimatedTooltip";
import type { PricingCardProps } from "./types";

export function PricingCard({
  id,
  name,
  description,
  price,
  priceSuffix = "/month",
  billingNote,
  featured = false,
  badge,
  ctaText,
  onCtaClick,
  ctaHref,
  companiesCount,
  socialProofText,
  features,
  featuresTitle = "What's included",
  testimonials,
  className,
}: PricingCardProps) {
  // Format price with consistent formatting
  const formatPrice = (value: number) => {
    return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };

  return (
    <div
      className={cn(
        "relative p-px rounded-[20px] w-full h-full group transition-all duration-300",
        featured
          ? "bg-linear-to-b from-brand-primary/40 via-brand-primary-light/40 to-brand-primary/40 z-10"
          : "bg-linear-to-b from-zinc-600/40 via-zinc-200/40 to-zinc-600/40",
        className
      )}
    >
      <div
        className={cn(
          "w-full h-full rounded-[19px] relative flex flex-col p-8 bg-bg-dark/90 backdrop-blur-xl overflow-hidden",
          featured && "pt-12"
        )}
      >
        {/* Tech Lines Texture */}
        <div
          className="absolute inset-0 opacity-[0.03] pointer-events-none"
          style={{
            backgroundImage: `repeating-linear-gradient(
              -45deg,
              transparent,
              transparent 10px,
              rgba(255, 255, 255, 0.5) 10px,
              rgba(255, 255, 255, 0.5) 11px
            )`,
          }}
        />
        {/* Top Light Gradient */}
        <div className="absolute inset-0 bg-linear-to-b from-white/5 via-transparent to-transparent pointer-events-none" />

        {/* Plan name and description */}
        <h3 className="text-white text-xl font-bold mb-2 font-clash-display">
          {name}
        </h3>
        <p className="text-gray-300 text-sm mb-6 font-dm-sans leading-relaxed">
          {description}
        </p>

        {/* Price */}
        <div className="mb-6">
          <div className="flex items-end mb-2">
            <span className="text-4xl font-bold text-white font-clash-display">
              ${formatPrice(price)}
            </span>
            <span className="text-gray-400 text-sm mb-1 ms-1 font-dm-sans">
              {priceSuffix}
            </span>
          </div>
          {billingNote && (
            <p className="text-gray-400 text-sm font-dm-sans">{billingNote}</p>
          )}
        </div>

        {/* Social proof */}
        {(testimonials?.length || companiesCount) && (
          <div className="flex items-center gap-3 mb-8">
            {testimonials && testimonials.length > 0 && (
              <div className="flex">
                <AnimatedTooltip items={testimonials.slice(0, 3)} />
              </div>
            )}
            {socialProofText && (
              <span className="text-gray-300 text-sm font-dm-sans">
                {socialProofText}
              </span>
            )}
          </div>
        )}

        {/* Features list */}
        <div className="grow mb-8">
          <h4 className="text-white text-sm font-medium mb-4 font-dm-sans uppercase tracking-wider">
            {featuresTitle}
          </h4>
          <ul className="flex flex-col gap-3">
            {features.map((feature, idx) => (
              <li key={`${id}-feature-${idx}`} className="flex items-start">
                <div className="shrink-0 h-5 w-5 rounded-full bg-brand-primary/20 flex items-center justify-center me-3 mt-0.5">
                  <IconCheck className="h-3 w-3 text-brand-primary-light" />
                </div>

                <span
                  className={cn(
                    "text-sm font-dm-sans",
                    feature.highlighted
                      ? "text-white font-medium"
                      : "text-gray-300"
                  )}
                >
                  {feature.label}

                  {/* Feature tooltips */}
                  {feature.tooltip && (
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <span className="inline-block ms-1 cursor-help text-gray-400 hover:text-gray-300">
                            ⓘ
                          </span>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="text-xs max-w-xs">{feature.tooltip}</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  )}
                </span>
              </li>
            ))}
          </ul>
        </div>

        {/* CTA Button */}
        <Button
          href={ctaHref}
          onClick={onCtaClick}
          variant={featured ? "default" : "outline"}
          className="w-full h-10 transition-all duration-300 font-dm-sans"
        >
          {ctaText}
        </Button>
      </div>

      {/* Badge */}
      {badge && (
        <div className="absolute -top-3 start-1/2 -translate-x-1/2 rtl:translate-x-1/2 z-20">
          <div className="px-3 py-1 bg-brand-primary text-button-text text-xs font-medium rounded-full font-dm-sans">
            {badge}
          </div>
        </div>
      )}
    </div>
  );
}

// Wrapper to align all cards at bottom
export function PricingCardsContainer({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
      {children}
    </div>
  );
}
