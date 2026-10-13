"use client";

import { cn } from "@/lib/utils";
import { JSX } from "react";
import { Button } from "@/components/ui/button";

export interface TabItem<T extends string = string> {
  id: T;
  label: string;
  count?: number;
}

interface TabsProps<T extends string = string> {
  items: TabItem<T>[];
  value: T;
  onValueChange: (value: T) => void;
  className?: string;
  tabClassName?: string;
  activeTabClassName?: string;
  inactiveTabClassName?: string;
  countClassName?: string;
  variant?: "pill" | "underline" | "minimal";
  size?: "sm" | "md" | "lg";
  animate?: boolean;
  showToggleButton?: boolean;
  toggleButtonText?: {
    show: string;
    hide: string;
  };
  isToggled?: boolean;
  onToggle?: () => void;
}

export function Tabs<T extends string = string>({
  items,
  value,
  onValueChange,
  className,
  tabClassName,
  activeTabClassName,
  inactiveTabClassName,
  countClassName,
  variant = "pill",
  size = "md",
  showToggleButton = false,
  toggleButtonText = { show: "Show", hide: "Hide" },
  isToggled = false,
  onToggle,
}: TabsProps<T>): JSX.Element {
  // Size variants for button content - responsive
  const sizeClasses = {
    sm: "text-xs sm:text-xs px-1 sm:px-1.5 py-1",
    md: "text-xs sm:text-sm px-2 sm:px-3 py-1 sm:py-1.5",
    lg: "text-sm sm:text-base px-2 sm:px-3 py-1.5 sm:py-2",
  };

  // Count badge size - responsive
  const countSizeClasses = {
    sm: "ml-1 w-3 h-3 sm:w-4 sm:h-4 text-[9px] sm:text-[10px]",
    md: "ml-1 w-4 h-4 sm:w-5 sm:h-5 text-[10px] sm:text-xs",
    lg: "ml-1.5 w-5 h-5 sm:w-6 sm:h-6 text-xs sm:text-sm",
  };

  // Variants - responsive gap and container
  const variantClasses = {
    pill: {
      container: "flex flex-wrap gap-1 sm:gap-2 justify-center",
      count: (isSelected: boolean) =>
        cn(
          "inline-flex items-center justify-center rounded-full font-medium",
          isSelected
            ? "text-black bg-white "
            : "text-text-muted bg-brand-surface/50"
        ),
    },
    underline: {
      container:
        "flex flex-wrap gap-1 sm:gap-2 border-b border-border-secondary/50 pb-1",
      count: (isSelected: boolean) =>
        cn(
          "inline-flex items-center justify-center rounded-full font-medium",
          isSelected
            ? "text-brand-primary-light bg-brand-primary/30"
            : "text-text-muted bg-brand-surface/50"
        ),
    },
    minimal: {
      container: "flex flex-wrap gap-1 sm:gap-2",
      count: (isSelected: boolean) =>
        cn(
          "inline-flex items-center justify-center rounded-full font-medium",
          isSelected
            ? "text-brand-primary-light bg-brand-primary/30"
            : "text-text-muted bg-brand-surface/50"
        ),
    },
  };

  return (
    <div className={cn("flex flex-col items-center", className)}>
      {showToggleButton && (
        <Button
          variant="ghost"
          onClick={onToggle}
          className="mb-3 sm:mb-4 text-xs sm:text-sm"
        >
          {isToggled ? toggleButtonText.hide : toggleButtonText.show}
        </Button>
      )}

      {(!showToggleButton || isToggled) && (
        <div className={cn(variantClasses[variant].container)}>
          {items.map((item) => (
            <Button
              key={item.id}
              onClick={() => onValueChange(item.id)}
              variant={value === item.id ? "outline" : "ghost"}
              className={cn(
                "transition-all duration-150 whitespace-nowrap shrink-0",
                sizeClasses[size],
                tabClassName,
                value === item.id ? activeTabClassName : inactiveTabClassName
              )}
            >
              <span className="flex items-center gap-0.5 sm:gap-1">
                {item.label}
                {item.count !== undefined && (
                  <span
                    className={cn(
                      variantClasses[variant].count(value === item.id),
                      countSizeClasses[size],
                      countClassName
                    )}
                  >
                    {item.count}
                  </span>
                )}
              </span>
            </Button>
          ))}
        </div>
      )}
    </div>
  );
}
