"use client";

import { useState, createContext, useContext, ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { IconChevronDown } from "@tabler/icons-react";
import { cn } from "@/lib/utils";

// Context for accordion state management
interface AccordionContextType {
  openItem: string | null;
  setOpenItem: (id: string | null) => void;
  allowMultiple: boolean;
}

const AccordionContext = createContext<AccordionContextType | null>(null);

// Hook to access accordion context
function useAccordion() {
  const context = useContext(AccordionContext);
  if (!context) {
    throw new Error("Accordion components must be used within an Accordion");
  }
  return context;
}

// Root Accordion component
interface AccordionProps {
  children: ReactNode;
  className?: string;
  defaultOpen?: string;
  allowMultiple?: boolean;
}

export function Accordion({
  children,
  className,
  defaultOpen,
  allowMultiple = false,
}: AccordionProps) {
  const [openItem, setOpenItem] = useState<string | null>(defaultOpen ?? null);

  return (
    <AccordionContext.Provider value={{ openItem, setOpenItem, allowMultiple }}>
      <div className={cn("flex flex-col gap-3 sm:gap-4", className)}>
        {children}
      </div>
    </AccordionContext.Provider>
  );
}

// Accordion Item component
interface AccordionItemProps {
  children: ReactNode;
  value: string;
  className?: string;
}

export function AccordionItem({
  children,
  value,
  className,
}: AccordionItemProps) {
  const { openItem } = useAccordion();
  const isOpen = openItem === value;

  return (
    <div
      data-state={isOpen ? "open" : "closed"}
      className={cn(
        "rounded-lg border border-border-secondary/50 overflow-hidden transition-all duration-200",
        isOpen
          ? "bg-brand-surface/40"
          : "bg-brand-surface/20 hover:bg-brand-surface/30",
        className
      )}
    >
      {children}
    </div>
  );
}

// Accordion Trigger component
interface AccordionTriggerProps {
  children: ReactNode;
  value: string;
  className?: string;
  badge?: ReactNode;
}

export function AccordionTrigger({
  children,
  value,
  className,
  badge,
}: AccordionTriggerProps) {
  const { openItem, setOpenItem } = useAccordion();
  const isOpen = openItem === value;

  const handleClick = () => {
    setOpenItem(isOpen ? null : value);
  };

  return (
    <button
      onClick={handleClick}
      className={cn(
        "flex justify-between items-start sm:items-center w-full p-4 sm:p-6 text-start",
        className
      )}
    >
      <h3 className="font-medium text-base sm:text-lg text-white pe-3 sm:pe-4 font-dm-sans leading-tight">
        {children}
      </h3>
      <span className="flex items-center ms-2 sm:ms-4 shrink-0">
        {/* Optional badge */}
        {badge && (
          <span className="hidden sm:block text-xs px-3 py-1 rounded-full me-3 bg-brand-primary/20 text-brand-primary-light border border-brand-primary/30 font-dm-sans">
            {badge}
          </span>
        )}

        {/* Toggle icon */}
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2, ease: "easeInOut" }}
          className="flex items-center justify-center h-7 w-7 sm:h-8 sm:w-8 rounded-full bg-brand-surface/50"
        >
          <IconChevronDown className="h-3 w-3 sm:h-4 sm:w-4 text-text-muted" />
        </motion.div>
      </span>
    </button>
  );
}

// Accordion Content component
interface AccordionContentProps {
  children: ReactNode;
  value: string;
  className?: string;
  badge?: ReactNode;
}

export function AccordionContent({
  children,
  value,
  className,
  badge,
}: AccordionContentProps) {
  const { openItem } = useAccordion();
  const isOpen = openItem === value;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.2, ease: "easeInOut" }}
          className="overflow-hidden"
        >
          <div className={cn("px-4 sm:px-6 pb-4 sm:pb-6 pt-0", className)}>
            <div className="h-px bg-border-secondary/50 mb-3 sm:mb-4" />
            <p className="text-text-body font-dm-sans leading-relaxed text-sm sm:text-base">
              {children}
            </p>
            {/* Mobile badge */}
            {badge && (
              <div className="block sm:hidden mt-3 text-xs px-3 py-1 rounded-full w-fit bg-brand-primary/20 text-brand-primary-light border border-brand-primary/30 font-dm-sans">
                {badge}
              </div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
