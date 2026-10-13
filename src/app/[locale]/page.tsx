import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import Hero from "@/features/landing/Hero";
import StatsBento from "@/features/landing/StatsBento";
import Plans from "@/features/landing/Plans";
import HowItWorks from "@/features/landing/HowItWorks";
import WhyUs from "@/features/landing/WhyUs";
import Certificates from "@/features/landing/Certificates";
import Testimonials from "@/features/landing/Testimonials";
import Faq from "@/features/landing/Faq";
import Cta from "@/features/landing/Cta";

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "HomePage" });

  return {
    title: t("title"),
    description: t("description"),
    openGraph: {
      title: t("title"),
      description: t("description"),
    },
    twitter: {
      title: t("title"),
      description: t("description"),
    },
  };
}
export default function Home() {
  return (
    <main className="landing-page skin-page w-full max-w-full overflow-x-hidden pt-12 sm:pt-[52px]">
      <Hero />
      <StatsBento />
      <Plans />
      <HowItWorks />
      <WhyUs />
      <Certificates />
      <Testimonials />
      <Faq />
      <Cta />
    </main>
  );
}
