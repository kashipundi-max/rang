"use client";

import { useState } from "react";
import CardLayout from "../CardLayout";
import { Bar, SearchHeader } from "./components";
import { bars } from "./config";

interface Card5Props {
  className?: string;
  title?: string;
  description?: string;
  index?: number;
}

export default function Card5({
  className,
  title,
  description,
  index = 0,
}: Card5Props) {
  const [isHovered, setIsHovered] = useState(false);
  const [isInView, setIsInView] = useState(false);

  return (
    <CardLayout
      className={className}
      title={title}
      description={description}
      index={index}
      onHoverChange={setIsHovered}
      onInView={() => setIsInView(true)}
    >
      <div className="px-6 pt-5">
        <SearchHeader />
      </div>
      <div className="absolute bottom-[25%] left-1/2 -translate-x-1/2 flex items-end gap-[18px]">
        {bars.map((bar, barIndex) => (
          <Bar
            key={barIndex}
            height={bar.height}
            isHighlighted={bar.isHighlighted}
            index={barIndex}
            isInView={isInView}
            isCardHovered={isHovered}
          />
        ))}
      </div>
    </CardLayout>
  );
}
