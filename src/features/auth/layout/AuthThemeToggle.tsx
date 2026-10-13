"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { IconMoon, IconSun } from "@tabler/icons-react";

export type AuthColorMode = "light" | "dark";

const STORAGE_KEY = "auth-color-mode";

/**
 * Applies the saved auth appearance to <html> before paint so the page never
 * flashes the wrong colours. Rendered as an inline script by AuthLayout.
 */
export const AUTH_MODE_SCRIPT = `(function(){try{var m=localStorage.getItem("${STORAGE_KEY}");document.documentElement.dataset.authMode=m==="dark"?"dark":"light";}catch(e){document.documentElement.dataset.authMode="light";}})();`;

/**
 * Light/dark switch for the auth screens only.
 * Light is the default; dark restores the brand purple appearance.
 */
export function AuthThemeToggle() {
  const t = useTranslations("AuthLayout");
  const [mode, setMode] = useState<AuthColorMode>("light");

  useEffect(() => {
    setMode(
      document.documentElement.dataset.authMode === "dark" ? "dark" : "light"
    );
  }, []);

  const toggle = () => {
    const next: AuthColorMode = mode === "dark" ? "light" : "dark";
    setMode(next);
    document.documentElement.dataset.authMode = next;
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // storage unavailable (private mode) - the switch still applies for this visit
    }
  };

  const label = mode === "dark" ? t("switchToLight") : t("switchToDark");

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={label}
      title={label}
      className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-border-secondary bg-bg-card/70 text-text-secondary backdrop-blur-sm transition-colors duration-200 hover:border-brand-primary/50 hover:text-brand-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary/30 cursor-pointer"
    >
      {mode === "dark" ? (
        <IconSun className="h-5 w-5" stroke={1.6} />
      ) : (
        <IconMoon className="h-5 w-5" stroke={1.6} />
      )}
    </button>
  );
}
