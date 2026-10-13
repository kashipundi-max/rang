import { Variants } from "framer-motion";

// Floating animation for cards
export const createFloatingAnimation = (isLowEnd: boolean): Variants => ({
    initial: { y: 0 },
    animate: {
        y: isLowEnd ? 0 : [-8, 8, -8],
        transition: {
            duration: isLowEnd ? 0 : 4,
            repeat: isLowEnd ? 0 : Infinity,
            repeatType: "loop" as const,
            ease: "easeInOut",
        },
    },
});

// Initial mount animation for floating cards
export const createCardMountAnimation = (isLowEnd: boolean): Variants => ({
    hidden: {
        opacity: 0,
        scale: isLowEnd ? 1 : 0.8,
        y: isLowEnd ? 0 : 30,
        rotate: 0,
    },
    visible: (i: number) => ({
        opacity: 1,
        scale: 1,
        y: 0,
        rotate: isLowEnd ? 0 : i % 2 === 0 ? -8 : 8,
        transition: {
            duration: isLowEnd ? 0.3 : 0.8,
            delay: isLowEnd ? 0.1 + i * 0.05 : 0.6 + i * 0.15,
            ease: isLowEnd ? "easeOut" : [0.25, 0.1, 0.25, 1],
            type: isLowEnd ? "tween" : ("spring" as const),
            damping: 15,
            stiffness: 100,
        },
    }),
});

// Fade in up animation
export const createFadeInUpAnimation = (isLowEnd: boolean): Variants => ({
    hidden: { opacity: 0, y: 20 },
    visible: {
        opacity: 1,
        y: 0,
        transition: {
            duration: isLowEnd ? 0.4 : 0.8,
            ease: isLowEnd ? "easeOut" : [0.25, 0.1, 0.25, 1],
        },
    },
});

// Container stagger animation
export const createContainerAnimation = (isLowEnd: boolean): Variants => ({
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: isLowEnd ? 0.08 : 0.15,
            delayChildren: isLowEnd ? 0.2 : 0.4,
        },
    },
});

// Sphere rotation animation
export const createSphereAnimation = (isLowEnd: boolean): Variants => ({
    initial: { rotate: 10 },
    animate: {
        rotate: isLowEnd ? 0 : 40,
        transition: {
            duration: isLowEnd ? 0 : 1,
            ease: [0.5, 0, 0.25, 1],
            delay: 0.2,
        },
    },
});

// Pulse animation for 3D effect
export const createPulseAnimation = (isLowEnd: boolean): Variants => ({
    initial: { opacity: 0.8, scale: 1 },
    animate: {
        opacity: isLowEnd ? 0.9 : [0.8, 1, 0.8],
        scale: isLowEnd ? 1 : [1, 1.05, 1],
        transition: {
            duration: isLowEnd ? 0 : 8,
            repeat: isLowEnd ? 0 : Infinity,
            repeatType: "loop" as const,
            ease: "easeInOut",
        },
    },
});
