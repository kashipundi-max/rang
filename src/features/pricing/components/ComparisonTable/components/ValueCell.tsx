"use client";

import React from "react";
import { IconCheck, IconX } from "@tabler/icons-react";

type FeatureValue = boolean | string;

interface ValueCellProps {
  value: FeatureValue;
  highlighted?: boolean;
}

export function ValueCell({ value, highlighted }: ValueCellProps) {
  const renderValue = () => {
    if (typeof value === "boolean") {
      return value ? (
        <div className="w-6 h-6 rounded-full bg-brand-primary/20 flex items-center justify-center mx-auto">
          <IconCheck className="w-4 h-4 text-brand-primary" />
        </div>
      ) : (
        <div className="w-6 h-6 rounded-full bg-text-secondary/10 flex items-center justify-center mx-auto">
          <IconX className="w-4 h-4 text-text-body/50" />
        </div>
      );
    }
    return (
      <span className="text-text-primary font-medium text-sm">{value}</span>
    );
  };

  return (
    <div
      className={`p-4 text-center border-s border-border-primary/10 ${
        highlighted ? "bg-brand-primary/5" : ""
      }`}
    >
      {renderValue()}
    </div>
  );
}
