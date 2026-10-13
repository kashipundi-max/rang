"use client";

import React from "react";
import { useTranslations } from "next-intl";
import type { BlogPost } from "../config/data";
import { getRelatedPosts } from "../config/data";
import { Breadcrumb } from "@/components/shared/Breadcrumb";
import {
  ArticleHeader,
  ArticleBody,
  ArticleSidebar,
  RelatedPosts,
} from "./components";

interface BlogPostContentProps {
  post: BlogPost;
}

export default function BlogPostContent({ post }: BlogPostContentProps) {
  const tPosts = useTranslations("BlogData.posts");
  const tBlog = useTranslations("BlogPage.hero");

  const relatedPosts = getRelatedPosts(post, 3);

  // Get translated content
  const title = tPosts(`${post.id}.title`);
  const content = tPosts(`${post.id}.content`);

  return (
    <main className="relative w-full min-h-screen bg-bg-dark overflow-hidden">
      {/* Breadcrumb */}
      <section className="relative pt-24 sm:pt-32">
        <div className="container mx-auto max-w-[95vw] sm:max-w-[90vw] md:max-w-[1250px] px-4 sm:px-6">
          <Breadcrumb
            items={[{ label: tBlog("badge"), href: "/blog" }, { label: title }]}
          />
        </div>
      </section>

      <ArticleHeader post={post} title={title} />

      {/* Article Content */}
      <section className="relative pb-12">
        <div className="container mx-auto max-w-[95vw] sm:max-w-[90vw] md:max-w-[1250px] px-4 sm:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
            <ArticleBody post={post} content={content} />
            <ArticleSidebar title={title} authorId={post.authorId} />
          </div>
        </div>
      </section>

      <RelatedPosts posts={relatedPosts} />

      {/* Bottom gradient fade */}
      <div className="absolute bottom-0 inset-x-0 h-32 bg-linear-to-t from-bg-dark to-transparent pointer-events-none" />
    </main>
  );
}
