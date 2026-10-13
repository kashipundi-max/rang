"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import {
  IconArrowRight,
  IconChartBar,
  IconChevronDown,
  IconCircleCheck,
  IconCreditCard,
  IconSearch,
  IconShieldCheck,
  IconTargetArrow,
  IconUserCheck,
  IconX,
} from "@tabler/icons-react";
import { faqData, type FaqCategory } from "@/features/home/FaqSection/config/data";

const collectionMeta = {
  programs: {
    icon: IconTargetArrow,
    description: "Challenge types, evaluation phases, targets, and trader development paths.",
  },
  drawdown: {
    icon: IconChartBar,
    description: "Daily loss limits, maximum drawdown, and calculation examples.",
  },
  conduct: {
    icon: IconShieldCheck,
    description: "Trading conduct, news rules, automation, and restricted strategies.",
  },
  payouts: {
    icon: IconCreditCard,
    description: "Profit splits, payout eligibility, schedules, and processing times.",
  },
  account: {
    icon: IconUserCheck,
    description: "KYC, account access, fees, inactivity, and general policies.",
  },
} satisfies Record<Exclude<FaqCategory, "all">, { icon: typeof IconTargetArrow; description: string }>;

const collections = Object.keys(collectionMeta) as Exclude<FaqCategory, "all">[];

