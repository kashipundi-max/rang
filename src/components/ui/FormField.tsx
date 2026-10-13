"use client";

import * as React from "react";
import * as LabelPrimitive from "@radix-ui/react-label";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import type { FieldError } from "react-hook-form";

export interface FormFieldProps {
  label: string;
  name: string;
  error?: FieldError;
  required?: boolean;
  children: React.ReactNode;
  className?: string;
  hint?: string;
}

/**
 * Reusable form field wrapper with accessible Radix UI label, error handling, and accessibility
 * Use this to wrap any form input (Input, Textarea, Select, etc.)
 */
export function FormField({
  label,
  name,
  error,
  required,
  children,
  className,
  hint,
}: FormFieldProps) {
  return (
    <div className={cn("relative", className)}>
      <LabelPrimitive.Root
        htmlFor={name}
        className="block text-sm font-medium text-text-primary/90 mb-2 font-dm-sans cursor-pointer"
      >
        {label}
        {required && (
          <span className="text-brand-primary ms-1" aria-hidden="true">
            *
          </span>
        )}
      </LabelPrimitive.Root>

      <div className="relative group">{children}</div>

      {/* Hint text */}
      {hint && !error && (
        <p
          id={`${name}-hint`}
          className="mt-2 text-xs text-text-muted font-dm-sans"
        >
          {hint}
        </p>
      )}

      {/* Error message with animation */}
      <AnimatePresence mode="wait">
        {error && (
          <motion.p
            id={`${name}-error`}
            role="alert"
            aria-live="polite"
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            className="mt-2 text-xs text-error/90 font-dm-sans flex items-center gap-1.5"
          >
            <svg
              className="w-3.5 h-3.5 shrink-0"
              fill="currentColor"
              viewBox="0 0 20 20"
              aria-hidden="true"
            >
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
            {error.message}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}

export interface FormInputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  icon?: React.ReactNode;
  error?: boolean;
}

/**
 * Styled form input with icon support and focus effects
 * Use inside FormField for full form field functionality
 *
 * @deprecated Consider using Input from '@/components/ui/input' which has
 * built-in Radix UI label, password toggle, and more accessibility features.
 * This component is kept for backward compatibility.
 */
export const FormInput = React.forwardRef<HTMLInputElement, FormInputProps>(
  ({ className, icon, error, id, ...props }, ref) => {
    const inputId = id || props.name;

    return (
      <>
        {icon && (
          <div
            className="absolute start-4 top-1/2 -translate-y-1/2 text-text-muted group-focus-within:text-brand-primary transition-colors duration-200 pointer-events-none z-10"
            aria-hidden="true"
          >
            {icon}
          </div>
        )}
        <input
          ref={ref}
          id={inputId}
          aria-invalid={error || undefined}
          aria-describedby={error ? `${inputId}-error` : undefined}
          className={cn(
            // Base styles
            "w-full h-12 rounded-xl border text-text-primary font-dm-sans text-sm",
            "bg-bg-card/60 backdrop-blur-sm",
            "border-border-secondary/40",
            // Padding with logical properties for RTL support
            icon ? "ps-12 pe-4" : "px-4",
            // Placeholder
            "placeholder:text-text-muted/60 placeholder:font-light",
            // Transitions
            "transition-all duration-300 ease-out",
            // Focus states
            "focus:outline-none focus:border-brand-primary/60",
            "focus:ring-2 focus:ring-brand-primary/20",
            "focus:bg-bg-card/80",
            // Hover
            "hover:border-border-secondary/60",
            // Error states
            error && [
              "border-error/50",
              "focus:border-error/70",
              "focus:ring-error/15",
            ],
            className
          )}
          {...props}
        />
        {/* Glow effect on focus */}
        <div
          className={cn(
            "absolute inset-0 rounded-xl opacity-0 pointer-events-none transition-opacity duration-300",
            "group-focus-within:opacity-100",
            error
              ? "shadow-[0_0_20px_rgba(245,158,11,0.15)]"
              : "shadow-[0_0_20px_rgba(var(--color-brand-primary-rgb,59,130,246),0.15)]"
          )}
          aria-hidden="true"
        />
      </>
    );
  }
);
FormInput.displayName = "FormInput";

export interface FormTextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: boolean;
  errorMessage?: string;
  maxLength?: number;
  currentLength?: number;
  showCounter?: boolean;
}

/**
 * Styled form textarea with character counter, Radix UI accessibility, and focus effects
 * Use inside FormField for full form field functionality
 */
export const FormTextarea = React.forwardRef<
  HTMLTextAreaElement,
  FormTextareaProps
>(
  (
    {
      className,
      error,
      errorMessage,
      maxLength = 2000,
      currentLength = 0,
      showCounter = true,
      id,
      ...props
    },
    ref
  ) => {
    const textareaId = id || props.name;
    const charPercentage = maxLength ? (currentLength / maxLength) * 100 : 0;

    return (
      <>
        <textarea
          ref={ref}
          id={textareaId}
          aria-invalid={error || undefined}
          aria-describedby={
            [
              error ? `${textareaId}-error` : null,
              showCounter ? `${textareaId}-counter` : null,
            ]
              .filter(Boolean)
              .join(" ") || undefined
          }
          maxLength={maxLength}
          className={cn(
            // Base styles
            "w-full min-h-[140px] rounded-xl border text-text-primary font-dm-sans text-sm",
            "bg-bg-card/60 backdrop-blur-sm",
            "border-border-secondary/40",
            // Padding
            "p-4",
            // Placeholder
            "placeholder:text-text-muted/60 placeholder:font-light",
            // Transitions
            "transition-all duration-300 ease-out",
            // Focus states
            "focus:outline-none focus:border-brand-primary/60",
            "focus:ring-2 focus:ring-brand-primary/20",
            "focus:bg-bg-card/80",
            // Hover
            "hover:border-border-secondary/60",
            // Resize
            "resize-none",
            // Error states
            error && [
              "border-error/50",
              "focus:border-error/70",
              "focus:ring-error/15",
            ],
            className
          )}
          {...props}
        />
        {/* Glow effect on focus */}
        <div
          className={cn(
            "absolute inset-0 rounded-xl opacity-0 pointer-events-none transition-opacity duration-300",
            "group-focus-within:opacity-100",
            error
              ? "shadow-[0_0_20px_rgba(245,158,11,0.15)]"
              : "shadow-[0_0_20px_rgba(var(--color-brand-primary-rgb,59,130,246),0.15)]"
          )}
          aria-hidden="true"
        />
        {/* Character counter */}
        {showCounter && maxLength && (
          <div
            id={`${textareaId}-counter`}
            className="absolute bottom-3 end-3 flex items-center gap-2"
            aria-live="polite"
            aria-atomic="true"
          >
            <div
              className="w-16 h-1 rounded-full bg-border-secondary/30 overflow-hidden"
              role="progressbar"
              aria-valuenow={currentLength}
              aria-valuemin={0}
              aria-valuemax={maxLength}
              aria-label="Character count"
            >
              <div
                className={cn(
                  "h-full rounded-full transition-all duration-300",
                  charPercentage >= 90
                    ? "bg-red-500"
                    : charPercentage >= 70
                    ? "bg-amber-500"
                    : "bg-brand-primary"
                )}
                style={{ width: `${Math.min(charPercentage, 100)}%` }}
              />
            </div>
            <span
              className={cn(
                "text-xs font-dm-sans tabular-nums",
                charPercentage >= 90
                  ? "text-red-400"
                  : charPercentage >= 70
                  ? "text-amber-400"
                  : "text-text-muted"
              )}
            >
              {currentLength}/{maxLength}
            </span>
          </div>
        )}

        {/* Error message */}
        {errorMessage && (
          <p
            id={`${textareaId}-error`}
            className="mt-2 text-xs text-error/90 font-dm-sans flex items-center gap-1.5"
            role="alert"
            aria-live="polite"
          >
            <svg
              className="w-3.5 h-3.5 shrink-0"
              fill="currentColor"
              viewBox="0 0 20 20"
              aria-hidden="true"
            >
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
            {errorMessage}
          </p>
        )}
      </>
    );
  }
);
FormTextarea.displayName = "FormTextarea";
