import type { ReactNode } from "react";
import { useTranslations } from "next-intl";
import { IconAlertTriangle, IconBell, IconSearch, IconSend } from "@tabler/icons-react";
import { cn } from "@/lib/utils";
import { Container, SectionHeading, splitTitle } from "./ui";

function Tile({
  title,
  description,
  large = false,
  className,
  children,
}: {
  title: string;
  description: string;
  large?: boolean;
  className?: string;
  children: ReactNode;
}) {
  return (
    <div className={cn("relative isolate flex h-[420px] flex-col gap-4 overflow-hidden rounded-xl bg-(--brand-border-card) lg:h-[480px]", className)}>
      <div className="flex w-full flex-col gap-2 p-8 pb-0">
        <h3
          className={cn(
            "w-full font-semibold text-(--brand-text-primary)",
            large ? "text-2xl leading-8 sm:text-[36px] sm:leading-[44px] sm:tracking-[-0.02em]" : "text-2xl leading-8"
          )}
        >
          {title}
        </h3>
        <p className="text-base leading-6 text-(--brand-text-secondary)">{description}</p>
      </div>
      <div className="relative min-h-0 w-full flex-1 px-8">
        {children}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/3 bg-linear-to-t from-(--brand-border-card) to-transparent" />
      </div>
    </div>
  );
}

function Panel({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={cn("rounded-2xl border border-(--brand-border-strong)/70 bg-(--brand-surface-card) p-4 shadow-[0_20px_40px_-20px_rgba(0,0,0,0.6)]", className)}>
      {children}
    </div>
  );
}

