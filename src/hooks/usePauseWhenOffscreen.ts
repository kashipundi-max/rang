"use client";

import { useEffect, useRef } from "react";

/**
 * Parks a subtree's *looping* animations while it is outside the viewport.
 *
 * The hero runs ~20 infinite animations. Even after they were reduced to pure
 * transform/opacity work, they kept compositing while the visitor was reading
 * the FAQ ten screens below - work that can never be seen. Parking them hands
 * the rest of the page a free compositor.
 *
 * Only animations with infinite iterations are touched. An earlier version did
 * this in CSS with a blanket `animation-play-state: paused`, which also froze
 * one-shot entrance animations: a `forwards` fade-in caught mid-flight would
 * stick at opacity 0 for as long as the section stayed off-screen. Filtering on
 * iteration count keeps entrances running to completion no matter where the
 * viewport is.
 *
 * `rootMargin` keeps the loops alive slightly past the edge so nothing visibly
 * snaps back to its start position at the moment the section scrolls away.
 */
export function usePauseWhenOffscreen<T extends HTMLElement>() {
    const ref = useRef<T>(null);

    useEffect(() => {
        const el = ref.current;
        if (!el || typeof IntersectionObserver === "undefined") return;
        if (typeof el.getAnimations !== "function") return;

        const setPaused = (paused: boolean) => {
            for (const animation of el.getAnimations({ subtree: true })) {
                if (animation.effect?.getComputedTiming().iterations !== Infinity) {
                    continue;
                }
                if (paused) {
                    if (animation.playState === "running") animation.pause();
                } else if (animation.playState === "paused") {
                    animation.play();
                }
            }
        };

        const observer = new IntersectionObserver(
            ([entry]) => setPaused(!entry.isIntersecting),
            { rootMargin: "200px 0px" }
        );

        observer.observe(el);

        return () => {
            observer.disconnect();
            // Leave nothing parked behind us if the component unmounts off-screen.
            setPaused(false);
        };
    }, []);

    return ref;
}
