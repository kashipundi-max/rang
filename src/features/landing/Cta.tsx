import { useTranslations } from "next-intl";
import { IconBrandDiscord, IconCheck, IconLifebuoy } from "@tabler/icons-react";
import { DISCORD_INVITE_URL } from "@/config/community";
import { CHALLENGE_RULES } from "@/lib/rulebook";
import { DashboardMock } from "./DashboardMock";
import { Container, PrimaryLink, SecondaryLink } from "./ui";

const HELP_CENTER_URL = "https://help.range4ex.com";

/** Closing CTA card, a trust strip, and the community / help cards. */
export default function Cta() {
  const t = useTranslations("CtaSection");
  const stats = useTranslations("StatisticsSection.stats");
  const community = useTranslations("FeaturesSection.card2");
  const rule = CHALLENGE_RULES.two_step_standard;

  const points = [
    { lead: "Choose from", strong: `${Object.keys(CHALLENGE_RULES).length} evaluation paths` },
    { lead: "Performance split", strong: `up to ${rule.profitSplitPercent}%` },
    { lead: "Clear objectives with", strong: "static drawdown limits" },
  ];

  const trust = [
    { value: "10K+", label: stats("stat1.label") },
    { value: "350%", label: stats("stat2.label") },
    { value: "99.9%", label: stats("stat3.label") },
  ];

  return (
    <>
      <section id="contact" className="isolate flex w-full scroll-mt-24 flex-col items-center gap-12 py-24">
        <Container className="flex flex-col gap-8">
          <div className="skin-glow-card relative overflow-hidden rounded-2xl md:overflow-visible">
            <div
              className="absolute inset-0 rounded-[inherit]"
              style={{
                background:
                  "radial-gradient(60% 80% at 0% 0%, rgb(var(--brand-300-rgb) / 0.4), rgba(91,33,182,0.25) 30%, rgb(var(--brand-surface-card-rgb) / 0) 60%), linear-gradient(0deg, var(--brand-surface-card), var(--brand-surface-card))",
              }}
            />
            <span className="skin-glow-inset z-10" />
            <div className="relative flex flex-col gap-12 px-6 py-12 sm:px-12 md:grid lg:grid-cols-[1fr_auto] lg:px-16 lg:py-12">
              <div className="flex max-w-[660px] flex-col gap-6">
                <h2 className="text-3xl leading-[1.2] font-semibold tracking-[-0.02em] text-(--brand-text-primary) sm:text-4xl lg:text-[48px] lg:leading-[60px]">
                  {t("title")}
                </h2>
                <p className="text-base leading-7 text-(--brand-text-secondary)">{t("description")}</p>
                <ul className="flex flex-col gap-4">
                  {points.map((point) => (
                    <li key={point.strong} className="flex items-center gap-2">
                      <IconCheck className="size-5 shrink-0 text-(--brand-300)" />
                      <p className="text-sm leading-5">
                        <span className="text-(--brand-text-secondary)">{point.lead} </span>
                        <span className="font-semibold text-(--brand-text-primary)">{point.strong}</span>
                      </p>
                    </li>
                  ))}
                </ul>
                <div>
                  <PrimaryLink href="#evaluation-plans">{t("contactForm.cta")}</PrimaryLink>
                </div>
              </div>

              <div className="ml-auto flex w-full md:ml-0 lg:w-[460px] lg:items-center lg:justify-center">
                <div className="relative w-full max-w-[520px] rounded-[28px] bg-black p-3 shadow-[0_30px_60px_-20px_rgba(0,0,0,0.5)] lg:absolute lg:top-[-40px] lg:right-4 lg:w-[540px] lg:max-w-none">
                  <DashboardMock framed={false} sidebar={false} className="overflow-hidden rounded-[20px]" />
                  <div className="pointer-events-none absolute inset-x-[-15px] -bottom-2 h-1/3 bg-linear-to-t from-(--brand-surface-card) to-transparent" />
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col items-start gap-8 px-2 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex max-w-[640px] flex-col gap-3">
              <h3 className="text-2xl leading-9 font-semibold text-(--brand-text-primary) sm:text-[30px] sm:leading-[38px]">
                {t("contactForm.title")}
              </h3>
              <p className="text-base leading-7 text-(--brand-text-secondary) sm:text-lg">{t("contactForm.description")}</p>
            </div>
            <div className="flex w-full flex-wrap items-stretch gap-6 lg:w-auto lg:flex-nowrap lg:gap-8">
              {trust.map((item, index) => (
                <div key={item.label} className="flex items-stretch gap-6 lg:gap-8">
                  {index > 0 && <div className="hidden w-px self-stretch bg-(--brand-border-strong) lg:block" />}
                  <div className="flex min-w-[120px] flex-1 flex-col gap-2 lg:min-w-[140px] lg:flex-none">
                    <p className="font-heading text-2xl leading-9 font-semibold text-(--brand-text-primary) sm:text-[30px] sm:leading-[38px]">
                      {item.value}
                    </p>
                    <p className="text-sm leading-5 text-(--brand-text-secondary)">{item.label}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Container>
      </section>

      <section className="isolate flex w-full flex-col items-center pt-12 pb-40">
        <Container className="grid grid-cols-1 gap-12 lg:grid-cols-2">
          <div className="flex flex-col items-stretch gap-4 rounded-xl">
            <div
              className="relative flex h-[316px] w-full items-center justify-center overflow-hidden rounded-xl"
              style={{ background: "radial-gradient(92.86% 72.02% at 50% 50%, #615FF6 0%, #393890 100%)" }}
            >
              <IconBrandDiscord className="size-40 text-white/90" stroke={1.2} />
            </div>
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <IconBrandDiscord className="size-6 text-[#615ff6]" />
                <span className="text-sm leading-5 font-semibold text-[#615ff6]">Discord</span>
                <span className="flex-1 text-sm leading-5 text-(--brand-text-secondary)">{community("teamChat")}</span>
              </div>
              <h3 className="text-2xl leading-8 font-semibold text-(--brand-text-primary)">{community("title")}</h3>
              <p className="text-base leading-6 text-(--brand-text-secondary)">{community("description")}</p>
            </div>
            <div className="mt-4">
              <SecondaryLink href={DISCORD_INVITE_URL} small>
                Join the Community
              </SecondaryLink>
            </div>
          </div>

          <div className="flex flex-col items-stretch gap-4 rounded-xl">
            <div
              className="relative flex h-[316px] w-full items-center justify-center overflow-hidden rounded-xl"
              style={{ background: "radial-gradient(60% 100% at 50% 50%, #9333ea 0%, #5b21b6 50%, #2a1250 100%)" }}
            >
              <IconLifebuoy className="size-40 text-white/90" stroke={1.2} />
            </div>
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <IconLifebuoy className="size-6 text-(--brand-300)" />
                <span className="text-sm leading-5 font-semibold text-(--brand-300)">Help Center</span>
                <span className="flex-1 text-sm leading-5 text-(--brand-text-secondary)">helpdesk@range4ex.com</span>
              </div>
              <h3 className="text-2xl leading-8 font-semibold text-(--brand-text-primary)">Rulebook &amp; support</h3>
              <p className="text-base leading-6 text-(--brand-text-secondary)">{t("contactForm.disclaimer")}</p>
            </div>
            <div className="mt-4">
              <SecondaryLink href={HELP_CENTER_URL} small>
                Visit the Help Center
              </SecondaryLink>
            </div>
          </div>
        </Container>
      </section>
    </>
  );
}
