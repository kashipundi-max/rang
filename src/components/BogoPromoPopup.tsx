"use client";

import { useEffect, useState } from "react";
import { IconArrowRight, IconGift, IconX } from "@tabler/icons-react";
import { Link } from "@/i18n/navigation";

type Offer = {
  id: string;
  name: string;
  type: "bogo" | "free_retry";
  description?: string;
  status: "active" | "paused";
  startsAt?: string;
  expiresAt?: string;
  accountSizes: number[];
  models: string[];
  userIds: string[];
  accountIds: string[];
  buyQuantity: number;
  freeQuantity: number;
  maxRedemptions: number;
  redeemedCount: number;
};

const DISMISS_KEY = "bogo-popup-dismissed";
const SHOW_DELAY_MS = 1500;

/** A store-wide BOGO that is running right now (not targeted, scheduled, expired or sold out). */
function isLiveStoreWideBogo(offer: Offer, now: number) {
  if (offer.type !== "bogo" || offer.status !== "active") return false;
  if (offer.userIds?.length || offer.accountIds?.length) return false;
  if (offer.startsAt && new Date(offer.startsAt).getTime() > now) return false;
  if (offer.expiresAt && new Date(offer.expiresAt).getTime() <= now) return false;
  if (offer.maxRedemptions > 0 && offer.redeemedCount >= offer.maxRedemptions) return false;
  return true;
}

function formatDate(value: string) {
  return new Date(value).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}

function readDismissed(): string | null {
  try {
    return window.sessionStorage.getItem(DISMISS_KEY);
  } catch {
    return null;
  }
}

/**
 * Site-wide "Buy 1 Get 1" popup. Driven entirely by the live offers the admin
 * manages in the CRM: it only appears while a store-wide BOGO offer is
 * running, and once dismissed it stays closed for the rest of the session.
 */
export default function BogoPromoPopup() {
  const [offer, setOffer] = useState<Offer | null>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    let timer: number | undefined;

    fetch("/api/offers", { signal: controller.signal })
      .then((res) => (res.ok ? res.json() : null))
      .then((body) => {
        const now = Date.now();
        const live = ((body?.offers || []) as Offer[]).find((item) => isLiveStoreWideBogo(item, now));
        if (!live || readDismissed() === live.id) return;
        setOffer(live);
        timer = window.setTimeout(() => setOpen(true), SHOW_DELAY_MS);
      })
      .catch(() => {});

    return () => {
      controller.abort();
      if (timer) window.clearTimeout(timer);
    };
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") close();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const close = () => {
    setOpen(false);
    if (offer) {
      try {
        window.sessionStorage.setItem(DISMISS_KEY, offer.id);
      } catch {
        // storage blocked - the popup simply may show again next page load
      }
    }
  };

  if (!open || !offer) return null;

  const buy = Math.max(1, offer.buyQuantity || 1);
  const free = Math.max(1, offer.freeQuantity || 1);

  return (
    <div
      className="skin-type fixed inset-0 z-[200] flex items-center justify-center bg-black/70 p-4"
      onClick={close}
      role="presentation"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="bogo-popup-title"
        onClick={(event) => event.stopPropagation()}
        className="relative w-full max-w-[360px] rounded-2xl border border-white/10 px-6 pt-8 pb-6 text-center shadow-[0_30px_80px_-20px_rgba(0,0,0,0.8)]"
        style={{ background: "radial-gradient(circle at 50% 0%, rgba(168, 85, 247, 0.35) 0%, transparent 60%), #150b26" }}
      >
        <button
          type="button"
          onClick={close}
          aria-label="Close offer"
          className="absolute top-3 right-3 flex size-8 cursor-pointer items-center justify-center rounded-full text-white/60 hover:bg-white/10 hover:text-white"
        >
          <IconX size={16} />
        </button>

        <span className="mx-auto flex size-12 items-center justify-center rounded-full bg-[#a855f7]/20 text-[#d8b4fe]">
          <IconGift size={24} />
        </span>
        <h2 id="bogo-popup-title" className="mt-4 text-2xl font-bold text-white">
          Buy {buy}, Get {free} <span className="text-[#c084fc]">Free</span>
        </h2>
        {offer.expiresAt && (
          <p className="mt-1.5 text-sm text-[#cdb8ea]">Ends {formatDate(offer.expiresAt)}</p>
        )}

        <Link
          href="/dashboard/buy"
          onClick={close}
          className="mt-6 inline-flex h-11 w-full items-center justify-center gap-2 rounded-full text-sm font-semibold text-white hover:brightness-110"
          style={{ background: "linear-gradient(63deg, #5b21b6 16.72%, #a855f7 83.39%)" }}
        >
          Claim Offer
          <IconArrowRight size={17} />
        </Link>
      </div>
    </div>
  );
}
