"use client";

import { useState, useMemo } from "react";
import { useTranslations } from "next-intl";
import { faqData, FaqCategory, FaqItem } from "../config/data";

const INITIAL_FAQ_COUNT = 4;

export interface TranslatedFaq extends FaqItem {
    question: string;
    answer: string;
}

export interface UseFaqFilterResult {
    // State
    selectedCategory: FaqCategory;
    setSelectedCategory: (category: FaqCategory) => void;
    searchQuery: string;
    setSearchQuery: (query: string) => void;
    showAllFaqs: boolean;
    toggleShowAll: () => void;

    // Computed
    categories: FaqCategory[];
    categoryCounts: Record<string, number>;
    displayedFaqs: TranslatedFaq[];
    hasMoreFaqs: boolean;
    remainingCount: number;
    hasResults: boolean;
}

export function useFaqFilter(): UseFaqFilterResult {
    const t = useTranslations("FaqSection");
    const [selectedCategory, setSelectedCategory] = useState<FaqCategory>("all");
    const [searchQuery, setSearchQuery] = useState("");
    const [showAllFaqs, setShowAllFaqs] = useState(false);

    // Get translated FAQ data
    const translatedFaqs = useMemo<TranslatedFaq[]>(() => {
        return faqData.map((faq) => ({
            ...faq,
            question: t(`faqs.${faq.id}.question`),
            answer: t(`faqs.${faq.id}.answer`),
        }));
    }, [t]);

    // Filter FAQs based on category and search query
    const filteredFaqs = useMemo(() => {
        return translatedFaqs.filter((faq) => {
            const matchesCategory =
                selectedCategory === "all" || faq.category === selectedCategory;
            const searchLower = searchQuery.toLowerCase();
            const matchesSearch =
                faq.question.toLowerCase().includes(searchLower) ||
                faq.answer.toLowerCase().includes(searchLower);
            return matchesCategory && matchesSearch;
        });
    }, [translatedFaqs, selectedCategory, searchQuery]);

    // Pagination
    const displayedFaqs = showAllFaqs
        ? filteredFaqs
        : filteredFaqs.slice(0, INITIAL_FAQ_COUNT);
    const hasMoreFaqs = filteredFaqs.length > INITIAL_FAQ_COUNT;
    const remainingCount = filteredFaqs.length - INITIAL_FAQ_COUNT;

    // Categories with counts
    const categories = useMemo(() => {
        return [
            "all",
            ...new Set(faqData.map((faq) => faq.category)),
        ] as FaqCategory[];
    }, []);

    const categoryCounts = useMemo(() => {
        return categories.reduce(
            (counts, category) => {
                counts[category] =
                    category === "all"
                        ? faqData.length
                        : faqData.filter((faq) => faq.category === category).length;
                return counts;
            },
            {} as Record<string, number>
        );
    }, [categories]);

    return {
        selectedCategory,
        setSelectedCategory,
        searchQuery,
        setSearchQuery,
        showAllFaqs,
        toggleShowAll: () => setShowAllFaqs((prev) => !prev),
        categories,
        categoryCounts,
        displayedFaqs,
        hasMoreFaqs,
        remainingCount,
        hasResults: filteredFaqs.length > 0,
    };
}
