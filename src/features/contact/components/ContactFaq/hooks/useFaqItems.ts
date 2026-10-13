import { useMemo } from "react";
import { useTranslations } from "next-intl";
import { contactFaqData, ContactFaqItem } from "../config";

interface TranslatedFaq extends ContactFaqItem {
    question: string;
    answer: string;
}

export function useFaqItems() {
    const t = useTranslations("ContactSection.faq");

    const translatedFaqs = useMemo<TranslatedFaq[]>(() => {
        return contactFaqData.map((faq) => ({
            ...faq,
            question: t(`items.${faq.id}.question`),
            answer: t(`items.${faq.id}.answer`),
        }));
    }, [t]);

    return { translatedFaqs, t };
}
