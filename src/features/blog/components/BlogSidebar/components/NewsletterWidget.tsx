"use client";

import React from "react";
import { motion } from "framer-motion";
import { IconMail, IconCheck } from "@tabler/icons-react";
import { useTranslations } from "next-intl";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface NewsletterWidgetProps {
  email: string;
  onEmailChange: (value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  subscribed: boolean;
}

export function NewsletterWidget({
  email,
  onEmailChange,
  onSubmit,
  subscribed,
}: NewsletterWidgetProps) {
  const t = useTranslations("BlogPage.sidebar");

  return (
    <motion.div
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
      className="bg-linear-to-br from-bg-card/80 via-bg-card/60 to-brand-surface/20 rounded-2xl border border-border-secondary/30 p-6 overflow-hidden relative"
    >
      {/* Decorative gradient */}
      <div className="absolute -top-12 -end-12 w-32 h-32 bg-brand-primary/20 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10">
        <div className="w-12 h-12 rounded-xl bg-brand-surface border border-brand-border/50 flex items-center justify-center mb-4">
          <IconMail className="w-6 h-6 text-brand-primary" />
        </div>
        <h3 className="text-lg font-clash-display font-medium text-text-primary mb-2">
          {t("newsletter.title")}
        </h3>
        <p className="text-sm text-text-body/90 font-dm-sans mb-4">
          {t("newsletter.description")}
        </p>

        <form onSubmit={onSubmit} className="space-y-3">
          <Input
            type="email"
            value={email}
            onChange={(e) => onEmailChange(e.target.value)}
            placeholder={t("newsletter.placeholder")}
            className="h-11"
          />
          <Button
            type="submit"
            className={cn(
              "w-full h-11 font-dm-sans text-sm font-medium",
              subscribed && "bg-emerald-500 hover:bg-emerald-500"
            )}
          >
            {subscribed ? (
              <span className="flex items-center justify-center gap-2">
                <IconCheck className="w-4 h-4" />
                {t("newsletter.success")}
              </span>
            ) : (
              t("newsletter.subscribe")
            )}
          </Button>
        </form>
        <p className="text-xs text-text-muted mt-3 font-dm-sans">
          {t("newsletter.privacy")}
        </p>
      </div>
    </motion.div>
  );
}
