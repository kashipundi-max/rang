// Blog post categories
export type BlogCategory = "all" | "analytics" | "growth" | "product" | "engineering" | "company";

// Blog post badge types
export type PostBadge = "featured" | "trending" | "new" | null;

// Blog post structure
export interface BlogPost {
    id: string; // Translation key (p1, p2, etc.)
    slug: string;
    authorId: string;
    category: Exclude<BlogCategory, "all">;
    tags: string[];
    image: string;
    publishedAt: string;
    readingTime: number;
    badge: PostBadge;
}

// Author structure
export interface BlogAuthor {
    id: string;
    avatar: string;
    twitter?: string;
    linkedin?: string;
}

// Blog posts data
export const blogPosts: BlogPost[] = [
    {
        id: "p1",
        slug: "future-of-product-analytics-2025-trends",
        authorId: "a1",
        category: "analytics",
        tags: ["analytics", "data", "product"],
        image: "/images/blog/post-1.webp",
        publishedAt: "2025-11-25",
        readingTime: 8,
        badge: "featured",
    },
    {
        id: "p2",
        slug: "how-we-increased-conversion-rates-340-percent",
        authorId: "a2",
        category: "growth",
        tags: ["growth", "conversion", "ab-testing"],
        image: "/images/blog/post-2.webp",
        publishedAt: "2025-11-22",
        readingTime: 6,
        badge: "trending",
    },
    {
        id: "p3",
        slug: "building-data-driven-culture-startup",
        authorId: "a3",
        category: "company",
        tags: ["culture", "data", "startup"],
        image: "/images/blog/post-3.webp",
        publishedAt: "2025-11-20",
        readingTime: 7,
        badge: "new",
    },
    {
        id: "p4",
        slug: "ab-testing-best-practices-product-teams",
        authorId: "a2",
        category: "product",
        tags: ["ab-testing", "product", "data"],
        image: "/images/blog/post-4.webp",
        publishedAt: "2025-11-18",
        readingTime: 10,
        badge: null,
    },
    {
        id: "p5",
        slug: "understanding-user-behavior-cohort-analysis",
        authorId: "a1",
        category: "analytics",
        tags: ["analytics", "retention", "data"],
        image: "/images/blog/post-5.webp",
        publishedAt: "2025-11-15",
        readingTime: 9,
        badge: null,
    }
];

// Authors data
export const blogAuthors: BlogAuthor[] = [
    {
        id: "a1",
        avatar: "/images/avatars/person/person-2.webp",
        twitter: "sarahchen",
        linkedin: "sarahchen",
    },
    {
        id: "a2",
        avatar: "/images/avatars/person/person-female-2.webp",
        twitter: "marcusrodriguez",
        linkedin: "marcusrodriguez",
    },
    {
        id: "a3",
        avatar: "/images/avatars/person/person-female.webp",
        twitter: "emilywatson",
        linkedin: "emilywatson",
    },
    {
        id: "a4",
        avatar: "/images/avatars/person/person.webp",
        twitter: "davidpark",
        linkedin: "davidpark",
    },
];

// Helper function to get post by slug
export function getPostBySlug(slug: string): BlogPost | undefined {
    return blogPosts.find((post) => post.slug === slug);
}

// Helper function to get author by id
export function getAuthorById(id: string): BlogAuthor | undefined {
    return blogAuthors.find((author) => author.id === id);
}

// Helper function to get related posts
export function getRelatedPosts(currentPost: BlogPost, limit = 3): BlogPost[] {
    return blogPosts
        .filter(
            (post) =>
                post.id !== currentPost.id &&
                (post.category === currentPost.category ||
                    post.tags.some((tag) => currentPost.tags.includes(tag)))
        )
        .slice(0, limit);
}

// Helper function to get posts by category
export function getPostsByCategory(category: BlogCategory): BlogPost[] {
    if (category === "all") return blogPosts;
    return blogPosts.filter((post) => post.category === category);
}

// Get all unique tags
export function getAllTags(): string[] {
    const tags = new Set<string>();
    blogPosts.forEach((post) => post.tags.forEach((tag) => tags.add(tag)));
    return Array.from(tags);
}

// Get all categories with counts
export function getCategoriesWithCounts(): Record<BlogCategory, number> {
    const counts: Record<BlogCategory, number> = {
        all: blogPosts.length,
        analytics: 0,
        growth: 0,
        product: 0,
        engineering: 0,
        company: 0,
    };

    blogPosts.forEach((post) => {
        counts[post.category]++;
    });

    return counts;
}
