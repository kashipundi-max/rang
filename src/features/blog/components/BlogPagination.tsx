"use client";

import React from "react";
import { motion } from "framer-motion";
import { IconChevronLeft, IconChevronRight } from "@tabler/icons-react";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";

interface BlogPaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export function BlogPagination({
  currentPage,
  totalPages,
  onPageChange,
}: BlogPaginationProps) {
  const t = useTranslations("BlogPage.pagination");

  // Demo pagination UI - always show 3 pages
  const pages = [1, 2, 3];

  const handlePageClick = (page: number) => {
    console.log("Page clicked:", page);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="flex items-center justify-center gap-2 mt-12"
    >
      {/* Previous button */}
      <button
        onClick={() => handlePageClick(currentPage - 1)}
        className={cn(
          "flex items-center gap-1 px-4 py-2 rounded-lg font-dm-sans text-sm",
          "border border-border-secondary/40 transition-all duration-300",
          "text-text-body hover:text-text-primary hover:border-brand-primary/40 hover:bg-brand-surface/30"
        )}
      >
        <IconChevronLeft className="w-4 h-4 rtl:rotate-180" />
        {t("previous")}
      </button>

      {/* Page numbers */}
      <div className="flex items-center gap-1">
        {pages.map((page) => (
          <button
            key={page}
            onClick={() => handlePageClick(page)}
            className={cn(
              "w-10 h-10 rounded-lg font-dm-sans text-sm font-medium",
              "transition-all duration-300",
              currentPage === page
                ? "bg-brand-primary text-white shadow-lg shadow-brand-primary/25"
                : "text-text-body hover:text-text-primary hover:bg-brand-surface/30"
            )}
          >
            {page}
          </button>
        ))}
      </div>

      {/* Next button */}
      <button
        onClick={() => handlePageClick(currentPage + 1)}
        className={cn(
          "flex items-center gap-1 px-4 py-2 rounded-lg font-dm-sans text-sm",
          "border border-border-secondary/40 transition-all duration-300",
          "text-text-body hover:text-text-primary hover:border-brand-primary/40 hover:bg-brand-surface/30"
        )}
      >
        {t("next")}
        <IconChevronRight className="w-4 h-4 rtl:rotate-180" />
      </button>
    </motion.div>
  );
}
