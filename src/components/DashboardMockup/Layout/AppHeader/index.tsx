"use client";

import React, { useState } from "react";
import { AppHeaderProps } from "./types";
import { useDropdown } from "./hooks";
import {
  SearchInput,
  UserAvatar,
  UserDropdownMenu,
  PageTitle,
} from "./components";

export default function AppHeader({ currentRoute }: AppHeaderProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const { isOpen, dropdownRef, toggle } = useDropdown();

  return (
    <header className="rounded-tr-[20px]">
      <div className="h-16 border-b rounded-tr-[20px] border-border-primary dark:border-border-secondary flex items-center justify-between bg-bg-card dark:bg-bg-dark py-4 px-6">
        <PageTitle currentRoute={currentRoute} />

        <div className="flex items-center gap-4">
          <SearchInput value={searchQuery} onChange={setSearchQuery} />

          {/* User Dropdown */}
          <div className="relative z-[200]" ref={dropdownRef}>
            <UserAvatar
              initials="JD"
              isDropdownOpen={isOpen}
              onClick={toggle}
            />
            {isOpen && (
              <UserDropdownMenu
                userName="Alex Mercer"
                userEmail="alex@range4ex.com"
              />
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

export type { AppHeaderProps } from "./types";
