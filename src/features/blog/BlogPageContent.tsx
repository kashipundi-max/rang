"use client";

import { useTranslations } from "next-intl";
import PageHeader from "@/components/shared/PageHeader";
import { useBlogFilter } from "./hooks/useBlogFilter";
import {
  BlogSearch,
  BlogCategories,
  BlogGrid,
  BlogPagination,
  BlogSidebar,
} from "./components";

export default function BlogPageContent() {
  const t = useTranslations("BlogPage.hero");
  const {
    selectedCategory,
    setSelectedCategory,
    searchQuery,
    setSearchQuery,
    currentPage,
    setCurrentPage,
    categories,
    categoryCounts,
    displayedPosts,
    totalPages,
    hasResults,
    clearSearch,
  } = useBlogFilter();

  return (
    <main className="relative w-full min-h-screen bg-bg-dark overflow-hidden">
      {/* Hero Section */}
      <PageHeader
        badge={t("badge")}
        title={t("title")}
        description={t("description")}
        breadcrumbItems={[{ label: t("badge") }]}
      />

      {/* Filters Section */}
      <section className="relative py-6 sm:py-8">
        <div className="container mx-auto max-w-[95vw] sm:max-w-[90vw] md:max-w-[1250px] px-4 sm:px-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sm:gap-6">
            <BlogCategories
              categories={categories}
              selectedCategory={selectedCategory}
              onSelect={setSelectedCategory}
              counts={categoryCounts}
            />
            <BlogSearch
              value={searchQuery}
              onChange={setSearchQuery}
              onClear={clearSearch}
            />
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="relative py-8 sm:py-12">
        <div className="container mx-auto max-w-[95vw] sm:max-w-[90vw] md:max-w-[1250px] px-4 sm:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Blog Grid */}
            <div className="lg:col-span-3">
              <BlogGrid posts={displayedPosts} hasResults={hasResults} />
              <BlogPagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
              />
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1">
              <BlogSidebar />
            </div>
          </div>
        </div>
      </section>

      {/* Bottom gradient fade */}
      <div className="absolute bottom-0 inset-x-0 h-32 bg-linear-to-t from-bg-dark to-transparent pointer-events-none" />
    </main>
  );
}
