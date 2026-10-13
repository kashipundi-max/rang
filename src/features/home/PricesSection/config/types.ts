// Define feature categories
export type FeatureCategory = "Design" | "Development" | "Support" | "Growth";

// Define feature with category and tooltip
export type PlanFeature = {
  textKey: string;
  category: FeatureCategory;
  tooltip?: string;
  highlighted?: boolean;
};

// Define testimonial type
export type Testimonial = {
  id: number;
  name: string;
  designation: string;
  image: string;
};

// Define pricing plan type
export type PricingPlan = {
  id: string;
  name: string;
  description: string;
  price: number;
  features: PlanFeature[];
  featured: boolean;
  cta: string;
  badge: string | null;
  accentColor: string;
  companies: string;
};
