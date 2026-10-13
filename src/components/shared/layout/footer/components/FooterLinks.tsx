"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { footerLinksConfig } from "../config/navigation";

export default function FooterLinks() {
  const t = useTranslations("Footer");

  return (
    <>
      {footerLinksConfig.map((section) => (
        <div key={section.titleKey}>
          <h3 className="font-medium text-text-primary text-sm uppercase tracking-wider mb-4">
            {t(`sections.${section.titleKey}`)}
          </h3>
          <ul className="space-y-3">
            {section.links.map((link) => (
              <li key={link.labelKey}>
                {link.href.startsWith("#") || link.href.startsWith("http") ? (
                  <a
                    href={link.href}
                    {...(link.href.startsWith("http")
                      ? { target: "_blank", rel: "noopener noreferrer" }
                      : {})}
                    className="text-text-body text-sm hover:text-white transition-colors duration-200"
                  >
                    {t(`links.${link.labelKey}`)}
                  </a>
                ) : (
                  <Link
                    href={link.href}
                    className="text-text-body text-sm hover:text-white transition-colors duration-200"
                  >
                    {t(`links.${link.labelKey}`)}
                  </Link>
                )}
              </li>
            ))}
          </ul>
        </div>
      ))}
    </>
  );
}
