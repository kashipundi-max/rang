"use client";

import React from "react";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import { donutData } from "./config";
import { useDonutChart } from "./hooks";
import {
  ChartLegend,
  TotalUsers,
  CenterContent,
  ChartSkeleton,
} from "./components";
import { WidgetLayout } from "../shared";

export function DonutChartWidget() {
  const {
    activeIndex,
    isMounted,
    chartRef,
    onPieEnter,
    onPieLeave,
    downloadAsPNG,
    handleMouseDown,
  } = useDonutChart();

  if (!isMounted) {
    return <ChartSkeleton />;
  }

  return (
    <WidgetLayout
      title="Traffic Source"
      onDownload={downloadAsPNG}
      downloadTitle="Download chart as PNG"
      containerRef={chartRef}
      className="overflow-visible"
    >
      {/* Main Content Container */}
      <div className="flex items-start justify-start h-full -mt-5">
        {/* Chart Section */}
        <div className="relative shrink-0 -ml-3">
          <div className="relative" onMouseDown={handleMouseDown}>
            <ResponsiveContainer width={200} height={200} minHeight={200}>
              <PieChart>
                <Pie
                  data={donutData}
                  cx="45%"
                  cy="50%"
                  outerRadius={80}
                  innerRadius={60}
                  fill="#8884d8"
                  dataKey="value"
                  animationDuration={800}
                  startAngle={90}
                  endAngle={450}
                  stroke="none"
                  cornerRadius={50}
                  paddingAngle={-10}
                  onMouseEnter={onPieEnter}
                  onMouseLeave={onPieLeave}
                >
                  {donutData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={entry.color}
                      opacity={index === activeIndex ? 0.9 : 1}
                    />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Center Content */}
          <CenterContent data={donutData} activeIndex={activeIndex} />
        </div>

        {/* Legend Section */}
        <ChartLegend data={donutData} />
      </div>

      {/* Bottom Section */}
      <TotalUsers data={donutData} total={7700} />
    </WidgetLayout>
  );
}

export default DonutChartWidget;
