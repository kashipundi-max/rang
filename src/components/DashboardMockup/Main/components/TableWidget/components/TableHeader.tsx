"use client";

import React from "react";

export function TableHeader() {
  return (
    <thead>
      <tr className="bg-brand-surface/30 border-b border-brand-border/50">
        <th className="py-3 px-4 text-left text-text-muted text-sm font-medium">
          ID
        </th>
        <th className="py-3 px-4 text-left text-text-muted text-sm font-medium">
          Customer
        </th>
        <th className="py-3 px-4 text-left text-text-muted text-sm font-medium">
          Date
        </th>
        <th className="py-3 px-4 text-left text-text-muted text-sm font-medium">
          Amount
        </th>
        <th className="py-3 px-4 text-left text-text-muted text-sm font-medium">
          Status
        </th>
      </tr>
    </thead>
  );
}
