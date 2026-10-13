import { SpotlightProps } from "@/components/LightRays";

export const spotlights: SpotlightProps[] = [
    // Left spotlight - softer, wider spread
    {
        width: "10%",
        left: "20%",
        rotation: 25,
        color: "dark",
        opacity: 0.4,
        blur: 40,
        delay: 0.5,
    },
    // Center spotlight - focused on content
    {
        width: "40%",
        left: "50%",
        rotation: 0,
        color: "dark",
        opacity: 0.15,
        blur: 25,
        delay: 0,
    },
    // Right spotlight - accent light
    {
        width: "30%",
        left: "75%",
        rotation: -20,
        color: "dark",
        opacity: 0.4,
        blur: 25,
        delay: 1.2,
    },
    // Background ambient light
    {
        width: "60%",
        left: "40%",
        rotation: 10,
        color: "dark",
        opacity: 0.2,
        blur: 60,
        delay: 2.0,
    },
];
