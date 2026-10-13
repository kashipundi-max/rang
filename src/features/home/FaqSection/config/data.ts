// Define the categories for FAQs
export type FaqCategory = "all" | "programs" | "drawdown" | "conduct" | "payouts" | "account";

// Define the structure for FAQ items
export interface FaqItem {
  id: string; // Translation key (q1, q2, etc.)
  category: Exclude<FaqCategory, "all">;
}

// Define the FAQ data with translation keys
export const faqData: FaqItem[] = [
  { id: "q1", category: "programs" },
  { id: "q2", category: "programs" },
  { id: "q3", category: "drawdown" },
  { id: "q4", category: "drawdown" },
  { id: "q5", category: "conduct" },
  { id: "q6", category: "conduct" },
  { id: "q7", category: "payouts" },
  { id: "q8", category: "payouts" },
  { id: "q9", category: "account" },
  { id: "q10", category: "account" },
];
