"use client";

import { useTranslations } from "next-intl";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/Accordion";
import ShowMoreButton from "./ShowMoreButton";
import NoResults from "./NoResults";
import { TranslatedFaq } from "../hooks/useFaqFilter";

interface FaqListProps {
  faqs: TranslatedFaq[];
  hasResults: boolean;
  hasMoreFaqs: boolean;
  showAllFaqs: boolean;
  remainingCount: number;
  onToggleShowAll: () => void;
}

export default function FaqList({
  faqs,
  hasResults,
  hasMoreFaqs,
  showAllFaqs,
  remainingCount,
  onToggleShowAll,
}: FaqListProps) {
  const t = useTranslations("FaqSection");

  if (!hasResults) {
    return <NoResults />;
  }

  return (
    <>
      <Accordion>
        {faqs.map((faq) => (
          <AccordionItem key={faq.id} value={faq.id}>
            <AccordionTrigger
              value={faq.id}
              badge={t(`categories.${faq.category}`)}
            >
              {faq.question}
            </AccordionTrigger>
            <AccordionContent
              value={faq.id}
              badge={t(`categories.${faq.category}`)}
            >
              {faq.answer}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>

      {hasMoreFaqs && (
        <ShowMoreButton
          showAllFaqs={showAllFaqs}
          onToggle={onToggleShowAll}
          remainingCount={remainingCount}
        />
      )}
    </>
  );
}
