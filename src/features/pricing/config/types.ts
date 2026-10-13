// Feature comparison item
export type ComparisonFeature = {
    id: string;
    category: FeatureComparisonCategory;
    starter: boolean | string;
    growth: boolean | string;
    enterprise: boolean | string;
};

// Feature comparison categories
export type FeatureComparisonCategory =
    | "core"
    | "analytics"
    | "integrations"
    | "support"
    | "security";

// FAQ item for pricing page
export type PricingFaqItem = {
    id: string;
    questionKey: string;
    answerKey: string;
};
