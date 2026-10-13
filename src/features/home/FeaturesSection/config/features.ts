import React from "react";
import Card1 from "../components/Card1";
import Card2 from "../components/Card2";
import Card3 from "../components/Card3";
import Card4 from "../components/Card4";
import Card5 from "../components/Card5";

export type CardKey = "Card1" | "Card2" | "Card3" | "Card4" | "Card5";

export interface Feature {
    id: string;
    titleKey: string;
    descriptionKey: string;
    card: CardKey;
}

export const features: Feature[] = [
    {
        id: "smart-notifications",
        titleKey: "card1.title",
        descriptionKey: "card1.description",
        card: "Card1",
    },
    {
        id: "easy-collaborations",
        titleKey: "card2.title",
        descriptionKey: "card2.description",
        card: "Card2",
    },
    {
        id: "fuel-growth",
        titleKey: "card3.title",
        descriptionKey: "card3.description",
        card: "Card3",
    },
    {
        id: "performance-metrics",
        titleKey: "card4.title",
        descriptionKey: "card4.description",
        card: "Card4",
    },
    {
        id: "analytics-dashboard",
        titleKey: "card5.title",
        descriptionKey: "card5.description",
        card: "Card5",
    },
];

export const CardComponents: Record<
    CardKey,
    React.ComponentType<{
        className?: string;
        title?: string;
        description?: string;
        index?: number;
    }>
> = {
    Card1,
    Card2,
    Card3,
    Card4,
    Card5,
};
