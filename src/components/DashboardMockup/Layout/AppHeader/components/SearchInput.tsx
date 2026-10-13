"use client";

import React from "react";
import { IconSearch } from "@tabler/icons-react";
import { SearchInputProps } from "../types";

export function SearchInput({ value, onChange }: SearchInputProps) {
  return (
    <div className="relative">
      <input
        type="text"
        placeholder="Search deployments..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-72 h-10 pl-10 pr-4 py-2 rounded-md bg-syntask-bg dark:bg-bg-dark border border-border-primary dark:border-border-secondary 
          focus:border-accent dark:focus:border-accent focus:ring-1 focus:ring-accent dark:focus:ring-accent 
          transition-colors outline-hidden text-text-primary"
        aria-label="Search deployments"
      />
      <IconSearch
        className="absolute left-3 top-1/2 -translate-y-1/2 text-text-body"
        size={16}
      />
    </div>
  );
}
