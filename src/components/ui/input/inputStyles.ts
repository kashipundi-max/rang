import { cn } from "@/lib/utils";

/**
 * Shared input base styles used across Input, Select, TextArea, etc.
 * Centralizes all input styling for consistent borders, backgrounds, focus states, etc.
 * Uses Tailwind CSS v4 variable syntax: text-(--var) instead of text-[var(--var)]
 */
export const getInputBaseStyles = (error?: string, hasIcon?: { start?: boolean; end?: boolean }) => {
    return cn(
        // Base input styles using theme variables
        "flex h-12 w-full rounded-md border",
        "bg-bg-card",
        "border-border-primary/30",
        "text-text-primary",
        "placeholder:text-text-muted",
        "text-sm px-3 py-2 focus:outline-none",
        "focus:border-brand-primary",
        "focus:ring-brand-primary",
        "disabled:cursor-not-allowed disabled:opacity-50",
        "disabled:bg-surface-hover",
        // Icon padding (logical properties for RTL support)
        hasIcon?.start && "ps-10", // padding-inline-start
        hasIcon?.end && "pe-10", // padding-inline-end
        // Error state - must override focus styles too
        error && [
            "border-error/70",
            "focus:border-error/80",
            "focus:ring-1 focus:ring-error/30",
        ]
    );
};

/**
 * Base container styles for input wrappers
 */
export const getInputContainerStyles = (className?: string) => {
    return cn("w-full", className);
};

/**
 * Label styles for input labels
 */
export const getInputLabelStyles = () => {
    return "block text-sm font-medium text-text-primary mb-2";
};

/**
 * Error message styles
 */
export const getInputErrorStyles = () => {
    return "mt-1 text-sm text-error/90";
};
