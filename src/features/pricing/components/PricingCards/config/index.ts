import { IconStar, IconRocket, IconBuilding } from "@tabler/icons-react";

export const testimonials = [
    {
        id: 1,
        name: "Alex Rivera",
        designation: "Product Manager",
        image: "/images/avatars/person/person-2.webp",
    },
    {
        id: 2,
        name: "Sarah Chen",
        designation: "Growth Lead",
        image: "/images/avatars/person/person-female-2.webp",
    },
    {
        id: 3,
        name: "Marcus Johnson",
        designation: "Data Analyst",
        image: "/images/avatars/person/person-female.webp",
    },
];

export const plans = [
    {
        id: "starter",
        icon: IconStar,
        price: 29,
        popular: false,
        companies: "1K+",
        features: ["f1", "f2", "f3", "f4", "f5"],
        notIncluded: ["f6", "f7", "f8"],
    },
    {
        id: "growth",
        icon: IconRocket,
        price: 79,
        popular: true,
        companies: "4K+",
        features: ["f1", "f2", "f3", "f4", "f5", "f6", "f7"],
        notIncluded: ["f8"],
    },
    {
        id: "enterprise",
        icon: IconBuilding,
        price: 199,
        popular: false,
        companies: "500+",
        features: ["f1", "f2", "f3", "f4", "f5", "f6", "f7", "f8"],
        notIncluded: [],
    },
];

export type PlanType = typeof plans[number];
