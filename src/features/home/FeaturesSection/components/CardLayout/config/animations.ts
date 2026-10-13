// Spring configuration constants
export const SPRING_CONFIG = { stiffness: 150, damping: 15, mass: 0.1 } as const;
export const SPRING_CONFIG_SLOW = { stiffness: 50, damping: 20, mass: 0.5 } as const;

// Entrance timings.
//
// These used to cascade: a 0.12s per-card stagger on top of per-element delays
// of up to 0.6s, so the last card's description stayed invisible for ~1.1s
// after it scrolled into view — the card read as "not loaded". Text now leads
// the entrance instead of trailing it, and the blur() filters are gone: they
// forced a compositing pass on every animating card for an effect that is
// barely visible at these durations.
const STAGGER_STEP = 0.05;
const EASE_OUT = [0.22, 1, 0.36, 1] as const;

// Animation variants
export const cardVariants = {
    hidden: {
        opacity: 0.5,
    },
    visible: (staggerDelay: number) => ({
        opacity: 1,
        transition: {
            duration: 0.35,
            ease: EASE_OUT,
            delay: staggerDelay,
            staggerChildren: 0.04,
            delayChildren: staggerDelay,
        },
    }),
};

export const contentVariants = {
    hidden: { opacity: 0 },
    visible: (staggerDelay: number) => ({
        opacity: 1,
        transition: { delay: staggerDelay + 0.05, duration: 0.25 },
    }),
};

export const textContainerVariants = {
    hidden: { opacity: 0, y: 12 },
    visible: (staggerDelay: number) => ({
        opacity: 1,
        y: 0,
        transition: {
            duration: 0.3,
            ease: EASE_OUT,
            delay: staggerDelay,
        },
    }),
};

export const titleVariants = {
    hidden: { opacity: 0, y: 8 },
    visible: (staggerDelay: number) => ({
        opacity: 1,
        y: 0,
        transition: {
            duration: 0.3,
            ease: EASE_OUT,
            delay: staggerDelay + 0.04,
        },
    }),
};

export const descriptionVariants = {
    hidden: { opacity: 0, y: 8 },
    visible: (staggerDelay: number) => ({
        opacity: 1,
        y: 0,
        transition: {
            duration: 0.3,
            ease: EASE_OUT,
            delay: staggerDelay + 0.08,
        },
    }),
};

export const gridVariants = {
    hidden: { opacity: 0, scale: 1.1 },
    visible: (staggerDelay: number) => ({
        opacity: 0.08,
        scale: 1,
        transition: { duration: 0.5, delay: staggerDelay + 0.1 },
    }),
};

export const fadeVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.3 } },
};

export { STAGGER_STEP };
