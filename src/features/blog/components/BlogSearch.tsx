"use client";

import React from "react";
import { motion } from "framer-motion";
import { IconSearch, IconX } from "@tabler/icons-react";
import { useTranslations } from "next-intl";
import { Input } from "@/components/ui/input";

interface BlogSearchProps {
  value: string;
  onChange: (value: string) => void;
  onClear: () => void;
}

export function BlogSearch({ value, onChange, onClear }: BlogSearchProps) {
  const t = useTranslations("BlogPage.search");

  return (
    <div className="relative max-w-md w-full">
      <div className="relative group">
        <Input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={t("placeholder")}
          startIcon={<IconSearch className="w-5 h-5" />}
          className="pe-12"
        />
        {value && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            onClick={onClear}
            className="absolute end-4 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-surface-hover transition-colors z-10"
            aria-label={t("clearSearch")}
          >
            <IconX className="w-4 h-4 text-text-muted hover:text-text-primary" />
          </motion.button>
        )}
      </div>
    </div>
  );
}
