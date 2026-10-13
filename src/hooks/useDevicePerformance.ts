import { useLayoutEffect, useState } from 'react';

interface PerformanceMetrics {
    isLowEnd: boolean;
    isMobile: boolean;
    hasReducedMotion: boolean;
    deviceMemory: number;
    hardwareConcurrency: number;
}

export function useDevicePerformance(): PerformanceMetrics {
    const [metrics, setMetrics] = useState<PerformanceMetrics>({
        isLowEnd: false,
        isMobile: false,
        hasReducedMotion: false,
        deviceMemory: 8,
        hardwareConcurrency: 4,
    });

    // useLayoutEffect (not useEffect) so the corrected isLowEnd value lands
    // before the browser paints the initial optimistic render — this stops a
    // one-frame flash of WebGL/heavy effects on the low-end devices that
    // can least afford them.
    useLayoutEffect(() => {
        const checkPerformance = () => {
            // Check if mobile device
            const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
                navigator.userAgent
            ) || window.innerWidth < 768;

            // Check for reduced motion preference
            const hasReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

            // Check device memory (if available)
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const deviceMemory = (navigator as any).deviceMemory || 8;

            // Check hardware concurrency (CPU cores)
            const hardwareConcurrency = navigator.hardwareConcurrency || 4;

            // Determine if low-end device
            const isLowEnd = isMobile || deviceMemory < 4 || hardwareConcurrency < 4 || hasReducedMotion;

            setMetrics({
                isLowEnd,
                isMobile,
                hasReducedMotion,
                deviceMemory,
                hardwareConcurrency,
            });
        };

        checkPerformance();

        // Re-check on resize
        window.addEventListener('resize', checkPerformance);
        return () => window.removeEventListener('resize', checkPerformance);
    }, []);

    return metrics;
}
