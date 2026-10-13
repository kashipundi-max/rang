"use client";

import { Card } from "@/components/Card";
import { FaqHeader, FaqAccordion } from "./components";

export function ContactFaq() {
  return (
    <div className="mt-12 sm:mt-16">
      <FaqHeader />

      <div className="max-w-2xl mx-auto">
        <Card animated>
          <FaqAccordion />
        </Card>
      </div>
    </div>
  );
}
