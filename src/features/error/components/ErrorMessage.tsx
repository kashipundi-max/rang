"use client";

import { motion } from "framer-motion";

interface ErrorMessageProps {
  title: string;
  description: string;
}

export function ErrorMessage({ title, description }: ErrorMessageProps) {
  return (
    <>
      <motion.h2
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="text-2xl sm:text-3xl md:text-4xl font-bold text-text-primary mb-4 -mt-8 sm:-mt-12"
      >
        {title}
      </motion.h2>

      <motion.p
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="text-text-secondary text-base sm:text-lg mb-8 max-w-md mx-auto"
      >
        {description}
      </motion.p>
    </>
  );
}
