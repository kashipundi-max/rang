"use client";

import { IconBrandDiscord, IconMail } from "@tabler/icons-react";
import { useTranslations } from "next-intl";
import { socialLinksConfig } from "../config/navigation";

const iconMap: Record<string, typeof IconMail> = {
  email: IconMail,
  discord: IconBrandDiscord,
};

export default function SocialLinks() {
  const t = useTranslations("Footer");

  return (
    <div className="flex items-center gap-4">
      {socialLinksConfig.map((social) => {
        const IconComponent = iconMap[social.id];
        return (
          <a
            key={social.id}
            href={social.href}
            aria-label={social.label ?? t(`social.${social.labelKey}`)}
            title={social.label}
            {...(social.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
            className="w-10 h-10 rounded-full bg-brand-surface/60 border border-border-secondary/60 flex items-center justify-center text-text-body hover:text-white hover:bg-surface-hover/70 hover:border-border-primary/70 transition-all duration-200 backdrop-blur-sm"
          >
            <IconComponent className="w-4 h-4" />
          </a>
        );
      })}
    </div>
  );
}
