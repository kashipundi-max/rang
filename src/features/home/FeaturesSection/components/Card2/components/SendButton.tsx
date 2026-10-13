"use client";

import { motion } from "framer-motion";

interface SendButtonProps {
  className?: string;
}

export default function SendButton({ className }: SendButtonProps) {
  return (
    <motion.div
      className={`w-9 h-9 rounded-lg flex items-center justify-center cursor-pointer ${className}`}
      style={{
        background:
          "linear-gradient(180deg, var(--color-brand-primary) 0%, var(--color-brand-glow) 100%)",
      }}
      whileHover={{
        scale: 1.1,
        boxShadow: "0 0 15px var(--color-card-spotlight)",
      }}
      whileTap={{ scale: 0.95 }}
      transition={{ duration: 0.2 }}
    >
      <svg
        width="14"
        height="14"
        viewBox="0 0 16 16"
        fill="none"
        className="rtl:rotate-180"
      >
        <path
          d="M14.5 1.5L7 9M14.5 1.5L10 14.5L7 9M14.5 1.5L1.5 6L7 9"
          stroke="white"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </motion.div>
  );
}
