"use client";

import React from "react";
import { motion } from "framer-motion";
import { IconArrowRight } from "@tabler/icons-react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import type { BlogPost } from "../../../config/data";

interface PopularPostsWidgetProps {
  posts: BlogPost[];
}

export function PopularPostsWidget({ posts }: PopularPostsWidgetProps) {
  const t = useTranslations("BlogPage.sidebar");
  const tPosts = useTranslations("BlogData.posts");

  return (
    <motion.div
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
      transition={{ delay: 0.1 }}
      className="bg-linear-to-br from-bg-card/80 via-bg-card/60 to-brand-surface/10 rounded-2xl border border-border-secondary/30 p-6"
    >
      <h3 className="text-lg font-clash-display font-medium text-text-primary mb-4">
        {t("popularPosts")}
      </h3>
      <div className="space-y-4">
        {posts.map((post, index) => (
          <Link
            key={post.id}
            href={`/blog/${post.slug}`}
            className="group flex items-start gap-3"
          >
            <span className="shrink-0 w-8 h-8 rounded-lg bg-brand-surface/50 border border-brand-border/30 flex items-center justify-center text-brand-primary text-sm font-medium font-dm-sans">
              {index + 1}
            </span>
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-medium text-text-primary font-dm-sans line-clamp-2 group-hover:text-brand-primary-light transition-colors">
                {tPosts(`${post.id}.title`)}
              </h4>
              <p className="text-xs text-text-muted mt-1 font-dm-sans">
                {post.readingTime} min read
              </p>
            </div>
            <IconArrowRight className="w-4 h-4 text-text-muted group-hover:text-brand-primary shrink-0 mt-1 rtl:rotate-180 transition-colors" />
          </Link>
        ))}
      </div>
    </motion.div>
  );
}