export default function FaqPageContent() {
  const t = useTranslations("FaqSection");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<FaqCategory>("all");
  const [openItem, setOpenItem] = useState<string | null>("q1");

  const translatedFaqs = useMemo(
    () =>
      faqData.map((faq) => ({
        ...faq,
        question: t(`faqs.${faq.id}.question`),
        answer: t(`faqs.${faq.id}.answer`),
      })),
    [t]
  );

  const filteredFaqs = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return translatedFaqs.filter((faq) => {
      const matchesCategory = selectedCategory === "all" || faq.category === selectedCategory;
      const matchesSearch = !query || `${faq.question} ${faq.answer}`.toLowerCase().includes(query);
      return matchesCategory && matchesSearch;
    });
  }, [searchQuery, selectedCategory, translatedFaqs]);

  const selectCollection = (category: Exclude<FaqCategory, "all">) => {
    setSelectedCategory(category);
    setSearchQuery("");
    setOpenItem(null);
    window.requestAnimationFrame(() => {
      document.getElementById("faq-answers")?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  };

  return (
    <main className="min-h-screen bg-white text-slate-950">
      <section className="relative overflow-hidden border-b border-white/10 bg-[#090512] px-4 pb-16 pt-32 sm:px-6 sm:pb-20 sm:pt-40">
        <div className="pointer-events-none absolute left-1/2 top-[-260px] h-[520px] w-[760px] -translate-x-1/2 rounded-full bg-[#6d28d9] opacity-35 blur-3xl" />
        <div className="relative mx-auto max-w-[780px] text-center">
          <p className="text-sm font-semibold text-[#c4a6ff]">Range4ex Help Center</p>
          <h1 className="mt-4 font-clash-display text-2xl font-normal leading-tight tracking-normal text-white sm:text-3xl md:text-4xl lg:text-5xl">
            Trading challenge and evaluation FAQ
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-[#b8b3c1] sm:text-lg">
            Clear answers about simulated trading challenges, evaluation rules, drawdown limits, and performance-based account access.
          </p>

          <div className="relative mx-auto mt-9 max-w-[660px] text-left">
            <IconSearch className="pointer-events-none absolute left-5 top-1/2 -translate-y-1/2 text-[#817d89]" size={22} />
            <input
              type="search"
              value={searchQuery}
              onChange={(event) => {
                setSearchQuery(event.target.value);
                setSelectedCategory("all");
              }}
              placeholder="Search for articles..."
              aria-label="Search frequently asked questions"
              className="h-[68px] w-full rounded-xl border border-white bg-white px-14 text-base text-[#17151d] shadow-[0_14px_40px_rgba(55,48,80,0.13)] outline-none transition placeholder:text-[#9a96a3] focus:border-[#b5a7e3] focus:ring-4 focus:ring-[#ddd6fe]/60"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                aria-label="Clear FAQ search"
                className="absolute right-4 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-[#f1eff5] text-[#77727f] transition hover:bg-[#e8e5ed] hover:text-[#17151d]"
              >
                <IconX size={17} />
              </button>
            )}
          </div>
        </div>
      </section>

      <section className="px-4 py-14 sm:px-6 sm:py-20">
        <div className="mx-auto max-w-[900px]">
          <div className="mb-7">
            <h2 className="font-clash-display text-2xl font-semibold tracking-[-0.02em] text-[#17151d] sm:text-3xl">
              Prop firm evaluation guidance from Range4ex
            </h2>
            <p className="mt-2 text-sm text-[#77727f]">Browse by topic or search all help articles above.</p>
          </div>

          {!searchQuery && (
            <div className="space-y-4">
              {collections.map((category) => {
                const meta = collectionMeta[category];
                const Icon = meta.icon;
                const count = faqData.filter((faq) => faq.category === category).length;
                return (
                  <button
                    key={category}
                    type="button"
                    onClick={() => selectCollection(category)}
                    className="group flex w-full items-center gap-5 rounded-xl border border-[#e7e6eb] bg-white p-5 text-left shadow-[0_2px_10px_rgba(30,25,40,0.025)] transition hover:border-[#d1ced7] hover:shadow-[0_12px_34px_rgba(30,25,40,0.07)] sm:p-6"
                  >
                    <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#f0edff] text-[#6750a4]">
                      <Icon size={23} stroke={1.8} />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-base font-semibold text-[#201d25]">{t(`categories.${category}`)}</span>
                      <span className="mt-1 block text-sm leading-6 text-[#77727f]">{meta.description}</span>
                      <span className="mt-2 block text-xs font-medium text-[#9a96a3]">{count} articles</span>
                    </span>
                    <IconArrowRight className="shrink-0 text-[#bbb7c1] transition group-hover:translate-x-1 group-hover:text-[#6750a4]" size={20} />
                  </button>
                );
              })}
            </div>
          )}

          <div id="faq-answers" className="scroll-mt-28 pt-14">
            <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="text-sm font-semibold text-[#6750a4]">Help articles</p>
                <h2 className="mt-1 font-clash-display text-2xl font-semibold text-[#17151d]">
                  {selectedCategory === "all" ? "All frequently asked questions" : t(`categories.${selectedCategory}`)}
                </h2>
              </div>
              {selectedCategory !== "all" && (
                <button type="button" onClick={() => setSelectedCategory("all")} className="text-sm font-semibold text-[#6750a4] hover:underline">
                  View all articles
                </button>
              )}
            </div>

            {filteredFaqs.length ? (
              <div className="space-y-3">
                {filteredFaqs.map((faq) => {
                  const isOpen = openItem === faq.id;
                  return (
                    <article key={faq.id} className="overflow-hidden rounded-xl border border-[#e7e6eb] bg-white transition hover:border-[#d5d2da]">
                      <button
                        type="button"
                        aria-expanded={isOpen}
                        onClick={() => setOpenItem(isOpen ? null : faq.id)}
                        className="flex w-full items-center justify-between gap-5 px-5 py-5 text-left sm:px-6"
                      >
                        <span className="font-medium leading-6 text-[#201d25]">{faq.question}</span>
                        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#f4f2f7] text-[#77727f]">
                          <IconChevronDown size={17} className={`transition-transform ${isOpen ? "rotate-180" : ""}`} />
                        </span>
                      </button>
                      {isOpen && (
                        <div className="border-t border-[#eeedf1] px-5 pb-6 pt-5 sm:px-6">
                          <div className="flex gap-3 text-[15px] leading-7 text-[#68656f]">
                            <IconCircleCheck className="mt-1.5 shrink-0 text-[#6750a4]" size={17} />
                            <p>{faq.answer}</p>
                          </div>
                        </div>
                      )}
                    </article>
                  );
                })}
              </div>
            ) : (
              <div className="rounded-xl border border-[#e7e6eb] bg-[#fafafa] px-6 py-14 text-center">
                <IconSearch className="mx-auto text-[#9a96a3]" size={28} />
                <h3 className="mt-4 font-semibold text-[#201d25]">No matching articles</h3>
                <p className="mt-2 text-sm text-[#77727f]">Try another search term or browse all FAQ collections.</p>
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery("");
                    setSelectedCategory("all");
                  }}
                  className="mt-5 rounded-full bg-[#201d25] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-black"
                >
                  Browse all articles
                </button>
              </div>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}