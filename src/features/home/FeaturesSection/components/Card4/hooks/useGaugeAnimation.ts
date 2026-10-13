"use client";

import { useEffect, useRef, useCallback } from "react";
import { useMotionValue, animate, MotionValue } from "framer-motion";
import { GAUGE_CONFIG, ANIMATION_CONFIG } from "../config";

interface UseGaugeAnimationReturn {
    needleRef: React.RefObject<SVGGElement | null>;
    rotationAngle: MotionValue<number>;
    triggerAnimation: (isInitial: boolean) => void;
}

export function useGaugeAnimation(
    isInView: boolean,
    isHovered: boolean
): UseGaugeAnimationReturn {
    const hasAnimatedOnMount = useRef(false);
    const rotationAngle = useMotionValue(0);
    const needleRef = useRef<SVGGElement>(null);

    const { cx, cy } = GAUGE_CONFIG;

    // Update SVG transform when rotation angle changes
    useEffect(() => {
        const unsubscribe = rotationAngle.on("change", (angle) => {
            if (needleRef.current) {
                needleRef.current.setAttribute(
                    "transform",
                    `rotate(${angle}, ${cx}, ${cy})`
                );
            }
        });
        return () => unsubscribe();
    }, [rotationAngle, cx, cy]);

    const runAnimation = useCallback(
        async (fromStart = false) => {
            if (fromStart) {
                await animate(
                    rotationAngle,
                    [ANIMATION_CONFIG.initial.from, ANIMATION_CONFIG.initial.to],
                    {
                        duration: ANIMATION_CONFIG.initial.duration,
                        ease: "easeInOut",
                    }
                );
            } else {
                const currentAngle = rotationAngle.get();
                await animate(
                    rotationAngle,
                    [currentAngle, ...ANIMATION_CONFIG.hover.sequence],
                    {
                        duration: ANIMATION_CONFIG.hover.duration,
                        ease: "easeInOut",
                    }
                );
            }
        },
        [rotationAngle]
    );

    // Trigger animation on scroll into view (once)
    useEffect(() => {
        if (isInView && !hasAnimatedOnMount.current) {
            hasAnimatedOnMount.current = true;
            runAnimation(true);
        }
    }, [isInView, runAnimation]);

    // Trigger animation on hover
    useEffect(() => {
        if (isHovered && hasAnimatedOnMount.current) {
            runAnimation(false);
        }
    }, [isHovered, runAnimation]);

    return {
        needleRef,
        rotationAngle,
        triggerAnimation: runAnimation,
    };
}
