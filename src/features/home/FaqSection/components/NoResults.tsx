"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { useTranslations } from "next-intl";

export default function NoResults() {
  const t = useTranslations("FaqSection");

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="text-center py-10 relative"
    >
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 opacity-30">
        <Image
          src="/images/hero_3d.webp"
          alt=""
          width={128}
          height={128}
          className="w-full h-full object-contain grayscale"
        />
      </div>
      <p className="text-text-muted relative z-10">{t("noResults")}</p>
    </motion.div>
  );
}
