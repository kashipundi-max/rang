"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { ThemeColors, themes } from "./themes";

interface ThemeContextType {
  currentTheme: ThemeColors;
  setTheme: (themeId: string) => void;
  themes: ThemeColors[];
  landingMode: "dark" | "light";
  setLandingMode: (mode: "dark" | "light") => void;
}

const ThemeContext = createContext<ThemeContextType | null>(null);

const STORAGE_KEY = "template-theme-color";
const LANDING_MODE_KEY = "template-landing-mode";

export function useThemeColor() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useThemeColor must be used within a ThemeColorProvider");
  }
  return context;
}

// Inline script to apply theme before React hydrates (prevents flash)
function ThemeScript({ defaultTheme }: { defaultTheme: string }) {
  const themeMap = themes.reduce((acc, theme) => {
    acc[theme.id] = theme;
    return acc;
  }, {} as Record<string, ThemeColors>);

  const scriptContent = `
    (function() {
      try {
        var themes = ${JSON.stringify(themeMap)};
        var savedThemeId = localStorage.getItem('${STORAGE_KEY}') || '${defaultTheme}';
        var landingMode = localStorage.getItem('${LANDING_MODE_KEY}') === 'light' ? 'light' : 'dark';
        var root = document.documentElement;
        root.dataset.landingMode = landingMode;
        root.classList.toggle('landing-light', landingMode === 'light');
        var theme = themes[savedThemeId] || themes['${defaultTheme}'];
        if (theme) {
          var root = document.documentElement;
          root.style.setProperty('--brand-hue-rotate', theme.brandHueRotate);
          root.style.setProperty('--brand-saturate', theme.brandSaturate);
          root.style.setProperty('--brand-brightness', theme.brandBrightness);
          root.style.setProperty('--color-bg-dark', theme.bgDark);
          root.style.setProperty('--color-bg-card', theme.bgCard);
          root.style.setProperty('--color-syntask-bg', theme.syntaskBg);
          root.style.setProperty('--color-surface-hover', theme.surfaceHover);
          root.style.setProperty('--color-border-primary', theme.borderPrimary);
          root.style.setProperty('--color-border-secondary', theme.borderSecondary);
          root.style.setProperty('--color-brand-primary', theme.brandPrimary);
          root.style.setProperty('--color-brand-primary-light', theme.brandPrimaryLight);
          root.style.setProperty('--color-brand-surface', theme.brandSurface);
          root.style.setProperty('--color-brand-border', theme.brandBorder);
          root.style.setProperty('--color-brand-glow', theme.brandGlow);
          root.style.setProperty('--color-accent', theme.accent);
          root.style.setProperty('--color-button-text', theme.buttonText);
          root.style.setProperty('--color-error', theme.error);
          root.style.setProperty('--color-error-light', theme.errorLight);
          root.style.setProperty('--color-card-bg', theme.cardBg);
          root.style.setProperty('--color-card-bg-inner', theme.cardBgInner);
          root.style.setProperty('--color-card-bg-gradient-start', theme.cardBgGradientStart);
          root.style.setProperty('--color-card-overlay', theme.cardOverlay);
          root.style.setProperty('--color-card-surface', theme.cardSurface);
          root.style.setProperty('--color-card-surface-hover', theme.cardSurfaceHover);
          root.style.setProperty('--color-card-border', theme.cardBorder);
          root.style.setProperty('--color-card-border-hover', theme.cardBorderHover);
          root.style.setProperty('--color-card-highlight-bg', theme.cardHighlightBg);
          root.style.setProperty('--color-card-highlight-border', theme.cardHighlightBorder);
          root.style.setProperty('--color-card-grid', theme.cardGrid);
          root.style.setProperty('--color-card-glow', theme.cardGlow);
          root.style.setProperty('--color-card-glow-secondary', theme.cardGlowSecondary);
          root.style.setProperty('--color-card-spotlight', theme.cardSpotlight);
          root.style.setProperty('--color-card-particle', theme.cardParticle);
          root.style.setProperty('--color-card-accent', theme.cardAccent);
          root.style.setProperty('--color-card-accent-muted', theme.cardAccentMuted);
        }
      } catch (e) {}
    })();
  `;

  return (
    <script
      dangerouslySetInnerHTML={{ __html: scriptContent }}
      suppressHydrationWarning
    />
  );
}

