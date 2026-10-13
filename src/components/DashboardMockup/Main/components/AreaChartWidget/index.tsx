"use client";

import React from "react";
import {
  ComposedChart,
  Area,
  Bar,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import { chartData } from "./config";
import { useAreaChart } from "./hooks";
import {
  ChartTooltip,
  ChartGradients,
  ScatterDotsWebGL,
  EndpointDot,
  GridLines,
  YAxisLabels,
  XAxisLabels,
  ChartSkeleton,
} from "./components";
import { WidgetLayout } from "../shared";

export function AreaChart() {
  const { showEndpoint, isMounted, chartRef, downloadAsPNG, handleMouseDown } =
    useAreaChart();

  // Don't render chart until mounted on client
  if (!isMounted) {
    return <ChartSkeleton />;
  }

  return (
    <WidgetLayout
      title="New Users"
      onDownload={downloadAsPNG}
      downloadTitle="Download chart as PNG"
      containerRef={chartRef}
      containerProps={{
        style: { outline: "none" },
        tabIndex: -1,
        onMouseDown: handleMouseDown,
      }}
    >
      {/* Chart Container */}
      <div className="relative h-[280px]">
        {/* Subtle Grid Lines */}
        <GridLines />

        {/* Y-axis Labels */}
        <YAxisLabels />

        {/* Main Chart */}
        <div
          className="ml-8 mr-4 h-[calc(100%-30px)]"
          style={{ outline: "none" }}
          tabIndex={-1}
          onMouseDown={handleMouseDown}
        >
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart
              data={chartData}
              margin={{ top: 10, right: 5, left: 0, bottom: 0 }}
              barCategoryGap="20%"
              style={{ outline: "none" }}
            >
              <ChartGradients />

              <XAxis
                dataKey="time"
                axisLine={false}
                tickLine={false}
                tick={false}
                height={0}
              />

              <YAxis domain={[8, 24]} hide={true} />

              <Tooltip
                content={<ChartTooltip />}
                cursor={{
                  stroke: "var(--color-brand-primary-light)",
                  strokeWidth: 1,
                  strokeDasharray: "5 5",
                  opacity: 0.7,
                }}
                wrapperStyle={{ outline: "none" }}
              />

              {/* Bar Chart */}
              <Bar
                dataKey="bars"
                fill="url(#barGradient)"
                radius={[1, 1, 0, 0]}
                opacity={0.7}
              />

              {/* Area Chart */}
              <Area
                type="monotone"
                dataKey="users"
                stroke="var(--color-brand-primary-light)"
                strokeWidth={2.5}
                fill="url(#areaGradient)"
                dot={false}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>

        {/* Enhanced Scatter Dots - WebGL powered for better performance */}
        <ScatterDotsWebGL pointCount={200} />

        {/* Endpoint Dot - Positioned on the chart line */}
        <EndpointDot visible={showEndpoint} />

        {/* X-axis Time Labels */}
        <XAxisLabels />
      </div>

      {/* Global CSS to prevent any focus outlines in this component */}
      <style>{`
        .recharts-wrapper,
        .recharts-surface,
        .recharts-wrapper *,
        .recharts-surface * {
          outline: none !important;
        }
      `}</style>
    </WidgetLayout>
  );
}

export default AreaChart;
