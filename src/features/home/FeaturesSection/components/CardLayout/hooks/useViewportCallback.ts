"use client";

import { useState, useCallback } from "react";

interface UseViewportCallbackReturn {
    hasCalledInView: boolean;
    handleViewportEnter: () => void;
}

export function useViewportCallback(
    onInView?: () => void
): UseViewportCallbackReturn {
    const [hasCalledInView, setHasCalledInView] = useState(false);

    const handleViewportEnter = useCallback(() => {
        if (!hasCalledInView) {
            setHasCalledInView(true);
            onInView?.();
        }
    }, [hasCalledInView, onInView]);

    return {
        hasCalledInView,
        handleViewportEnter,
    };
}
