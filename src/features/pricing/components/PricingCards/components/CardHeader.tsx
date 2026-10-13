"use client";

import React from "react";
import { cn } from "@/lib/utils";
import type { PlanType } from "../config";

interface CardHeaderProps {
  plan: PlanType;
  planName: string;
}

export function CardHeader({ plan, planName }: CardHeaderProps) {
  const Icon = plan.icon;

  return (
    <div className="flex items-center gap-3 mb-4">
      <div
        className={cn(
          "w-10 h-10 rounded-xl flex items-center justify-center",
          plan.popular ? "bg-brand-primary/20" : "bg-text-secondary/10"
        )}
      >
        <Icon
          className={cn(
            "w-5 h-5",
            plan.popular ? "text-brand-primary" : "text-text-body"
          )}
        />
      </div>
      <h3 className="text-xl font-bold text-text-primary font-clash-display">
        {planName}
      </h3>
    </div>
  );
}
