"use client";

import React from "react";
import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import type { BlogPost } from "../../config/data";

interface ArticleBodyProps {
  post: BlogPost;
  content: string;
}

interface ContentSection {
  title: string | null;
  content: string;
}

export function ArticleBody({ post, content }: ArticleBodyProps) {
  const tTags = useTranslations("BlogData.tags");

  // Parse content into sections (split by ## headings)
  const sections: ContentSection[] = content
    .split(/\n\n## /)
    .map((section, index) => {
      if (index === 0) {
        return { title: null, content: section };
      }
      const [heading, ...rest] = section.split("\n\n");
      return { title: heading, content: rest.join("\n\n") };
    });

  return (
    <motion.article
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="lg:col-span-8 prose prose-invert prose-lg max-w-none"
    >
      {sections.map((section, index) => (
        <div key={index} className="mb-8">
          {section.title && (
            <h2 className="text-2xl font-clash-display font-medium text-text-primary mb-4">
              {section.title}
            </h2>
          )}
          {section.content.split("\n\n").map((paragraph, pIndex) => (
            <p
              key={pIndex}
              className="text-text-body/90 font-dm-sans leading-relaxed mb-4"
            >
              {paragraph}
            </p>
          ))}
        </div>
      ))}

      {/* Tags */}
      <div className="flex flex-wrap gap-2 pt-8 border-t border-border-secondary/30 mt-12">
        {post.tags.map((tag) => (
          <span
            key={tag}
            className="px-3 py-1.5 text-xs font-dm-sans text-text-body bg-bg-card/80 border border-border-secondary/30 rounded-full"
          >
            {tTags(tag)}
          </span>
        ))}
      </div>
    </motion.article>
  );
}
