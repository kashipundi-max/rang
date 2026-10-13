import { ComparisonFeature, PricingFaqItem } from "./types";

// Feature comparison data for the comparison table
export const comparisonFeatures: ComparisonFeature[] = [
    // Core Features
    {
        id: "tracked_users",
        category: "core",
        starter: "10K",
        growth: "100K",
        enterprise: "Unlimited",
    },
    {
        id: "team_members",
        category: "core",
        starter: "3",
        growth: "10",
        enterprise: "Unlimited",
    },
    {
        id: "projects",
        category: "core",
        starter: "1",
        growth: "5",
        enterprise: "Unlimited",
    },
    {
        id: "data_retention",
        category: "core",
        starter: "7 days",
        growth: "90 days",
        enterprise: "Unlimited",
    },
    {
        id: "custom_events",
        category: "core",
        starter: "10",
        growth: "100",
        enterprise: "Unlimited",
    },

    // Analytics Features
    {
        id: "basic_analytics",
        category: "analytics",
        starter: true,
        growth: true,
        enterprise: true,
    },
    {
        id: "advanced_analytics",
        category: "analytics",
        starter: false,
        growth: true,
        enterprise: true,
    },
    {
        id: "funnel_analysis",
        category: "analytics",
        starter: false,
        growth: true,
        enterprise: true,
    },
    {
        id: "cohort_analysis",
        category: "analytics",
        starter: false,
        growth: true,
        enterprise: true,
    },
    {
        id: "ab_testing",
        category: "analytics",
        starter: false,
        growth: true,
        enterprise: true,
    },
    {
        id: "custom_reports",
        category: "analytics",
        starter: false,
        growth: true,
        enterprise: true,
    },
    {
        id: "realtime_dashboard",
        category: "analytics",
        starter: false,
        growth: true,
        enterprise: true,
    },
    {
        id: "predictive_analytics",
        category: "analytics",
        starter: false,
        growth: false,
        enterprise: true,
    },

    // Integrations
    {
        id: "api_access",
        category: "integrations",
        starter: false,
        growth: true,
        enterprise: true,
    },
    {
        id: "webhooks",
        category: "integrations",
        starter: false,
        growth: true,
        enterprise: true,
    },
    {
        id: "slack_integration",
        category: "integrations",
        starter: true,
        growth: true,
        enterprise: true,
    },
    {
        id: "zapier_integration",
        category: "integrations",
        starter: false,
        growth: true,
        enterprise: true,
    },
    {
        id: "custom_integrations",
        category: "integrations",
        starter: false,
        growth: false,
        enterprise: true,
    },
    {
        id: "data_export",
        category: "integrations",
        starter: "CSV",
        growth: "CSV, JSON",
        enterprise: "All formats",
    },

    // Support
    {
        id: "email_support",
        category: "support",
        starter: true,
        growth: true,
        enterprise: true,
    },
    {
        id: "priority_support",
        category: "support",
        starter: false,
        growth: true,
        enterprise: true,
    },
    {
        id: "phone_support",
        category: "support",
        starter: false,
        growth: false,
        enterprise: true,
    },
    {
        id: "dedicated_manager",
        category: "support",
        starter: false,
        growth: false,
        enterprise: true,
    },
    {
        id: "onboarding_training",
        category: "support",
        starter: false,
        growth: "Basic",
        enterprise: "Custom",
    },
    {
        id: "sla_guarantee",
        category: "support",
        starter: false,
        growth: "99.9%",
        enterprise: "99.99%",
    },

    // Security
    {
        id: "ssl_encryption",
        category: "security",
        starter: true,
        growth: true,
        enterprise: true,
    },
    {
        id: "two_factor_auth",
        category: "security",
        starter: true,
        growth: true,
        enterprise: true,
    },
    {
        id: "sso",
        category: "security",
        starter: false,
        growth: true,
        enterprise: true,
    },
    {
        id: "audit_logs",
        category: "security",
        starter: false,
        growth: true,
        enterprise: true,
    },
    {
        id: "custom_permissions",
        category: "security",
        starter: false,
        growth: false,
        enterprise: true,
    },
    {
        id: "hipaa_compliance",
        category: "security",
        starter: false,
        growth: false,
        enterprise: true,
    },
    {
        id: "soc2_compliance",
        category: "security",
        starter: false,
        growth: false,
        enterprise: true,
    },
];

// FAQ items for pricing page
export const pricingFaqItems: PricingFaqItem[] = [
    {
        id: "faq1",
        questionKey: "q1",
        answerKey: "a1",
    },
    {
        id: "faq2",
        questionKey: "q2",
        answerKey: "a2",
    },
    {
        id: "faq3",
        questionKey: "q3",
        answerKey: "a3",
    },
    {
        id: "faq4",
        questionKey: "q4",
        answerKey: "a4",
    },
    {
        id: "faq5",
        questionKey: "q5",
        answerKey: "a5",
    },
    {
        id: "faq6",
        questionKey: "q6",
        answerKey: "a6",
    },
];
