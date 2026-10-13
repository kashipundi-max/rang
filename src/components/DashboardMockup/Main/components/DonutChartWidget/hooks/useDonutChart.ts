"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import domtoimage from "dom-to-image";

export function useDonutChart() {
    const [activeIndex, setActiveIndex] = useState<number | null>(null);
    const [isMounted, setIsMounted] = useState(false);
    const chartRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    const onPieEnter = useCallback((_: unknown, index: number) => {
        setActiveIndex(index);
    }, []);

    const onPieLeave = useCallback(() => {
        setActiveIndex(null);
    }, []);

    const downloadAsPNG = useCallback(async () => {
        if (!chartRef.current) return;

        try {
            const dataUrl = await domtoimage.toPng(chartRef.current, {
                quality: 1,
                bgcolor: "#0f172a",
                width: chartRef.current.offsetWidth * 2,
                height: chartRef.current.offsetHeight * 2,
                style: {
                    transform: "scale(2)",
                    transformOrigin: "top left",
                    width: chartRef.current.offsetWidth + "px",
                    height: chartRef.current.offsetHeight + "px",
                },
            });

            const link = document.createElement("a");
            link.download = "traffic-source-chart.png";
            link.href = dataUrl;
            link.click();
        } catch (error) {
            console.error("Error generating image:", error);
        }
    }, []);

    const handleMouseDown = useCallback(
        (e: React.MouseEvent<HTMLDivElement>) => {
            e.preventDefault();
            if (e.target instanceof HTMLElement) {
                e.target.blur();
            }
        },
        []
    );

    return {
        activeIndex,
        isMounted,
        chartRef,
        onPieEnter,
        onPieLeave,
        downloadAsPNG,
        handleMouseDown,
    };
}
