import type { Icon } from "@tabler/icons-react";
import { steps } from "@/features/home/HowItWorksSection/config/steps";
import { cn } from "@/lib/utils";
import { Container, PrimaryLink, SecondaryLink, SectionHeading } from "./ui";

function StepIcon({ icon: IconComponent, faded = false }: { icon: Icon; faded?: boolean }) {
  return (
    <span
      className={cn(
        "relative flex size-12 shrink-0 items-center justify-center rounded-full bg-[#9333ea] text-(--brand-text-primary)",
        faded ? "opacity-20" : "ring-2 ring-[#ecdcff] shadow-[0px_-2px_4px_2px_rgb(var(--brand-300-rgb)/0.1)]"
      )}
    >
      <IconComponent className="size-6" stroke={1.8} />
      <span className="pointer-events-none absolute inset-0 rounded-full shadow-[inset_0px_0px_0px_1px_rgba(12,14,18,0.18),inset_0px_-2px_0px_0px_rgba(12,14,18,0.05)]" />
    </span>
  );
}

function StepCard({
  step,
  align = "start",
  className,
}: {
  step: (typeof steps)[number];
  align?: "start" | "end";
  className?: string;
}) {
  const end = align === "end";
  return (
    <div
      className={cn(
        "skin-glow-card relative flex flex-col justify-center overflow-hidden rounded-2xl border border-(--brand-border-card) bg-(--brand-primary-surface) p-6",
        className
      )}
    >
      <span
        className="pointer-events-none absolute inset-0 rounded-2xl"
        style={{ backgroundImage: "linear-gradient(180deg, var(--brand-card-tint) 0%, #0b0616 100%)" }}
      />
      <span className="skin-glow-inset rounded-2xl" />
      <div className={cn("relative flex h-full flex-col justify-between gap-3", end ? "items-end text-right" : "items-start text-left")}>
        <StepIcon icon={step.icon} />
        <div className={cn("flex w-full flex-col gap-3", end ? "items-end" : "items-start")}>
          <h3 className="w-full text-[26px] leading-[34px] font-semibold text-(--brand-text-primary) sm:text-[30px] sm:leading-[38px]">
            {step.title}
          </h3>
          <p className="w-full text-lg leading-7 text-(--brand-text-muted)">{step.description}</p>
        </div>
      </div>
    </div>
  );
}

function GhostNumber({ value, align }: { value: string; align: "start" | "end" }) {
  return (
    <div className={cn("flex h-60 items-center overflow-hidden rounded-2xl px-6 select-none", align === "end" ? "justify-end" : "justify-start")}>
      <span className="bg-gradient-to-b from-[rgba(245,248,250,0.8)] to-[rgba(145,147,148,0)] bg-clip-text font-heading text-[160px] font-normal tracking-[-0.04em] text-transparent">
        {value}
      </span>
    </div>
  );
}

function Rail({ className }: { className?: string }) {
  return (
    <div className={cn("relative flex w-px flex-col items-center self-stretch", className)}>
      <span className="absolute inset-y-0 left-1/2 w-px -translate-x-1/2 bg-linear-to-b from-(--brand-border-card)/0 via-(--brand-border-card) to-(--brand-border-card)/0" />
      <span
        className="absolute inset-y-0 left-1/2 w-px -translate-x-1/2"
        style={{
          background:
            "linear-gradient(to bottom, rgb(var(--brand-300-rgb) / 0) 0%, rgb(var(--brand-300-rgb) / 0.9) 50%, rgb(var(--brand-300-rgb) / 0) 100%)",
          boxShadow: "0 0 8px rgb(var(--brand-300-rgb) / 0.6)",
        }}
      />
    </div>
  );
}

/** Three-step timeline: two alternating cards around a glowing rail, then the finale. */
export default function HowItWorks() {
  const [first, second, last] = steps;

  return (
    <section id="how-it-works" className="isolate flex w-full scroll-mt-24 flex-col items-center overflow-x-clip py-12 sm:py-16 lg:py-24">
      <Container className="flex flex-col items-center gap-12 sm:gap-16 lg:gap-20">
        <SectionHeading
          eyebrow="How it works"
          lead="From evaluation to"
          accent="funded trader"
          description="Follow these steps to join, complete your evaluation, and start earning as a funded trader."
        />

        {/* Mobile */}
        <div className="relative w-full max-w-[560px] lg:hidden">
          <div className="flex gap-4 sm:gap-5">
            <Rail className="shrink-0" />
            <div className="flex min-w-0 flex-1 flex-col gap-8 sm:gap-10">
              {steps.map((step) => (
                <StepCard key={step.number} step={step} className="min-h-[180px] w-full" />
              ))}
            </div>
          </div>
        </div>

        {/* Desktop */}
        <div className="relative hidden w-full max-w-7xl lg:block">
          <div className="grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-stretch gap-10">
            <div className="flex flex-col gap-40 pb-40">
              <GhostNumber value="01" align="end" />
              <div className="flex justify-end">
                <StepCard step={second} align="end" className="h-60 w-[520px] max-w-full" />
              </div>
            </div>

            <div className="relative flex">
              <Rail />
              <span className="absolute -bottom-6 left-1/2 -translate-x-1/2">
                <StepIcon icon={last.icon} faded />
              </span>
            </div>

            <div className="flex flex-col gap-40 pb-40">
              <div className="flex justify-start">
                <StepCard step={first} className="h-60 w-[520px] max-w-full" />
              </div>
              <GhostNumber value="02" align="start" />
            </div>
          </div>
        </div>

        <div className="flex w-full flex-col items-center gap-10 sm:gap-12">
          <div className="hidden w-full max-w-[768px] flex-col items-center gap-3 text-center lg:flex">
            <h3 className="text-[30px] leading-[38px] font-semibold text-(--brand-text-muted)">{last.title}</h3>
            <p className="text-lg leading-7 text-(--brand-text-muted)/60">{last.description}</p>
          </div>
          <div className="flex w-full max-w-[420px] flex-col items-stretch gap-3 sm:w-auto sm:flex-row sm:items-start">
            <PrimaryLink href="/auth/signup" arrow>
              Get Funded
            </PrimaryLink>
            <SecondaryLink href="/pricing">View Plans</SecondaryLink>
          </div>
        </div>

        <div className="pointer-events-none relative h-[60px] w-full">
          <span
            className="absolute inset-0 opacity-50"
            style={{
              background:
                "radial-gradient(ellipse 50% 100% at 50% 100%, rgb(var(--brand-300-rgb) / 1) 0%, rgb(var(--brand-300-rgb) / 0.75) 25%, rgb(var(--brand-300-rgb) / 0.5) 50%, rgb(var(--brand-300-rgb) / 0) 100%)",
            }}
          />
          <span className="absolute inset-x-0 bottom-0 h-px bg-[rgb(var(--brand-300-rgb)/0.5)]" />
        </div>
      </Container>
    </section>
  );
}
