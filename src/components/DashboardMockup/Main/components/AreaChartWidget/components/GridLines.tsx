"use client";

import React from "react";
import { yAxisValues } from "../config";

export function GridLines() {
  return (
    <div
      className="absolute inset-x-0 top-0 pointer-events-none opacity-20"
      style={{ bottom: "30px" }}
    >
      {yAxisValues.map((value, index) => (
        <div
          key={value}
          className="absolute w-full border-t border-brand-primary/60"
          style={{ top: `${(index / (yAxisValues.length - 1)) * 100}%` }}
        />
      ))}
    </div>
  );
}
