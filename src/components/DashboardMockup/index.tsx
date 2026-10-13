"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { Route } from "./Layout/Sidebar";
import { useDevicePerformance } from "@/hooks/useDevicePerformance";
import { useDashboardScale } from "./hooks";
import { getContainerStyle, getGlassStyle } from "./utils";

const Sidebar = dynamic(() => import("./Layout/Sidebar"), { ssr: true });
const AppHeader = dynamic(() => import("./Layout/AppHeader"), { ssr: true });
const Main = dynamic(() => import("./Main"), { ssr: false });

export default function DashboardMockup() {
  const [currentRoute, setCurrentRoute] = useState<Route>("Overview");
  const { isLowEnd } = useDevicePerformance();
  const { scale, isMounted, isLargeScreen } = useDashboardScale();

  const containerStyle = getContainerStyle({
    scale,
    isMounted,
    isLowEnd,
    isLargeScreen,
  });
  const glassStyle = getGlassStyle(isLowEnd);

  return (
    <div dir="ltr">
      <div
        className="relative flex flex-col w-[1296px] h-[950px] sm:h-[950px] rounded-lg z-10"
        style={containerStyle}
      >
        <div
          aria-hidden
          className="pointer-events-none absolute w-[calc(100%+20px)] h-[calc(100%+20px)]"
          style={glassStyle}
        />

        <div className="main-layout flex h-full relative z-20 rounded-[20px]">
          <Sidebar currentRoute={currentRoute} onNavigate={setCurrentRoute} />

          <div className="flex-1 h-full flex flex-col bg-bg-dark rounded-tr-[20px] rounded-br-[20px]">
            <AppHeader currentRoute={currentRoute} />

            <Main />
          </div>
        </div>
      </div>
    </div>
  );
}
