"use client";
import { RefObject } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { NavHighlight } from "./NavHighlight";
import { navigationConfig } from "../config/navigation";

interface DesktopNavProps {
  navRef: RefObject<HTMLElement | null>;
  linkRefs: RefObject<(HTMLAnchorElement | null)[]>;
  hoverStyle: { left: number; width: number; opacity: number };
  setHoveredIndex: (index: number | null) => void;
}

export function DesktopNav({
  navRef,
  linkRefs,
  hoverStyle,
  setHoveredIndex,
}: DesktopNavProps) {
  const t = useTranslations("Header");

  return (
    <nav
      ref={navRef}
      className="relative hidden shrink-0 items-center gap-1 lg:flex"
      onMouseLeave={() => setHoveredIndex(null)}
    >
      {/* Sliding background indicator */}
      <NavHighlight
        left={hoverStyle.left}
        width={hoverStyle.width}
        opacity={hoverStyle.opacity * 0.6}
      />

      {navigationConfig.map((link, index) => {
        const className =
          "relative z-10 rounded-md px-3 py-2 text-center text-sm leading-5 font-semibold text-[#f5f8fa] transition-colors duration-300 ease-out select-none hover:text-white";
        const setRef = (el: HTMLAnchorElement | null) => {
          linkRefs.current[index] = el;
        };

        if (link.href.startsWith("http")) {
          return (
            <a
              key={index}
              ref={setRef}
              href={link.href}
              target="_blank"
              rel="noopener noreferrer"
              onMouseEnter={() => setHoveredIndex(index)}
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
            ref={setRef}
            href={link.href}
            onMouseEnter={() => setHoveredIndex(index)}
            className={className}
            style={{ minWidth: link.minWidth }}
          >
            {t(link.labelKey)}
          </Link>
        );
      })}
    </nav>
  );
}
