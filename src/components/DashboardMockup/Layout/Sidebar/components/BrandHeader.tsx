"use client";

import React from "react";
import { Logo } from "@/components/Logo";

export function BrandHeader() {
  return (
    <div className="h-16 flex items-start rounded-tl-[20px] px-6 py-5 bg-neutral-950">
      <Logo size="sm" />
    </div>
  );
}
