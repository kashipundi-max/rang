"use client";
import React from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { navigationConfig, ctaButtonConfig } from "../config/navigation";
import LanguageSwitcher from "@/components/LanguageSwitcher";

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
  locale: string;
  isAuthenticated: boolean;
}

export function MobileMenu({ isOpen, onClose, locale, isAuthenticated }: MobileMenuProps) {
  const t = useTranslations("Header");

  if (!isOpen) return null;

  return (
    <div className="absolute top-full start-3 end-3 mx-auto mt-2 max-w-[1250px] overflow-hidden rounded-2xl border border-(--brand-border-card) bg-(--brand-surface-card) lg:hidden sm:start-6 sm:end-6">
      <nav className="flex flex-col">
        {navigationConfig.map((link, index) => {
          const className =
            "px-6 py-4 text-base leading-6 font-semibold text-[#f5f8fa] transition-colors hover:bg-white/5 border-b border-(--brand-border-card) select-none";

          if (link.href.startsWith("http")) {
            return (
              <a
                key={index}
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                onClick={onClose}
                className={className}
                style={{ minWidth: link.minWidth }}
              >
                {t(link.labelKey)}
              </a>
            );
          }

          return (
            <Link
              key={index}
              href={link.href}
              onClick={onClose}
              className={className}
              style={{ minWidth: link.minWidth }}
            >
              {t(link.labelKey)}
            </Link>
          );
        })}
      </nav>

      {/* Mobile Actions */}
      <div className="flex items-center justify-between gap-2 px-6 py-4">
        <LanguageSwitcher currentLocale={locale} variant="ghost" />
        <div className="flex items-center gap-2">
          {!isAuthenticated && (
            <Link
              href="/auth/signin"
              onClick={onClose}
              className="skin-btn-secondary skin-btn-sm"
            >
              {t("login")}
            </Link>
          )}
          <Link
            href={isAuthenticated ? "/dashboard" : "/auth/signup"}
            onClick={onClose}
            className="skin-btn-primary skin-btn-sm"
            style={{ minWidth: ctaButtonConfig.minWidth }}
          >
            <span className="relative">{isAuthenticated ? "Dashboard" : t("signUp")}</span>
          </Link>
        </div>
      </div>
    </div>
  );
}

