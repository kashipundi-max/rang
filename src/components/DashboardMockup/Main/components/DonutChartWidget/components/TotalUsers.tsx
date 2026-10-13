"use client";

import React from "react";
import { DonutDataItem } from "../types";

interface TotalUsersProps {
  data: DonutDataItem[];
  total: number;
}

export function TotalUsers({ data, total }: TotalUsersProps) {
  return (
    <div className="absolute bottom-6 left-6 right-6">
      <div className="flex items-center justify-between">
        <span className="text-text-body text-sm">Total users</span>
        <div className="flex items-center gap-6 relative">
          <div className="">
            {data.map((item, index) => (
              <div
                key={index}
                className="w-4 h-4 rounded-full absolute top-1.5"
                style={{
                  backgroundColor: item.color,
                  left: `${index * 8}px`,
                }}
              />
            ))}
          </div>
          <span className="text-white text-lg font-bold ml-6">{total}</span>
        </div>
      </div>
    </div>
  );
}
