"use client";

import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/Accordion";
import { pricingFaqItems } from "../config/data";
import SectionHeader from "@/components/shared/SectionHeader";

export function PricingFaq() {
  const t = useTranslations("PricingPage");

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      className="max-w-3xl mx-auto mb-20"
    >
      {/* Section Header */}
      <SectionHeader
        title={t("faq.title")}
        description={t("faq.description")}
        useAnimatedBackground
      />

      {/* FAQ Accordion */}
      <Accordion defaultOpen="faq1" className="space-y-4">
        {pricingFaqItems.map((item) => (
          <div key={item.id} className="faq-item">
            <AccordionItem value={item.id}>
              <AccordionTrigger value={item.id}>
                {t(`faq.items.${item.questionKey}`)}
              </AccordionTrigger>
              <AccordionContent value={item.id}>
                {t(`faq.items.${item.answerKey}`)}
              </AccordionContent>
            </AccordionItem>
          </div>
        ))}
      </Accordion>
    </motion.div>
  );
}
