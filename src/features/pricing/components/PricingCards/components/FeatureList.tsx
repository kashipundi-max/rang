"use client";

import React from "react";
import { IconCheck, IconX } from "@tabler/icons-react";

interface FeatureListProps {
  features: string[];
  notIncluded: string[];
  getFeatureLabel: (key: string) => string;
  getNotIncludedLabel: (key: string) => string;
}

export function FeatureList({
  features,
  notIncluded,
  getFeatureLabel,
  getNotIncludedLabel,
}: FeatureListProps) {
  return (
    <div className="flex-1 space-y-3 mb-8">
      {features.map((featureKey) => (
        <div key={featureKey} className="flex items-start gap-3">
          <div className="w-5 h-5 rounded-full bg-brand-primary/20 flex items-center justify-center shrink-0 mt-0.5">
            <IconCheck className="w-3 h-3 text-brand-primary" />
          </div>
          <span className="text-text-primary text-sm">
            {getFeatureLabel(featureKey)}
          </span>
        </div>
      ))}
      {notIncluded.map((featureKey) => (
        <div key={featureKey} className="flex items-start gap-3 opacity-50">
          <div className="w-5 h-5 rounded-full bg-text-secondary/10 flex items-center justify-center shrink-0 mt-0.5">
            <IconX className="w-3 h-3 text-text-body" />
          </div>
          <span className="text-text-body text-sm line-through">
            {getNotIncludedLabel(featureKey)}
          </span>
        </div>
      ))}
    </div>
  );
}
