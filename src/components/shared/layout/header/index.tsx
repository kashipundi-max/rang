"use client";

import { useEffect, useState } from "react";

import { useLocale } from "next-intl";
import { usePathname } from "@/i18n/navigation";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { Logo } from "@/components/Logo";
import { cn } from "@/lib/utils";
import { useNavHighlight, useMobileMenu, useHeaderReveal } from "./hooks";
import {
  DesktopNav,
  MobileMenuButton,
  MobileMenu,
  MobileOverlay,
  HeaderActions,
} from "./components";
import PromotionBanner from "./components/PromotionBanner";

/**
 * Site header.
 *
 * Below `lg` it is a full-width rail that turns solid once the page scrolls;
 * from `lg` up the rail goes transparent and the inner row becomes a floating
 * gradient-bordered pill. In both cases the bar tucks away while scrolling down
 * and comes straight back on the first upward scroll.
 */
export default function Header() {
  const locale = useLocale();
  const pathname = usePathname();
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const controller = new AbortController();

    fetch("/api/auth/me", {
      cache: "no-store",
      signal: controller.signal,
    })
      .then((response) => setIsAuthenticated(response.ok))
      .catch((error) => {
        if (error instanceof DOMException && error.name === "AbortError") return;
        setIsAuthenticated(false);
      });

    return () => controller.abort();
  }, [pathname]);

  const { isMobileMenuOpen, toggleMobileMenu, closeMobileMenu } =
    useMobileMenu();
  const { hoverStyle, setHoveredIndex, navRef, linkRefs } = useNavHighlight();
  const { isScrolled, isHidden } = useHeaderReveal();

  const isHomePage = pathname === "/";
  // The home page carries the promo banner, so the bar sits below it.
  const solid = isScrolled || isMobileMenuOpen;

  return (
    <>
      {isHomePage && <PromotionBanner />}
      <MobileOverlay isOpen={isMobileMenuOpen} onClose={closeMobileMenu} />

      <header
        className={cn(
          "skin-type fixed inset-x-0 z-50 w-full p-3 sm:px-6",
          "transition-transform duration-300 ease-out will-change-transform motion-reduce:transition-none",
          isHomePage ? "top-12 sm:top-[52px]" : "top-0",
          solid
            ? "bg-[#0b0616]/85 border-b border-white/5 backdrop-blur-xl"
            : "border-b border-transparent",
          // From lg the chrome lives on the pill, so the rail itself steps back.
          "lg:border-transparent lg:bg-transparent lg:backdrop-blur-none",
          isHidden && !isMobileMenuOpen && "-translate-y-[150%]"
        )}
      >
        <div className="relative mx-auto w-full px-1 sm:px-2 md:px-6 xl:max-w-7xl 2xl:max-w-360">
          <div className="skin-nav-pill flex items-center gap-4 lg:gap-10 lg:px-6 lg:py-4">
            <div className="flex flex-1 items-center">
              <Logo asLink size="md" className="flex items-center" />
            </div>

            <DesktopNav
              navRef={navRef}
              linkRefs={linkRefs}
              hoverStyle={hoverStyle}
              setHoveredIndex={setHoveredIndex}
            />

            <div className="flex flex-1 items-center justify-end gap-2">
              <LanguageSwitcher currentLocale={locale} variant="ghost" />
              <HeaderActions isAuthenticated={isAuthenticated} />
              <MobileMenuButton
                isOpen={isMobileMenuOpen}
                onToggle={toggleMobileMenu}
              />
            </div>
          </div>
        </div>

        <MobileMenu
          isOpen={isMobileMenuOpen}
          onClose={closeMobileMenu}
          locale={locale}
          isAuthenticated={isAuthenticated}
        />
      </header>
    </>
  );
}
