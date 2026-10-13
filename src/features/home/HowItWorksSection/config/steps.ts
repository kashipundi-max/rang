import {
  IconLayoutGrid,
  IconTargetArrow,
  IconWallet,
  type Icon,
} from "@tabler/icons-react";

export interface Step {
  number: number;
  title: string;
  description: string;
  icon: Icon;
}

export const steps: Step[] = [
  {
    number: 1,
    title: "Choose Your Account",
    description:
      "Select your market, account type, and preferred balance to begin your evaluation.",
    icon: IconLayoutGrid,
  },
  {
    number: 2,
    title: "Pass The Evaluation",
    description:
      "Trade on your platform and meet the objectives outlined in your dashboard with clear, structured rules.",
    icon: IconTargetArrow,
  },
  {
    number: 3,
    title: "Get Funded & Paid",
    description:
      "Once funded, access your profits with fast, reliable payouts on your preferred payment rail.",
    icon: IconWallet,
  },
];

/**
 * Shared visual tokens for the timeline. Kept as `color-mix` expressions so the
 * section follows whatever `--color-brand-primary` the active theme sets.
 */
export const rail = {
  /** Dim track that is always visible behind the animated beam. */
  track:
    "linear-gradient(to bottom, transparent 0%, color-mix(in srgb, var(--color-brand-primary) 30%, transparent) 18%, color-mix(in srgb, var(--color-brand-primary) 30%, transparent) 82%, transparent 100%)",
  /** Bright beam that grows downward as the section scrolls through view. */
  beam: "linear-gradient(to bottom, color-mix(in srgb, var(--color-brand-primary-light) 0%, transparent) 0%, color-mix(in srgb, var(--color-brand-primary-light) 85%, transparent) 45%, var(--color-brand-primary-light) 100%)",
  /** Glow applied to the beam head and to the node dots. */
  glow: "0 0 8px color-mix(in srgb, var(--color-brand-primary-light) 85%, transparent), 0 0 18px color-mix(in srgb, var(--color-brand-primary) 55%, transparent), 0 0 28px color-mix(in srgb, var(--color-brand-primary) 30%, transparent)",
} as const;
