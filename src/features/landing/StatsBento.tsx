import { useTranslations } from "next-intl";
import { CHALLENGE_RULES } from "@/lib/rulebook";
import { Container } from "./ui";

const STATS = [
  { value: "10K", suffix: "+", key: "stat1" },
  { value: "350", suffix: "%", key: "stat2" },
  { value: "99.9", suffix: "%", key: "stat3" },
] as const;

const PLATFORMS = [
  { src: "/mt5.png", alt: "MetaTrader 5" },
  { src: "/mt4.png", alt: "MetaTrader 4" },
];

function Stat({
  value,
  suffix,
  label,
  compact = false,
}: {
  value: string;
  suffix: string;
  label: string;
  compact?: boolean;
}) {
  return (
    <div className={compact ? "flex flex-col items-center gap-1 text-center" : "flex flex-1 flex-col items-start gap-1 text-left"}>
      <div className="flex items-start gap-2 font-heading font-semibold whitespace-nowrap">
        <span
          className={
            compact
              ? "text-[30px] leading-[38px] text-(--brand-text-primary)"
              : "text-[36px] leading-[44px] tracking-[-0.72px] text-(--brand-text-primary)"
          }
        >
          {value}
        </span>
        <span className={compact ? "text-base leading-6 text-(--brand-positive)" : "text-lg leading-7 text-(--brand-positive)"}>
          {suffix}
        </span>
      </div>
      <p className="text-sm leading-5 text-(--brand-text-secondary)">{label}</p>
    </div>
  );
}

function PlatformMarquee({ height }: { height: string }) {
  // Four copies so the -50% loop never shows a gap with only two logos.
  const logos = [...PLATFORMS, ...PLATFORMS, ...PLATFORMS, ...PLATFORMS];
  return (
    <div className="skin-marquee flex w-max items-center gap-6">
      {[...logos, ...logos].map((logo, index) => (
        <img
          key={index}
          src={logo.src}
          alt={index < logos.length ? logo.alt : ""}
          aria-hidden={index >= logos.length}
          loading="lazy"
          className={`${height} w-auto shrink-0 object-contain`}
        />
      ))}
    </div>
  );
}

/** Key numbers, platforms and the program summary as a 5-column bento. */
export default function StatsBento() {
  const t = useTranslations("StatisticsSection");
  const pathCount = Object.keys(CHALLENGE_RULES).length;

  return (
    <section id="about" className="w-full scroll-mt-24 py-12 sm:py-16">
      <Container>
        {/* Mobile */}
        <div className="flex flex-col gap-10 lg:hidden">
          <div className="flex items-start justify-between gap-2 rounded-2xl bg-(--brand-primary-surface) px-4 py-6">
            {STATS.map((stat) => (
              <Stat
                key={stat.key}
                compact
                value={stat.value}
                suffix={stat.suffix}
                label={t(`stats.${stat.key}.label`)}
              />
            ))}
          </div>
          <div className="relative w-full overflow-x-hidden">
            <PlatformMarquee height="max-h-12 h-12" />
          </div>
        </div>

        {/* Desktop */}
        <div className="relative hidden gap-2 bg-[radial-gradient(42.54%_42.54%_at_57.46%_50%,#24143d,transparent)] lg:grid lg:grid-cols-5 lg:grid-rows-2">
          <div className="col-span-3 flex h-[148px] items-center rounded-br-[20px] bg-(--brand-primary-surface) px-6">
            <div className="flex w-full items-center justify-between gap-6">
              {STATS.map((stat, index) => (
                <div key={stat.key} className="contents">
                  {index > 0 && <span className="h-12 w-px bg-(--brand-border-card)/60" />}
                  <Stat value={stat.value} suffix={stat.suffix} label={t(`stats.${stat.key}.label`)} />
                </div>
              ))}
            </div>
          </div>

          <div className="col-span-2 flex h-[148px] items-center overflow-hidden rounded-bl-[20px] bg-(--brand-primary-surface) px-6">
            <div className="flex w-full flex-col items-start gap-1">
              <div className="flex w-full items-center gap-2">
                <span className="font-heading text-[36px] leading-[44px] font-semibold tracking-[-0.72px] text-(--brand-text-primary)">
                  {PLATFORMS.length}
                </span>
                <span className="text-lg leading-7 font-semibold text-(--brand-positive)">+</span>
                <div className="skin-marquee-mask ml-2 flex-1 overflow-hidden">
                  <PlatformMarquee height="h-[50px]" />
                </div>
              </div>
              <p className="text-sm leading-5 text-(--brand-text-muted)">Trading platforms</p>
            </div>
          </div>

          <div className="col-span-4 flex h-[148px] items-center rounded-tr-[20px] bg-(--brand-primary-surface) px-6">
            <div className="flex w-full flex-col items-start gap-1">
              <p className="font-heading text-2xl leading-8 font-semibold text-(--brand-text-secondary)">
                {t("title")}
              </p>
              <p className="max-w-[640px] text-sm leading-5 text-(--brand-text-muted)">
                {t("description")}
              </p>
            </div>
          </div>

          <div className="col-span-1 flex h-[148px] items-center rounded-tl-[20px] bg-(--brand-primary-surface) px-6">
            <div className="flex w-full flex-col items-start gap-1">
              <div className="flex items-start gap-2 font-heading font-semibold">
                <span className="text-[36px] leading-[44px] tracking-[-0.72px] text-(--brand-text-primary)">
                  {pathCount}
                </span>
                <span className="text-lg leading-7 text-(--brand-positive)">paths</span>
              </div>
              <p className="text-sm leading-5 text-(--brand-text-secondary)">{t("badge")}</p>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
