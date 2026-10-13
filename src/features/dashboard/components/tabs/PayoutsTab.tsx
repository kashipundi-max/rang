"use client";

import React, { useState } from "react";
import {
  IconCash,
  IconClock,
  IconArrowUpRight,
  IconPlus,
  IconBuildingBank,
  IconCoinBitcoin,
  IconCreditCard,
} from "../Icons";
import { Account, Payout } from "../../index";
import { getPayoutPeriodStart } from "@/lib/payoutRules";
import { getProfitSplitPercent } from "@/lib/rulebook";

interface PayoutsTabProps {
  account: Account;
  payouts: Payout[];
  onRequestPayout: (amount: number, method: string, details: string) => void;
  kycStatus?: "Unsubmitted" | "Pending" | "Verified" | "Rejected";
}

export default function PayoutsTab({
  account,
  payouts,
  onRequestPayout,
  kycStatus = "Unsubmitted",
}: PayoutsTabProps) {
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState("USDT (ERC20)");
  const [details, setDetails] = useState("");

  const isFunded = account ? account.status === "Funded" : false;
  const isKycVerified = kycStatus === "Verified";
  
  const withdrawalCap = account ? account.size * 0.06 : 0;
  const availableGrossProfit = account ? Math.max(0, account.balance - account.size) : 0;
  const accountPayouts = payouts.filter((payout) => payout.accountId === account.id);
  const payoutPeriodStart = getPayoutPeriodStart(account.createdAt || new Date().toISOString());
  const payoutPeriodEnd = new Date(payoutPeriodStart.getTime() + 14 * 24 * 60 * 60 * 1000);
  const alreadyRequestedInPeriod = accountPayouts
    .filter((payout) => {
      if (payout.status === "Rejected") return false;
      const requestedAt = new Date(`${payout.date}T23:59:59.999Z`);
      return !Number.isNaN(requestedAt.getTime()) && requestedAt >= payoutPeriodStart;
    })
    .reduce((sum, payout) => sum + payout.amount, 0);
  const remainingPeriodCap = Math.max(0, withdrawalCap - alreadyRequestedInPeriod);
  const eligibleAmount = isFunded ? Math.min(availableGrossProfit, remainingPeriodCap) : 0;
  const priorPaidPayouts = accountPayouts.filter((p) => p.status === "Paid").length;
  const traderSplitPercent = getProfitSplitPercent(priorPaidPayouts);
  const traderShare = eligibleAmount * (traderSplitPercent / 100);
  const hasProfitableDays = account.currentTradingDays >= 3;
  const failingRuleCheck = account.ruleChecks?.find(
    (check) => check.status === "failed" || check.status === "warning",
  );
  const isEligible =
    isFunded &&
    eligibleAmount >= 100 &&
    hasProfitableDays &&
    !failingRuleCheck &&
    isKycVerified;

  const totalPaid = accountPayouts
    .filter((p) => p.status === "Paid")
    .reduce((sum, p) => sum + p.amount, 0);

  const pendingPayouts = accountPayouts
    .filter((p) => p.status === "Pending" || p.status === "Approved")
    .reduce((sum, p) => sum + p.amount, 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const withdrawVal = Number(amount);
    if (isNaN(withdrawVal) || withdrawVal <= 0 || withdrawVal > eligibleAmount) return;

    onRequestPayout(withdrawVal, method, details);
    setShowRequestModal(false);
    setAmount("");
    setDetails("");
  };

  return (
    <div className="space-y-6 md:space-y-8 animate-fade-in relative">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border-secondary pb-4">
        <div>
          <h1 className="text-3xl font-clash-display font-semibold tracking-tight text-white flex items-center gap-2">
            Withdrawals & Payouts
          </h1>
          <p className="text-text-secondary text-sm">
            Request payouts from funded accounts and set up your preferred payment gateway.
          </p>
        </div>
        <button
          onClick={() => setShowRequestModal(true)}
          disabled={!isEligible}
          className="px-4 py-2 bg-white text-black hover:bg-neutral-200 disabled:opacity-40 text-xs font-semibold rounded flex items-center gap-1.5 transition-colors cursor-pointer"
        >
          <IconPlus size={16} />
          <span>Request Payout</span>
        </button>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="dash-card p-5">
          <span className="text-[10px] text-text-secondary uppercase tracking-wider font-mono">Total Paid Out</span>
          <h2 className="text-2xl font-semibold font-mono text-white mt-2">${totalPaid.toLocaleString()}</h2>
          <p className="text-[10px] text-text-muted mt-1 font-mono">Cumulative earnings settled</p>
        </div>

        <div className="dash-card p-5">
          <span className="text-[10px] text-text-secondary uppercase tracking-wider font-mono">Pending Review</span>
          <h2 className="text-2xl font-semibold font-mono text-white mt-2">${pendingPayouts.toLocaleString()}</h2>
          <p className="text-[10px] text-text-muted mt-1 font-mono">Awaiting settlement clearance</p>
        </div>

        <div className="dash-card p-5">
          <span className="text-[10px] text-text-secondary uppercase tracking-wider font-mono">Gross Withdrawal Limit</span>
          <h2 className="text-2xl font-semibold font-mono text-white mt-2">${eligibleAmount.toLocaleString()}</h2>
          <p className="text-[10px] text-text-muted mt-1 font-mono">
            {isEligible
              ? `Remaining period cap; estimated ${traderSplitPercent}% trader share $${traderShare.toLocaleString()}`
              : !hasProfitableDays
                ? `${account.currentTradingDays}/3 profitable days completed`
                : failingRuleCheck
                  ? `${failingRuleCheck.label} must be cleared`
                  : remainingPeriodCap <= 0
                    ? "6% cap already used for this payout period"
                    : "Instant Funded or Funded account with profits required"}
          </p>
        </div>
      </div>

      {!isKycVerified && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 flex items-center gap-3 text-xs text-red-400 font-mono animate-fade-in">
          <span className="h-2 w-2 rounded-full bg-red-400 animate-pulse" />
          <span>
            Identity verification is currently <strong>{kycStatus}</strong>. Your KYC compliance documents must be approved before you can submit payout withdrawal requests.
          </span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Next Payout Date Details */}
        <div className="dash-card p-5 flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-semibold text-white mb-2 flex items-center gap-1.5">
              <IconClock size={16} />
              <span>Next Payout Cycle</span>
            </h3>
            <p className="text-xs text-text-secondary leading-normal">
              Instant Funded and Funded payouts are eligible bi-weekly (every 14 days) after the required qualifying days and with zero rule violations. Gross withdrawals are capped at 6% of the initial balance per payout period; excess profit remains in the account. The performance-fee split is 80% on the first withdrawal, 85% on the second, then 90%.
            </p>
          </div>

          <div className="mt-6 space-y-2 rounded border border-neutral-900 bg-neutral-950 px-3 py-4 font-mono text-xs">
            <div className="flex justify-between gap-3">
              <span className="text-text-secondary">Current Period:</span>
              <span className="text-right font-semibold text-white">
                {payoutPeriodStart.toISOString().slice(0, 10)} - {payoutPeriodEnd.toISOString().slice(0, 10)}
              </span>
            </div>
            <div className="flex justify-between gap-3">
              <span className="text-text-secondary">Cap Already Requested:</span>
              <span className="font-semibold text-white">${alreadyRequestedInPeriod.toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Payout method configuration */}
        <div className="lg:col-span-2 dash-card p-5">
          <h3 className="text-sm font-semibold text-white mb-4">Saved Settlement Methods</h3>
          <div className="space-y-3">
            <div className="p-3.5 rounded-lg bg-neutral-950 border border-neutral-900 flex items-center justify-between text-xs">
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded bg-neutral-900 text-neutral-400 flex items-center justify-center">
                  <IconCoinBitcoin size={16} />
                </div>
                <div>
                  <h4 className="font-semibold text-white">USDT Wallet (ERC20)</h4>
                  <span className="text-[9px] text-neutral-500 font-mono block">Address: 0x71C...89af</span>
                </div>
              </div>
              <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[9px] font-bold font-mono">
                DEFAULT
              </span>
            </div>

            <div className="p-3.5 rounded-lg bg-neutral-950 border border-neutral-900 flex items-center justify-between text-xs">
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded bg-neutral-900 text-neutral-400 flex items-center justify-center">
                  <IconBuildingBank size={16} />
                </div>
                <div>
                  <h4 className="font-semibold text-white">Bank Wire Settlement</h4>
                  <span className="text-[9px] text-neutral-500 font-mono block">Chase Account: *9281</span>
                </div>
              </div>
              <button className="px-2.5 py-1 text-[9px] font-semibold rounded bg-neutral-900 hover:bg-neutral-850 border border-neutral-850 text-white cursor-pointer transition-colors">
                Edit
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Payout History Log */}
      <div className="dash-card p-5">
        <h3 className="text-sm font-semibold text-white mb-4">Payout Clearance Logs</h3>
        {/* Phones: stacked cards instead of a 6-column table */}
        <ul className="divide-y divide-neutral-900/60 md:hidden">
          {accountPayouts.map((p) => (
            <li key={p.id} className="py-3 font-mono text-xs">
              <div className="flex items-center justify-between gap-3">
                <span className="font-bold text-white">${p.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                <span
                  className={`rounded border px-1.5 py-0.5 text-[9px] font-bold uppercase ${
                    p.status === "Paid"
                      ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                      : p.status === "Pending"
                      ? "bg-amber-500/10 border-amber-500/20 text-amber-400"
                      : p.status === "Approved"
                      ? "bg-blue-500/10 border-blue-500/20 text-blue-400"
                      : "bg-rose-500/10 border-rose-500/20 text-rose-400"
                  }`}
                >
                  {p.status}
                </span>
              </div>
              <span className="mt-1 block font-sans text-[11px] text-neutral-300">{p.method}</span>
              <span className="mt-0.5 block break-all text-[10px] text-neutral-500">#{p.id} · {p.date}</span>
            </li>
          ))}
          {accountPayouts.length === 0 && (
            <li className="py-8 text-center font-sans text-xs text-neutral-500">No payout settlements processed.</li>
          )}
        </ul>
        <div className="hidden overflow-x-auto custom-scrollbar md:block">
          <table className="w-full text-left font-mono text-xs border-collapse">
            <thead>
              <tr className="border-b border-neutral-900 text-text-secondary text-[10px] tracking-wider uppercase font-bold">
                <th className="pb-3 pr-4">Reference ID</th>
                <th className="pb-3 px-4">Date Requested</th>
                <th className="pb-3 px-4">Settlement Method</th>
                <th className="pb-3 px-4">Gateway Address</th>
                <th className="pb-3 px-4 text-right">Amount</th>
                <th className="pb-3 pl-4 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-900/60">
              {accountPayouts.map((p) => (
                <tr key={p.id} className="text-neutral-300">
                  <td className="py-3 pr-4 text-neutral-500 font-semibold">#{p.id}</td>
                  <td className="py-3 px-4 text-neutral-400">{p.date}</td>
                  <td className="py-3 px-4 text-white font-sans">{p.method}</td>
                  <td className="py-3 px-4 text-neutral-400 text-[10px] max-w-[120px] truncate">{p.details}</td>
                  <td className="py-3 px-4 text-right font-bold text-white">${p.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                  <td className="py-3 pl-4 text-right">
                    <span
                      className={`inline-block px-1.5 py-0.2 rounded text-[9px] uppercase font-bold border ${
                        p.status === "Paid"
                          ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                          : p.status === "Pending"
                          ? "bg-amber-500/10 border-amber-500/20 text-amber-400 animate-pulse"
                          : p.status === "Approved"
                          ? "bg-blue-500/10 border-blue-500/20 text-blue-400"
                          : "bg-rose-500/10 border-rose-500/20 text-rose-400"
                      }`}
                    >
                      {p.status}
                    </span>
                  </td>
                </tr>
              ))}
              {accountPayouts.length === 0 && (
                <tr>
                  <td colSpan={6} className="text-center py-8 text-neutral-500 font-sans">
                    No payout settlements processed.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Request Payout Modal */}
      {showRequestModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            onClick={() => setShowRequestModal(false)}
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
          />
          <div className="relative z-10 w-[calc(100%-2rem)] max-w-md max-h-[90dvh] overflow-y-auto p-5 sm:p-6 bg-neutral-950 border border-neutral-800 rounded-xl shadow-2xl animate-fade-in">
            <h3 className="text-lg font-semibold text-white font-clash-display">Request Earnings Payout</h3>
            <p className="text-xs text-text-secondary mt-1">
              Select a gross withdrawal amount. The current maximum is <span className="text-white font-bold font-mono">${eligibleAmount.toLocaleString()}</span>; your standard trader share is 80%. Requests above the 6% period cap are automatically adjusted.
            </p>

            <form onSubmit={handleSubmit} className="mt-4 space-y-4 text-xs">
              <div className="space-y-1.5">
                <label className="text-text-secondary font-mono">Withdrawal Amount ($)</label>
                <input
                  type="number"
                  required
                  placeholder={`Max: ${eligibleAmount.toFixed(0)}`}
                  min={100}
                  max={eligibleAmount}
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full px-3 py-2 rounded bg-neutral-900 border border-neutral-800 focus:border-neutral-700 text-white outline-none font-mono"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-text-secondary font-mono">Payout Method</label>
                <select
                  value={method}
                  onChange={(e) => setMethod(e.target.value)}
                  className="w-full px-3 py-2 rounded bg-neutral-900 border border-neutral-800 text-white outline-none cursor-pointer"
                >
                  <option value="USDT (ERC20)">USDT (ERC20) - Fast Crypto</option>
                  <option value="BTC Wallet">Bitcoin (BTC)</option>
                  <option value="Bank Wire">Bank Wire (SWIFT/IBAN)</option>
                  <option value="Deel Settlement">Deel Portal Account</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-text-secondary font-mono">Receiving Wallet Address / IBAN</label>
                <textarea
                  required
                  rows={3}
                  placeholder="Paste your crypto wallet address or Bank Routing/IBAN credentials exactly."
                  value={details}
                  onChange={(e) => setDetails(e.target.value)}
                  className="w-full px-3 py-2 rounded bg-neutral-900 border border-neutral-800 focus:border-neutral-700 text-white outline-none font-mono"
                />
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowRequestModal(false)}
                  className="flex-1 py-2 text-xs font-semibold rounded bg-neutral-900 border border-neutral-800 hover:bg-neutral-850 cursor-pointer text-white text-center"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 text-xs font-semibold rounded bg-white text-black hover:bg-neutral-200 cursor-pointer text-center"
                >
                  Confirm Request
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
