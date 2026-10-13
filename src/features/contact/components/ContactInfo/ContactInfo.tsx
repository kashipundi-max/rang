"use client";

import { useTranslations } from "next-intl";
import { Divider } from "@/components/Divider";
import { Card } from "@/components/Card";
import { ContactItemsList, SocialLinks, ResponseBadge } from "./components";

export function ContactInfo() {
  const t = useTranslations("ContactSection.info");

  return (
    <Card animated className="h-full">
      <div className="space-y-3">
        {/* Contact Items */}
        <ContactItemsList />

        {/* Quick Response Badge */}
        <ResponseBadge />

        {/* Divider */}
        <Divider className="my-5" text={t("social.label")} />

        {/* Social Links */}
        <SocialLinks />
      </div>
    </Card>
  );
}
