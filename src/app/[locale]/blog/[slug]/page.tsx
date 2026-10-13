import { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { BlogPostContent, getPostBySlug, blogPosts } from "@/features/blog";

type Props = {
  params: Promise<{ locale: string; slug: string }>;
};

// Generate static params for all blog posts
export async function generateStaticParams() {
  return blogPosts.map((post) => ({
    slug: post.slug,
  }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params;
  const post = getPostBySlug(slug);

  if (!post) {
    return {
      title: "Post Not Found",
    };
  }

  const t = await getTranslations({ locale, namespace: "BlogData.posts" });
  const tMeta = await getTranslations({ locale, namespace: "BlogPost.meta" });

  const title = t(`${post.id}.title`);
  const excerpt = t(`${post.id}.excerpt`);

  return {
    title: `${title}${tMeta("titleSuffix")}`,
    description: excerpt,
    openGraph: {
      title: title,
      description: excerpt,
      type: "article",
      publishedTime: post.publishedAt,
    },
  };
}

export default async function BlogPostPage({ params }: Props) {
  const { locale, slug } = await params;

  // Enable static rendering
  setRequestLocale(locale);

  const post = getPostBySlug(slug);

  if (!post) {
    notFound();
  }

  return <BlogPostContent post={post} />;
}
