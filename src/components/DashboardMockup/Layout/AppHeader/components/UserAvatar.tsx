"use client";

import React from "react";
import { IconChevronDown } from "@tabler/icons-react";
import { UserAvatarProps } from "../types";

export function UserAvatar({
  initials,
  isDropdownOpen,
  onClick,
}: UserAvatarProps) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-2 hover:bg-syntask-bg dark:hover:bg-bg-card rounded-full p-1 transition-colors outline-none focus:outline-none focus-visible:outline-none"
      aria-haspopup="true"
      aria-expanded={isDropdownOpen}
      aria-label="User account menu"
    >
      <div className="h-9 w-9 rounded-full border-2 border-border-primary dark:border-border-secondary flex items-center justify-center bg-syntask-bg dark:bg-bg-card">
        <span className="text-sm font-medium text-text-primary">
          {initials}
        </span>
      </div>
      <IconChevronDown
        size={16}
        className={`transition-transform text-text-body ${
          isDropdownOpen ? "rotate-180" : ""
        }`}
        aria-hidden="true"
      />
    </button>
  );
}
