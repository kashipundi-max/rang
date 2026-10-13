"use client";

import { motion } from "framer-motion";

export function LoadingSpinner() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="flex flex-col items-center justify-center gap-4"
    >
      <motion.div
        className="w-8 h-8 border-2 border-brand-primary/30 border-t-brand-primary rounded-full"
        animate={{ rotate: 360 }}
        transition={{
          duration: 1,
          repeat: Infinity,
          ease: "linear",
        }}
      />
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="text-text-body text-sm font-dm-sans"
      >
        Loading...
      </motion.p>
    </motion.div>
  );
}
