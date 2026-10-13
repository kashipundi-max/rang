import * as React from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface IconButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  className?: string;
  size?: "sm" | "md" | "lg";
  variant?: "default" | "ghost" | "destructive" | "outline" | "secondary";
}

const IconButton = React.forwardRef<HTMLButtonElement, IconButtonProps>(
  (
    {
      className,
      size = "md",
      variant = "ghost",
      children,
      type = "button",
      ...props
    },
    ref
  ) => {
    const sizeClasses = {
      sm: "h-6 w-6 p-1",
      md: "h-8 w-8 p-1.5",
      lg: "h-10 w-10 p-2",
    } as const;

    return (
      <Button
        ref={ref}
        type={type}
        variant={variant}
        size="icon"
        className={cn(
          // Disable transitions so theme changes are instant; ripple still animates on click
          "transition-none",
          // Unified control look for ghost variant
          variant === "ghost" && [
            "border border-[var(--border-subtle)] bg-[var(--control-bg)] rounded-full",
            "hover:bg-[var(--text-muted)]/8 hover:border-[var(--border-subtle)]",
            "text-[var(--text)]",
          ],
          // For other variants, use default button styling
          variant !== "ghost" && "rounded-full",
          sizeClasses[size],
          className
        )}
        {...props}
      >
        {children}
      </Button>
    );
  }
);

IconButton.displayName = "IconButton";

export default IconButton;
