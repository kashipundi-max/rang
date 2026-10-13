"use client";

import React from "react";
import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { getAuthorById } from "../../config/data";

interface AuthorWidgetProps {
  authorId: string;
}

export function AuthorWidget({ authorId }: AuthorWidgetProps) {
  const t = useTranslations("BlogPost");
  const tAuthors = useTranslations("BlogData.authors");
  const author = getAuthorById(authorId);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 }}
      className="bg-linear-to-br from-bg-card/80 via-bg-card/60 to-brand-surface/10 rounded-xl border border-border-secondary/30 p-5"
    >
      <h3 className="text-sm font-medium text-text-primary font-dm-sans mb-4">
        {t("author.about")}
      </h3>
      <div className="flex items-start gap-3">
        <img
          src={author?.avatar}
          alt={tAuthors(`${authorId}.name`)}
          className="w-12 h-12 rounded-full object-cover border border-brand-border/50 shrink-0"
        />
        <div>
          <p className="text-text-primary font-medium font-dm-sans">
            {tAuthors(`${authorId}.name`)}
          </p>
          <p className="text-xs text-text-muted font-dm-sans mb-2">
            {tAuthors(`${authorId}.role`)}
          </p>
          <p className="text-sm text-text-body/90 font-dm-sans leading-relaxed">
            {tAuthors(`${authorId}.bio`)}
          </p>
        </div>
      </div>
    </motion.div>
  );
}
