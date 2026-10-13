"use client";

import React, { useState } from "react";
import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragStartEvent,
  rectIntersection,
  MouseSensor,
} from "@dnd-kit/core";
import {
  restrictToHorizontalAxis,
  restrictToParentElement,
} from "@dnd-kit/modifiers";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  horizontalListSortingStrategy,
} from "@dnd-kit/sortable";
import { KpiSectionProps } from "./types";
import { useIsMobile } from "./hooks";
import { KpiCard, SortableKpiItem } from "./components";

export function KpiWidget({ kpis, onKpisChange }: KpiSectionProps) {
  const [activeId, setActiveId] = useState<string | null>(null);
  const isMobile = useIsMobile();

  const sensors = useSensors(
    useSensor(MouseSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
        tolerance: 5,
        delay: 100,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  function handleDragStart(event: DragStartEvent) {
    setActiveId(event.active.id as string);
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    setActiveId(null);

    if (!over) return;
    if (active.id === over.id) return;

    const oldIndex = kpis.findIndex((kpi) => kpi.id === active.id);
    const newIndex = kpis.findIndex((kpi) => kpi.id === over.id);

    const newKpis = arrayMove(kpis, oldIndex, newIndex);
    onKpisChange(newKpis);
  }

  function handleDragCancel() {
    setActiveId(null);
  }

  // Render static version for mobile
  if (isMobile) {
    return (
      <div
        className="mb-6 relative overflow-hidden"
        role="region"
        aria-label="Key Performance Indicators"
      >
        <div className="flex flex-nowrap gap-4 pb-2 select-none overflow-hidden">
          {kpis.map((kpi) => (
            <div
              key={kpi.id}
              className="dnd-kpi-item"
              style={{
                width: "calc(20% - 13px)",
                flexShrink: 0,
              }}
            >
              <KpiCard {...kpi} />
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Render draggable version for desktop
  return (
    <DndContext
      sensors={sensors}
      collisionDetection={rectIntersection}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragCancel={handleDragCancel}
      modifiers={[restrictToHorizontalAxis, restrictToParentElement]}
      autoScroll={false}
    >
      <div
        className="mb-6 relative overflow-hidden"
        role="region"
        aria-label="Key Performance Indicators"
      >
        <SortableContext
          items={kpis.map((kpi) => kpi.id)}
          strategy={horizontalListSortingStrategy}
        >
          <div className="flex flex-nowrap gap-4 pb-2 select-none overflow-hidden">
            {kpis.map((kpi) => (
              <SortableKpiItem
                key={kpi.id}
                kpi={kpi}
                isActive={activeId === kpi.id}
              />
            ))}
          </div>
        </SortableContext>
      </div>
    </DndContext>
  );
}

export { KpiSectionSkeleton } from "./components";
export type { Kpi, KpiSectionProps } from "./types";
export { initialKpis } from "./config";

export default KpiWidget;
