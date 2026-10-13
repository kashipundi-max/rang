"use client";

import React from "react";
import {
  IconArrowRight,
  IconTrendingUp,
  IconTrendingDown,
  IconGripHorizontal,
} from "@tabler/icons-react";
import { TrendDirection, Kpi } from "../types";

type KpiCardProps = Kpi;

function getTrendIcon(direction: TrendDirection) {
  switch (direction) {
    case "up":
      return <IconTrendingUp size={14} className="mr-1" />;
    case "down":
      return <IconTrendingDown size={14} className="mr-1" />;
    case "stable":
      return <IconArrowRight size={14} className="mr-1" />;
    default:
      return null;
  }
}

function getTrendColor(direction: TrendDirection) {
  switch (direction) {
    case "up":
      return "text-accent";
    case "down":
      return "text-red-500 dark:text-red-400";
    case "stable":
      return "text-accent";
    default:
      return "text-text-body";
  }
}

export function KpiCard(props: KpiCardProps) {
  const { id, title, value, trend, color } = props;
  const valueColor = color || "text-text-primary";

  return (
    <div
      className="bg-brand-surface/20 p-4 rounded-lg border border-brand-border/50 shadow-xs hover:shadow-md transition-all h-full"
      data-kpi-id={id}
      tabIndex={0}
      role="article"
      aria-label={`${title}: ${value}${
        trend ? `, trend ${trend.direction} ${trend.value}` : ""
      }`}
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center">
          <div className="text-xs font-medium text-text-body">{title}</div>
        </div>
        <div
          className="opacity-40 hover:opacity-100 transition-opacity cursor-grab hidden md:block"
          aria-hidden="true"
          title="Drag handle"
        >
          <IconGripHorizontal size={16} className="text-text-muted" />
        </div>
      </div>

      <div className="flex items-baseline justify-between">
        <div className={`text-xl font-bold ${valueColor || "text-white"}`}>
          {value}
        </div>
        {trend && (
          <div
            className={`flex items-center text-xs font-medium ${getTrendColor(
              trend.direction
            )}`}
            aria-label={`Trend: ${trend.direction} ${trend.value}`}
          >
            {getTrendIcon(trend.direction)}
            <span>{trend.value}</span>
          </div>
        )}
      </div>
    </div>
  );
}
