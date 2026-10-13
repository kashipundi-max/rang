import { CSSProperties } from "react";

interface ContainerStylesParams {
    scale: number;
    isMounted: boolean;
    isLowEnd: boolean;
    isLargeScreen: boolean;
}

export function getContainerStyle({
    scale,
    isMounted,
    isLowEnd,
    isLargeScreen,
}: ContainerStylesParams): CSSProperties {
    // Use large screen styles as default to prevent flash on initial load
    const useCenteredLayout = !isMounted || isLargeScreen;

    return {
        inset: 0,
        transformOrigin: useCenteredLayout ? "top center" : "top left",
        backfaceVisibility: "hidden",
        perspective: isLowEnd ? "none" : "1000px",
        border: "0.5px solid var(--color-brand-border)",
        borderRadius: "20px",
        position: "relative",
        background: "transparent",
        transform: `scale(${scale}) translateZ(0)`,
        marginBottom: scale < 1 ? `${(1 - scale) * -1000}px` : "0px",
        marginLeft: useCenteredLayout ? "auto" : 16,
        marginRight: useCenteredLayout ? "auto" : 0,
        left: 0,
        // Hide until mounted to prevent any flash
        opacity: isMounted ? 1 : 0,
    };
}

export function getGlassStyle(isLowEnd: boolean): CSSProperties {
    return isLowEnd
        ? {
            top: "-10px",
            left: "-10px",
            zIndex: 5,
            borderRadius: 25,
            background: "rgba(255,255,255,0.08)",
            boxShadow: "0 2px 16px 0 var(--color-brand-glow)",
            border: "1px solid rgba(255,255,255,0.1)",
            overflow: "hidden",
        }
        : {
            top: "-10px",
            left: "-10px",
            zIndex: 5,
            borderRadius: 25,
            background: "rgba(255,255,255,0.15)",
            boxShadow: "0 4px 32px 0 var(--color-brand-glow)",
            border: "1px solid rgba(255,255,255,0.18)",
            backdropFilter: "blur(16px) saturate(180%)",
            WebkitBackdropFilter: "blur(16px) saturate(180%)",
            overflow: "hidden",
        };
}
