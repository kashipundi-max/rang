"use client";

import * as React from "react";
import * as CheckboxPrimitive from "@radix-ui/react-checkbox";
import * as LabelPrimitive from "@radix-ui/react-label";
import { IconCheck } from "@tabler/icons-react";
import { cn } from "@/lib/utils";

export interface CheckboxProps
  extends React.ComponentPropsWithoutRef<typeof CheckboxPrimitive.Root> {
  /** Label text for the checkbox */
  label?: React.ReactNode;
  /** Error message to display */
  error?: string;
  /** Additional class for the container */
  containerClassName?: string;
  /** Size variant */
  size?: "sm" | "md" | "lg";
}

const sizeStyles = {
  sm: {
    checkbox: "w-4 h-4",
    icon: "w-3 h-3",
    label: "text-xs",
  },
  md: {
    checkbox: "w-5 h-5",
    icon: "w-4 h-4",
    label: "text-sm",
  },
  lg: {
    checkbox: "w-6 h-6",
    icon: "w-5 h-5",
    label: "text-base",
  },
};

/**
 * Accessible Checkbox component built with Radix UI primitives
 * Supports keyboard navigation, screen readers, and custom styling
 */
const Checkbox = React.forwardRef<
  React.ElementRef<typeof CheckboxPrimitive.Root>,
  CheckboxProps
>(
  (
    { className, label, error, containerClassName, size = "md", id, ...props },
    ref
  ) => {
    const generatedId = React.useId();
    const checkboxId = id || generatedId;
    const errorId = `${checkboxId}-error`;
    const styles = sizeStyles[size];

    return (
      <div className={cn("relative", containerClassName)}>
        <div className="flex items-start gap-3">
          <CheckboxPrimitive.Root
            ref={ref}
            id={checkboxId}
            aria-invalid={error ? "true" : undefined}
            aria-describedby={error ? errorId : undefined}
            className={cn(
              // Base styles
              styles.checkbox,
              "shrink-0  rounded border-2 transition-all duration-200",
              // Default state
              "border-border-secondary/60 bg-bg-card/60",
              // Checked state
              "data-[state=checked]:bg-brand-primary data-[state=checked]:border-brand-primary",
              // Focus state
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary/20 focus-visible:ring-offset-2 focus-visible:ring-offset-bg-primary",
              // Hover state
              "hover:border-border-secondary",
              // Disabled state
              "disabled:cursor-not-allowed disabled:opacity-50",
              // Error state
              error && "border-red-500/60",
              className
            )}
            {...props}
          >
            <CheckboxPrimitive.Indicator
              className={cn(
                "flex items-center justify-center text-white",
                "data-[state=checked]:animate-in data-[state=checked]:fade-in-0 data-[state=checked]:zoom-in-75",
                "data-[state=unchecked]:animate-out data-[state=unchecked]:fade-out-0 data-[state=unchecked]:zoom-out-75"
              )}
            >
              <IconCheck
                className={styles.icon}
                color="var(--color-button-text)"
                strokeWidth={3}
              />
            </CheckboxPrimitive.Indicator>
          </CheckboxPrimitive.Root>

          {label && (
            <LabelPrimitive.Root
              htmlFor={checkboxId}
              className={cn(
                styles.label,
                "text-text-body font-dm-sans cursor-pointer select-none",
                "peer-disabled:cursor-not-allowed peer-disabled:opacity-50"
              )}
            >
              {label}
            </LabelPrimitive.Root>
          )}
        </div>

        {error && (
          <p
            id={errorId}
            role="alert"
            aria-live="polite"
            className="mt-2 text-xs text-red-400 font-dm-sans"
          >
            {error}
          </p>
        )}
      </div>
    );
  }
);

Checkbox.displayName = "Checkbox";

export { Checkbox };
