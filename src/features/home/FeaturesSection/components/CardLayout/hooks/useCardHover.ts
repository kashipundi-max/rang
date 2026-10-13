"use client";

import { useRef, useState, useCallback } from "react";
import { useMotionValue, useSpring, useTransform, MotionValue } from "framer-motion";
import { SPRING_CONFIG } from "../config";

interface UseCardHoverReturn {
    cardRef: React.RefObject<HTMLDivElement | null>;
    isHovered: boolean;
    spotlightX: MotionValue<number>;
    spotlightY: MotionValue<number>;
    glareX: MotionValue<number>;
    glareY: MotionValue<number>;
    handleMouseMove: (e: React.MouseEvent<HTMLDivElement>) => void;
    handleMouseEnter: () => void;
    handleMouseLeave: () => void;
}

export function useCardHover(
    onHoverChange?: (isHovered: boolean) => void
): UseCardHoverReturn {
    const cardRef = useRef<HTMLDivElement>(null);
    const [isHovered, setIsHovered] = useState(false);

    // Mouse position for cursor effects
    const mouseX = useMotionValue(0);
    const mouseY = useMotionValue(0);

    // Smooth spring animation
    const springX = useSpring(mouseX, SPRING_CONFIG);
    const springY = useSpring(mouseY, SPRING_CONFIG);

    // Spotlight/gradient follows cursor
    const spotlightX = useTransform(springX, [-0.5, 0.5], [0, 100]);
    const spotlightY = useTransform(springY, [-0.5, 0.5], [0, 100]);

    // Glare effect position
    const glareX = useTransform(springX, [-0.5, 0.5], [-50, 150]);
    const glareY = useTransform(springY, [-0.5, 0.5], [-50, 150]);

    const handleMouseMove = useCallback(
        (e: React.MouseEvent<HTMLDivElement>) => {
            if (!cardRef.current) return;
            const rect = cardRef.current.getBoundingClientRect();
            const x = (e.clientX - rect.left) / rect.width - 0.5;
            const y = (e.clientY - rect.top) / rect.height - 0.5;
            mouseX.set(x);
            mouseY.set(y);
        },
        [mouseX, mouseY]
    );

    const handleMouseLeave = useCallback(() => {
        mouseX.set(0);
        mouseY.set(0);
        setIsHovered(false);
        onHoverChange?.(false);
    }, [mouseX, mouseY, onHoverChange]);

    const handleMouseEnter = useCallback(() => {
        setIsHovered(true);
        onHoverChange?.(true);
    }, [onHoverChange]);

    return {
        cardRef,
        isHovered,
        spotlightX,
        spotlightY,
        glareX,
        glareY,
        handleMouseMove,
        handleMouseEnter,
        handleMouseLeave,
    };
}
