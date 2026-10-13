"use client";

import React from "react";
import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { BlogCard } from "./BlogCard";
import { TranslatedPost } from "../hooks/useBlogFilter";

interface BlogGridProps {
  posts: TranslatedPost[];
  hasResults: boolean;
}

export function BlogGrid({ posts, hasResults }: BlogGridProps) {
  const t = useTranslations("BlogPage.search");

  if (!hasResults) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center py-16"
      >
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-brand-surface/50 border border-brand-border/30 flex items-center justify-center">
          <svg
            className="w-8 h-8 text-text-muted"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>
        <p className="text-text-body font-dm-sans text-lg">{t("noResults")}</p>
      </motion.div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
      {posts.map((post, index) => (
        <BlogCard
          key={post.id}
          post={post}
          index={index}
          featured={index === 0 && posts.length > 3}
        />
      ))}
    </div>
  );
}
