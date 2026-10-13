"use client";

import React from "react";
import { TableRow } from "../types";
import { statusStyles } from "../config";

interface TableRowItemProps {
  row: TableRow;
  index: number;
}

export function TableRowItem({ row, index }: TableRowItemProps) {
  return (
    <tr
      className={`
        border-b border-brand-border/30 last:border-0 
        hover:bg-brand-surface/20 transition-colors duration-200
        ${index % 2 === 0 ? "bg-brand-surface/10" : "bg-transparent"}
      `}
    >
      <td className="py-4 px-4 text-white text-sm font-medium">{row.id}</td>
      <td className="py-4 px-4 text-white text-sm">{row.customer}</td>
      <td className="py-4 px-4 text-text-body text-sm">{row.date}</td>
      <td className="py-4 px-4 text-white text-sm font-semibold">
        {row.amount}
      </td>
      <td className="py-4 px-4">
        <span
          className={`
            inline-flex items-center px-3 py-1 rounded-full text-xs font-medium
            ${statusStyles[row.status]}
          `}
        >
          {row.status}
        </span>
      </td>
    </tr>
  );
}
