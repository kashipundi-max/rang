"use client";

import React from "react";

interface SectionTitleProps {
  title: string;
}

export function SectionTitle({ title }: SectionTitleProps) {
  return (
    <div className="py-3 px-5 text-[11px] font-medium uppercase tracking-wider bg-neutral-950 text-text-body">
      {title}
    </div>
  );
}
