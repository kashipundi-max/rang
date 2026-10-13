"use client";

import React, { useEffect, useState } from "react";
import { IconCheck, IconCopy, IconGift, IconTicket } from "@tabler/icons-react";
import { Chip, PageHeader, Panel, SectionLabel } from "../ui";

type OfferAccount = {
  accountId: string;
  login: string;
  platform: string;
  kind: "active" | "granted" | "applied";
};

type TraderOffer = {
  id: string;
  name: string;
  type: "bogo" | "free_retry";
  description: string;
  summary: string;
  startsAt?: string;
  expiresAt?: string;
  accountSizes: number[];
  models: string[];
  targeted: boolean;
  accounts: OfferAccount[];
};

type Coupon = {
  id?: string;
  code: string;
  discountPercent: number | string;
  status?: string;
  expiresAt?: string;
};

// Only the non-default states get a label; "active" (the account is simply
// covered) is the normal case and needs no tag.
const ACCOUNT_KIND_LABEL: Partial<Record<OfferAccount["kind"], string>> = {
  granted: "Free account",
  applied: "Unlocked",
};

function formatDate(value?: string) {
  if (!value) return "";
  return new Date(value).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formatSize(size: number) {
  return size >= 1000 ? `$${Number((size / 1000).toFixed(1))}K` : `$${size}`;
}

function isCouponActive(coupon: Coupon) {
  const expired = Boolean(coupon.expiresAt && new Date(coupon.expiresAt).getTime() <= Date.now());
  return String(coupon.status || "active").toLowerCase() === "active" && !expired;
}

interface OffersTabProps {
  onSelectAccount: (accountId: string) => void;
  onNavigateBuy: () => void;
}

/** Live offers the trader is in scope for (and which accounts each covers), plus the coupon codes that work today. */
export default function OffersTab({ onSelectAccount, onNavigateBuy }: OffersTabProps) {
  const [offers, setOffers] = useState<TraderOffer[]>([]);
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [copiedCode, setCopiedCode] = useState("");

  useEffect(() => {
    let cancelled = false;
    const readJson = (url: string) =>
      fetch(url)
        .then((response) => (response.ok ? response.json() : null))
        .catch(() => null);

    Promise.all([readJson("/api/offers/accounts"), readJson("/api/coupons")])
      .then(([offerData, couponData]) => {
        if (cancelled) return;
        setOffers(offerData?.offers || []);
        setCoupons(
          ((couponData?.coupons || []) as Coupon[])
            .filter(isCouponActive)
            .sort((a, b) => Number(b.discountPercent) - Number(a.discountPercent)),
        );
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const copyCode = (code: string) => {
    navigator.clipboard?.writeText(code).catch(() => {});
    setCopiedCode(code);
    window.setTimeout(() => setCopiedCode((current) => (current === code ? "" : current)), 1600);
  };

  return (
    <div className="mx-auto max-w-[1480px] space-y-6">
      <PageHeader
        title="Offers & coupons"
        subtitle="Offers apply on their own at checkout. Coupon codes can be entered on the Buy challenge page."
      />

      {loading ? (
        <Panel className="p-10 text-center text-[15px] text-text-muted">Loading…</Panel>
      ) : (
        <>
          <section className="space-y-4">
            <SectionLabel>Active offers</SectionLabel>
            {offers.length === 0 ? (
              <Panel className="p-8 text-center text-[15px] text-text-muted">No offers are running right now.</Panel>
            ) : (
              <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
                {offers.map((offer) => (
                  <Panel key={offer.id} className="flex flex-col p-6">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex min-w-0 items-center gap-3">
                        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-brand-primary/15 text-brand-primary">
                          <IconGift size={22} stroke={1.8} />
                        </span>
                        <div className="min-w-0">
                          <h3 className="truncate text-[18px] font-bold text-white">{offer.name}</h3>
                          <p className="text-[14px] text-text-secondary">{offer.summary}</p>
                        </div>
                      </div>
                      <div className="flex shrink-0 flex-col items-end gap-1.5">
                        <Chip tone="brand">{offer.type === "free_retry" ? "Free retry" : "Buy 1 get 1"}</Chip>
                        {offer.targeted && <Chip tone="warning">For you</Chip>}
                      </div>
                    </div>

                    {offer.description && (
                      <p className="mt-4 text-[14px] leading-relaxed text-text-secondary">{offer.description}</p>
                    )}

                    <dl className="mt-5 grid grid-cols-1 gap-4 border-t border-white/[0.08] pt-5 sm:grid-cols-3">
                      <div className="min-w-0">
                        <dt className="text-[12px] font-bold uppercase tracking-[0.14em] text-text-muted">Sizes</dt>
                        <dd className="mt-1.5 text-[15px] font-semibold text-white">
                          {offer.accountSizes.length ? offer.accountSizes.map(formatSize).join(" · ") : "All sizes"}
                        </dd>
                      </div>
                      <div className="min-w-0">
                        <dt className="text-[12px] font-bold uppercase tracking-[0.14em] text-text-muted">Models</dt>
                        <dd className="mt-1.5 text-[15px] font-semibold text-white">
                          {offer.models.length ? offer.models.join(", ") : "All models"}
                        </dd>
                      </div>
                      <div className="min-w-0">
                        <dt className="text-[12px] font-bold uppercase tracking-[0.14em] text-text-muted">Ends</dt>
                        <dd className="mt-1.5 text-[15px] font-semibold text-white">
                          {offer.expiresAt ? formatDate(offer.expiresAt) : "No end date"}
                        </dd>
                      </div>
                    </dl>

                    <div className="mt-5 border-t border-white/[0.08] pt-5">
                      <div className="flex items-center justify-between gap-3">
                        <span className="text-[12px] font-bold uppercase tracking-[0.14em] text-text-muted">Your accounts</span>
                        {offer.accounts.length > 0 && (
                          <span className="text-[14px] font-semibold text-white">
                            {offer.accounts.length} included
                          </span>
                        )}
                      </div>
                      {offer.accounts.length ? (
                        <div className="mt-3 flex flex-wrap gap-2">
                          {offer.accounts.map((account) => (
                            <button
                              key={account.accountId}
                              type="button"
                              onClick={() => onSelectAccount(account.accountId)}
                              title={`Open ${account.platform} ${account.login}`}
                              className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-white/10 px-2.5 py-1 text-[13px] font-semibold text-text-primary hover:border-white/25 hover:text-white"
                            >
                              <span className="text-text-muted">{account.platform}</span>
                              <span>{account.login}</span>
                              {ACCOUNT_KIND_LABEL[account.kind] && (
                                <span className="text-emerald-400">· {ACCOUNT_KIND_LABEL[account.kind]}</span>
                              )}
                            </button>
                          ))}
                        </div>
                      ) : (
                        <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-[14px] text-text-secondary">
                          <span>None of your accounts are covered yet.</span>
                          {offer.type === "bogo" && (
                            <button
                              type="button"
                              onClick={onNavigateBuy}
                              className="cursor-pointer font-semibold text-brand-primary hover:underline"
                            >
                              Buy a challenge →
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </Panel>
                ))}
              </div>
            )}
          </section>

          <section className="space-y-4">
            <SectionLabel>Coupon codes</SectionLabel>
            {coupons.length === 0 ? (
              <Panel className="p-8 text-center text-[15px] text-text-muted">No coupon codes are active right now.</Panel>
            ) : (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {coupons.map((coupon) => {
                  const copied = copiedCode === coupon.code;
                  return (
                    <Panel key={coupon.id || coupon.code} className="flex items-center justify-between gap-4 p-5">
                      <div className="flex min-w-0 items-center gap-3.5">
                        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-emerald-500/15 text-emerald-400">
                          <IconTicket size={22} stroke={1.8} />
                        </span>
                        <div className="min-w-0">
                          <p className="truncate font-mono text-[17px] font-bold tracking-wide text-white">{coupon.code}</p>
                          <p className="text-[14px] text-text-secondary">
                            <span className="font-semibold text-emerald-400">{Number(coupon.discountPercent)}% off</span>
                            {" · "}
                            {coupon.expiresAt ? `until ${formatDate(coupon.expiresAt)}` : "no expiry"}
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => copyCode(coupon.code)}
                        aria-label={`Copy coupon ${coupon.code}`}
                        className="flex h-10 shrink-0 cursor-pointer items-center gap-1.5 rounded-xl border border-white/10 px-3.5 text-[14px] font-semibold text-white hover:bg-white/[0.06]"
                      >
                        {copied ? <IconCheck size={16} className="text-emerald-400" /> : <IconCopy size={16} />}
                        {copied ? "Copied" : "Copy"}
                      </button>
                    </Panel>
                  );
                })}
              </div>
            )}
          </section>
        </>
      )}
    </div>
  );
}
