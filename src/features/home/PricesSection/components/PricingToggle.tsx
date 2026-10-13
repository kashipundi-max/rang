"use client";

import { motion, AnimatePresence } from "framer-motion";
import { IconBadgeCc } from "@tabler/icons-react";
import { cn } from "@/lib/utils";

interface PricingToggleProps {
  isYearly: boolean;
  setIsYearly: (value: boolean) => void;
}

export function PricingToggle({ isYearly, setIsYearly }: PricingToggleProps) {
  return (
    <motion.div
      className="mt-10 flex items-center justify-center"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: 0.2 }}
    >
      <div className="flex items-center justify-center bg-neutral-100 dark:bg-neutral-800 p-1 rounded-xl">
        <button
          onClick={() => setIsYearly(false)}
          className={cn(
            "relative px-4 py-2 text-sm transition-all duration-300 rounded-lg",
            !isYearly
              ? "text-white font-medium shadow-sm"
              : "text-neutral-500 dark:text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-300"
          )}
        >
          {!isYearly && (
            <motion.div
              layoutId="billingTabBackground"
              className="absolute inset-0 bg-linear-to-r from-brand-primary to-brand-primary-light rounded-lg"
              transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
            />
          )}
          <span className="relative">Monthly</span>
        </button>
        <button
          onClick={() => setIsYearly(true)}
          className={cn(
            "relative px-4 py-2 text-sm transition-all duration-300 rounded-lg",
            isYearly
              ? "text-white font-medium shadow-sm"
              : "text-neutral-500 dark:text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-300"
          )}
        >
          {isYearly && (
            <motion.div
              layoutId="billingTabBackground"
              className="absolute inset-0 bg-linear-to-r from-brand-primary to-brand-primary-light rounded-lg"
              transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
            />
          )}
          <span className="relative">Annual</span>
          <span className="absolute -top-1 -right-1 flex h-5 w-5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-brand-primary-light opacity-75"></span>
            <span className="relative inline-flex items-center justify-center text-[8px] rounded-full h-5 w-5 bg-brand-primary text-white font-medium">
              17%
            </span>
          </span>
        </button>
      </div>

      {/* Yearly discount callout */}
      <AnimatePresence>
        {isYearly && (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="ml-4 bg-brand-surface/20 text-brand-primary-light text-xs py-1 px-2.5 rounded-md flex items-center"
          >
            <IconBadgeCc className="w-3.5 h-3.5 mr-1.5" />
            <span>Save up to $198/year</span>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
