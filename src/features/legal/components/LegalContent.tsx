"use client";

import { useTranslations } from "next-intl";

interface LegalContentProps {
  translationNamespace: string;
  sectionsCount?: number;
}

export default function LegalContent({
  translationNamespace,
  sectionsCount = 7,
}: LegalContentProps) {
  const t = useTranslations(`${translationNamespace}.content`);

  // Build sections array based on provided count
  const sections: { title: string; text: string }[] = [];

  for (let i = 0; i < sectionsCount; i++) {
    sections.push({
      title: t(`sections.${i}.title`),
      text: t(`sections.${i}.text`),
    });
  }

  return (
    <div className="prose prose-invert max-w-none">
      {/* Last Updated */}
      <p className="text-text-tertiary text-sm mb-8">{t("lastUpdated")}</p>

      {/* Introduction */}
      <p className="text-text-secondary text-base leading-relaxed mb-8">
        {t("introduction")}
      </p>

      {/* Sections */}
      {sections.map((section, index) => (
        <div key={index} className="mb-8">
          <h2 className="text-xl font-semibold text-text-primary mb-4">
            {index + 1}. {section.title}
          </h2>
          <p className="text-text-secondary text-base leading-relaxed whitespace-pre-line">
            {section.text}
          </p>
        </div>
      ))}

      {/* Contact Section */}
      <div className="mt-12 pt-8 border-t border-border-secondary/30">
        <h2 className="text-xl font-semibold text-text-primary mb-4">
          {t("contact.title")}
        </h2>
        <p className="text-text-secondary text-base leading-relaxed">
          {t("contact.text")}
        </p>
      </div>
    </div>
  );
}
