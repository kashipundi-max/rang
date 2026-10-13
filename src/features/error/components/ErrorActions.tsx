"use client";

import { motion } from "framer-motion";
import { IconHome, IconArrowLeft } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";

interface ErrorActionsProps {
  backHomeLabel: string;
  goBackLabel: string;
}

export function ErrorActions({
  backHomeLabel,
  goBackLabel,
}: ErrorActionsProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.4 }}
      className="flex flex-col sm:flex-row items-center justify-center gap-4"
    >
      <Button href="/" size="lg" startIcon={<IconHome className="w-5 h-5" />}>
        {backHomeLabel}
      </Button>

      <Button
        variant="secondary"
        size="lg"
        onClick={() => window.history.back()}
        startIcon={<IconArrowLeft className="w-5 h-5 rtl:rotate-180" />}
      >
        {goBackLabel}
      </Button>
    </motion.div>
  );
}
