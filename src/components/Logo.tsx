"use client";

import * as React from "react";
import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils";

type LogoSize = "sm" | "md" | "lg" | "xl";

interface LogoProps {
  /** Size variant */
  size?: LogoSize;
  /** Make the logo a link to home page */
  asLink?: boolean;
  /** Enable framer-motion animation (lazy loaded) */
  animated?: boolean;
  /** Additional class names */
  className?: string;
}

// Lazy load motion component to reduce bundle size
const MotionDiv = React.lazy(() =>
  import("framer-motion").then((mod) => ({
    default: mod.motion.div,
  }))
);

const sizeClasses: Record<LogoSize, { image: string; text: string }> = {
  sm: { image: "h-7 w-auto", text: "text-sm" },
  md: { image: "h-9 w-auto", text: "text-base" },
  lg: { image: "h-12 w-auto", text: "text-xl" },
  xl: { image: "h-20 w-auto", text: "text-3xl" },
};

function LogoContent({ size = "md" }: { size?: LogoSize }) {
  const sizes = sizeClasses[size];

  return (
    <>
      <Image
        src="/logo.webp"
        alt=""
        width={743}
        height={503}
        className={cn("shrink-0 object-contain", sizes.image)}
        priority={size === "md"}
      />
      <span
        className={cn(
          "font-clash-display font-semibold uppercase tracking-[0.08em] text-text-primary",
          sizes.text
        )}
      >
        Range4ex
      </span>
    </>
  );
}
function Logo({
  size = "md",
  asLink = false,
  animated = false,
  className,
}: LogoProps) {
  const innerClasses = "flex items-center gap-2";

  const content = (
    <div className={innerClasses}>
      <LogoContent size={size} />
    </div>
  );

  const animatedContent = animated ? (
    <React.Suspense fallback={content}>
      <MotionDiv
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className={innerClasses}
      >
        <LogoContent size={size} />
      </MotionDiv>
    </React.Suspense>
  ) : (
    content
  );

  if (asLink) {
    return (
      <Link href="/" className={cn("flex items-center select-none", className)}>
        {animatedContent}
      </Link>
    );
  }

  return <div className={className}>{animatedContent}</div>;
}

export { Logo };
export type { LogoProps, LogoSize };
