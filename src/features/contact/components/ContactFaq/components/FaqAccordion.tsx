"use client";

import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/Accordion";
import { useFaqItems } from "../hooks";

export function FaqAccordion() {
  const { translatedFaqs } = useFaqItems();

  return (
    <Accordion defaultOpen="q1">
      {translatedFaqs.map((faq) => (
        <AccordionItem key={faq.id} value={faq.id}>
          <AccordionTrigger value={faq.id}>{faq.question}</AccordionTrigger>
          <AccordionContent value={faq.id}>{faq.answer}</AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
}
