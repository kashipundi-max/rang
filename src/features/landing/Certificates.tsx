"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { certificates } from "@/features/home/CertificatesSection/config/certificates";
import { cn } from "@/lib/utils";
import { Container, Eyebrow, SectionHeading, splitTitle } from "./ui";

/**
 * Payout certificates: one large certificate in a gradient-bordered frame
 * that fades out at the bottom, with a row of thumbnails under a hairline to
 * switch between them.
 */
export default function Certificates() {
  const t = useTranslations("CertificatesSection");
  const [active, setActive] = useState(0);
  const [lead, accent] = splitTitle(t("title"), 1);

  return (
    <section
      id="payouts"
      className="relative w-full scroll-mt-24 bg-linear-to-b from-(--brand-surface-card)/50 to-(--brand-surface-card)/0"
    >
      <Container className="pt-8 sm:pt-12">
        <Eyebrow>{t("badge")}</Eyebrow>
      </Container>

      <Container className="mt-4 flex flex-col items-center gap-8 pb-20 sm:gap-10 sm:pb-28">
        <SectionHeading lead={lead} accent={accent} description={t("description")} />

        <div className="flex w-full max-w-[880px] flex-col items-center">
          <div className="relative aspect-[1.62/1] w-full rounded-2xl border-[1.458px] border-transparent [background:linear-gradient(#0b0616,#0b0616)_padding-box,linear-gradient(180deg,rgb(168_85_247/0.6),rgb(168_85_247/0)_70%)_border-box]">
            <div
              className="absolute top-3 right-3 bottom-0 left-3 overflow-hidden rounded-t-md sm:top-6 sm:right-6 sm:left-6"
              style={{
                maskImage: "linear-gradient(to bottom, #000 78%, transparent 100%)",
                WebkitMaskImage: "linear-gradient(to bottom, #000 78%, transparent 100%)",
              }}
            >
              {certificates.map((item, index) => (
                <img
                  key={item.image}
                  src={item.image}
                  alt={item.alt}
                  loading={index === 0 ? "eager" : "lazy"}
                  className={cn(
                    "absolute inset-0 h-full w-full object-cover object-top transition-opacity duration-500",
                    index === active ? "opacity-100" : "opacity-0"
                  )}
                />
              ))}
            </div>
          </div>

          <div className="relative mt-6 grid w-full grid-cols-3 gap-2 sm:grid-cols-6 lg:mt-10">
            <span className="absolute inset-x-0 -top-3 h-px bg-linear-to-r from-(--brand-border-card)/0 via-(--brand-border-card) to-(--brand-border-card)/0" />
            {certificates.map((item, index) => (
              <button
                key={item.image}
                type="button"
                onClick={() => setActive(index)}
                aria-label={`Show certificate ${index + 1}`}
                aria-pressed={index === active}
                className={cn(
                  "relative cursor-pointer overflow-hidden rounded-lg border transition-opacity duration-300",
                  index === active ? "border-(--brand-300)/70 opacity-100" : "border-(--brand-border-card) opacity-40 hover:opacity-70"
                )}
              >
                <img src={item.image} alt="" loading="lazy" className="aspect-[3/2] w-full object-cover" />
              </button>
            ))}
          </div>

          <p className="mt-4 text-center text-xs text-(--brand-text-muted)">Select a certificate to view it.</p>
        </div>
      </Container>
    </section>
  );
}
