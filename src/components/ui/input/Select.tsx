"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import { cn } from "@/lib/utils";
import * as m from "framer-motion/client";
import { IconX, IconChevronDown } from "@tabler/icons-react";
import { Input } from "./Input";
import IconButton from "../iconButton";
import { Button } from "../button";
import {
  getInputBaseStyles,
  getInputLabelStyles,
  getInputErrorStyles,
} from "./inputStyles";

export interface SelectOption {
  value: string | number;
  label: string;
  disabled?: boolean;
  icon?: React.ReactNode;
  description?: string;
}

export interface SelectProps {
  options: SelectOption[];
  value?: string | number;
  onChange?: (value: string | number) => void;
  placeholder?: string;
  className?: string;
  triggerClassName?: string;
  disabled?: boolean;
  loading?: boolean;
  searchable?: boolean;
  clearable?: boolean;
  error?: string;
  label?: string;
  required?: boolean;
  position?: "bottom" | "top" | "auto";
  variant?: "default" | "ghost";
  hideChevron?: boolean;
  hideChevronOnMobile?: boolean;
  usePortal?: boolean;
}

export default function Select({
  options,
  value,
  onChange,
  placeholder = "Select an option...",
  className,
  triggerClassName,
  disabled = false,
  loading = false,
  searchable = false,
  clearable = false,
  error,
  label,
  required = false,
  position = "auto",
  variant = "default",
  hideChevron = false,
  hideChevronOnMobile = false,
  usePortal = true,
}: SelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const [shouldOpenUpward, setShouldOpenUpward] = useState(false);
  const [dropdownHeight, setDropdownHeight] = useState(0);
  const [dropdownPosition, setDropdownPosition] = useState({
    top: 0,
    left: 0,
    width: 0,
  });
  const selectRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const selectedOption = options.find((option) => option.value === value);

  const filteredOptions = searchable
    ? options.filter((option) =>
        option.label.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : options;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        selectRef.current &&
        !selectRef.current.contains(event.target as Node) &&
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
        setSearchTerm("");
        setFocusedIndex(-1);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (isOpen && searchable && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen, searchable]);

  const updateDropdownMetrics = useCallback(() => {
    if (!isOpen || !selectRef.current) return;

    const rect = selectRef.current.getBoundingClientRect();
    const viewportHeight = window.innerHeight;

    const measuredHeight = dropdownRef.current?.scrollHeight ?? 0;
    const itemHeight = 40;
    const calculatedHeight = measuredHeight
      ? Math.min(measuredHeight + 8, 240)
      : Math.min(filteredOptions.length * itemHeight + 8, 240);

    setDropdownHeight(calculatedHeight);

    const spaceBelow = viewportHeight - rect.bottom;
    const spaceAbove = rect.top;

    const openUpward =
      position === "auto"
        ? spaceBelow < calculatedHeight && spaceAbove > spaceBelow
        : position === "top";

    setShouldOpenUpward(openUpward);

    if (usePortal) {
      // Use viewport-relative positioning (fixed positioning in the portal)
      const upwardTop = rect.top - calculatedHeight - 4;
      const downwardTop = rect.bottom + 4;
      const constrainedUpwardTop = Math.max(8, upwardTop);
      const constrainedDownwardTop = Math.min(
        downwardTop,
        viewportHeight - calculatedHeight - 8
      );

      setDropdownPosition({
        top: openUpward ? constrainedUpwardTop : constrainedDownwardTop,
        left: rect.left,
        width: rect.width,
      });
    }
  }, [filteredOptions.length, isOpen, position, usePortal]);

  useEffect(() => {
    if (!isOpen) return;

    updateDropdownMetrics();

    const handleResize = () => updateDropdownMetrics();
    const handleScroll = () => updateDropdownMetrics();

    const observer = new MutationObserver(() => updateDropdownMetrics());
    if (dropdownRef.current) {
      observer.observe(dropdownRef.current, {
        childList: true,
        subtree: true,
      });
    }

    window.addEventListener("resize", handleResize);
    window.addEventListener("scroll", handleScroll, true);

    const raf = requestAnimationFrame(() => updateDropdownMetrics());

    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("scroll", handleScroll, true);
      observer.disconnect();
      cancelAnimationFrame(raf);
    };
  }, [isOpen, updateDropdownMetrics]);

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (disabled || loading) return;

    switch (event.key) {
      case "Enter":
        event.preventDefault();
        if (isOpen) {
          if (focusedIndex >= 0 && filteredOptions[focusedIndex]) {
            handleSelect(filteredOptions[focusedIndex]);
          }
        } else {
          setIsOpen(true);
        }
        break;

      case "ArrowDown":
        event.preventDefault();
        if (!isOpen) {
          setIsOpen(true);
        } else {
          setFocusedIndex((prev) =>
            prev < filteredOptions.length - 1 ? prev + 1 : 0
          );
        }
        break;

      case "ArrowUp":
        event.preventDefault();
        if (isOpen) {
          setFocusedIndex((prev) =>
            prev > 0 ? prev - 1 : filteredOptions.length - 1
          );
        }
        break;

      case "Escape":
        event.preventDefault();
        setIsOpen(false);
        setSearchTerm("");
        setFocusedIndex(-1);
        break;

      case "Tab":
        if (isOpen) {
          setIsOpen(false);
          setSearchTerm("");
          setFocusedIndex(-1);
        }
        break;
    }
  };

  const handleSelect = (option: SelectOption) => {
    if (option.disabled) return;

    onChange?.(option.value);
    setIsOpen(false);
    setSearchTerm("");
    setFocusedIndex(-1);
  };

  const handleClear = (event: React.MouseEvent) => {
    event.stopPropagation();
    onChange?.("");
  };

  return (
    <div className={cn("relative", className)}>
      {label && (
        <label className={getInputLabelStyles()}>
          {label}
          {required && <span className="text-destructive ms-1">*</span>}
        </label>
      )}

      <div ref={selectRef} className="relative">
        <Button
          type="button"
          onClick={() => !disabled && !loading && setIsOpen(!isOpen)}
          className={cn(
            // Use shared input base styles from Input component
            getInputBaseStyles(error),
            "justify-between items-center text-start font-normal",
            // Ghost variant override if needed
            variant === "ghost" &&
              "bg-transparent border-0 ring-0 focus:ring-0 hover:bg-(--surface-hover)",
            triggerClassName
          )}
          contentClassName="w-full"
          onKeyDown={handleKeyDown}
          disabled={disabled}
          variant="outline"
          role="combobox"
          aria-expanded={isOpen}
          aria-controls={isOpen ? "select-options" : undefined}
          aria-haspopup="listbox"
        >
          <div className="flex items-center justify-between w-full gap-2">
            <div className="flex items-center gap-2 flex-1 min-w-0  w-full">
              {selectedOption?.icon && (
                <div className="shrink-0 w-4 text-(--text-muted)">
                  {selectedOption.icon}
                </div>
              )}
              {searchable && isOpen ? (
                <Input
                  ref={inputRef}
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="flex-1 bg-transparent border-none focus:ring-0 focus:border-transparent p-0 h-auto"
                  placeholder="Search options..."
                />
              ) : (
                <span
                  className={cn(
                    "flex-1 truncate text-start",
                    selectedOption ? "text-(--text)" : "text-(--text-muted)"
                  )}
                >
                  {selectedOption ? selectedOption.label : placeholder}
                </span>
              )}
            </div>

            <div className="flex items-center gap-1 shrink-0">
              {clearable && selectedOption && !disabled && (
                <IconButton type="button" onClick={handleClear} size="sm">
                  <IconX className="w-4 h-4 text-(--text-muted)" />
                </IconButton>
              )}

              {loading ? (
                <div className="w-4 h-4 border-2 border-border-primary border-t-text-muted rounded-full animate-spin" />
              ) : !hideChevron ? (
                <IconChevronDown
                  className={cn(
                    "w-4 h-4 text-text-muted transition-transform",
                    hideChevronOnMobile && "hidden sm:inline",
                    isOpen && "rotate-180"
                  )}
                />
              ) : null}
            </div>
          </div>
        </Button>

        <>
          {isOpen && (
            <>
              {usePortal ? (
                createPortal(
                  <m.div
                    ref={dropdownRef}
                    className={cn(
                      "fixed z-9999 bg-bg-card border border-border-primary rounded-md shadow-lg overflow-auto"
                    )}
                    style={{
                      top: `${dropdownPosition.top}px`,
                      left: `${dropdownPosition.left}px`,
                      minWidth: `${dropdownPosition.width}px`,
                      width: "max-content",
                      maxHeight: `${dropdownHeight}px`,
                    }}
                    initial={{ opacity: 0, y: shouldOpenUpward ? 10 : -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: shouldOpenUpward ? 10 : -10 }}
                    transition={{ duration: 0.2 }}
                    role="listbox"
                    id="select-options"
                  >
                    {filteredOptions.length === 0 ? (
                      <div className="px-3 py-2 text-sm text-text-muted">
                        {searchable
                          ? "No options found"
                          : "No options available"}
                      </div>
                    ) : (
                      <div className="flex flex-col gap-1 p-1">
                        {filteredOptions.map((option, index) => (
                          <div
                            key={option.value}
                            onClick={() => handleSelect(option)}
                            className={cn(
                              "px-3 py-2 cursor-pointer transition-colors rounded-md",
                              "hover:bg-surface-hover",
                              focusedIndex === index && "bg-surface-hover",
                              option.value === value &&
                                "bg-brand-surface text-brand-primary",
                              option.disabled && "opacity-50 cursor-not-allowed"
                            )}
                            role="option"
                            aria-selected={option.value === value}
                          >
                            <div className="flex items-center gap-2">
                              {option.icon && (
                                <div className="w-4">{option.icon}</div>
                              )}
                              <div className="flex-1 min-w-0">
                                <div className="text-sm font-medium text-text-primary">
                                  {option.label}
                                </div>
                                {option.description && (
                                  <div className="text-xs text-text-muted">
                                    {option.description}
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </m.div>,
                  document.body
                )
              ) : (
                <m.div
                  ref={dropdownRef}
                  className={cn(
                    "absolute z-50 min-w-full w-max bg-bg-card border border-border-primary rounded-md shadow-lg overflow-auto p-1",
                    position === "top" || shouldOpenUpward
                      ? "bottom-full mb-1"
                      : "top-full mt-1"
                  )}
                  style={{
                    maxHeight: `${dropdownHeight || 240}px`,
                  }}
                  initial={{
                    opacity: 0,
                    y: position === "top" || shouldOpenUpward ? 10 : -10,
                  }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{
                    opacity: 0,
                    y: position === "top" || shouldOpenUpward ? 10 : -10,
                  }}
                  transition={{ duration: 0.2 }}
                  role="listbox"
                  id="select-options"
                >
                  {filteredOptions.length === 0 ? (
                    <div className="px-3 py-2 text-sm text-text-muted">
                      {searchable ? "No options found" : "No options available"}
                    </div>
                  ) : (
                    <div className="flex flex-col gap-1">
                      {filteredOptions.map((option, index) => (
                        <div
                          key={option.value}
                          onClick={() => handleSelect(option)}
                          className={cn(
                            "px-3 py-2 cursor-pointer transition-colors rounded-md",
                            "hover:bg-surface-hover",
                            focusedIndex === index && "bg-surface-hover",
                            option.value === value &&
                              "bg-brand-surface text-brand-primary",
                            option.disabled && "opacity-50 cursor-not-allowed"
                          )}
                          role="option"
                          aria-selected={option.value === value}
                        >
                          <div className="flex items-center gap-2">
                            {option.icon && (
                              <div className="w-4">{option.icon}</div>
                            )}
                            <div className="flex-1 min-w-0">
                              <div className="text-sm font-medium text-text-primary">
                                {option.label}
                              </div>
                              {option.description && (
                                <div className="text-xs text-text-muted">
                                  {option.description}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </m.div>
              )}
            </>
          )}
        </>
      </div>

      {error && <p className={getInputErrorStyles()}>{error}</p>}
    </div>
  );
}
