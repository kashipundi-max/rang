"use client";

import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface AuthCardProps {
  children: ReactNode;
  className?: string;
}

/**
 * Plain, professional surface for auth forms.
 * Unlike the marketing Card it has no orbs or gradients, so it reads
 * correctly on both the white and the dark purple auth appearance.
 */
export function AuthCard({ children, className }: AuthCardProps) {
  return (
    <div
      className={cn(
        "auth-card relative border border-border-secondary bg-bg-card p-6 sm:p-8",
        className
      )}
    >
      {children}
    </div>
  );
}
