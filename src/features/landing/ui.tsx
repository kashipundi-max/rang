import type { ReactNode } from "react";
import { IconArrowRight } from "@tabler/icons-react";
import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils";

/** Page-width wrapper shared by every landing section. */
export function Container({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "mx-auto w-full px-4 sm:px-6 md:px-10 lg:max-w-248 xl:max-w-7xl 2xl:max-w-360",
        className
      )}
    >
      {children}
    </div>
  );
}

type ButtonLinkProps = {
  href: string;
  children: ReactNode;
  className?: string;
  arrow?: boolean;
  small?: boolean;
};

function isExternal(href: string) {
  return href.startsWith("http") || href.startsWith("mailto:");
}

export function PrimaryLink({
  href,
  children,
  className,
  arrow = false,
  small = false,
}: ButtonLinkProps) {
  const classes = cn("skin-btn-primary", small && "skin-btn-sm", className);
  const content = (
    <>
      <span className="relative">{children}</span>
      {arrow && <IconArrowRight className="relative size-5" aria-hidden />}
    </>
  );

  if (href.startsWith("#") || isExternal(href)) {
    return (
      <a href={href} className={classes}>
        {content}
      </a>
    );
  }

  return (
    <Link href={href} className={classes}>
      {content}
    </Link>
  );
}

export function SecondaryLink({
  href,
  children,
  className,
  small = false,
}: ButtonLinkProps) {
  const classes = cn("skin-btn-secondary", small && "skin-btn-sm", className);

  if (href.startsWith("#") || isExternal(href)) {
    return (
      <a
        href={href}
        className={classes}
        {...(isExternal(href) ? { target: "_blank", rel: "noopener noreferrer" } : {})}
      >
        {children}
      </a>
    );
  }

  return (
    <Link href={href} className={classes}>
      {children}
    </Link>
  );
}

/** The small label framed by two hairlines that sits above a section title. */
export function Eyebrow({ children }: { children: ReactNode }) {
  return (
    <div className="flex w-full items-center justify-center pb-8">
      <div className="h-px flex-1 bg-linear-to-r from-transparent to-(--brand-border-strong)" />
      <div className="shrink-0 rounded-lg border border-(--brand-border-strong) bg-(--brand-primary-surface) px-[10px] py-1">
        <span className="text-sm leading-5 font-medium whitespace-nowrap text-(--brand-text-secondary)">
          {children}
        </span>
      </div>
      <div className="h-px flex-1 bg-linear-to-l from-transparent to-(--brand-border-strong)" />
    </div>
  );
}

/**
 * Centered section heading: white lead-in plus a glowing gradient tail.
 * `lead` and `accent` are split out of one translated title by `splitTitle`.
 */
export function SectionHeading({
  eyebrow,
  lead,
  accent,
  description,
  align = "center",
}: {
  eyebrow?: ReactNode;
  lead: ReactNode;
  accent?: ReactNode;
  description?: ReactNode;
  align?: "center" | "start";
}) {
  const centered = align === "center";

  return (
    <div className="w-full">
      {eyebrow && <Eyebrow>{eyebrow}</Eyebrow>}
      <div
        className={cn(
          "flex w-full max-w-[768px] flex-col gap-4 sm:gap-5 lg:gap-6",
          centered ? "mx-auto items-center text-center" : "items-start text-left"
        )}
      >
        <h2
          className={cn(
            "flex flex-wrap items-center gap-x-2 text-[32px] leading-[40px] font-semibold tracking-[-0.02em] sm:gap-x-3 sm:text-[40px] sm:leading-[50px] lg:text-[48px] lg:leading-[60px]",
            centered ? "justify-center" : "justify-start"
          )}
        >
          <span className="text-(--brand-text-primary)">{lead}</span>
          {accent && <span className="skin-gradient-text-soft">{accent}</span>}
        </h2>
        {description && (
          <p className="text-base leading-6 font-normal text-(--brand-text-secondary) sm:text-lg sm:leading-7 lg:text-xl lg:leading-7.5">
            {description}
          </p>
        )}
      </div>
    </div>
  );
}

/**
 * Splits a title so its last `accentWords` words get the gradient treatment,
 * e.g. "From evaluation to funded trader" -> ["From evaluation to", "funded trader"].
 */
export function splitTitle(title: string, accentWords = 2): [string, string] {
  const words = title.trim().split(/\s+/);
  if (words.length <= accentWords) return ["", title];
  return [
    words.slice(0, words.length - accentWords).join(" "),
    words.slice(words.length - accentWords).join(" "),
  ];
}

/** Green check used in plan and CTA lists. */
export function CheckIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      className={cn("size-4 shrink-0", className)}
    >
      <path d="M20 6 9 17l-5-5" />
    </svg>
  );
}
