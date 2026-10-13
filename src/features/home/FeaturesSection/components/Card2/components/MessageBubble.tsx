"use client";

import { motion } from "framer-motion";
import { getInitials } from "../config/utils";

interface MessageBubbleProps {
  name: string;
  message: string;
  time: string;
  isMe: boolean;
  index: number;
  isInView: boolean;
  isHovered: boolean;
}

export default function MessageBubble({
  name,
  message,
  time,
  isMe,
  index,
  isInView,
  isHovered,
}: MessageBubbleProps) {
  return (
    <motion.div
      className={`flex gap-3 ${isMe ? "flex-row-reverse" : ""}`}
      initial={{ opacity: 0, x: isMe ? 20 : -20, y: 10 }}
      animate={
        isInView
          ? {
              opacity: 1,
              x: 0,
              y: isHovered ? -2 : 0,
            }
          : { opacity: 0, x: isMe ? 20 : -20, y: 10 }
      }
      transition={{
        opacity: { duration: 0.4, delay: index * 0.15 },
        x: {
          duration: 0.5,
          delay: index * 0.15,
          ease: "easeOut",
        },
        y: { duration: 0.3, ease: "easeOut" },
      }}
      whileHover={{
        scale: 1.02,
        transition: { duration: 0.2 },
      }}
    >
      <motion.div
        className={`w-7 h-7 rounded-full shrink-0 flex items-center justify-center text-[9px] font-semibold shadow-lg mt-1 ${
          isMe
            ? "bg-card-highlight-bg text-card-accent border border-card-highlight-border"
            : "bg-gradient-to-br from-card-highlight-bg to-card-surface text-card-accent border border-card-highlight-border"
        }`}
        initial={{ scale: 0 }}
        animate={isInView ? { scale: 1 } : { scale: 0 }}
        transition={{
          duration: 0.3,
          delay: index * 0.15 + 0.2,
          ease: [0.34, 1.56, 0.64, 1],
        }}
      >
        {getInitials(name)}
      </motion.div>
      <div
        className={`flex flex-col ${
          isMe ? "items-end" : "items-start"
        } max-w-[85%]`}
      >
        <span className="text-white/40 text-[9px] mb-1 px-1">{name}</span>
        <div
          className={`px-3 py-2 rounded-2xl text-[11px] leading-relaxed shadow-md ${
            isMe
              ? "bg-gradient-to-r from-brand-primary to-brand-glow text-white/90 border border-card-highlight-border/50 ltr:rounded-tr-sm rtl:rounded-tl-sm"
              : "bg-card-highlight-bg text-white/90 border border-card-highlight-border/50 ltr:rounded-tl-sm rtl:rounded-tr-sm"
          }`}
        >
          {message}
        </div>
        <span className="text-white/20 text-[8px] mt-1 px-1">{time}</span>
      </div>
    </motion.div>
  );
}
