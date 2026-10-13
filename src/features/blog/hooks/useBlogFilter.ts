"use client";

import { useState, useMemo, useCallback } from "react";
import { useTranslations } from "next-intl";
import {
    blogPosts,
    BlogPost,
    BlogCategory,
    getPostsByCategory,
    getCategoriesWithCounts,
} from "../config/data";

const POSTS_PER_PAGE = 5;

export interface TranslatedPost extends BlogPost {
    title: string;
    excerpt: string;
}

export interface UseBlogFilterResult {
    // State
    selectedCategory: BlogCategory;
    setSelectedCategory: (category: BlogCategory) => void;
    searchQuery: string;
    setSearchQuery: (query: string) => void;
    currentPage: number;
    setCurrentPage: (page: number) => void;

    // Computed
    categories: BlogCategory[];
    categoryCounts: Record<BlogCategory, number>;
    displayedPosts: TranslatedPost[];
    totalPages: number;
    hasResults: boolean;
    totalResults: number;

    // Actions
    clearSearch: () => void;
}

export function useBlogFilter(): UseBlogFilterResult {
    const t = useTranslations("BlogData.posts");
    const [selectedCategory, setSelectedCategory] = useState<BlogCategory>("all");
    const [searchQuery, setSearchQuery] = useState("");
    const [currentPage, setCurrentPage] = useState(1);

    // Get translated posts
    const translatedPosts = useMemo<TranslatedPost[]>(() => {
        return blogPosts.map((post) => ({
            ...post,
            title: t(`${post.id}.title`),
            excerpt: t(`${post.id}.excerpt`),
        }));
    }, [t]);

    // Filter posts based on category and search query
    const filteredPosts = useMemo(() => {
        let posts = selectedCategory === "all"
            ? translatedPosts
            : translatedPosts.filter((post) => post.category === selectedCategory);

        if (searchQuery.trim()) {
            const searchLower = searchQuery.toLowerCase();
            posts = posts.filter(
                (post) =>
                    post.title.toLowerCase().includes(searchLower) ||
                    post.excerpt.toLowerCase().includes(searchLower)
            );
        }

        return posts;
    }, [translatedPosts, selectedCategory, searchQuery]);

    // Pagination
    const totalPages = Math.ceil(filteredPosts.length / POSTS_PER_PAGE);
    const displayedPosts = filteredPosts.slice(
        (currentPage - 1) * POSTS_PER_PAGE,
        currentPage * POSTS_PER_PAGE
    );

    // Categories
    const categories: BlogCategory[] = [
        "all",
        "analytics",
        "growth",
        "product",
    ];
    const categoryCounts = getCategoriesWithCounts();

    // Reset page when filters change
    const handleCategoryChange = useCallback((category: BlogCategory) => {
        setSelectedCategory(category);
        setCurrentPage(1);
    }, []);

    const handleSearchChange = useCallback((query: string) => {
        setSearchQuery(query);
        setCurrentPage(1);
    }, []);

    const clearSearch = useCallback(() => {
        setSearchQuery("");
        setCurrentPage(1);
    }, []);

    return {
        selectedCategory,
        setSelectedCategory: handleCategoryChange,
        searchQuery,
        setSearchQuery: handleSearchChange,
        currentPage,
        setCurrentPage,
        categories,
        categoryCounts,
        displayedPosts,
        totalPages,
        hasResults: filteredPosts.length > 0,
        totalResults: filteredPosts.length,
        clearSearch,
    };
}
