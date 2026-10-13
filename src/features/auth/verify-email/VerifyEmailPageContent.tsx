"use client";

import { useState } from "react";
import Link from "next/link";
import {
  IconAlertTriangle,
  IconCircleCheck,
  IconLoader2,
  IconMail,
} from "@tabler/icons-react";
import { AuthCard, AuthLayout } from "../layout";
import { Button } from "@/components/ui/button";

type Props = {
  locale: string;
  status: string;
  email: string;
};

type ResendState = "idle" | "sending" | "sent" | "error";

export default function VerifyEmailPageContent({ locale, status, email }: Props) {
  const [resendState, setResendState] = useState<ResendState>("idle");
  const [resendMessage, setResendMessage] = useState("");
  const success = status === "success";
  const failed = ["invalid", "expired", "error", "email-failed"].includes(status);

  async function resend() {
    if (!email || resendState === "sending") return;
    setResendState("sending");
    setResendMessage("");

    try {
      const response = await fetch("/api/auth/resend-verification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, locale }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Unable to resend email.");
      setResendState("sent");
      setResendMessage("A new verification email has been sent.");
    } catch (error) {
      setResendState("error");
      setResendMessage(error instanceof Error ? error.message : "Unable to resend email.");
    }
  }

  const icon = success ? (
    <IconCircleCheck className="h-12 w-12 text-emerald-400" />
  ) : failed ? (
    <IconAlertTriangle className="h-12 w-12 text-amber-400" />
  ) : (
    <IconMail className="h-12 w-12 text-primary" />
  );

  const title = success
    ? "Email verified"
    : status === "expired"
      ? "Verification link expired"
      : status === "invalid"
        ? "Verification link is invalid"
        : status === "email-failed"
          ? "Email could not be sent"
          : status === "error"
            ? "Verification could not be completed"
            : "Check your email";

  const message = success
    ? "Your trader profile is active and you are securely signed in."
    : failed
      ? "Request a fresh verification email below, then use the newest link."
      : `We sent a one-time verification link${email ? ` to ${email}` : ""}. The link expires in 24 hours.`;

  return (
    <AuthLayout translationNamespace="SignInPage" hideHeader>
      <AuthCard className="w-full sm:p-8">
        <div className="relative z-10 flex flex-col items-center text-center">
          <div className="mb-5 flex h-20 w-20 items-center justify-center rounded-full border border-border-secondary/40 bg-bg-dark/60">
            {icon}
          </div>
          <h1 className="mb-3 font-clash-display text-2xl font-medium text-text-primary sm:text-3xl">
            {title}
          </h1>
          <p className="mb-7 max-w-sm font-dm-sans text-sm leading-6 text-text-body/90">
            {message}
          </p>

          {success ? (
            <Button asChild className="w-full">
              <Link href={`/${locale}/dashboard`}>Continue to dashboard</Link>
            </Button>
          ) : (
            <div className="w-full space-y-3">
              {email && (
                <Button type="button" className="w-full" onClick={resend} disabled={resendState === "sending"}>
                  {resendState === "sending" && <IconLoader2 className="h-5 w-5 animate-spin" />}
                  {resendState === "sending" ? "Sending..." : "Resend verification email"}
                </Button>
              )}
              <Button asChild variant="outline" className="w-full">
                <Link href={`/${locale}/auth/signin`}>Skip for now and sign in</Link>
              </Button>
              <p className="text-xs leading-5 text-text-body/60">
                You can sign in without verifying, but verify soon to keep full access.
              </p>
            </div>
          )}

          {resendMessage && (
            <p className={`mt-4 text-sm ${resendState === "error" ? "text-red-400" : "text-emerald-400"}`} role="status">
              {resendMessage}
            </p>
          )}
        </div>
      </AuthCard>
    </AuthLayout>
  );
}
