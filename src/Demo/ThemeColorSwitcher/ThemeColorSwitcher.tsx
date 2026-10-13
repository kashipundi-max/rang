"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  IconPalette,
  IconCheck,
  IconX,
  IconBolt,
  IconMoon,
  IconSun,
} from "@tabler/icons-react";
import { useTranslations } from "next-intl";
import { useThemeColor } from "./ThemeColorProvider";
import { cn } from "@/lib/utils";

const SCROLL_TOP_KEY = "theme-scroll-top";
const PERFORMANCE_KEY = "template-performance-mode";

export function ThemeColorSwitcher() {
  const t = useTranslations("ThemeColorSwitcher");
  const { currentTheme, setTheme, themes, landingMode, setLandingMode } =
    useThemeColor();
  const [isOpen, setIsOpen] = useState(false);
  const [performanceMode, setPerformanceMode] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  // Load performance mode on mount
  useEffect(() => {
    setPerformanceMode(localStorage.getItem(PERFORMANCE_KEY) === "on");
  }, []);

  // Scroll to top after page reload from theme change
  useEffect(() => {
    if (sessionStorage.getItem(SCROLL_TOP_KEY)) {
      sessionStorage.removeItem(SCROLL_TOP_KEY);
      window.scrollTo({ top: 0, behavior: "instant" });
    }
  }, []);

  // Handle performance mode toggle - saves and reloads page
  const handlePerformanceToggle = () => {
    const newValue = !performanceMode;
    localStorage.setItem(PERFORMANCE_KEY, newValue ? "on" : "off");
    sessionStorage.setItem(SCROLL_TOP_KEY, "true");
    window.location.reload();
  };

  // Apply the selected brand color across the shared app theme immediately.
  const handleThemeChange = (themeId: string) => {
    if (themeId !== currentTheme.id) {
      setTheme(themeId);
    }
  };

  // Close panel when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        panelRef.current &&
        !panelRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  // Close on escape key
  useEffect(() => {
    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen]);

  return (
    <div ref={panelRef} className="fixed bottom-6 end-6 z-100">
      {/* Toggle Button */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "w-12 h-12 rounded-full flex items-center justify-center",
          "bg-brand-surface/90 backdrop-blur-md border border-brand-border/50",
          "shadow-lg shadow-brand-glow/20",
          "hover:bg-brand-surface hover:border-brand-primary/50",
          "transition-all duration-300",
          "focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary/50"
        )}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        aria-label={t("changeTheme")}
      >
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.3 }}
        >
          {isOpen ? (
            <IconX className="w-5 h-5 text-brand-primary-light" />
          ) : (
            <IconPalette className="w-5 h-5 text-brand-primary-light" />
          )}
        </motion.div>
      </motion.button>

      {/* Color Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className={cn(
              "absolute bottom-16 end-0",
              "w-72 p-4 rounded-xl",
              "bg-bg-card/95 backdrop-blur-xl",
              "border border-border-secondary/50",
              "shadow-2xl shadow-black/30"
            )}
          >
            {/* Header */}
            <div className="mb-4">
              <h3 className="text-text-primary font-medium text-sm font-dm-sans">
                {t("title")}
              </h3>
              <p className="text-text-muted text-xs mt-1">{t("description")}</p>
            </div>

            {/* Color Grid */}
            <div className="grid grid-cols-4 gap-2">
              {themes.map((theme) => (
                <motion.button
                  key={theme.id}
                  onClick={() => handleThemeChange(theme.id)}
                  className={cn(
                    "relative w-12 h-12 rounded-lg",
                    "flex items-center justify-center",
                    "border-2 transition-all duration-200",
                    "focus:outline-none",
                    currentTheme.id === theme.id
                      ? "border-white/80 scale-105"
                      : "border-transparent hover:border-white/30"
                  )}
                  style={{ backgroundColor: theme.preview }}
                  whileHover={{
                    scale: currentTheme.id === theme.id ? 1.05 : 1.1,
                  }}
                  whileTap={{ scale: 0.95 }}
                  title={theme.name}
                  aria-label={t("selectTheme", { theme: theme.name })}
                >
                  {currentTheme.id === theme.id && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute inset-0 flex items-center justify-center bg-black/20 rounded-lg"
                    >
                      <IconCheck className="w-5 h-5 text-white drop-shadow-md" />
                    </motion.div>
                  )}
                </motion.button>
              ))}
            </div>

            {/* Current Theme Name */}
            <div className="mt-4 pt-3 border-t border-border-secondary/50">
              <div className="flex items-center justify-between">
                <span className="text-text-muted text-xs">{t("current")}:</span>
                <span
                  className="text-xs font-medium px-2 py-1 rounded-full"
                  style={{
                    backgroundColor: `${currentTheme.preview}20`,
                    color: currentTheme.preview,
                  }}
                >
                  {currentTheme.name}
                </span>
              </div>
            </div>

            {/* Landing Page Appearance */}
            <div className="mt-3 pt-3 border-t border-border-secondary/50">
              <div className="mb-2 flex items-center justify-between">
                <span className="text-text-muted text-xs">Landing page</span>
                <span className="text-[10px] uppercase tracking-[0.16em] text-text-muted">
                  Appearance
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2 rounded-lg bg-bg-dark/60 p-1">
                {([
                  { id: "dark", label: "Dark", icon: IconMoon },
                  { id: "light", label: "Light", icon: IconSun },
                ] as const).map(({ id, label, icon: Icon }) => (
                  <button
                    key={id}
                    type="button"
                    onClick={() => setLandingMode(id)}
                    className={cn(
                      "flex items-center justify-center gap-2 rounded-md px-3 py-2 text-xs font-semibold transition-all",
                      landingMode === id
                        ? "bg-brand-primary text-button-text shadow-sm"
                        : "text-text-muted hover:bg-brand-surface/50 hover:text-text-primary"
                    )}
                    aria-pressed={landingMode === id}
                  >
                    <Icon className="h-4 w-4" />
                    {label}
                  </button>
                ))}
              </div>
              <p className="mt-2 px-1 text-[10px] leading-relaxed text-text-muted">
                Light mode brightens selected landing-page sections. The hero,
                pricing, and footer stay dark.
              </p>
            </div>

            {/* Performance Mode Toggle */}
            <div className="mt-3 pt-3 border-t border-border-secondary/50">
              <button
                onClick={handlePerformanceToggle}
                className={cn(
                  "w-full flex items-center justify-between p-2 rounded-lg transition-all duration-200",
                  "hover:bg-brand-surface/30",
                  performanceMode
                    ? "bg-brand-surface/20 border border-brand-border/30"
                    : "bg-transparent"
                )}
              >
                <div className="flex items-center gap-2">
                  <IconBolt
                    className={cn(
                      "w-4 h-4",
                      performanceMode ? "text-brand-primary" : "text-text-muted"
                    )}
                  />
                  <span className="text-text-primary text-xs font-medium">
                    {t("performanceMode")}
                  </span>
                </div>
                <div
                  className={cn(
                    "w-8 h-4 rounded-full transition-all duration-200 relative",
                    performanceMode ? "bg-brand-primary" : "bg-border-secondary"
                  )}
                >
                  <div
                    className={cn(
                      "absolute top-0.5 w-3 h-3 rounded-full bg-white transition-all duration-200",
                      performanceMode ? "left-4" : "left-0.5"
                    )}
                  />
                </div>
              </button>
              <p className="text-text-muted text-[10px] mt-1 px-1">
                {t("performanceDescription")}
              </p>
            </div>

            {/* Info */}
            <div className="mt-3 p-2 rounded-lg bg-brand-surface/30 border border-brand-border/30">
              <p className="text-text-muted text-[10px] leading-relaxed">
                ⚠️ {t("demoWarning")}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
