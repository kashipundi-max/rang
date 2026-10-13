"use client";

import React, { useState } from "react";
import { blogPosts, getAllTags } from "../../config/data";
import { NewsletterWidget, PopularPostsWidget, TagsWidget } from "./components";

export function BlogSidebar() {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const popularPosts = blogPosts.slice(0, 3);
  const tags = getAllTags();

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setSubscribed(true);
      setEmail("");
      setTimeout(() => setSubscribed(false), 3000);
    }
  };

  return (
    <aside className="space-y-8">
      <NewsletterWidget
        email={email}
        onEmailChange={setEmail}
        onSubmit={handleSubscribe}
        subscribed={subscribed}
      />
      <PopularPostsWidget posts={popularPosts} />
      <TagsWidget tags={tags} />
    </aside>
  );
}
