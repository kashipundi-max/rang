"use client";

import React from "react";
import { useTranslations } from "next-intl";
import { BlogCard } from "../../components/BlogCard";
import type { BlogPost } from "../../config/data";

interface RelatedPostsProps {
  posts: BlogPost[];
}

export function RelatedPosts({ posts }: RelatedPostsProps) {
  const t = useTranslations("BlogPost");
  const tPosts = useTranslations("BlogData.posts");

  if (posts.length === 0) {
    return null;
  }

  return (
    <section className="relative py-12 sm:py-16 border-t border-border-secondary/20">
      <div className="container mx-auto max-w-[95vw] sm:max-w-[90vw] md:max-w-[1250px] px-4 sm:px-6">
        <div className="text-center mb-10">
          <h2 className="text-2xl sm:text-3xl font-clash-display font-medium text-text-primary mb-3">
            {t("related.title")}
          </h2>
          <p className="text-text-body/90 font-dm-sans">
            {t("related.description")}
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {posts.map((relatedPost, index) => (
            <BlogCard
              key={relatedPost.id}
              post={{
                ...relatedPost,
                title: tPosts(`${relatedPost.id}.title`),
                excerpt: tPosts(`${relatedPost.id}.excerpt`),
              }}
              index={index}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
