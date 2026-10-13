import Plans from "@/features/landing/Plans";
import Faq from "@/features/landing/Faq";
import Cta from "@/features/landing/Cta";

/** Pricing page reuses the landing page's Plans section so design and prices stay identical. */
export default function PricingPageContent() {
  return (
    <main className="landing-page skin-page w-full max-w-full overflow-x-hidden pt-12 sm:pt-[52px]">
      <Plans />
      <Faq />
      <Cta />
    </main>
  );
}
