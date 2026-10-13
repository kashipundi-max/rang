"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  IconBrandTwitter,
  IconBrandLinkedin,
  IconLink,
  IconCheck,
} from "@tabler/icons-react";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";

interface ShareWidgetProps {
  title: string;
}

export function ShareWidget({ title }: ShareWidgetProps) {
  const t = useTranslations("BlogPost");
  const [copied, setCopied] = useState(false);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="bg-linear-to-br from-bg-card/80 via-bg-card/60 to-brand-surface/10 rounded-xl border border-border-secondary/30 p-5"
    >
      <h3 className="text-sm font-medium text-text-primary font-dm-sans mb-4">
        {t("share.title")}
      </h3>
      <div className="flex items-center gap-2">
        <button
          onClick={() =>
            window.open(
              `https://twitter.com/intent/tweet?text=${encodeURIComponent(
                title
              )}&url=${encodeURIComponent(window.location.href)}`,
              "_blank"
            )
          }
          className="w-10 h-10 rounded-lg bg-bg-card/80 border border-border-secondary/30 flex items-center justify-center text-text-body hover:text-brand-primary hover:border-brand-primary/40 transition-colors"
          aria-label={t("share.twitter")}
        >
          <IconBrandTwitter className="w-5 h-5" />
        </button>
        <button
          onClick={() =>
            window.open(
              `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(
                window.location.href
              )}`,
              "_blank"
            )
          }
          className="w-10 h-10 rounded-lg bg-bg-card/80 border border-border-secondary/30 flex items-center justify-center text-text-body hover:text-brand-primary hover:border-brand-primary/40 transition-colors"
          aria-label={t("share.linkedin")}
        >
          <IconBrandLinkedin className="w-5 h-5" />
        </button>
        <button
          onClick={handleCopyLink}
          className={cn(
            "w-10 h-10 rounded-lg border flex items-center justify-center transition-colors",
            copied
              ? "bg-emerald-500/20 border-emerald-500/30 text-emerald-400"
              : "bg-bg-card/80 border-border-secondary/30 text-text-body hover:text-brand-primary hover:border-brand-primary/40"
          )}
          aria-label={copied ? t("share.copied") : t("share.copy")}
        >
          {copied ? (
            <IconCheck className="w-5 h-5" />
          ) : (
            <IconLink className="w-5 h-5" />
          )}
        </button>
      </div>
    </motion.div>
  );
}
