"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useTranslations } from "next-intl";

interface ShowMoreButtonProps {
  showAllFaqs: boolean;
  onToggle: () => void;
  remainingCount: number;
}

export default function ShowMoreButton({
  showAllFaqs,
  onToggle,
  remainingCount,
}: ShowMoreButtonProps) {
  const t = useTranslations("FaqSection");

  return (
    <motion.div
      className="flex justify-center mt-8"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <Button
        variant="outline"
        onClick={onToggle}
        className="flex items-center gap-2"
      >
        {showAllFaqs ? (
          <>
            <svg
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 15l7-7 7 7"
              />
            </svg>
            {t("showLess")}
          </>
        ) : (
          <>
            <svg
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
            {t("showMore", { count: remainingCount })}
          </>
        )}
      </Button>
    </motion.div>
  );
}
