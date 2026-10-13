import { useState, useRef, useEffect, RefObject } from "react";

interface HoverStyle {
    left: number;
    width: number;
    opacity: number;
}

interface UseNavHighlightReturn {
    hoveredIndex: number | null;
    setHoveredIndex: (index: number | null) => void;
    hoverStyle: HoverStyle;
    navRef: RefObject<HTMLElement | null>;
    linkRefs: RefObject<(HTMLAnchorElement | null)[]>;
}

export function useNavHighlight(): UseNavHighlightReturn {
    const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
    const [hoverStyle, setHoverStyle] = useState<HoverStyle>({
        left: 0,
        width: 0,
        opacity: 0,
    });
    const navRef = useRef<HTMLElement | null>(null);
    const linkRefs = useRef<(HTMLAnchorElement | null)[]>([]);

    useEffect(() => {
        if (
            hoveredIndex !== null &&
            linkRefs.current[hoveredIndex] &&
            navRef.current
        ) {
            const linkEl = linkRefs.current[hoveredIndex];
            const navEl = navRef.current;
            if (linkEl) {
                const linkRect = linkEl.getBoundingClientRect();
                const navRect = navEl.getBoundingClientRect();
                setHoverStyle({
                    left: linkRect.left - navRect.left,
                    width: linkRect.width,
                    opacity: 1,
                });
            }
        } else {
            setHoverStyle((prev) => ({ ...prev, opacity: 0 }));
        }
    }, [hoveredIndex]);

    return {
        hoveredIndex,
        setHoveredIndex,
        hoverStyle,
        navRef,
        linkRefs,
    };
}
