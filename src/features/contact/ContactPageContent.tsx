"use client";

import { useTranslations } from "next-intl";
import {
  ContactForm,
  ContactInfo,
  ContactFaq,
} from "@/features/contact/components";
import PageHeader from "@/components/shared/PageHeader";

export default function ContactPageContent() {
  const t = useTranslations("ContactPage.hero");

  return (
    <main className="relative w-full min-h-screen bg-bg-dark overflow-hidden">
      {/* Hero Section with PageHeader */}
      <PageHeader
        badge={t("badge")}
        title={t("title")}
        description={t("description")}
        breadcrumbItems={[{ label: t("badge") }]}
      />

      {/* Main Contact Section */}
      <section className="relative pb-2">
        <div className="container mx-auto max-w-[95vw] sm:max-w-[90vw] md:max-w-[1250px] px-4 sm:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 lg:gap-12">
            {/* Contact Form - Takes 3 columns */}
            <div className="lg:col-span-3">
              <ContactForm />
            </div>

            {/* Contact Info - Takes 2 columns */}
            <div className="lg:col-span-2">
              <div className="sticky top-24">
                <ContactInfo />
              </div>
            </div>
          </div>

          {/* FAQ Section */}
          <ContactFaq />
        </div>
      </section>
    </main>
  );
}
