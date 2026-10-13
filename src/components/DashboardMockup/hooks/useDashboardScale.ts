import { useEffect, useLayoutEffect, useState, useRef } from "react";
import {
    DASHBOARD_FIXED_WIDTH,
    DASHBOARD_MIN_SCALE,
    DASHBOARD_SCALE_PADDING,
} from "../config";

export function useDashboardScale() {
    const [scale, setScale] = useState(1);
    const [isMounted, setIsMounted] = useState(false);
    const [isLargeScreen, setIsLargeScreen] = useState(true); // Default to true to prevent flash

    useEffect(() => {
        setIsMounted(true);
    }, []);

    useLayoutEffect(() => {
        if (!isMounted) return;

        const calculateScale = () => {
            const isLarge = window.innerWidth >= 1440;
            setIsLargeScreen(isLarge);

            if (isLarge) {
                setScale(1);
                return;
            }

            const screenWidth = window.innerWidth - DASHBOARD_SCALE_PADDING;
            let calculatedScale = Math.min(screenWidth / DASHBOARD_FIXED_WIDTH, 1);

            if (window.innerWidth <= 640) {
                calculatedScale = calculatedScale * 0.75;
            }

            const minRequiredScale = (window.innerWidth - 32) / DASHBOARD_FIXED_WIDTH;
            setScale(
                Math.max(calculatedScale, Math.max(minRequiredScale, DASHBOARD_MIN_SCALE))
            );
        };

        calculateScale();
        window.addEventListener("resize", calculateScale);
        return () => window.removeEventListener("resize", calculateScale);
    }, [isMounted]);

    return { scale, isMounted, isLargeScreen };
}
