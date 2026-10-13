"use client";

import React from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { KpiCard } from "./KpiCard";
import { SortableKpiItemProps } from "../types";

export function SortableKpiItem({
  kpi,
  isActive = false,
}: SortableKpiItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: kpi.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 10 : 1,
    opacity: isDragging ? 0.8 : 1,
    width: "calc(20% - 13px)",
    flexShrink: 0,
    position: "relative" as const,
    touchAction: "none",
  };

  const cardClassName = `
    dnd-kpi-item  
    ${isDragging || isActive ? "scale-105 shadow-lg" : ""}
  `.trim();

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      className={cardClassName}
      data-dragging={isDragging || undefined}
    >
      <div
        {...listeners}
        className="h-full cursor-grab active:cursor-grabbing transition-all duration-200"
      >
        <KpiCard {...kpi} />
      </div>
    </div>
  );
}
