"use client";

import { motion } from "framer-motion";

interface ErrorCodeDisplayProps {
  code: string;
}

export function ErrorCodeDisplay({ code }: ErrorCodeDisplayProps) {
  return (
    <motion.h1
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.6, delay: 0.1 }}
      className="text-[150px] sm:text-[200px] md:text-[250px] font-bold leading-none text-transparent bg-clip-text bg-linear-to-b from-brand-primary/40 to-brand-primary/10 font-clash-display select-none"
    >
      {code}
    </motion.h1>
  );
}
