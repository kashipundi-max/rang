"use client";

import Input from "@/components/ui/SimpleInput";
import { IconSearch } from "@tabler/icons-react";
import { useTranslations } from "next-intl";

interface SearchBoxProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

export default function SearchBox({
  searchQuery,
  setSearchQuery,
}: SearchBoxProps) {
  const t = useTranslations("FaqSection");

  return (
    <div className="w-full max-w-full sm:max-w-lg mx-auto px-2 sm:px-0">
      <div className="relative">
        <Input
          type="text"
          placeholder={t("searchPlaceholder")}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full ps-10 sm:ps-6 text-sm sm:text-base"
        />
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <IconSearch className="h-4 w-4 sm:h-5 sm:w-5 text-text-muted" />
        </div>
        {searchQuery && (
          <button
            onClick={() => setSearchQuery("")}
            className="absolute inset-y-0 right-0 pr-3 flex items-center text-text-muted hover:text-text-body transition-colors duration-200"
          >
            <svg
              className="h-4 w-4 sm:h-5 sm:w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
}
