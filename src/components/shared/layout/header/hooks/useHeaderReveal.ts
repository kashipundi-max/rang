"use client";

import { useEffect, useRef, useState } from "react";

/** Past this the bar picks up its solid background on small screens. */
const SCROLLED_AT = 30;
/** Never hide while the reader is still near the top of the page. */
const HIDE_AFTER = 160;
/** Ignore sub-pixel wobble and trackpad jitter. */
const DELTA = 6;

interface HeaderReveal {
  isScrolled: boolean;
  isHidden: boolean;
}

/**
 * Scroll state for the header: solid once the page has moved, and tucked away
 * while scrolling down so long pages read full-height, returning the moment the
 * reader scrolls back up.
 *
 * Reads are batched into a single rAF so a fast scroll never triggers more than
 * one layout read per frame.
 */
export function useHeaderReveal(): HeaderReveal {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isHidden, setIsHidden] = useState(false);
  const lastY = useRef(0);

  useEffect(() => {
    lastY.current = window.scrollY;
    let frame = 0;

    const onScroll = () => {
      if (frame) return;
      frame = window.requestAnimationFrame(() => {
        frame = 0;
        const y = window.scrollY;
        setIsScrolled(y > SCROLLED_AT);

        const diff = y - lastY.current;
        if (Math.abs(diff) > DELTA) {
          setIsHidden(diff > 0 && y > HIDE_AFTER);
          lastY.current = y;
        }
      });
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", onScroll);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, []);

  return { isScrolled, isHidden };
}
