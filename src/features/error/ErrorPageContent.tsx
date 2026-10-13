"use client";

import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import {
  ErrorCodeDisplay,
  ErrorMessage,
  ErrorActions,
  ErrorBackground,
} from "./components";

interface ErrorPageContentProps {
  errorCode: string;
  translationKey: string;
}

export function ErrorPageContent({
  errorCode,
  translationKey,
}: ErrorPageContentProps) {
  const t = useTranslations(translationKey);

  return (
    <main className="relative w-full min-h-screen bg-bg-dark flex items-center justify-center overflow-hidden">
      <ErrorBackground />

      <div className="relative z-10 container mx-auto px-4 sm:px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-2xl mx-auto"
        >
          <ErrorCodeDisplay code={errorCode} />

          <ErrorMessage title={t("title")} description={t("description")} />

          <ErrorActions
            backHomeLabel={t("backHome")}
            goBackLabel={t("goBack")}
          />
        </motion.div>
      </div>

      {/* Bottom gradient fade */}
      <div className="absolute bottom-0 inset-x-0 h-32 bg-linear-to-t from-bg-dark to-transparent pointer-events-none" />
    </main>
  );
}
