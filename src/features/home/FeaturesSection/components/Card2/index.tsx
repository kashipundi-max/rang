"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import CardLayout from "../CardLayout";
import ChatHeader from "./components/ChatHeader";
import MessageBubble from "./components/MessageBubble";
import ChatInput from "./components/ChatInput";
import { messageKeys } from "./config/messages";

interface Card2Props {
  className?: string;
  title?: string;
  description?: string;
  index?: number;
}

export default function Card2({
  className,
  title,
  description,
  index = 0,
}: Card2Props) {
  const [isHovered, setIsHovered] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const t = useTranslations("FeaturesSection");

  return (
    <CardLayout
      className={className}
      title={title}
      description={description}
      index={index}
      onHoverChange={setIsHovered}
      onInView={() => setIsInView(true)}
    >
      <div className="relative w-full h-full flex flex-col px-6 pt-4">
        <ChatHeader title={t("card2.teamChat")} />

        {/* Chat Container */}
        <div className="flex-1 rounded-xl bg-card-surface/80 backdrop-blur-sm border border-card-highlight-border p-4 flex flex-col shadow-inner shadow-brand-glow/10 relative overflow-hidden">
          {/* 45deg line texture overlay */}
          <div
            className="absolute inset-0 opacity-[0.08] pointer-events-none"
            style={{
              backgroundImage: `repeating-linear-gradient(
                -45deg,
                transparent,
                transparent 3px,
                rgba(255,255,255,0.15) 3px,
                rgba(255,255,255,0.15) 5px
              )`,
            }}
          />

          <div className="flex flex-col gap-4 flex-1 relative z-10">
            {messageKeys.map((msg, msgIndex) => (
              <MessageBubble
                key={msg.id}
                name={t(msg.nameKey)}
                message={t(msg.messageKey)}
                time={t(msg.timeKey)}
                isMe={msg.isMe}
                index={msgIndex}
                isInView={isInView}
                isHovered={isHovered}
              />
            ))}
          </div>

          <ChatInput placeholder={t("card2.typeMessage")} isInView={isInView} />
        </div>
      </div>
    </CardLayout>
  );
}
