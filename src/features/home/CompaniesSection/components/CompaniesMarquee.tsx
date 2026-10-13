"use client";

import { useRef, useState, useEffect } from "react";
import { companies } from "../config/companies";
import CompanyIcon from "./CompanyIcon";

export default function CompaniesMarquee() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    if (prefersReducedMotion) {
      setIsPaused(true);
    }
  }, []);

  // Triple the items for seamless loop
  const tripleCompanies = [...companies, ...companies, ...companies];

  return (
    <div
      className="overflow-hidden relative"
      dir="ltr"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Left gradient overlay */}
      <div className="absolute left-0 top-0 w-16 sm:w-24 md:w-32 lg:w-120 h-full bg-linear-to-r from-bg-dark via-bg-dark/50 to-transparent z-10 pointer-events-none" />

      {/* Right gradient overlay */}
      <div className="absolute right-0 top-0 w-16 sm:w-24 md:w-32 lg:w-120 h-full bg-linear-to-l from-bg-dark via-bg-dark/50 to-transparent z-10 pointer-events-none" />

      <div
        ref={scrollRef}
        className="flex gap-4 sm:gap-6 md:gap-8 lg:gap-10 animate-scroll"
        style={{ animationPlayState: isPaused ? "paused" : "running" }}
      >
        {tripleCompanies.map((company, index) => (
          <CompanyIcon key={`${company.name}-${index}`} company={company} />
        ))}
      </div>

      <style jsx>{`
        @keyframes scroll {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-33.333%);
          }
        }
        .animate-scroll {
          animation: scroll 25s linear infinite;
          will-change: transform;
        }
        @media (prefers-reduced-motion: reduce) {
          .animate-scroll {
            animation: none;
          }
        }
      `}</style>
    </div>
  );
}
