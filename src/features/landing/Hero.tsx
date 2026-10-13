import { useTranslations } from "next-intl";
import { IconShieldCheck } from "@tabler/icons-react";
import { DashboardMock } from "./DashboardMock";
import { PrimaryLink, SecondaryLink } from "./ui";

const RULES_URL = "https://help.range4ex.com";

/**
 * Static hero: centered two-line title (white + glowing gradient), two pill
 * buttons, a trust row, and the dashboard preview in a browser frame that
 * overlaps the bottom of the section on desktop.
 */
export default function Hero() {
  const t = useTranslations("HeroSection");

  return (
    <section className="relative overflow-hidden rounded-t-3xl pt-24 sm:pt-32 lg:min-h-[1060px] lg:pt-40">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-35"
        style={{
          background:
            "radial-gradient(118.44% 121.56% at 50% 8.94%, rgba(12,14,18,0) 0%, rgba(12,14,18,0) 48.79%, #9333ea 71.32%, #f0e2ff 100%)",
        }}
      />

      <div className="relative z-10 mx-auto flex w-full max-w-7xl flex-col items-center gap-8 px-4 sm:gap-10 sm:px-6 lg:gap-12 lg:px-8">
        <div className="flex w-full max-w-[1024px] flex-col items-center gap-4 text-center">
          <span className="rounded-lg border border-(--brand-border-strong) bg-(--brand-primary-surface) px-[10px] py-1 text-sm leading-5 font-medium text-(--brand-text-secondary)">
            {t("badge")}
          </span>
          <div className="flex w-full flex-col items-center gap-2 sm:gap-3">
            <h1 className="w-full text-[36px] leading-[44px] font-semibold tracking-[-0.02em] text-[#f7f7f7] sm:text-[48px] sm:leading-[58px] lg:text-[60px] lg:leading-[72px]">
              {t("title1")}
            </h1>
            <p
              className="skin-gradient-text w-full font-heading text-[36px] leading-[44px] font-semibold tracking-[-0.02em] sm:text-[48px] sm:leading-[58px] lg:text-[60px] lg:leading-[72px]"
            >
              {t("title2")}
            </p>
            <p className="max-w-[812px] px-2 text-base leading-6 text-(--brand-text-secondary) sm:text-lg sm:leading-7 lg:text-xl lg:leading-7.5">
              {t("description")}
            </p>
          </div>
        </div>

        <div className="flex w-full flex-col items-center gap-3 sm:w-auto sm:flex-row">
          <PrimaryLink href="#evaluation-plans" arrow className="w-full sm:w-auto">
            {t("cta")}
          </PrimaryLink>
          <SecondaryLink href={RULES_URL} className="w-full sm:w-auto">
            {t("ctaSecondary")}
          </SecondaryLink>
        </div>

        <div className="flex items-center gap-2 py-1 text-sm leading-5 font-medium text-(--brand-text-secondary)">
          <IconShieldCheck className="size-4 text-[#EAAA08]" stroke={2} />
          <span>{t("trustBadge")}</span>
        </div>

        {/* Mobile / tablet: preview flows under the copy */}
        <DashboardMock className="mb-12 w-full max-w-[720px] lg:hidden" />
      </div>

      {/* Desktop: preview hangs off the bottom edge */}
      <div className="absolute top-[610px] left-1/2 z-20 hidden -translate-x-1/2 lg:block">
        <DashboardMock className="w-[1074px] max-w-[calc(100vw-1.5rem)]" />
      </div>
    </section>
  );
}
