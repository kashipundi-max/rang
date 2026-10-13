"use client";

import { useEffect, useState, useCallback } from "react";

interface UseHeroLoadingReturn {
    isLoaded: boolean;
    isFirstVisit: boolean;
    loadedImages: Record<string, boolean>;
    allSvgsLoaded: boolean;
    handleImageLoad: (imageKey: string) => void;
}

export function useHeroLoading(): UseHeroLoadingReturn {
    const [isLoaded, setIsLoaded] = useState(false);
    const [isFirstVisit, setIsFirstVisit] = useState(true);
    const [loadedImages, setLoadedImages] = useState<Record<string, boolean>>({
        svg1: false,
        svg2: false,
        svg3: false,
        svg4: false,
    });

    const allSvgsLoaded = Object.values(loadedImages).every((loaded) => loaded);

    const handleImageLoad = useCallback((imageKey: string) => {
        setLoadedImages((prev) => ({
            ...prev,
            [imageKey]: true,
        }));
    }, []);

    useEffect(() => {
        const hasVisited = localStorage.getItem("hero-visited");

        if (hasVisited) {
            setIsFirstVisit(false);
            setIsLoaded(true);
        } else {
            setIsFirstVisit(true);
            localStorage.setItem("hero-visited", "true");

            if (allSvgsLoaded) {
                const timer = setTimeout(() => {
                    setIsLoaded(true);
                }, 100);
                return () => clearTimeout(timer);
            }

            const fallbackTimer = setTimeout(() => {
                setIsLoaded(true);
            }, 2000);

            return () => clearTimeout(fallbackTimer);
        }
    }, [allSvgsLoaded]);

    return {
        isLoaded,
        isFirstVisit,
        loadedImages,
        allSvgsLoaded,
        handleImageLoad,
    };
}
