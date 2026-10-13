"use client";

import { motion } from "framer-motion";
import SendButton from "./SendButton";

interface ChatInputProps {
  placeholder: string;
  isInView: boolean;
}

export default function ChatInput({ placeholder, isInView }: ChatInputProps) {
  return (
    <motion.div
      className="mt-3 flex items-center gap-2 relative z-10"
      initial={{ opacity: 0, y: 10 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }}
      transition={{ duration: 0.4, delay: 0.5 }}
    >
      <div className="flex-1 h-9 rounded-lg bg-card-surface border border-card-highlight-border flex items-center px-3 transition-colors hover:border-card-highlight-bg">
        <span className="text-white/25 text-[10px]">{placeholder}</span>
      </div>
      <SendButton />
    </motion.div>
  );
}
