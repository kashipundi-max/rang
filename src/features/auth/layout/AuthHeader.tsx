"use client";

import { motion } from "framer-motion";

interface AuthHeaderProps {
  title: string;
  subtitle?: string;
  className?: string;
}

export function AuthHeader({ title, subtitle, className }: AuthHeaderProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={className}
    >
      <h1 className="text-2xl sm:text-3xl font-clash-display font-medium text-text-primary mb-3">
        {title}
      </h1>
      {subtitle && <p className="text-text-body/90 font-dm-sans text-sm">{subtitle}</p>}
    </motion.div>
  );
}
