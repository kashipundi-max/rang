"use client";

import React from "react";
import { ShareWidget } from "./ShareWidget";
import { AuthorWidget } from "./AuthorWidget";

interface ArticleSidebarProps {
  title: string;
  authorId: string;
}

export function ArticleSidebar({ title, authorId }: ArticleSidebarProps) {
  return (
    <aside className="lg:col-span-4">
      <div className="sticky top-24 space-y-6">
        <ShareWidget title={title} />
        <AuthorWidget authorId={authorId} />
      </div>
    </aside>
  );
}