function AlertsVisual() {
  const t = useTranslations("FeaturesSection.card1");
  const rows = [t("followers.name1"), t("followers.name2"), t("followers.name3")];
  return (
    <Panel className="mx-auto mt-2 flex max-w-[460px] flex-col gap-2.5">
      {rows.map((name, index) => (
        <div
          key={name}
          className={cn(
            "flex items-center gap-3 rounded-xl border px-3 py-2.5",
            index === 0 ? "border-(--brand-300)/40 bg-(--brand-card-tint)" : "border-(--brand-border-card) bg-(--brand-primary-surface)"
          )}
        >
          <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-[#9333ea]/20 text-(--brand-300)">
            {index === 0 ? <IconAlertTriangle size={18} /> : <IconBell size={18} />}
          </span>
          <span className="min-w-0 flex-1">
            <span className="block truncate text-sm font-semibold text-(--brand-text-primary)">{name}</span>
            <span className="block text-xs text-(--brand-text-muted)">{t("startedFollowing")}</span>
          </span>
          <span className="rounded-full border border-(--brand-border-strong) px-2.5 py-1 text-[11px] font-semibold text-(--brand-text-secondary)">
            {t("view")}
          </span>
        </div>
      ))}
    </Panel>
  );
}

function CommunityVisual() {
  const t = useTranslations("FeaturesSection.card2");
  const messages = ["msg1", "msg2", "msg3"] as const;
  return (
    <Panel className="mx-auto mt-2 flex max-w-[420px] flex-col gap-3">
      <p className="text-sm font-semibold text-(--brand-text-primary)">{t("teamChat")}</p>
      {messages.map((key) => {
        const mine = key === "msg3";
        return (
          <div key={key} className={cn("flex flex-col gap-1", mine ? "items-end" : "items-start")}>
            <span className="text-[11px] text-(--brand-text-muted)">
              {t(`messages.${key}.name`)} · {t(`messages.${key}.time`)}
            </span>
            <span
              className={cn(
                "max-w-[85%] rounded-2xl px-3 py-2 text-xs leading-5",
                mine ? "bg-[#9333ea] text-white" : "bg-(--brand-border-card) text-(--brand-text-secondary)"
              )}
            >
              {t(`messages.${key}.message`)}
            </span>
          </div>
        );
      })}
      <div className="flex items-center gap-2 rounded-full border border-(--brand-border-card) bg-(--brand-primary-surface) py-1.5 pr-1.5 pl-3">
        <span className="flex-1 truncate text-xs text-(--brand-text-muted)">{t("typeMessage")}</span>
        <span className="flex size-7 items-center justify-center rounded-full bg-[#9333ea] text-white">
          <IconSend size={14} />
        </span>
      </div>
    </Panel>
  );
}

// Illustrative progression curve, not account data.
const GROWTH = [8, 12, 11, 18, 17, 24, 29, 27, 35, 42, 40, 51];

function ProgressionVisual() {
  const t = useTranslations("FeaturesSection.card3");
  const max = Math.max(...GROWTH);
  const line = GROWTH.map((v, i) => `${(i / (GROWTH.length - 1)) * 100},${48 - (v / max) * 42}`).join(" L");
  return (
    <Panel className="mx-auto mt-2 max-w-[420px]">
      <div className="flex items-center justify-between">
        <span className="text-xs text-(--brand-text-muted)">{t("growthRate")}</span>
        <span className="rounded-full bg-(--brand-positive)/15 px-2 py-0.5 text-[11px] font-semibold text-(--brand-positive)">
          {t("vsLastQuarter")}
        </span>
      </div>
      <p className="mt-1 font-heading text-2xl font-semibold text-(--brand-text-primary)">
        {t("target")}
      </p>
      <svg viewBox="0 0 100 50" preserveAspectRatio="none" className="mt-3 h-32 w-full" aria-hidden>
        <defs>
          <linearGradient id="why-growth" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="#a855f7" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#a855f7" stopOpacity="0" />
          </linearGradient>
        </defs>
        <path d={`M${line} L100,50 L0,50 Z`} fill="url(#why-growth)" />
        <path d={`M${line}`} fill="none" stroke="#a855f7" strokeWidth="1.2" vectorEffect="non-scaling-stroke" />
      </svg>
    </Panel>
  );
}

function TrackerVisual() {
  const rows = [
    { label: "Daily limit used", pct: 32 },
    { label: "Overall limit used", pct: 18 },
    { label: "Objective progress", pct: 64 },
  ];
  return (
    <Panel className="mx-auto mt-2 flex max-w-[420px] flex-col gap-4">
      {rows.map((row) => (
        <div key={row.label}>
          <div className="flex justify-between text-xs">
            <span className="text-(--brand-text-secondary)">{row.label}</span>
            <span className="font-semibold text-(--brand-text-primary)">{row.pct}%</span>
          </div>
          <div className="mt-2 h-2 overflow-hidden rounded-full bg-(--brand-border-card)">
            <div className="h-full rounded-full bg-linear-to-r from-(--primary-800) to-(--brand-300)" style={{ width: `${row.pct}%` }} />
          </div>
        </div>
      ))}
    </Panel>
  );
}

const BARS = [38, 62, 45, 80, 56, 92, 70, 48, 66, 84];

function InsightsVisual() {
  const t = useTranslations("FeaturesSection.card5");
  return (
    <Panel className="mx-auto mt-2 max-w-[640px]">
      <div className="flex items-center gap-2 rounded-full border border-(--brand-border-card) bg-(--brand-primary-surface) px-3 py-2">
        <IconSearch size={14} className="text-(--brand-text-muted)" />
        <span className="text-xs text-(--brand-text-muted)">{t("searchPlaceholder")}</span>
      </div>
      <div className="mt-4 flex h-36 items-end gap-2">
        {BARS.map((height, index) => (
          <span
            key={index}
            className={cn("flex-1 rounded-t-md", index === 5 ? "bg-(--brand-300)" : "bg-(--brand-border-strong)")}
            style={{ height: `${height}%` }}
          />
        ))}
      </div>
    </Panel>
  );
}

/** Feature bento: five tiles in a 3+2 / 2+3 / full-width rhythm. */
export default function WhyUs() {
  const t = useTranslations("FeaturesSection");
  const [lead, accent] = splitTitle(t("title"), 3);

  return (
    <section id="features" className="isolate flex w-full scroll-mt-24 flex-col items-center bg-(--brand-surface-card)/50 py-12 sm:py-16 lg:py-24">
      <Container className="flex flex-col items-center gap-12 sm:gap-16 lg:gap-20">
        <SectionHeading eyebrow={t("badge")} lead={lead} accent={accent} description={t("description")} />

        <div className="grid w-full grid-cols-1 gap-2 sm:gap-3 md:grid-cols-3 lg:grid-cols-5">
          <Tile large title={t("card1.title")} description={t("card1.description")} className="md:col-span-2 lg:col-span-3">
            <AlertsVisual />
          </Tile>
          <Tile title={t("card2.title")} description={t("card2.description")} className="md:col-span-1 lg:col-span-2">
            <CommunityVisual />
          </Tile>
          <Tile title={t("card3.title")} description={t("card3.description")} className="md:col-span-1 lg:col-span-2">
            <ProgressionVisual />
          </Tile>
          <Tile large title={t("card4.title")} description={t("card4.description")} className="md:col-span-2 lg:col-span-3">
            <TrackerVisual />
          </Tile>
          <Tile large title={t("card5.title")} description={t("card5.description")} className="md:col-span-3 lg:col-span-5 lg:h-[420px]">
            <InsightsVisual />
          </Tile>
        </div>
      </Container>
    </section>
  );
}
