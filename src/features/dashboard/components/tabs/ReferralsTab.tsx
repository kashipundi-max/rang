"use client";

import React, { useState, useEffect } from "react";
import {
  IconShare,
  IconCopy,
  IconCheck,
  IconCash,
  IconTrophy,
  IconClock,
  IconArrowUpRight,
  IconGift,
} from "../Icons";

interface Referral {
  referredUserId: string;
  affiliateId: string;
  orderId: string;
  commissionAmount: number;
  status: "pending" | "approved" | "paid";
  createdAt: string;
  referredName: string;
  referredEmail: string;
  amountPaid: number;
  planName: string;
}

interface Affiliate {
  userId: string;
  referralCode: string;
  commissionRate: number;
}

interface Metrics {
  totalReferrals: number;
  totalEarned: number;
  pendingEarned: number;
  paidEarned: number;
}

export default function ReferralsTab() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [affiliate, setAffiliate] = useState<Affiliate | null>(null);
  const [metrics, setMetrics] = useState<Metrics>({
    totalReferrals: 0,
    totalEarned: 0,
    pendingEarned: 0,
    paidEarned: 0,
  });
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [copiedLink, setCopiedLink] = useState(false);

  useEffect(() => {
    const fetchReferralData = async () => {
      try {
        const res = await fetch("/api/affiliate");
        const data = await res.json();
        if (data.success) {
          setAffiliate(data.affiliate);
          setMetrics(data.metrics || {
            totalReferrals: 0,
            totalEarned: 0,
            pendingEarned: 0,
            paidEarned: 0,
          });
          setReferrals(data.referrals || []);
        } else {
          setError(data.error || "Failed to load referral details.");
        }
      } catch (err) {
        console.error("Error loading referral data:", err);
        setError("An unexpected error occurred while loading referral data.");
      } finally {
        setLoading(false);
      }
    };

    fetchReferralData();
  }, []);

  const handleCopyLink = () => {
    if (!affiliate) return;
    const origin = typeof window !== "undefined" ? window.location.origin : "https://www.range4ex.com";
    const link = `${origin}/auth/signup?ref=${affiliate.referralCode}`;
    navigator.clipboard.writeText(link);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 text-center border border-dashed border-red-500/30 rounded-xl bg-red-500/5 backdrop-blur-md text-red-400 font-mono text-xs">
        <p>{error}</p>
      </div>
    );
  }

  const referralLink = affiliate 
    ? `${typeof window !== "undefined" ? window.location.origin : "https://www.range4ex.com"}/auth/signup?ref=${affiliate.referralCode}`
    : "";

  return (
    <div className="space-y-6 md:space-y-8 animate-fade-in relative">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border-secondary pb-4">
        <div>
          <h1 className="text-3xl font-clash-display font-semibold tracking-tight text-white flex items-center gap-2">
            Referral Program
          </h1>
          <p className="text-text-secondary text-sm">
            Earn 5% commission on challenge purchases when traders sign up using your unique link.
          </p>
        </div>
      </div>

      {/* Referral Link & Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Referral Link Card */}
        <div className="lg:col-span-1 dash-card p-5 flex flex-col justify-between min-h-[220px]">
          <div>
            <h3 className="text-sm font-semibold text-white mb-2 flex items-center gap-1.5">
              <IconShare size={16} className="text-brand-primary" />
              <span>Your Partner Link</span>
            </h3>
            <p className="text-xs text-text-secondary leading-normal">
              Share this link with other traders. Any challenge purchase they make will grant you a 5% commission instantly.
            </p>
          </div>

          <div className="space-y-3 mt-4">
            <div className="p-2.5 rounded bg-neutral-950 border border-neutral-900 flex justify-between font-mono text-xs items-center">
              <span className="text-neutral-500 text-[10px] uppercase">Ref Code:</span>
              <span className="text-white font-bold">{affiliate?.referralCode}</span>
            </div>

            <button
              onClick={handleCopyLink}
              className="w-full py-2 bg-white text-black hover:bg-neutral-200 text-xs font-semibold rounded flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              {copiedLink ? <IconCheck size={16} /> : <IconCopy size={16} />}
              <span>{copiedLink ? "Link Copied!" : "Copy Referral Link"}</span>
            </button>
          </div>
        </div>

        {/* Right: Metrics Grid */}
        <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="dash-card p-5 flex flex-col justify-between">
            <div>
              <span className="text-[10px] text-text-secondary uppercase tracking-wider font-mono">Total Referred Traders</span>
              <h2 className="text-3xl font-semibold font-mono text-white mt-2">{metrics.totalReferrals}</h2>
            </div>
            <p className="text-[10px] text-text-muted mt-4 font-mono flex items-center gap-1">
              <IconGift size={12} className="text-brand-primary" />
              <span>Signed up using your code</span>
            </p>
          </div>

          <div className="dash-card p-5 flex flex-col justify-between">
            <div>
              <span className="text-[10px] text-text-secondary uppercase tracking-wider font-mono">Pending Commissions</span>
              <h2 className="text-3xl font-semibold font-mono text-amber-400 mt-2">${metrics.pendingEarned.toFixed(2)}</h2>
            </div>
            <p className="text-[10px] text-text-muted mt-4 font-mono flex items-center gap-1">
              <IconClock size={12} className="text-amber-400" />
              <span>Awaiting payment approval</span>
            </p>
          </div>

          <div className="dash-card p-5 flex flex-col justify-between">
            <div>
              <span className="text-[10px] text-text-secondary uppercase tracking-wider font-mono">Approved Earnings</span>
              <h2 className="text-3xl font-semibold font-mono text-emerald-400 mt-2">${metrics.totalEarned.toFixed(2)}</h2>
            </div>
            <p className="text-[10px] text-text-muted mt-4 font-mono flex items-center gap-1">
              <IconCash size={12} className="text-emerald-400" />
              <span>Added to your main balance</span>
            </p>
          </div>
        </div>
      </div>

      {/* Referred Purchases Table */}
      <div className="dash-card p-6">
        <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
          <IconTrophy size={16} className="text-brand-primary" />
          <span>Referred Purchase Directory</span>
        </h3>

        {referrals.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono text-neutral-400 border-collapse">
              <thead>
                <tr className="border-b border-white/5 text-neutral-500">
                  <th className="pb-3 font-semibold">Trader Details</th>
                  <th className="pb-3 font-semibold">Challenge Purchased</th>
                  <th className="pb-3 font-semibold">Order Price</th>
                  <th className="pb-3 font-semibold">Your Commission (5%)</th>
                  <th className="pb-3 font-semibold">Status</th>
                  <th className="pb-3 text-right font-semibold">Date Registered</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {referrals.map((r, idx) => (
                  <tr key={idx} className="hover:bg-white/[0.01]">
                    <td className="py-3.5">
                      <span className="text-white font-bold block">{r.referredName}</span>
                      <span className="text-[10px] text-neutral-500">{r.referredEmail}</span>
                    </td>
                    <td className="py-3.5 text-neutral-300 capitalize">{r.planName}</td>
                    <td className="py-3.5 text-white">${r.amountPaid}</td>
                    <td className="py-3.5 text-emerald-400 font-bold">${r.commissionAmount.toFixed(2)}</td>
                    <td className="py-3.5">
                      <span
                        className={`text-[9px] uppercase px-2 py-0.5 rounded border font-bold ${
                          r.status === "paid"
                            ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                            : r.status === "approved"
                            ? "bg-blue-500/10 border-blue-500/30 text-blue-400"
                            : "bg-amber-500/10 border-amber-500/30 text-amber-400"
                        }`}
                      >
                        {r.status}
                      </span>
                    </td>
                    <td className="py-3.5 text-right text-neutral-400">
                      {new Date(r.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-12 text-neutral-500 font-mono border border-dashed border-white/5 rounded-xl bg-neutral-950/20 backdrop-blur-md">
            <IconGift size={24} className="mx-auto text-neutral-700 mb-2" />
            <span>No referrals registered yet. Share your partner link to start earning!</span>
          </div>
        )}
      </div>
    </div>
  );
}
