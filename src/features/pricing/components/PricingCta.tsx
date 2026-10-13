"use client";

import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import { IconArrowRight, IconHeadset } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";

export function PricingCta() {
  const t = useTranslations("PricingPage");

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
      className="relative max-w-4xl mx-auto"
    >
      <div className="relative p-px rounded-2xl bg-linear-to-r from-brand-primary/50 via-brand-primary/20 to-brand-primary/50">
        <div className="relative rounded-[15px] bg-bg-card p-8 md:p-12 overflow-hidden">
          {/* Background decoration */}
          <div className="absolute inset-0 bg-linear-to-br from-brand-primary/5 via-transparent to-brand-primary/5 pointer-events-none" />
          <div className="absolute -top-24 -end-24 w-48 h-48 bg-brand-primary/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative flex flex-col md:flex-row items-center gap-8">
            {/* Icon */}
            <div className="w-16 h-16 rounded-2xl bg-brand-primary/20 flex items-center justify-center shrink-0">
              <IconHeadset className="w-8 h-8 text-brand-primary" />
            </div>

            {/* Content */}
            <div className="flex-1 text-center md:text-start">
              <h3 className="text-2xl md:text-3xl font-bold text-text-primary mb-3 font-clash-display">
                {t("cta.title")}
              </h3>
              <p className="text-text-body max-w-xl">{t("cta.description")}</p>
            </div>

            {/* CTA */}
            <Button href="/contact" size="lg">
              {t("cta.button")}
              <IconArrowRight className="w-5 h-5 ms-2 rtl:rotate-180" />
            </Button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
