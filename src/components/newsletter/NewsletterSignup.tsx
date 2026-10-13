"use client";

import { FormEvent, useState } from "react";
import { useTranslations } from "next-intl";
import { IconCheck, IconLoader2 } from "@tabler/icons-react";
import Input from "@/components/ui/SimpleInput";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type NewsletterSignupProps = {
  source: "footer" | "home";
  className?: string;
};

type SubmitState = "idle" | "loading" | "success" | "error";

export default function NewsletterSignup({ source, className }: NewsletterSignupProps) {
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
        body: JSON.stringify({ email, source }),
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
    <div className={cn("w-full max-w-3xl rounded-2xl border border-white/10 bg-[#15131c]/95 p-6 text-center shadow-2xl shadow-black/25 sm:p-8", className)}>
      <h3 className="font-clash-display text-xl font-semibold uppercase tracking-[0.04em] text-white sm:text-2xl">
        {t("newsletter.title")}
      </h3>
      <p className="mx-auto mt-3 max-w-2xl text-sm leading-relaxed text-text-body sm:text-base">
        {t("newsletter.description")}
      </p>

      <form onSubmit={handleSubmit} className="mx-auto mt-6 flex w-full max-w-xl flex-col gap-3 sm:flex-row" noValidate>
        <Input
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder={t("newsletter.placeholder")}
          autoComplete="email"
          aria-label={t("newsletter.placeholder")}
          required
          disabled={state === "loading"}
          className="min-w-0 flex-1"
        />
        <Button type="submit" disabled={state === "loading"} className="min-w-44 px-6">
          {state === "loading" ? (
            <span className="flex items-center gap-2"><IconLoader2 className="h-4 w-4 animate-spin" />Subscribing</span>
          ) : state === "success" ? (
            <span className="flex items-center gap-2"><IconCheck className="h-4 w-4" />Subscribed</span>
          ) : (
            t("newsletter.subscribe")
          )}
        </Button>
      </form>

      <div className="mt-3 min-h-5" aria-live="polite">
        {message && <p className={cn("text-xs", state === "error" ? "text-red-400" : "text-emerald-400")}>{message}</p>}
      </div>

      <p className="mx-auto mt-3 max-w-2xl text-xs leading-relaxed text-text-body/65">
        Trading involves substantial risk and may not be suitable for everyone. Past performance is not indicative of future results.
      </p>
    </div>
  );
}