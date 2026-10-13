"use client";

import React, { useState } from "react";
import {
  IconTrophy,
  IconAward,
  IconFlame,
  IconAlertTriangle,
  IconFlag,
  IconWorld,
  IconX,
  IconCopy,
} from "../Icons";
import { Account } from "../../index";

interface AchievementsTabProps {
  accounts: Account[];
  certificates?: any[];
  /** Signed-in trader's full name, shown on their own leaderboard row. */
  userName?: string;
}

export default function AchievementsTab({ accounts, certificates = [], userName }: AchievementsTabProps) {
  const [activeCert, setActiveCert] = useState<any | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const selfName = userName?.trim() ?? "";
  const selfInitials =
    selfName
      .split(/\s+/)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase() ?? "")
      .join("") || "YOU";

  const hasFunded = accounts.some((a) => a.status === "Funded");
  const hasPassed = accounts.some((a) => a.status === "Passed" || a.status === "Funded");

  const badges = [
    {
      id: "b1",
      title: "Challenge Passed",
      desc: "Successfully passed Phase 1 & Phase 2 evaluation objectives.",
      icon: <IconAward size={20} />,
      unlocked: hasPassed,
    },
    {
      id: "b2",
      title: "Funded Trader",
      desc: "Activated your first live funded account with profit share.",
      icon: <IconTrophy size={20} />,
      unlocked: hasFunded,
    },
    {
      id: "b3",
      title: "Zero Violations",
      desc: "Traded an evaluation account without hitting any drawdown warning.",
      icon: <IconAlertTriangle size={20} className="rotate-180" />,
      unlocked: true,
    },
    {
      id: "b4",
      title: "First Payout",
      desc: "Requested and cleared your first withdrawal profit split.",
      icon: <IconAward size={20} />,
      unlocked: true,
    },
    {
      id: "b5",
      title: "Profit Streak",
      desc: "Close 10 consecutive trading days in positive net yield.",
      icon: <IconFlame size={20} />,
      unlocked: false,
    },
    {
      id: "b6",
      title: "Consistency King",
      desc: "Maintain a daily variance deviation under 15% across 20 trades.",
      icon: <IconFlag size={20} />,
      unlocked: false,
    },
  ];

  // Leaderboard data
  const leaderboard = [
    { rank: 1, name: "Dominik S.", country: "🇨🇿 CZ", return: "+114.2%", profit: "$22,840", phase: "Funded", avatar: "DS" },
    { rank: 2, name: "Marcus A.", country: "🇸🇪 SE", return: "+89.4%", profit: "$17,880", phase: "Funded", avatar: "MA" },
    { rank: 3, name: "Emily L.", country: "🇬🇧 UK", return: "+82.1%", profit: "$41,050", phase: "Funded", avatar: "EL" },
    { rank: 4, name: "Yasmin K.", country: "🇦🇪 AE", return: "+76.8%", profit: "$15,360", phase: "Funded", avatar: "YK" },
    { rank: 5, name: "Jean P.", country: "🇫🇷 FR", return: "+71.5%", profit: "$14,300", phase: "Funded", avatar: "JP" },
    { rank: 6, name: selfName ? `${selfName} (You)` : "You", country: "🇺🇸 US", return: "+4.76%", profit: "$2,380", phase: "Funded", avatar: selfInitials, highlighted: true },
  ];

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(label);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6 md:space-y-8 animate-fade-in relative">
      {/* Title */}
      <div className="border-b border-border-secondary pb-4">
        <h1 className="text-3xl font-clash-display font-semibold tracking-tight text-white flex items-center gap-2">
          Milestones & Leaderboard
        </h1>
        <p className="text-text-secondary text-sm">
          Track unlocked badges, completed milestones, and see how you rank against global prop traders.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Badges Grid */}
        <div className="lg:col-span-2 space-y-6">
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-white">Earned Badges</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {badges.map((badge) => (
                <div
                  key={badge.id}
                  className={`dash-card flex items-start gap-4 p-4 transition-all ${
                    badge.unlocked ? "" : "opacity-40"
                  }`}
                >
                  <div className={`p-2.5 rounded-lg flex-shrink-0 ${
                    badge.unlocked ? "bg-white text-black" : "bg-neutral-900 text-neutral-500"
                  }`}>
                    {badge.icon}
                  </div>
                  <div>
                    <h4 className="text-xs font-semibold text-white flex items-center gap-2">
                      <span>{badge.title}</span>
                      {badge.unlocked && (
                        <span className="text-[8px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/25 px-1 rounded uppercase font-semibold">
                          UNLOCKED
                        </span>
                      )}
                    </h4>
                    <p className="text-xs text-text-secondary mt-1 leading-normal">{badge.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Certificates Ledger Section */}
          <div className="dash-card p-5 space-y-4">
            <h3 className="text-sm font-semibold text-white flex items-center gap-2">
              <IconAward className="text-amber-500" size={16} />
              <span>Verifiable Trader Certificates</span>
            </h3>
            <p className="text-xs text-text-secondary">
              Official verification credentials issued on successful phase completions and profit split payouts.
            </p>

            <div className="space-y-3 font-mono text-xs">
              {certificates.map((cert) => (
                <div
                  key={cert.id}
                  className="p-3.5 rounded-xl border border-white/5 bg-neutral-950/20 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="space-y-1">
                    <span className="text-white font-bold block">{cert.planName}</span>
                    <span className="text-[9px] text-neutral-500 block uppercase">
                      ID: {cert.id} • Account Size: ${cert.accountSize.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleCopy(`http://localhost:3000/api/certificates?id=${cert.id}`, cert.id)}
                      className="px-2.5 py-1.5 bg-neutral-900 hover:bg-neutral-850 border border-white/5 hover:border-white/10 rounded-lg text-[10px] text-neutral-300 cursor-pointer flex items-center gap-1"
                    >
                      <IconCopy size={12} />
                      <span>{copiedId === cert.id ? "Copied Link!" : "Copy Link"}</span>
                    </button>
                    <button
                      onClick={() => setActiveCert(cert)}
                      className="px-3 py-1.5 bg-white hover:bg-neutral-200 text-black font-semibold text-[10px] rounded-lg cursor-pointer"
                    >
                      View & Print
                    </button>
                  </div>
                </div>
              ))}
              {certificates.length === 0 && (
                <div className="text-center py-6 text-neutral-500 font-sans">
                  No evaluation certificates issued yet. Complete challenges to pass target objectives.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Global Leaderboard */}
        <div className="dash-card p-5 space-y-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-semibold text-white flex items-center gap-1.5">
              <IconWorld size={16} />
              <span>Global Rankings</span>
            </h3>
            <span className="text-[10px] text-text-muted font-mono uppercase">Monthly Return</span>
          </div>

          <div className="space-y-2">
            {leaderboard.map((trader) => (
              <div
                key={trader.name}
                className={`p-3 rounded-lg border flex items-center justify-between transition-colors ${
                  trader.highlighted
                    ? "bg-white/95 border-white text-black"
                    : "bg-neutral-950/60 border-neutral-900 text-neutral-300"
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className={`font-mono text-xs font-bold w-4 text-center ${
                    trader.highlighted ? "text-black" : "text-neutral-500"
                  }`}>
                    {trader.rank}
                  </span>
                  <div className={`h-7 w-7 rounded-full flex items-center justify-center text-xs font-bold font-mono ${
                    trader.highlighted ? "bg-black text-white" : "bg-neutral-800 text-neutral-300"
                  }`}>
                    {trader.avatar}
                  </div>
                  <div>
                    <h4 className={`text-xs font-semibold ${trader.highlighted ? "text-black font-bold" : "text-white"}`}>
                      {trader.name}
                    </h4>
                    <span className="text-[9px] text-neutral-500 font-sans block">{trader.country}</span>
                  </div>
                </div>

                <div className="text-right font-mono">
                  <span className={`text-xs font-bold ${
                    trader.highlighted ? "text-black" : "text-emerald-400"
                  }`}>
                    {trader.return}
                  </span>
                  <span className={`text-[9px] block ${
                    trader.highlighted ? "text-neutral-600" : "text-neutral-500"
                  }`}>
                    {trader.profit} Profit
                  </span>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center pt-2">
            <span className="text-[10px] text-text-muted uppercase font-semibold font-mono">
              Your Rank: #824 / 28,190 Traders
            </span>
          </div>
        </div>
      </div>

      {/* Certificate Print Preview Modal */}
      {activeCert && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 print:p-0 print:static">
          <style dangerouslySetInnerHTML={{ __html: `
            @media print {
              body {
                background: white !important;
                color: black !important;
              }
              /* Hide all elements on page */
              body * {
                visibility: hidden !important;
              }
              /* Show ONLY the certificate artwork element and its children */
              #print-certificate-artwork, #print-certificate-artwork * {
                visibility: visible !important;
              }
              #print-certificate-artwork {
                position: fixed !important;
                left: 5% !important;
                top: 8% !important;
                width: 90% !important;
                max-width: 90% !important;
                height: auto !important;
                margin: 0 auto !important;
                padding: 3rem !important;
                border: 4px double #d97706 !important;
                border-radius: 12px !important;
                background: white !important;
                color: black !important;
                box-shadow: none !important;
              }
              /* High contrast text styles for white paper print */
              #print-certificate-artwork span, 
              #print-certificate-artwork p, 
              #print-certificate-artwork h2, 
              #print-certificate-artwork h3, 
              #print-certificate-artwork div,
              #print-certificate-artwork strong {
                color: black !important;
              }
              #print-certificate-artwork .text-amber-500,
              #print-certificate-artwork .text-amber-400,
              #print-certificate-artwork .text-amber-600 {
                color: #d97706 !important;
              }
              @page {
                size: landscape;
                margin: 0;
              }
            }
          `}} />
          <div className="absolute inset-0 bg-black/85 backdrop-blur-sm print:hidden" onClick={() => setActiveCert(null)} />
          
          <div className="relative z-10 w-full max-w-2xl bg-neutral-950 border border-white/10 rounded-2xl p-6 shadow-2xl space-y-4 print:border-none print:shadow-none print:bg-white print:text-black">
            {/* Modal actions, hidden during print */}
            <div className="flex justify-between items-center border-b border-white/5 pb-2 print:hidden">
              <span className="text-xs font-mono text-neutral-500">Secure Telemetry Certificate Viewer</span>
              <div className="flex gap-2">
                <button
                  onClick={handlePrint}
                  className="px-3 py-1 bg-white hover:bg-neutral-200 text-black text-[10px] font-semibold rounded-lg cursor-pointer"
                >
                  Print Certificate
                </button>
                <button onClick={() => setActiveCert(null)} className="text-neutral-400 hover:text-white cursor-pointer">
                  <IconX size={16} />
                </button>
              </div>
            </div>
 
            {/* Certificate Artwork */}
            <div id="print-certificate-artwork" className="p-8 border-2 border-double border-amber-500/30 rounded-xl bg-neutral-900/40 text-center space-y-6 relative overflow-hidden print:bg-white print:text-black print:border-amber-600">
              {/* Overlay glow */}

              <div className="space-y-2 relative z-10">
                <IconAward className="text-amber-500 mx-auto" size={48} />
                <span className="text-[10px] font-mono tracking-widest text-amber-500/80 uppercase block">
                  RANGE4EX
                </span>
              </div>

              <div className="space-y-2 relative z-10">
                <h2 className="text-2xl font-clash-display font-bold text-white tracking-tight print:text-black">
                  CERTIFICATE OF ACHIEVEMENT
                </h2>
                <p className="text-xs text-neutral-400 font-serif italic print:text-neutral-600">
                  This document officially certifies and validates that
                </p>
              </div>

              <div className="py-2 relative z-10">
                <h3 className="text-xl font-clash-display font-semibold text-amber-400 print:text-amber-600">
                  {activeCert.traderName}
                </h3>
                <div className="w-24 h-0.5 bg-gradient-to-r from-transparent via-amber-500/50 to-transparent mx-auto mt-2" />
              </div>

              <div className="max-w-md mx-auto text-xs text-neutral-300 leading-relaxed font-sans print:text-neutral-800">
                has successfully passed all target evaluations and risk compliance parameters associated with the
                <strong className="text-white block font-bold mt-1 text-sm print:text-black">
                  ${activeCert.accountSize.toLocaleString()} {activeCert.planName}
                </strong>
                and is hereby authorized as a verified trading nodes node operator.
              </div>

              <div className="grid grid-cols-2 gap-4 border-t border-white/5 pt-6 font-mono text-[9px] text-neutral-500 relative z-10 print:border-neutral-200">
                <div className="text-left">
                  <span className="block uppercase text-[8px] text-neutral-600">DATE ISSUED</span>
                  <span className="text-neutral-300 font-bold print:text-black">
                    {new Date(activeCert.datePassed).toLocaleDateString()}
                  </span>
                </div>
                <div className="text-right">
                  <span className="block uppercase text-[8px] text-neutral-600">VERIFIABLE CODE</span>
                  <span className="text-amber-500 font-bold font-mono print:text-amber-600">
                    {activeCert.id}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
