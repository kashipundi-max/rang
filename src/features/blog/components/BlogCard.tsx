"use client";

import React from "react";
import { motion } from "framer-motion";
import { IconArrowRight, IconClock } from "@tabler/icons-react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils";
import { TranslatedPost } from "../hooks/useBlogFilter";
import { getAuthorById } from "../config/data";

interface BlogCardProps {
  post: TranslatedPost;
  index: number;
  featured?: boolean;
}

export function BlogCard({ post, index, featured = false }: BlogCardProps) {
  const t = useTranslations("BlogPage.posts");
  const tAuthors = useTranslations("BlogData.authors");
  const tCategories = useTranslations("BlogPage.categories");
  const author = getAuthorById(post.authorId);

  const formattedDate = new Date(post.publishedAt).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  return (
    <motion.article
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4, delay: index * 0.1 }}
      className={cn(
        "group relative rounded-2xl overflow-hidden",
        "bg-linear-to-br from-bg-card/80 via-bg-card/60 to-brand-surface/10",
        "border border-border-secondary/30 hover:border-brand-primary/40",
        "transition-all duration-300",
        featured && "md:col-span-2 md:row-span-1"
      )}
    >
      <Link href={`/blog/${post.slug}`} className="block">
        {/* Image Container */}
        <div
          className={cn(
            "relative overflow-hidden",
            featured ? "h-64 md:h-80" : "h-48"
          )}
        >
          {/* Post image */}
          <img
            src={post.image}
            alt={post.title}
            className="absolute inset-0 w-full h-full object-cover object-top-left transition-transform duration-300 group-hover:scale-105"
          />
          {/* Overlay gradient */}
          <div className="absolute inset-0 bg-linear-to-t from-bg-card via-transparent to-transparent" />

          {/* Category badge */}
          <div className="absolute top-4 start-4 z-10">
            <span className="px-3 py-1.5 text-xs font-medium font-dm-sans bg-brand-surface/80 backdrop-blur-sm text-brand-primary-light border border-brand-border/50 rounded-full">
              {tCategories(post.category)}
            </span>
          </div>

          {/* Post badge (featured, trending, new) */}
          {post.badge && (
            <div className="absolute top-4 end-4 z-10">
              <span
                className={cn(
                  "px-3 py-1.5 text-xs font-medium font-dm-sans rounded-full",
                  post.badge === "featured" &&
                    "bg-amber-500/20 text-amber-400 border border-amber-500/30",
                  post.badge === "trending" &&
                    "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30",
                  post.badge === "new" &&
                    "bg-brand-primary/20 text-brand-primary-light border border-brand-primary/30"
                )}
              >
                {t(post.badge)}
              </span>
            </div>
          )}

          {/* Hover overlay */}
          <div className="absolute inset-0 bg-brand-primary/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </div>

        {/* Content */}
        <div className="p-5 sm:p-6">
          {/* Meta info */}
          <div className="flex items-center gap-3 mb-3 text-sm text-text-muted font-dm-sans">
            <span>{formattedDate}</span>
            <span className="w-1 h-1 rounded-full bg-text-muted/50" />
            <span className="flex items-center gap-1">
              <IconClock className="w-4 h-4" />
              {post.readingTime} {t("minRead")}
            </span>
          </div>

          {/* Title */}
          <h3
            className={cn(
              "font-clash-display font-medium text-text-primary mb-3",
              "group-hover:text-brand-primary-light transition-colors duration-300",
              featured ? "text-xl sm:text-2xl" : "text-lg"
            )}
          >
            {post.title}
          </h3>

          {/* Excerpt */}
          <p
            className={cn(
              "text-text-body/90 font-dm-sans leading-relaxed mb-4",
              featured ? "text-base line-clamp-3" : "text-sm line-clamp-2"
            )}
          >
            {post.excerpt}
          </p>

          {/* Author & Read more */}
          <div className="flex items-center justify-between pt-4 border-t border-border-secondary/30">
            {/* Author */}
            <div className="flex items-center gap-3">
              <img
                src={author?.avatar}
                alt={tAuthors(`${post.authorId}.name`)}
                className="w-8 h-8 rounded-full object-cover border border-brand-border/50"
              />
              <span className="text-sm text-text-body font-dm-sans">
                {tAuthors(`${post.authorId}.name`)}
              </span>
            </div>

            {/* Read more */}
            <span className="flex items-center gap-1 text-sm text-brand-primary font-medium font-dm-sans group-hover:gap-2 transition-all duration-300">
              {t("readMore")}
              <IconArrowRight className="w-4 h-4 rtl:rotate-180" />
            </span>
          </div>
        </div>
      </Link>
    </motion.article>
  );
}
