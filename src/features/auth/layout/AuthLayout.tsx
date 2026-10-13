"use client";

import { ReactNode } from "react";
import { useTranslations } from "next-intl";
import { Logo } from "@/components/Logo";
import { DashboardMock } from "@/features/landing/DashboardMock";

interface AuthLayoutProps {
  children: ReactNode;
  /** Translation namespace for the page (e.g., "SignInPage", "SignUpPage") */
  translationNamespace: string;
  /** Hide the brand logo above the form */
  hideLogo?: boolean;
  /** Hide the heading above the form */
  hideHeader?: boolean;
  /** Hide the subtitle under the heading */
  hideSubtitle?: boolean;
  /** Widen the content column */
  wide?: boolean;
}

/**
 * Shared layout for the auth screens (sign in, sign up, forgot password,
 * verify email).
 *
 * Split screen with no site header or footer: the form column on the left
 * (42%), and on desktop a rounded sky-blue gradient panel on the right with
 * the brand, the headline and a dashboard preview bleeding off its corner.
 * Colours come from the `.skin-auth` tokens in `src/styles/skin-page.css`.
 */
export function AuthLayout({
  children,
  translationNamespace,
  hideLogo = false,
  hideHeader = false,
  hideSubtitle = false,
  wide = false,
}: AuthLayoutProps) {
  const t = useTranslations(translationNamespace);
  const hero = useTranslations("HeroSection");

  return (
    <main className="auth-scope skin-auth skin-type relative flex min-h-[100dvh] text-white">
      <div className="flex min-h-[100dvh] w-full flex-col px-6 py-8 lg:w-[42%] lg:px-12 xl:px-20">
        {!hideLogo && (
          <div className="auth-logo mb-10 flex justify-center lg:hidden">
            <Logo size="lg" asLink />
          </div>
        )}

        <div className="flex flex-1 items-center justify-center">
          <div className={`w-full ${wide ? "max-w-xl" : "max-w-md"}`}>
            {!hideHeader && (
              <div className="mb-8 text-center">
                <h1 className="mb-2 text-3xl font-bold text-white">{t("form.title")}</h1>
                {!hideSubtitle && (
                  <p className="text-sm leading-relaxed text-white/50">{t("form.subtitle")}</p>
                )}
              </div>
            )}

            {children}
          </div>
        </div>

        <p className="mt-8 text-center text-xs text-white/40">
          © Range4ex {new Date().getFullYear()}
        </p>
      </div>

      <div className="hidden p-3 lg:block lg:w-[58%]">
        <div
          className="relative flex h-full w-full flex-col overflow-hidden rounded-[28px] pt-12 pl-12 xl:pt-16 xl:pl-16"
          style={{ background: "linear-gradient(45deg, #2a1250 0%, #9333ea 100%)" }}
        >
          <div className="relative z-10 self-start">
            <Logo size="lg" asLink />
          </div>
          <h2 className="relative z-10 mt-10 max-w-2xl text-4xl leading-[1.08] font-bold text-white xl:mt-14 xl:text-6xl">
            {hero("title1")} {hero("title2")}
          </h2>
          <div className="relative mt-8 min-h-0 flex-1">
            <div className="pointer-events-none absolute top-0 left-0 w-[calc(100%+4rem)] min-w-[760px] overflow-hidden rounded-tl-2xl shadow-[0_30px_80px_-20px_rgba(0,0,0,0.55)]">
              <DashboardMock framed={false} />
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
