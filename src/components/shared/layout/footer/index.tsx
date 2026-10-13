"use client";

import { FormEvent, useState } from "react";
import { useTranslations } from "next-intl";
import { IconBrandDiscord, IconMail } from "@tabler/icons-react";
import { Link } from "@/i18n/navigation";
import { Logo } from "@/components/Logo";
import { PaymentMethodIcon, paymentMethods } from "@/components/PaymentMethods";
import { disclaimers } from "./components/DisclaimerSection";
import { footerLinksConfig, socialLinksConfig } from "./config/navigation";

const socialIcons: Record<string, typeof IconMail> = {
  email: IconMail,
  discord: IconBrandDiscord,
};

const legalSection = footerLinksConfig.find((section) => section.titleKey === "legal");
const linkSections = footerLinksConfig.filter((section) => section.titleKey !== "legal");

function isExternal(href: string) {
  return href.startsWith("http") || href.startsWith("mailto:");
}

function FooterLink({ href, className, children }: { href: string; className: string; children: React.ReactNode }) {
  if (href.startsWith("#") || isExternal(href)) {
    return (
      <a href={href} className={className} {...(isExternal(href) ? { target: "_blank", rel: "noopener noreferrer" } : {})}>
        {children}
      </a>
    );
  }
  return (
    <Link href={href} className={className}>
      {children}
    </Link>
  );
}

type SubmitState = "idle" | "loading" | "success" | "error";

function NewsletterForm() {
  const t = useTranslations("Footer");
  const [email, setEmail] = useState("");
  const [state, setState] = useState<SubmitState>("idle");
  const [message, setMessage] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (state === "loading") return;
    setState("loading");
    setMessage("");

    try {
      const response = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, source: "footer" }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Unable to subscribe right now.");
      setState("success");
      setMessage(result.message || "You are subscribed. Please check your inbox.");
      setEmail("");
    } catch (error) {
      setState("error");
      setMessage(error instanceof Error ? error.message : "Unable to subscribe right now.");
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="flex w-full max-w-[440px] flex-col gap-2">
      <div className="flex w-full items-center gap-3">
        <label className="min-w-0 flex-1">
          <span className="sr-only">{t("newsletter.placeholder")}</span>
          <input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder={t("newsletter.placeholder")}
            autoComplete="email"
            required
            disabled={state === "loading"}
            className="h-11 w-full rounded-full border border-(--brand-border-strong) bg-(--brand-primary-surface) px-4 text-sm text-white placeholder:text-[#9b6fd6] focus:border-(--brand-300) focus:ring-2 focus:ring-(--brand-50)/30 focus:outline-none"
          />
        </label>
        <button
          type="submit"
          disabled={state === "loading"}
          className="inline-flex h-11 cursor-pointer items-center justify-center rounded-full bg-linear-63 from-(--brand-800) from-16.72% to-(--brand-300) to-83.39% px-5 text-sm font-semibold whitespace-nowrap text-white transition-[filter] hover:brightness-90 disabled:opacity-60"
        >
          {state === "loading" ? "Subscribing" : state === "success" ? "Subscribed" : t("newsletter.subscribe")}
        </button>
      </div>
      <p aria-live="polite" className={`min-h-5 text-xs ${state === "error" ? "text-red-400" : "text-(--brand-positive)"}`}>
        {message}
      </p>
    </form>
  );
}

/**
 * Site footer: logo + social row, link columns with the newsletter, payment
 * method tiles, program disclaimers, then legal links and copyright.
 */
export default function Footer() {
  const t = useTranslations("Footer");

  return (
    <footer className="skin-type bg-(--brand-primary-surface) text-white">
      <div className="mx-auto flex w-full flex-col gap-12 px-4 pt-8 pb-16 sm:px-6 md:px-10 lg:max-w-248 lg:pt-10 lg:pb-24 xl:max-w-7xl 2xl:max-w-360">
        <div className="flex flex-col gap-8 md:flex-row md:items-center md:justify-between">
          <Logo asLink size="lg" />
          <ul className="flex flex-wrap items-center gap-3">
            {socialLinksConfig.map((social) => {
              const Icon = socialIcons[social.id];
              return (
                <li key={social.id}>
                  <a
                    href={social.href}
                    aria-label={social.label ?? t(`social.${social.labelKey}`)}
                    title={social.label}
                    {...(social.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                    className="inline-flex size-12 items-center justify-center rounded-xl border border-(--brand-border-card) bg-(--brand-surface-card) text-(--brand-text-secondary) transition-colors hover:border-(--brand-border-strong) hover:text-white"
                  >
                    {Icon && <Icon className="size-5" />}
                  </a>
                </li>
              );
            })}
          </ul>
        </div>

        <div className="h-px w-full bg-(--brand-border-card)" />

        <div className="grid grid-cols-2 gap-8 sm:grid-cols-3 lg:grid-cols-12 lg:gap-8 lg:px-8">
          {linkSections.map((section) => (
            <div key={section.titleKey} className="flex flex-col gap-4 lg:col-span-2">
              <h3 className="text-sm font-semibold tracking-tight text-(--brand-text-muted)">
                {t(`sections.${section.titleKey}`)}
              </h3>
              <ul className="flex flex-col gap-3">
                {section.links.map((link) => (
                  <li key={link.labelKey}>
                    <FooterLink
                      href={link.href}
                      className="text-sm font-semibold text-(--brand-text-secondary) transition-colors hover:text-white"
                    >
                      {t(`links.${link.labelKey}`)}
                    </FooterLink>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          <div className="col-span-2 flex flex-col gap-4 sm:col-span-3 lg:col-span-6">
            <h3 className="text-sm font-semibold tracking-tight text-(--brand-text-muted)">
              {t("newsletter.description")}
            </h3>
            <NewsletterForm />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 lg:grid-cols-6 xl:grid-cols-11">
          {paymentMethods.map((method) => (
            <div
              key={method.name}
              title={method.name}
              className="flex h-14 items-center justify-center rounded-lg bg-(--brand-surface-card) px-5 text-[#e4d6f5]"
            >
              <PaymentMethodIcon method={method} />
              <span className="sr-only">{method.name}</span>
            </div>
          ))}
        </div>

        <div className="flex flex-col gap-3 text-xs leading-[18px] text-(--brand-text-muted) lg:px-8">
          <p>{t("description")}</p>
          {disclaimers.map((item) => (
            <p key={item.title}>
              <strong className="font-bold text-(--brand-text-secondary)">{item.title}:</strong> {item.content}
            </p>
          ))}
        </div>

        <div className="h-px w-full bg-(--brand-border-card)" />

        <div className="flex flex-col gap-4 text-sm text-(--brand-text-muted) sm:flex-row sm:items-center sm:justify-between lg:px-8">
          <ul className="flex flex-wrap items-center gap-4">
            {legalSection?.links.map((link) => (
              <li key={link.labelKey}>
                <FooterLink href={link.href} className="transition-colors hover:text-white">
                  {t(`links.${link.labelKey}`)}
                </FooterLink>
              </li>
            ))}
          </ul>
          <p>{t("copyright", { year: new Date().getFullYear() })}</p>
        </div>
      </div>
    </footer>
  );
}
