"use client";

import NewsletterSignup from "@/components/newsletter/NewsletterSignup";
import { getBrandFilter } from "@/features/home/HeroSection/utils";

export default function NewsletterSection() {
  const brandFilter = getBrandFilter();

  return (
    <div className="relative mt-7 sm:mt-12 mb-0 py-8 border-t overflow-hidden border-border-secondary/60 w-full flex justify-center">
      <NewsletterSignup source="footer" className="relative z-10 mx-auto" />
      <div
        className="absolute -z-1 end-0 top-0 translate-x-1/2 rtl:-translate-x-1/2 rotate-z-180 w-[200px] sm:w-[250px] h-[300px] pointer-events-none"
        style={{
          backgroundImage: "url('/images/hero_3d.webp')",
          backgroundSize: "contain",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          filter: brandFilter,
        }}
      />
    </div>
  );
}