"use client";

import { useState } from "react";
import CardLayout from "../CardLayout";
import {
  GaugeGradients,
  GaugeArcs,
  GaugeTicks,
  GaugeNeedle,
  GaugePivot,
} from "./components";
import { useGaugeAnimation } from "./hooks";

interface Card4Props {
  className?: string;
  title?: string;
  description?: string;
  index?: number;
}

export default function Card4({
  className,
  title,
  description,
  index = 0,
}: Card4Props) {
  const [isHovered, setIsHovered] = useState(false);
  const [isInView, setIsInView] = useState(false);

  const { needleRef } = useGaugeAnimation(isInView, isHovered);

  return (
    <CardLayout
      className={className}
      title={title}
      description={description}
      index={index}
      onHoverChange={setIsHovered}
      onInView={() => setIsInView(true)}
    >
      <div className="relative w-full h-full flex items-start justify-center pt-8">
        <svg viewBox="0 0 300 180" className="w-[85%] h-auto" fill="none">
          <GaugeGradients />
          <GaugeArcs />
          <GaugeTicks />
          <GaugeNeedle ref={needleRef} />
          <GaugePivot />
        </svg>
      </div>
    </CardLayout>
  );
}
