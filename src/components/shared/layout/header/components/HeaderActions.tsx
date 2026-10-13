"use client";

import React from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

interface HeaderActionsProps {
  children?: React.ReactNode;
  isAuthenticated: boolean;
}

/**
 * Right-hand side of the header. Signed out shows an outlined Login pill next
 * to the gradient primary CTA; signed in collapses to a single Dashboard button.
 */
export function HeaderActions({
  children,
  isAuthenticated,
}: HeaderActionsProps) {
  const t = useTranslations("Header");

  return (
    <div className="flex items-center gap-2">
      {children}

      {!isAuthenticated && (
        <Link
          href="/auth/signin"
          className="hidden h-10 items-center justify-center rounded-full border border-(--brand-border-strong) bg-(--brand-surface-section) px-5 text-sm font-semibold text-[#f5f8fa] transition-opacity hover:opacity-80 sm:inline-flex"
        >
          {t("login")}
        </Link>
      )}

      <Link
        href={isAuthenticated ? "/dashboard" : "/auth/signup"}
        className="skin-btn-primary skin-btn-sm hidden h-10 px-5 sm:inline-flex"
      >
        <span className="relative">{isAuthenticated ? "Dashboard" : t("signUp")}</span>
      </Link>
    </div>
  );
}
