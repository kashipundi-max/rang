"use client";

import SectionHeader from "@/components/shared/SectionHeader";
import { Button } from "@/components/ui/button";
import { DesktopTimeline, MobileTimeline } from "./components";

export default function HowItWorksSection() {
  return (
    <section
      id="how-it-works"
      className="bg-bg-dark relative isolate flex w-full flex-col items-center overflow-x-clip py-12 sm:py-16 lg:py-24"
    >
      <div className="relative z-10 mx-auto flex w-full max-w-7xl flex-col items-center gap-12 px-4 sm:gap-16 sm:px-6 lg:gap-20 lg:px-10">
        <SectionHeader
          badge="How it works"
          title="From evaluation to funded trader"
          description="Follow these steps to join, complete your evaluation, and start earning as a funded trader."
          useAnimatedBackground
          className="mb-0! w-full py-2!"
        />

        <MobileTimeline />
        <DesktopTimeline />

        <div className="flex w-full flex-col items-center justify-center gap-3 sm:w-auto sm:flex-row">
          <Button href="/auth/signup" className="w-full sm:w-auto">
            Get Funded
          </Button>
          <Button href="/pricing" variant="secondary" className="w-full sm:w-auto">
            View Plans
          </Button>
        </div>
      </div>
    </section>
  );
}
