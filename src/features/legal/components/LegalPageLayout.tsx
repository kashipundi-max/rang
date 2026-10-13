"use client";

import { useTranslations } from "next-intl";
import PageHeader from "@/components/shared/PageHeader";

interface LegalPageLayoutProps {
  translationNamespace: string;
  children: React.ReactNode;
}

export default function LegalPageLayout({
  translationNamespace,
  children,
}: LegalPageLayoutProps) {
  const t = useTranslations(`${translationNamespace}.hero`);

  return (
    <main className="relative w-full min-h-screen bg-bg-dark overflow-hidden">
      {/* Hero Section with PageHeader */}
      <PageHeader
        badge={t("badge")}
        title={t("title")}
        description={t("description")}
        breadcrumbItems={[
          { label: t("legalLabel"), href: "/legal/terms" },
          { label: t("badge") },
        ]}
      />

      {/* Content Section */}
      <section className="relative">
        <div className="container mx-auto max-w-[95vw] sm:max-w-[90vw] md:max-w-[900px] px-4 sm:px-6">
          <div className="bg-linear-to-br from-bg-card/60 via-bg-card/40 to-brand-surface/10 backdrop-blur-sm rounded-2xl border border-border-secondary/30 p-6 sm:p-8 md:p-12">
            {children}
          </div>
        </div>
      </section>

      {/* Bottom gradient fade */}
      <div className="absolute bottom-0 inset-x-0 h-32 bg-linear-to-t from-bg-dark to-transparent pointer-events-none" />
    </main>
  );
}
