"use client";

import * as React from "react";
import * as TooltipPrimitive from "@radix-ui/react-tooltip";
import { cn } from "@/lib/utils";

// Create a provider component to wrap tooltip usage
const TooltipProvider = TooltipPrimitive.Provider;

// Create the root tooltip component
const Tooltip = TooltipPrimitive.Root;

// Create the trigger element that will show the tooltip
const TooltipTrigger = TooltipPrimitive.Trigger;

// Create the content component with styling
const TooltipContent = React.forwardRef<
  React.ElementRef<typeof TooltipPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TooltipPrimitive.Content>
>(({ className, sideOffset = 4, ...props }, ref) => (
  <TooltipPrimitive.Content
    ref={ref}
    sideOffset={sideOffset}
    className={cn(
      "z-50 overflow-hidden rounded-md bg-neutral-900 dark:bg-neutral-800 px-3 py-1.5 text-xs text-neutral-50",
      "animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95",
      "shadow-md border border-neutral-800 dark:border-neutral-700",
      className
    )}
    {...props}
  />
));
TooltipContent.displayName = TooltipPrimitive.Content.displayName;

// Export components
export {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider
};