function applyTheme(theme: ThemeColors) {
  const root = document.documentElement;

  // Brand Image Filters
  root.style.setProperty("--brand-hue-rotate", theme.brandHueRotate);
  root.style.setProperty("--brand-saturate", theme.brandSaturate);
  root.style.setProperty("--brand-brightness", theme.brandBrightness);

  // Background Colors
  root.style.setProperty("--color-bg-dark", theme.bgDark);
  root.style.setProperty("--color-bg-card", theme.bgCard);

  // UI Colors
  root.style.setProperty("--color-syntask-bg", theme.syntaskBg);
  root.style.setProperty("--color-surface-hover", theme.surfaceHover);
  root.style.setProperty("--color-border-primary", theme.borderPrimary);
  root.style.setProperty("--color-border-secondary", theme.borderSecondary);

  // Brand Colors
  root.style.setProperty("--color-brand-primary", theme.brandPrimary);
  root.style.setProperty(
    "--color-brand-primary-light",
    theme.brandPrimaryLight
  );
  root.style.setProperty("--color-brand-surface", theme.brandSurface);
  root.style.setProperty("--color-brand-border", theme.brandBorder);
  root.style.setProperty("--color-brand-glow", theme.brandGlow);
  root.style.setProperty("--color-accent", theme.accent);

  // Button Colors
  root.style.setProperty("--color-button-text", theme.buttonText);

  // Error Colors
  root.style.setProperty("--color-error", theme.error);
  root.style.setProperty("--color-error-light", theme.errorLight);

  // Feature Card Colors
  root.style.setProperty("--color-card-bg", theme.cardBg);
  root.style.setProperty("--color-card-bg-inner", theme.cardBgInner);
  root.style.setProperty(
    "--color-card-bg-gradient-start",
    theme.cardBgGradientStart
  );
  root.style.setProperty("--color-card-overlay", theme.cardOverlay);
  root.style.setProperty("--color-card-surface", theme.cardSurface);
  root.style.setProperty("--color-card-surface-hover", theme.cardSurfaceHover);
  root.style.setProperty("--color-card-border", theme.cardBorder);
  root.style.setProperty("--color-card-border-hover", theme.cardBorderHover);
  root.style.setProperty("--color-card-highlight-bg", theme.cardHighlightBg);
  root.style.setProperty(
    "--color-card-highlight-border",
    theme.cardHighlightBorder
  );
  root.style.setProperty("--color-card-grid", theme.cardGrid);
  root.style.setProperty("--color-card-glow", theme.cardGlow);
  root.style.setProperty(
    "--color-card-glow-secondary",
    theme.cardGlowSecondary
  );
  root.style.setProperty("--color-card-spotlight", theme.cardSpotlight);
  root.style.setProperty("--color-card-particle", theme.cardParticle);
  root.style.setProperty("--color-card-accent", theme.cardAccent);
  root.style.setProperty("--color-card-accent-muted", theme.cardAccentMuted);
}

interface ThemeColorProviderProps {
  children: ReactNode;
  defaultTheme?: string;
}

export function ThemeColorProvider({
  children,
  defaultTheme = "purple",
}: ThemeColorProviderProps) {
  const [currentTheme, setCurrentTheme] = useState<ThemeColors>(
    () => themes.find((t) => t.id === defaultTheme) || themes[0]
  );
  const [mounted, setMounted] = useState(false);
  const [landingMode, setLandingModeState] = useState<"dark" | "light">("dark");

  // Load saved theme and landing appearance on mount
  useEffect(() => {
    const savedLandingMode = localStorage.getItem(LANDING_MODE_KEY);
    const initialLandingMode = savedLandingMode === "light" ? "light" : "dark";
    setLandingModeState(initialLandingMode);
    document.documentElement.dataset.landingMode = initialLandingMode;
    document.documentElement.classList.toggle(
      "landing-light",
      initialLandingMode === "light"
    );

    const savedThemeId = localStorage.getItem(STORAGE_KEY);
    if (savedThemeId) {
      const savedTheme = themes.find((t) => t.id === savedThemeId);
      if (savedTheme) {
        setCurrentTheme(savedTheme);
        applyTheme(savedTheme);
      }
    } else {
      applyTheme(currentTheme);
    }
    setMounted(true);
  }, []);

  // Apply theme when it changes
  useEffect(() => {
    if (mounted) {
      applyTheme(currentTheme);
      localStorage.setItem(STORAGE_KEY, currentTheme.id);
    }
  }, [currentTheme, mounted]);

  const setTheme = (themeId: string) => {
    const theme = themes.find((t) => t.id === themeId);
    if (theme) {
      setCurrentTheme(theme);
      localStorage.setItem(STORAGE_KEY, theme.id);
      applyTheme(theme);
    }
  };

  const setLandingMode = (mode: "dark" | "light") => {
    setLandingModeState(mode);
    localStorage.setItem(LANDING_MODE_KEY, mode);
    document.documentElement.dataset.landingMode = mode;
    document.documentElement.classList.toggle("landing-light", mode === "light");
  };

  return (
    <ThemeContext.Provider
      value={{ currentTheme, setTheme, themes, landingMode, setLandingMode }}
    >
      <ThemeScript defaultTheme={defaultTheme} />
      {children}
    </ThemeContext.Provider>
  );
}
