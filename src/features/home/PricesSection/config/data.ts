import { PricingPlan, Testimonial } from './types';

// Testimonials for social proof
export const testimonials: Testimonial[] = [
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
  }
];

// Define pricing plans with categorized features
export const plans: PricingPlan[] = [
  {
    id: "starter",
    name: "Starter",
    description: "Perfect for small teams getting started with user analytics and growth tracking",
    price: 29,
    features: [
      { textKey: "f1", category: "Growth" },
      { textKey: "f2", category: "Design" },
      { textKey: "f3", category: "Support" },
      { textKey: "f4", category: "Development" },
      { textKey: "f5", category: "Growth" },
    ],
    featured: false,
    cta: "Start Free Trial",
    badge: null,
    accentColor: "from-brand-primary to-brand-surface",
    companies: "1K+",
  },
  {
    id: "growth",
    name: "Growth",
    description: "Advanced analytics and insights for scaling businesses with comprehensive user tracking",
    price: 79,
    features: [
      { textKey: "f1", category: "Growth", highlighted: true },
      { textKey: "f2", category: "Design", highlighted: true },
      { textKey: "f3", category: "Support" },
      { textKey: "f4", category: "Development", highlighted: true },
      { textKey: "f5", category: "Growth" },
      { textKey: "f6", category: "Growth", highlighted: true },
      { textKey: "f7", category: "Design" },
    ],
    featured: true,
    cta: "Choose Growth",
    badge: "Most Popular",
    accentColor: "from-brand-primary-light to-brand-primary",
    companies: "4K+",
  },
  {
    id: "enterprise",
    name: "Enterprise",
    description: "Complete analytics solution for large organizations with unlimited tracking and premium support",
    price: 199,
    features: [
      { textKey: "f1", category: "Growth", highlighted: true },
      { textKey: "f2", category: "Design", highlighted: true },
      { textKey: "f3", category: "Support", highlighted: true },
      { textKey: "f4", category: "Development", highlighted: true },
      { textKey: "f5", category: "Growth", highlighted: true },
      { textKey: "f6", category: "Design" },
      { textKey: "f7", category: "Support", highlighted: true },
    ],
    featured: false,
    cta: "Contact Sales",
    badge: "Enterprise",
    accentColor: "from-brand-surface to-brand-border",
    companies: "500+",
  }
];
