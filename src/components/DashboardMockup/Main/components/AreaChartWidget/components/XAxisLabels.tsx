"use client";

import React from "react";
import { timeLabels } from "../config";

export function XAxisLabels() {
  return (
    <div className="absolute bottom-0 left-8 right-4 flex justify-between text-text-muted text-xs font-medium h-[30px] items-center">
      {timeLabels.map((label) => (
        <span key={label}>{label}</span>
      ))}
    </div>
  );
}
