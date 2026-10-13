"use client";

import { useTranslations } from "next-intl";
import SectionHeader from "@/components/shared/SectionHeader";
import { Card } from "@/components/Card";
import FaqCategories from "./components/FaqCategories";
import SearchBox from "./components/SearchBox";
import FaqList from "./components/FaqList";
import { useFaqFilter } from "./hooks/useFaqFilter";

export default function FaqSection() {
  const t = useTranslations("FaqSection");
  const {
    selectedCategory,
    setSelectedCategory,
    searchQuery,
    setSearchQuery,
    showAllFaqs,
    toggleShowAll,
    categories,
    categoryCounts,
    displayedFaqs,
    hasMoreFaqs,
    remainingCount,
    hasResults,
  } = useFaqFilter();

  return (
    <section
      id="faq"
      className="relative w-full bg-bg-dark py-6 sm:py-8 md:py-10 overflow-hidden"
    >
      <div className="container mx-auto max-w-[95vw] sm:max-w-[90vw] md:max-w-[1250px] px-4 sm:px-6">
        <Card
          animated
          className="bg-linear-to-b from-bg-card/0 via-bg-card/0 to-brand-surface/20 border-0 backdrop-blur-none py-8 sm:py-12 md:py-15"
        >
          {/* Header */}
          <div className="relative">
            <SectionHeader
              badge={t("badge")}
              title={t("title")}
              useAnimatedBackground
              description={t("description")}
            />
            <div className="absolute top-1/2 start-1/2 -translate-x-1/2 rtl:translate-x-1/2 -translate-y-1/2 w-48 sm:w-60 md:w-72 h-48 sm:h-60 md:h-72 bg-brand-primary/5 rounded-full blur-3xl pointer-events-none" />
          </div>

          {/* Search */}
          <div className="mt-6 sm:mt-8 mb-8 sm:mb-10 relative z-20">
            <SearchBox
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
            />
          </div>

          {/* Categories */}
          <div className="relative z-20">
            <FaqCategories
              categories={categories}
              selectedCategory={selectedCategory}
              setSelectedCategory={setSelectedCategory}
              categoryCounts={categoryCounts}
            />
          </div>

          {/* FAQ List */}
          <div className="mt-6 sm:mt-8 max-w-full sm:max-w-[900px] mx-auto relative z-20">
            <FaqList
              faqs={displayedFaqs}
              hasResults={hasResults}
              hasMoreFaqs={hasMoreFaqs}
              showAllFaqs={showAllFaqs}
              remainingCount={remainingCount}
              onToggleShowAll={toggleShowAll}
            />
          </div>
        </Card>
      </div>
    </section>
  );
}
