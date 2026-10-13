"use client";

import React from "react";
import { motion } from "framer-motion";
import { IconClock, IconCalendar } from "@tabler/icons-react";
import { useTranslations } from "next-intl";
import { getAuthorById } from "../../config/data";
import type { BlogPost } from "../../config/data";

interface ArticleHeaderProps {
  post: BlogPost;
  title: string;
}

export function ArticleHeader({ post, title }: ArticleHeaderProps) {
  const t = useTranslations("BlogPost");
  const tAuthors = useTranslations("BlogData.authors");
  const tCategories = useTranslations("BlogPage.categories");
  const author = getAuthorById(post.authorId);

  const formattedDate = new Date(post.publishedAt).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  return (
    <section className="relative pt-8 sm:pt-12 pb-8">
      <div className="container mx-auto max-w-[95vw] sm:max-w-[90vw] md:max-w-[1250px] px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Category */}
          <span className="inline-block px-3 py-1.5 text-xs font-medium font-dm-sans bg-brand-surface/80 text-brand-primary-light border border-brand-border/50 rounded-full mb-4">
            {tCategories(post.category)}
          </span>

          {/* Title */}
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-clash-display font-medium text-text-primary mb-6 leading-tight">
            {title}
          </h1>

          {/* Meta */}
          <div className="flex flex-wrap items-center gap-4 sm:gap-6 text-sm text-text-body font-dm-sans mb-8">
            <div className="flex items-center gap-2">
              <img
                src={author?.avatar}
                alt={tAuthors(`${post.authorId}.name`)}
                className="w-10 h-10 rounded-full object-cover border border-brand-border/50"
              />
              <div>
                <p className="text-text-primary font-medium">
                  {tAuthors(`${post.authorId}.name`)}
                </p>
                <p className="text-xs text-text-muted">
                  {tAuthors(`${post.authorId}.role`)}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <IconCalendar className="w-4 h-4" />
              {formattedDate}
            </div>
            <div className="flex items-center gap-1">
              <IconClock className="w-4 h-4" />
              {post.readingTime} {t("readingTime")}
            </div>
          </div>

          {/* Featured Image */}
          <div className="relative h-64 sm:h-80 md:h-96 rounded-2xl overflow-hidden mb-8">
            <img
              src={post.image}
              alt={title}
              className="absolute inset-0 w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-linear-to-t from-bg-card/50 via-transparent to-transparent" />
          </div>
        </motion.div>
      </div>
    </section>
  );
}
