import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { FaqPageContent } from "@/features/faq";

type Props = {
  params: Promise<{ locale: string }>;
};

export const metadata: Metadata = {
  title: "Trading Challenge FAQ | Range4ex Evaluations",
  description: "Find answers about Range4ex simulated trading challenges, prop firm evaluation rules, drawdown limits, and performance-based account access.",
};

export default async function FaqPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <FaqPageContent />;
}