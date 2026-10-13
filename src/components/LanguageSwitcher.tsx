"use client";

import { useAppNavigation } from "@/hooks/navigation/useAppNavigation";
import { FlagIcon } from "react-flag-kit";
import Select, { type SelectOption } from "@/components/ui/input/Select";

const languages = [
  { code: "en", country: "US" as const },
  { code: "ar", country: "SA" as const },
  { code: "el", country: "GR" as const },
  { code: "es", country: "ES" as const },
];

interface LanguageSwitcherProps {
  className?: string;
  currentLocale?: string;
  variant?: "default" | "ghost";
  triggerClassName?: string;
}

export default function LanguageSwitcher({
  className,
  currentLocale = "en",
  variant = "default",
  triggerClassName,
}: LanguageSwitcherProps) {
  const { navigateToLocale } = useAppNavigation();

  const options: SelectOption[] = languages.map((lang) => ({
    value: lang.code,
    label: lang.code.toUpperCase(),
    icon: <FlagIcon code={lang.country} size={16} className="rounded-[3px]" />,
  }));

  const handleLanguageChange = (value: string | number) => {
    const langCode = value as string;

    // Get current pathname for locale switching
    const currentPath = window.location.pathname;

    // Use the enhanced navigation method that handles locale switching
    navigateToLocale(currentPath, langCode);
  };

  return (
    <Select
      options={options}
      value={currentLocale}
      onChange={handleLanguageChange}
      className={className}
      usePortal={true}
      triggerClassName={[
        variant === "ghost"
          ? "bg-transparent border-0 hover:bg-white/10"
          : "bg-[var(--control-bg)] border border-[var(--border-subtle)] hover:border-[var(--border-subtle)]",
        "rounded-full",
        "hover:bg-[var(--surface-hover)]",
        "transition-none",
        "h-8",
        "ps-2 pe-1",
        triggerClassName,
      ]
        .filter(Boolean)
        .join(" ")}
      variant={variant}
      hideChevron
    />
  );
}
