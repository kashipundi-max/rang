"use client";

import React from "react";

export function YAxisLabels() {
  return (
    <div
      className="absolute left-1 top-0 flex flex-col justify-between text-text-muted text-xs font-medium"
      style={{ bottom: "30px" }}
    >
      <span>24</span>
      <span>20</span>
      <span>16</span>
      <span>12</span>
      <span>8</span>
    </div>
  );
}
