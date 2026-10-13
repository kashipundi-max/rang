"use client";

import { socialLinks } from "../config";

export function SocialLinks() {
  return (
    <div className="flex items-center gap-3 pt-3">
      {socialLinks.map((social) => (
        <a
          key={social.label}
          href={social.href}
          className="w-11 h-11 rounded-xl bg-bg-card/80 border border-border-secondary/30 flex items-center justify-center text-text-body hover:text-brand-primary hover:border-brand-border/50 hover:bg-brand-surface/30 hover:scale-110 hover:-translate-y-0.5 active:scale-95 transition-all duration-300"
          aria-label={social.label}
        >
          <social.icon className="w-5 h-5" />
        </a>
      ))}
    </div>
  );
}
