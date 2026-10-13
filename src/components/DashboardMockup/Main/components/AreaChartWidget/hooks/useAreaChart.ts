"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import domtoimage from "dom-to-image";

export function useAreaChart() {
    const [showEndpoint, setShowEndpoint] = useState(false);
    const [isMounted, setIsMounted] = useState(false);
    const chartRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        // Ensure component only renders on client side
        setIsMounted(true);

        // Delay showing the endpoint dot until after chart animation
        const timer = setTimeout(() => {
            setShowEndpoint(true);
        }, 1500); // 1.5 seconds delay

        // Suppress Recharts SSR warnings
        const originalError = console.error;
        console.error = (...args: unknown[]) => {
            if (
                typeof args[0] === "string" &&
                (args[0].includes("width(-1) and height(-1) of chart") ||
                    args[0].includes("minWidth") ||
                    args[0].includes("minHeight"))
            ) {
                return;
            }
            originalError.apply(console, args);
        };

        return () => {
            clearTimeout(timer);
            console.error = originalError;
        };
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
            link.download = "new-users-chart.png";
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
        showEndpoint,
        isMounted,
        chartRef,
        downloadAsPNG,
        handleMouseDown,
    };
}
