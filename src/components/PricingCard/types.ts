import { ComponentType } from "react";

export interface PricingFeature {
    key: string;
    label: string;
    highlighted?: boolean;
    tooltip?: string;
}

export interface Testimonial {
    id: number;
    name: string;
    designation: string;
    image: string;
}

export interface PricingCardProps {
    /** Unique identifier for the plan */
    id: string;
    /** Plan name */
    name: string;
    /** Short description of the plan */
    description: string;
    /** Price value */
    price: number;
    /** Price suffix text (e.g., "/month") */
    priceSuffix?: string;
    /** Billing note text */
    billingNote?: string;
    /** Whether this is the featured/popular plan */
    featured?: boolean;
    /** Badge text (e.g., "Most Popular") */
    badge?: string | null;
    /** CTA button text */
    ctaText: string;
    /** CTA button click handler */
    onCtaClick?: () => void;
    /** CTA href link */
    ctaHref?: string;
    /** Number of companies/teams using this plan */
    companiesCount?: string;
    /** Social proof text */
    socialProofText?: string;
    /** List of features */
    features: PricingFeature[];
    /** Section title for features */
    featuresTitle?: string;
    /** Social proof testimonials */
    testimonials?: Testimonial[];
    /** Custom class name */
    className?: string;
}
