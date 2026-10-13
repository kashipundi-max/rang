"use client";

import React, { useCallback, useEffect, useState } from "react";
import {
  IconEye,
  IconEyeOff,
  IconCopy,
  IconServer,
  IconKey,
  IconWallet,
  IconPlus,
  IconChevronDown,
  IconChevronUp,
  IconCheck,
  IconClock,
  IconGift,
} from "../Icons";
import { Account } from "../../index";
import { useParams } from "next/navigation";
import { getManualWallet, isManualCryptoMethod, parseManualGatewayRef } from "@/config/manualWallets";

type OfferTag = {
  offerId: string;
  offerName: string;
  kind: "active" | "granted" | "applied";
  label: string;
  detail: string;
};

const OFFER_TAG_STYLES: Record<OfferTag["kind"], string> = {
  active: "border-fuchsia-500/30 bg-fuchsia-500/10 text-fuchsia-300",
  granted: "border-emerald-500/30 bg-emerald-500/10 text-emerald-300",
  applied: "border-sky-500/30 bg-sky-500/10 text-sky-300",
};

interface AccountsTabProps {
  accounts: Account[];
  activeAccountId: string;
  onSelectAccount: (accountId: string) => void;
  onNavigateBuy: () => void;
  onOpenGraph: (accountId: string) => void;
  /** Reload the dashboard after a free retry issues a new pending account. */
  onAccountsChanged?: () => void | Promise<void>;
}

