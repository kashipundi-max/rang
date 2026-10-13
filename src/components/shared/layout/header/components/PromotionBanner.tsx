"use client";

import { useEffect, useState } from "react";
import { IconCheck, IconCopy, IconDiscount2 } from "@tabler/icons-react";

type LiveCoupon = {
  code: string;
  discountPercent: number;
  status?: string;
  expiresAt?: string;
};

type Countdown = {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
};

function getCountdown(deadline: number): Countdown {
  const distance = Math.max(deadline - Date.now(), 0);
  return {
    days: Math.floor(distance / 86_400_000),
    hours: Math.floor((distance / 3_600_000) % 24),
    minutes: Math.floor((distance / 60_000) % 60),
    seconds: Math.floor((distance / 1_000) % 60),
  };
}

export default function PromotionBanner() {
  const [copied, setCopied] = useState(false);
  const [countdown, setCountdown] = useState<Countdown | null>(null);
  const [coupon, setCoupon] = useState<LiveCoupon | null>(null);

  // Same pick as the pricing section: the biggest active, unexpired coupon.
  useEffect(() => {
    const controller = new AbortController();
    fetch("/api/coupons", { cache: "no-store", signal: controller.signal })
      .then((res) => res.json())
      .then((body) => {
        if (!body?.success) return;
        const now = Date.now();
        const best = (body.coupons || [])
          .filter(
            (item: LiveCoupon) =>
              item.status === "active" &&
              Number(item.discountPercent) > 0 &&
              (!item.expiresAt || new Date(item.expiresAt).getTime() > now)
          )
          .reduce(
            (top: LiveCoupon | null, item: LiveCoupon) =>
              !top || Number(item.discountPercent) > Number(top.discountPercent) ? item : top,
            null
          );
        setCoupon(best ? { ...best, code: String(best.code).toUpperCase() } : null);
      })
      .catch(() => {});
    return () => controller.abort();
  }, []);

  const deadline = coupon?.expiresAt ? new Date(coupon.expiresAt).getTime() : null;
  const deadlineLabel = deadline
    ? new Date(deadline).toLocaleDateString("en-US", { month: "short", day: "numeric" })
    : "";

  useEffect(() => {
    if (!copied) return;
    const timer = window.setTimeout(() => setCopied(false), 1800);
    return () => window.clearTimeout(timer);
  }, [copied]);

  useEffect(() => {
    if (!deadline) return;
    const updateCountdown = () => setCountdown(getCountdown(deadline));
    updateCountdown();
    const timer = window.setInterval(updateCountdown, 1000);
    return () => window.clearInterval(timer);
  }, [deadline]);

  const copyPromoCode = async () => {
    if (!coupon) return;
    try {
      await navigator.clipboard.writeText(coupon.code);
      setCopied(true);
    } catch {
      setCopied(false);
    }
  };

  const pad = (value?: number) => String(value ?? 0).padStart(2, "0");

  return (
    <aside
      aria-label="Promotion"
      className="skin-type fixed inset-x-0 top-0 z-[60] flex h-12 items-center justify-center overflow-hidden px-3 text-[#f7f7f7] sm:h-[52px] sm:px-6 lg:px-12"
      style={{ background: "linear-gradient(180deg, #a855f7 0%, #5b21b6 100%)" }}
    >
      <div className="relative flex min-w-0 flex-wrap items-center justify-center gap-2 sm:gap-3">
        <div className="flex items-center gap-2">
          <IconDiscount2 size={20} stroke={1.8} aria-hidden="true" />
          <span className="text-xs leading-5 font-semibold whitespace-nowrap sm:text-sm">
            {coupon ? `Save ${coupon.discountPercent}%` : "Limited-time offers on every challenge"}
          </span>
        </div>

        {coupon && (
        <div className="flex items-center gap-1.5 rounded-md bg-[#0c0e12] py-0.5 pr-1 pl-3">
          <span className="text-xs leading-[18px] font-semibold whitespace-nowrap text-[#f5f8fa]">
            Code: {coupon.code}
          </span>
          <button
            type="button"
            onClick={copyPromoCode}
            aria-label={copied ? "Promo code copied" : "Copy promo code " + coupon.code}
            className="flex items-center justify-center rounded-full p-1.5 transition-colors hover:bg-white/10"
          >
            {copied ? <IconCheck size={14} aria-hidden="true" /> : <IconCopy size={14} aria-hidden="true" />}
          </button>
        </div>
        )}

        {deadline && (
        <div
          className="hidden items-center gap-1.5 rounded-md bg-[#0c0e12]/40 px-2.5 py-1 text-xs leading-[18px] font-semibold tabular-nums whitespace-nowrap sm:flex"
          aria-label={`Coupon expires ${deadlineLabel}`}
          aria-live="polite"
          aria-atomic="true"
        >
          <span>{deadlineLabel}</span>
          <span>{countdown ? countdown.days : "--"}d</span>
          <span>
            {countdown
              ? `${pad(countdown.hours)}:${pad(countdown.minutes)}:${pad(countdown.seconds)}`
              : "--:--:--"}
          </span>
        </div>
        )}

        <span className="sr-only" role="status" aria-live="polite">
          {copied ? "Promo code copied to clipboard." : ""}
        </span>
      </div>
    </aside>
  );
}
