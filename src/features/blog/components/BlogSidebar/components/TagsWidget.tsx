"use client";

import React from "react";
import { motion } from "framer-motion";
import { useTranslations } from "next-intl";

interface TagsWidgetProps {
  tags: string[];
}

export function TagsWidget({ tags }: TagsWidgetProps) {
  const t = useTranslations("BlogPage.sidebar");
  const tTags = useTranslations("BlogData.tags");

  return (
    <motion.div
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
      transition={{ delay: 0.2 }}
      className="bg-linear-to-br from-bg-card/80 via-bg-card/60 to-brand-surface/10 rounded-2xl border border-border-secondary/30 p-6"
    >
      <h3 className="text-lg font-clash-display font-medium text-text-primary mb-4">
        {t("tags")}
      </h3>
      <div className="flex flex-wrap gap-2">
        {tags.map((tag) => (
          <span
            key={tag}
            className="px-3 py-1.5 text-xs font-dm-sans text-text-body bg-bg-card/80 border border-border-secondary/30 rounded-full hover:border-brand-primary/40 hover:text-brand-primary-light transition-colors cursor-pointer"
          >
            {tTags(tag)}
          </span>
        ))}
      </div>
    </motion.div>
  );
}