export default function AccountsTab({
  accounts,
  activeAccountId,
  onSelectAccount,
  onNavigateBuy,
  onOpenGraph,
  onAccountsChanged,
}: AccountsTabProps) {
  const params = useParams();
  const locale = String(params?.locale || "en");

  // Paid-for orders that have no trading account yet (awaiting payment or admin review),
  // so a trader can see their order right after checkout.
  const [pendingOrders, setPendingOrders] = useState<any[]>([]);
  useEffect(() => {
    let cancelled = false;
    fetch("/api/orders")
      .then((response) => response.json())
      .then((data) => {
        if (cancelled || !data.success) return;
        setPendingOrders(
          (data.orders || [])
            .filter((order: any) => String(order.status || "").toLowerCase() === "pending")
            .sort((a: any, b: any) => String(b.createdAt).localeCompare(String(a.createdAt))),
        );
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  const [showPassword, setShowPassword] = useState<Record<string, boolean>>({});
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Free-retry offers the admin has scoped to this trader's failed accounts.
  // Fetched here rather than threaded through the dashboard because nothing
  // else on the page needs it.
  const [retryEligibility, setRetryEligibility] = useState<any[]>([]);
  const [claimingAccountId, setClaimingAccountId] = useState<string | null>(null);
  const [retryError, setRetryError] = useState("");
  const [retryErrorAccountId, setRetryErrorAccountId] = useState<string | null>(
    null,
  );

  const loadRetryEligibility = useCallback(async () => {
    try {
      const response = await fetch("/api/offers/retry");
      const data = await response.json();
      if (response.ok && data.success) {
        setRetryEligibility(data.eligibility || []);
      }
    } catch {
      // A missing offers table must never break the accounts list.
      setRetryEligibility([]);
    }
  }, []);

  // Offers apply without a code, so each account shows a tag for every offer
  // that is live on it or that it came from.
  const [offerTags, setOfferTags] = useState<Record<string, OfferTag[]>>({});

  const loadOfferTags = useCallback(async () => {
    try {
      const response = await fetch("/api/offers/accounts");
      const data = await response.json();
      if (response.ok && data.success) {
        setOfferTags(data.tags || {});
      }
    } catch {
      setOfferTags({});
    }
  }, []);

  useEffect(() => {
    loadRetryEligibility();
    loadOfferTags();
  }, [loadRetryEligibility, loadOfferTags]);

  const handleClaimRetry = async (accountId: string) => {
    setClaimingAccountId(accountId);
    setRetryError("");
    setRetryErrorAccountId(null);
    try {
      const response = await fetch("/api/offers/retry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ accountId }),
      });
      const data = await response.json();
      if (!response.ok || !data.success) {
        setRetryError(data.error || "Could not request the free retry.");
        setRetryErrorAccountId(accountId);
        return;
      }
      await Promise.all([loadRetryEligibility(), loadOfferTags()]);
      await onAccountsChanged?.();
    } catch {
      setRetryError("Could not request the free retry.");
      setRetryErrorAccountId(accountId);
    } finally {
      setClaimingAccountId(null);
    }
  };

  // Track expanded state for accounts (default active account is expanded)
  const [expandedAccounts, setExpandedAccounts] = useState<
    Record<string, boolean>
  >({
    [activeAccountId]: true,
  });

  const toggleExpand = (accId: string, e: React.MouseEvent) => {
    e.stopPropagation(); // prevent selecting the account just from clicking expand
    setExpandedAccounts((prev) => ({ ...prev, [accId]: !prev[accId] }));
  };

  const togglePassword = (accId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setShowPassword((prev) => ({ ...prev, [accId]: !prev[accId] }));
  };

  const handleCopy = (text: string, label: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(text);
    setCopiedId(label);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="space-y-6 md:space-y-8 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border-secondary pb-4">
        <div>
          <h1 className="text-3xl font-clash-display font-semibold tracking-tight text-white flex items-center gap-2">
            My Accounts
          </h1>
          <p className="text-text-secondary text-sm">
            View status, login credentials, and statistics for all evaluation
            and funded accounts.
          </p>
        </div>
        <button
          onClick={onNavigateBuy}
          className="px-4 py-2 bg-white text-black hover:bg-neutral-200 text-xs font-semibold rounded flex items-center gap-1.5 transition-colors cursor-pointer"
        >
          <IconPlus size={16} />
          <span>New Challenge</span>
        </button>
      </div>

      {pendingOrders.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-neutral-400">Pending orders</h2>
          {pendingOrders.map((order) => {
            const proof = isManualCryptoMethod(order.paymentMethod) ? parseManualGatewayRef(order.gatewayRef) : null;
            return (
              <div
                key={order.id}
                className={`flex flex-col gap-3 rounded-2xl border p-4 sm:flex-row sm:items-center sm:justify-between ${
                  proof ? "border-amber-500/25 bg-amber-500/[0.04]" : "border-white/[0.08] bg-neutral-950/40"
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border ${proof ? "border-amber-500/30 bg-amber-500/10 text-amber-400" : "border-white/10 bg-white/5 text-neutral-400"}`}>
                    <IconClock size={18} />
                  </span>
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono text-sm font-bold text-white">{order.id}</span>
                      <span className={`rounded-full border px-2 py-0.5 text-[9px] font-bold uppercase ${proof ? "border-amber-500/30 bg-amber-500/10 text-amber-300" : "border-neutral-700 bg-neutral-900 text-neutral-400"}`}>
                        {proof ? "Payment under review" : "Awaiting payment"}
                      </span>
                    </div>
                    <p className="mt-1 text-[11px] text-neutral-500">
                      {order.planName || "Challenge"} · ${Number(order.amountPaid || 0).toLocaleString()}
                      {proof && ` · ${getManualWallet(proof.walletId)?.label || proof.walletId}`}
                      {order.createdAt && ` · ${String(order.createdAt).substring(0, 10)}`}
                    </p>
                  </div>
                </div>
                {proof ? (
                  <p className="text-[10px] text-neutral-500 sm:max-w-[220px] sm:text-right">
                    Your account credentials appear here once an admin verifies the transaction.
                  </p>
                ) : (
                  <a
                    href={`/pay?orderId=${encodeURIComponent(order.id)}&locale=${encodeURIComponent(locale)}`}
                    className="shrink-0 rounded-lg bg-white px-4 py-2 text-center text-xs font-semibold text-black transition-colors hover:bg-neutral-200"
                  >
                    Complete payment
                  </a>
                )}
              </div>
            );
          })}
        </section>
      )}

      {/* Account Column List */}
      <div className="flex flex-col gap-4">
        {accounts.length === 0 && pendingOrders.length > 0 ? null : accounts.length === 0 ? (
          <div className="text-center py-16 border border-dashed border-neutral-850 rounded-2xl text-neutral-400 bg-neutral-950/20 backdrop-blur-md">
            <IconWallet size={32} className="mx-auto text-neutral-600 mb-3" />
            <p className="font-semibold text-white">No accounts found</p>
            <p className="text-xs text-neutral-500 mt-1 max-w-xs mx-auto">
              Purchase a challenge plan to get your first MT4, MT5, or cTrader
              account credentials.
            </p>
            <button
              onClick={onNavigateBuy}
              className="mt-4 px-4 py-2 bg-white text-black hover:bg-neutral-200 text-xs font-semibold rounded-lg transition-colors cursor-pointer"
            >
              Get Started
            </button>
          </div>
        ) : (
          accounts.map((acc) => {
            const isActive = acc.id === activeAccountId;
            const isExpanded = expandedAccounts[acc.id] || false;
            const isPassShow = showPassword[acc.id] || false;
            const ruleAlerts = acc.ruleAlerts || [];
            const breachAlerts = ruleAlerts.filter(
              (alert) => alert.type === "error",
            );
            const warningAlerts = ruleAlerts.filter(
              (alert) => alert.type === "warning",
            );
            const hasBreach =
              acc.status === "Failed" || breachAlerts.length > 0;
            const displayedRuleAlerts =
              breachAlerts.length > 0
                ? breachAlerts
                : warningAlerts.length > 0
                  ? warningAlerts
                  : ruleAlerts;
            const retry = retryEligibility.find(
              (item: any) => item.accountId === acc.id,
            );
            const tags = offerTags[acc.id] || [];
            const isNextStageRequest = [
              "Phase 2 (Verification)",
              "Funded (Live)",
            ].includes(acc.phase);

            return (
              <div
                key={acc.id}
                onClick={() => onSelectAccount(acc.id)}
                className={`dash-card cursor-pointer transition-all duration-350 ${
                  isActive
                    ? "border-brand-primary/55 shadow-[0_0_28px_-6px_var(--color-brand-primary)]"
                    : ""
                }`}
              >
                {/* Vertical Active Line Indicator */}
                {isActive && (
                  <div className="absolute left-0 top-0 bottom-0 w-[4px] bg-white shadow-[0_0_12px_rgba(255,255,255,0.8)]" />
                )}

                {/* Main Summary Header (always visible) */}
                <div className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 select-none">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                      <span
                        className={`h-2 w-2 rounded-full ${isActive ? "bg-white shadow-[0_0_8px_rgba(255,255,255,0.8)]" : "bg-neutral-600"}`}
                      />
                      <span className="font-mono text-sm font-bold text-white">
                        #{acc.id}
                      </span>
                    </div>
                    <span
                      className={`text-[9px] font-bold font-mono px-2 py-0.5 rounded border uppercase ${
                        acc.deliveryStatus === "pending"
                          ? "bg-amber-500/10 border-amber-500/20 text-amber-400 animate-pulse"
                          : acc.status === "Funded"
                            ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                            : acc.status === "Passed"
                              ? "bg-blue-500/10 border-blue-500/20 text-blue-400"
                              : acc.status === "Failed"
                                ? "bg-rose-500/10 border-rose-500/20 text-rose-400"
                                : "bg-amber-500/10 border-amber-500/20 text-amber-400"
                      }`}
                    >
                      {acc.deliveryStatus === "pending"
                        ? "Pending"
                        : acc.status}
                    </span>
                    <span className="hidden sm:inline text-neutral-600 font-mono text-[10px]">
                      |
                    </span>
                    <div className="text-left">
                      <h3 className="text-xs sm:text-sm font-semibold text-white leading-none">
                        {acc.type}
                      </h3>
                      <p className="text-[10px] text-text-secondary mt-1 leading-none">
                        {acc.phase}
                      </p>
                    </div>
                    {hasBreach && (
                      <span className="hidden md:inline-flex rounded border border-rose-500/30 bg-rose-500/10 px-2 py-0.5 font-mono text-[9px] font-bold uppercase tracking-wider text-rose-300">
                        You are breached
                      </span>
                    )}
                    {!hasBreach && warningAlerts.length > 0 && (
                      <span className="hidden md:inline-flex rounded border border-amber-500/30 bg-amber-500/10 px-2 py-0.5 font-mono text-[9px] font-bold uppercase tracking-wider text-amber-300">
                        Rule warning
                      </span>
                    )}
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-6 sm:gap-8">
                    {/* Balance / Equity Quick stats */}
                    <div className="text-left sm:text-right">
                      <div className="text-[10px] text-text-secondary uppercase tracking-wider font-mono">
                        Current Balance
                      </div>
                      <div className="text-xs sm:text-sm font-mono font-semibold text-white mt-0.5">
                        $
                        {acc.balance.toLocaleString(undefined, {
                          minimumFractionDigits: 2,
                        })}
                      </div>
                    </div>

                    <div className="hidden xs:block text-left sm:text-right">
                      <div className="text-[10px] text-text-secondary uppercase tracking-wider font-mono">
                        Account Size
                      </div>
                      <div className="text-xs sm:text-sm font-mono font-semibold text-neutral-300 mt-0.5">
                        ${acc.size.toLocaleString()}
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <span className="text-[10px] text-text-muted font-mono uppercase bg-neutral-900 border border-neutral-800 px-2 py-0.5 rounded">
                        {acc.platform}
                      </span>
                      {/* Expand Trigger Button */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onOpenGraph(acc.id);
                        }}
                        className="px-2 py-1.5 rounded-lg border border-neutral-800 text-[10px] font-bold uppercase text-neutral-300 hover:text-white hover:bg-neutral-900 transition-all cursor-pointer"
                      >
                        Graph
                      </button>
                      <button
                        onClick={(e) => toggleExpand(acc.id, e)}
                        className="p-1.5 rounded-lg border border-neutral-800 text-neutral-400 hover:text-white hover:bg-neutral-900 transition-all cursor-pointer"
                      >
                        {isExpanded ? (
                          <IconChevronUp size={14} />
                        ) : (
                          <IconChevronDown size={14} />
                        )}
                      </button>
                    </div>
                  </div>
                </div>

                {tags.length > 0 && (
                  <div className="-mt-2 flex flex-wrap gap-1.5 px-4 pb-3 sm:px-5">
                    {tags.map((tag) => (
                      <span
                        key={`${tag.kind}-${tag.offerId}`}
                        title={tag.detail}
                        className={`inline-flex max-w-full items-center gap-1 rounded border px-2 py-0.5 font-mono text-[9px] font-bold uppercase tracking-wider ${OFFER_TAG_STYLES[tag.kind]}`}
                      >
                        <IconGift size={10} className="shrink-0" />
                        <span className="truncate">{tag.label}</span>
                      </span>
                    ))}
                  </div>
                )}

                {/* Free retry offer — only on a failed account the admin has
                    an active free-retry offer covering. */}
                {retry && (
                  <div
                    className={`border-t px-4 py-3 sm:px-5 ${
                      retry.offer
                        ? "border-emerald-500/20 bg-emerald-500/[0.06]"
                        : "border-amber-500/20 bg-amber-500/[0.06]"
                    }`}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <div className="flex items-start gap-2.5 min-w-0">
                        <IconGift
                          size={16}
                          className={
                            retry.offer
                              ? "mt-0.5 shrink-0 text-emerald-400"
                              : "mt-0.5 shrink-0 text-amber-400"
                          }
                        />
                        <div className="min-w-0">
                          <p className="text-xs font-semibold text-white">
                            {retry.offer
                              ? `Free retry available — ${retry.offer.name}`
                              : "Free retry requested"}
                          </p>
                          <p className="mt-0.5 text-[11px] leading-relaxed text-text-secondary">
                            {retry.offer
                              ? `This account failed, so you can request a replacement $${Number(retry.accountSize).toLocaleString()} account at no cost. ${retry.offer.retriesRemaining} retr${retry.offer.retriesRemaining === 1 ? "y" : "ies"} left on this account.`
                              : `Your replacement account${retry.newAccountId ? ` (#${retry.newAccountId})` : ""} is being provisioned. Credentials appear here once delivered.`}
                          </p>
                        </div>
                      </div>
                      {retry.offer && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleClaimRetry(acc.id);
                          }}
                          disabled={claimingAccountId === acc.id}
                          className="shrink-0 rounded-lg bg-emerald-500 px-4 py-2 text-[11px] font-bold text-black transition-colors hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer"
                        >
                          {claimingAccountId === acc.id
                            ? "Requesting…"
                            : "Request free account"}
                        </button>
                      )}
                    </div>
                    {retryError && retryErrorAccountId === acc.id && (
                      <p className="mt-2 text-[11px] text-rose-300">{retryError}</p>
                    )}
                  </div>
                )}

                {/* Expandable Details Container */}
                {isExpanded && (
                  <div className="border-t border-neutral-900 bg-black/10 p-5 animate-fade-in">
                    {displayedRuleAlerts.length > 0 && (
                      <div
                        className={`mb-5 rounded-xl border p-4 ${
                          breachAlerts.length > 0
                            ? "border-rose-500/30 bg-rose-500/10"
                            : warningAlerts.length > 0
                              ? "border-amber-500/30 bg-amber-500/10"
                              : "border-blue-500/30 bg-blue-500/10"
                        }`}
                      >
                        <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between">
                          <p className="font-mono text-[10px] font-bold uppercase tracking-wider text-white">
                            {breachAlerts.length > 0
                              ? `You are breached${breachAlerts.length > 1 ? ` — ${breachAlerts.length} violations` : ""}`
                              : "Rule alert"}
                          </p>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              onOpenGraph(acc.id);
                            }}
                            className="w-fit rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 font-mono text-[10px] font-bold uppercase text-white transition-colors hover:bg-white/10"
                          >
                            View Graph
                          </button>
                        </div>
                        <div className="mt-3 space-y-3 divide-y divide-white/5">
                          {displayedRuleAlerts.map((alert, index) => (
                            <div key={alert.id} className={index === 0 ? "" : "pt-3"}>
                              <h4 className="text-sm font-semibold text-white">
                                {alert.title}
                              </h4>
                              <p className="mt-1 text-xs leading-relaxed text-neutral-300">
                                {alert.message}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Metrics Section */}
                      <div className="space-y-3.5">
                        <h4 className="text-[10px] uppercase font-bold text-neutral-500 font-mono tracking-wider">
                          Financial Highlights
                        </h4>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="p-3 bg-neutral-950/40 border border-neutral-900 rounded-xl">
                            <span className="text-[10px] text-text-secondary block font-mono">
                              Initial Size
                            </span>
                            <span className="text-sm font-bold text-white font-mono block mt-1">
                              ${acc.size.toLocaleString()}
                            </span>
                          </div>
                          <div className="p-3 bg-neutral-950/40 border border-neutral-900 rounded-xl">
                            <span className="text-[10px] text-text-secondary block font-mono">
                              Live Equity
                            </span>
                            <span className="text-sm font-bold text-white font-mono block mt-1">
                              $
                              {acc.equity.toLocaleString(undefined, {
                                minimumFractionDigits: 2,
                              })}
                            </span>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="p-3 bg-neutral-950/40 border border-neutral-900 rounded-xl">
                            <span className="text-[10px] text-text-secondary block font-mono">
                              Today's P&L
                            </span>
                            <span
                              className={`text-sm font-bold font-mono block mt-1 ${acc.todayPl >= 0 ? "text-emerald-400" : "text-rose-400"}`}
                            >
                              {acc.todayPl >= 0 ? "+" : ""}$
                              {acc.todayPl.toLocaleString(undefined, {
                                minimumFractionDigits: 2,
                              })}
                            </span>
                          </div>
                          <div className="p-3 bg-neutral-950/40 border border-neutral-900 rounded-xl">
                            <span className="text-[10px] text-text-secondary block font-mono">
                              Total Net P&L
                            </span>
                            <span
                              className={`text-sm font-bold font-mono block mt-1 ${acc.totalPl >= 0 ? "text-emerald-400" : "text-rose-400"}`}
                            >
                              {acc.totalPl >= 0 ? "+" : ""}$
                              {acc.totalPl.toLocaleString(undefined, {
                                minimumFractionDigits: 2,
                              })}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Credentials Section */}
                      <div className="space-y-3.5">
                        <h4 className="text-[10px] uppercase font-bold text-neutral-500 font-mono tracking-wider">
                          Trading Credentials
                        </h4>
                        {acc.deliveryStatus === "pending" ? (
                          <div className="p-4 rounded-xl bg-gradient-to-br from-neutral-950 via-neutral-950 to-brand-surface/10 border border-white/10 flex flex-col gap-3 font-mono text-xs">
                            <div className="flex items-start gap-3 border-b border-white/5 pb-3">
                              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-emerald-500/20 bg-emerald-500/10 text-emerald-300">
                                <IconCheck size={16} />
                              </span>
                              <div>
                                <span className="block text-[9px] uppercase tracking-wider text-emerald-300 font-bold">
                                  Request submitted
                                </span>
                                <span className="mt-1 block text-[11px] leading-relaxed text-neutral-400 font-sans">
                                  {isNextStageRequest
                                    ? "Your next-stage account request is saved. Admin delivery is pending."
                                    : "Your account request is saved. Admin delivery is pending."}
                                </span>
                              </div>
                            </div>
                            <div className="flex items-center justify-between text-text-secondary">
                              <span className="flex items-center gap-2">
                                <IconClock
                                  size={13}
                                  className="text-amber-400"
                                />
                                <span>Status:</span>
                              </span>
                              <span className="text-amber-400 font-bold uppercase animate-pulse">
                                Delivery Pending
                              </span>
                            </div>
                            <div className="flex items-center justify-between text-text-secondary">
                              <span>Account ID:</span>
                              <span className="text-white font-bold">
                                #{acc.id}
                              </span>
                            </div>
                            <div className="flex items-center justify-between text-text-secondary">
                              <span>Challenge Model:</span>
                              <span className="text-white font-bold">
                                {acc.type}
                              </span>
                            </div>
                            <div className="flex items-center justify-between text-text-secondary">
                              <span>Account Size:</span>
                              <span className="text-white font-bold">
                                ${acc.size.toLocaleString()}
                              </span>
                            </div>
                            <div className="flex items-center justify-between text-text-secondary">
                              <span>Platform:</span>
                              <span className="text-white font-bold">
                                {acc.platform}
                              </span>
                            </div>
                            <div className="border-t border-neutral-900 pt-2.5 mt-1 text-[10px] text-neutral-500 leading-relaxed font-sans">
                              Credentials will display here automatically as
                              soon as the delivery desk assigns the server,
                              login, and passwords.
                            </div>
                          </div>
                        ) : (
                          <div className="p-4 rounded-xl bg-neutral-950 border border-neutral-900 flex flex-col gap-2.5 font-mono text-xs">
                            <div className="flex items-center justify-between text-text-secondary">
                              <span className="flex items-center gap-2">
                                <IconKey
                                  size={13}
                                  className="text-neutral-500"
                                />
                                <span>Login ID:</span>
                              </span>
                              <div className="flex items-center gap-1.5">
                                <span className="text-white font-bold">
                                  {acc.login}
                                </span>
                                <button
                                  onClick={(e) =>
                                    handleCopy(acc.login, `login-${acc.id}`, e)
                                  }
                                  className="p-1 hover:bg-neutral-900 rounded text-neutral-500 hover:text-white cursor-pointer transition-colors"
                                >
                                  <IconCopy size={12} />
                                </button>
                              </div>
                            </div>

                            <div className="flex items-center justify-between text-text-secondary">
                              <span className="flex items-center gap-2">
                                <IconKey
                                  size={13}
                                  className="text-neutral-500"
                                />
                                <span>Master Password:</span>
                              </span>
                              <div className="flex items-center gap-1.5">
                                <span className="text-white font-bold">
                                  {isPassShow
                                    ? acc.passwordMaster || "Not available"
                                    : "••••••••"}
                                </span>
                                <div className="flex items-center gap-0.5">
                                  <button
                                    onClick={(e) => togglePassword(acc.id, e)}
                                    className="p-1 hover:bg-neutral-900 rounded text-neutral-500 hover:text-white cursor-pointer transition-colors"
                                  >
                                    {isPassShow ? (
                                      <IconEyeOff size={12} />
                                    ) : (
                                      <IconEye size={12} />
                                    )}
                                  </button>
                                  <button
                                    onClick={(e) =>
                                      handleCopy(
                                        acc.passwordMaster || "",
                                        `pass-${acc.id}`,
                                        e,
                                      )
                                    }
                                    className="p-1 hover:bg-neutral-900 rounded text-neutral-500 hover:text-white cursor-pointer transition-colors"
                                  >
                                    <IconCopy size={12} />
                                  </button>
                                </div>
                              </div>
                            </div>

                            <div className="flex items-start justify-between gap-3 text-text-secondary">
                              <span className="flex shrink-0 items-center gap-2">
                                <IconServer
                                  size={13}
                                  className="text-neutral-500"
                                />
                                <span>Server:</span>
                              </span>
                              <div className="flex min-w-0 items-center gap-1.5">
                                <span className="min-w-0 break-all text-right text-white font-bold">
                                  {acc.server}
                                </span>
                                <button
                                  onClick={(e) =>
                                    handleCopy(
                                      acc.server,
                                      `server-${acc.id}`,
                                      e,
                                    )
                                  }
                                  className="p-1 hover:bg-neutral-900 rounded text-neutral-500 hover:text-white cursor-pointer transition-colors"
                                >
                                  <IconCopy size={12} />
                                </button>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Actions / Selection Footer inside Expanded Panel */}
                    <div className="mt-5 pt-4 border-t border-neutral-900 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-xs">
                      <div className="flex items-center gap-2">
                        <span className="text-text-muted font-mono uppercase tracking-wider">
                          PLATFORM: {acc.platform}
                        </span>
                        {copiedId && copiedId.includes(acc.id) && (
                          <span className="text-white font-bold font-mono bg-white/5 border border-white/10 px-2 py-0.5 rounded">
                            ✓ Credentials Copied
                          </span>
                        )}
                      </div>

                      {isActive ? (
                        <div className="text-white font-bold uppercase font-mono flex items-center gap-1.5 bg-white/5 border border-white/10 px-3 py-1.5 rounded-lg select-none">
                          <span className="h-1.5 w-1.5 bg-white rounded-full animate-ping" />
                          Active Workspace
                        </div>
                      ) : (
                        <button
                          onClick={() => onSelectAccount(acc.id)}
                          className="px-4 py-2 rounded-lg bg-white text-black hover:bg-neutral-200 font-bold transition-all cursor-pointer uppercase font-mono tracking-wider self-end sm:self-auto text-center"
                        >
                          Select Account
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
