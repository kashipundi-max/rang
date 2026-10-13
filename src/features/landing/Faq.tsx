import { useTranslations } from "next-intl";
import { IconCirclePlus, IconCircleMinus } from "@tabler/icons-react";
import { faqData } from "@/features/home/FaqSection/config/data";
import { Link } from "@/i18n/navigation";
import { Container } from "./ui";

/** Two-column FAQ: heading on the left, native-details accordion on the right. */
export default function Faq() {
  const t = useTranslations("FaqSection");

  return (
    <section id="faq" className="isolate flex w-full scroll-mt-24 flex-col items-center py-24">
      <Container className="flex flex-wrap items-start gap-x-16 gap-y-10">
        <div className="flex max-w-[768px] min-w-[280px] flex-1 flex-col gap-5">
          <div className="flex items-center">
            <span className="inline-flex items-center rounded-md border border-(--brand-border-strong) bg-(--brand-surface-section) px-2.5 py-1">
              <span className="text-sm leading-5 font-medium text-(--brand-text-secondary)">{t("badge")}</span>
            </span>
            <span className="ml-3 h-px flex-1 bg-(--brand-border-strong)" />
          </div>
          <h2 className="text-3xl leading-[1.2] font-semibold tracking-[-0.02em] text-(--brand-text-primary) sm:text-4xl lg:text-[36px] lg:leading-[44px]">
            {t("title")}
          </h2>
          <p className="text-base leading-7 text-(--brand-text-secondary) sm:text-lg">
            {t("description")}{" "}
            <Link href="/faq" className="underline underline-offset-2 hover:opacity-80">
              View all FAQs
            </Link>
          </p>
        </div>

        <div className="flex min-w-[280px] flex-1 flex-col gap-4">
          {faqData.map((item, index) => (
            <details key={item.id} className="skin-faq group rounded-2xl p-8 transition-colors" open={index === 0}>
              <summary className="flex w-full cursor-pointer items-start justify-between gap-6 text-left">
                <span className="flex-1 text-lg leading-7 font-medium text-(--brand-text-primary)">
                  {t(`faqs.${item.id}.question`)}
                </span>
                <span className="pt-0.5 text-(--brand-300)">
                  <IconCirclePlus className="skin-faq-plus size-6" stroke={1.8} />
                  <IconCircleMinus className="skin-faq-minus size-6" stroke={1.8} />
                </span>
              </summary>
              <p className="mt-4 text-base leading-6 text-(--brand-text-secondary)">{t(`faqs.${item.id}.answer`)}</p>
            </details>
          ))}
        </div>
      </Container>
    </section>
  );
}
