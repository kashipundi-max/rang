"use client";

import dynamic from "next/dynamic";
import { points } from "../config/points";
import ContactForm from "./ContactForm";
import { TextHoverEffect } from "@/components/TextHoverEffect";

const WorldMap = dynamic(() => import("@/components/WorldMap"));

export default function MapContent() {
  return (
    <>
      {/* Mobile: Background map with overlay */}
      <div className="absolute inset-0 z-0 md:hidden">
        <WorldMap
          points={points}
          pointColor="var(--color-brand-primary)"
          coverMode={true}
          className="top-[50%] rounded-none opacity-70"
        />
        <div className="absolute inset-0 bg-linear-to-b from-bg-dark/30 via-bg-dark/20 to-bg-dark/40 rounded-xl" />
      </div>

      {/* Mobile: Contact form on top */}
      <div className="mb-8 sm:mb-10 flex justify-center md:hidden">
        <ContactForm />
      </div>

      {/* Desktop: Full map section with floating form */}
      <div className="hidden md:block relative w-full h-[400px] sm:h-[500px]">
        <div className="relative">
          <WorldMap points={points} pointColor="var(--color-brand-primary)" />
          <div className="absolute inset-0 bg-linear-to-r from-bg-dark/20 via-transparent to-bg-dark/20" />
        </div>

        <div className="flex justify-center absolute start-1/2 top-1/2 -translate-x-1/2 rtl:translate-x-1/2 -translate-y-1/2 items-center z-20">
          <ContactForm />
        </div>

        <div className="absolute w-full h-[180px] sm:h-[220px] md:h-[250px] translate-y-[55%] bottom-0">
          <TextHoverEffect
            text="Range4Ex"
            automatic={false}
            className="range4ex-wordmark w-full h-full"
          />
        </div>
      </div>
    </>
  );
}
