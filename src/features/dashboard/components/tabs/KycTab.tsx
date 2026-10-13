"use client";

import React, { useState } from "react";
import {
  IconUserCheck,
  IconShieldLock,
  IconCircleCheck,
  IconCircleX,
  IconClock,
} from "../Icons";

import { userIsKycEligible } from "@/lib/kycEligibility";

interface KycTabProps {
  status: "Unsubmitted" | "Pending" | "Verified" | "Rejected";
  kycData: any;
  accounts?: any[];
  isEligible?: boolean;
  onRefreshKyc: () => Promise<void>;
}

export default function KycTab({ status, kycData, accounts = [], isEligible: isEligibleProp, onRefreshKyc }: KycTabProps) {
  const [loading, setLoading] = useState(false);
  const [syncing, setSyncing] = useState(false);

  const isEligible = isEligibleProp ?? userIsKycEligible(accounts);

  const isDidit = kycData?.documentType === "didit";
  const isSimulated = isDidit && kycData?.backUrl?.includes("mock_session_id");
  const diditStatus = kycData?.addressUrl || "Not Started";

  const handleStartDidit = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/kyc", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ method: "didit-create" }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        await onRefreshKyc();
        if (data.kyc.backUrl) {
          if (data.simulated) {
            // Simulated session started
          } else {
            // Open real Didit verification portal
            window.open(data.kyc.backUrl, "_blank", "noopener,noreferrer");
          }
        }
      } else {
        alert(data.error || "Failed to initialize Didit verification.");
      }
    } catch (err) {
      console.error("Error starting Didit:", err);
      alert("Error initiating Didit verification session.");
    } finally {
      setLoading(false);
    }
  };

  const handleSync = async (simulateOutcomeStatus?: string) => {
    setSyncing(true);
    try {
      const body: any = { method: "didit-sync" };
      if (simulateOutcomeStatus) {
        body.simulateStatus = simulateOutcomeStatus;
        if (simulateOutcomeStatus === "Declined") {
          body.rejectReason = "Selfie scan failed liveness test (user movement was too rapid).";
        }
      }

      const res = await fetch("/api/kyc", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        await onRefreshKyc();
      } else {
        alert(data.error || "Failed to sync status.");
      }
    } catch (err) {
      console.error("Error syncing status:", err);
      alert("Error syncing verification status.");
    } finally {
      setSyncing(false);
    }
  };

  return (
    <div className="space-y-6 md:space-y-8 animate-fade-in">
      {/* Header */}
      <div className="border-b border-white/5 pb-4">
        <h1 className="text-3xl font-clash-display font-semibold tracking-tight text-white flex items-center gap-2">
          KYC Compliance Verification
        </h1>
        <p className="text-text-secondary text-sm">
          Automated identity verification powered by Didit® secure identity gateway.
        </p>
      </div>

      {/* Account Eligibility Locked Banner */}
      {!isEligible && status !== "Verified" && (
        <div className="bg-amber-500/10 border border-amber-500/30 backdrop-blur-xl rounded-2xl p-4 flex items-start gap-3">
          <IconShieldLock size={22} className="text-amber-400 shrink-0 mt-0.5" />
          <div className="space-y-1 text-xs">
            <h4 className="font-semibold text-amber-300 font-clash-display">KYC Verification Locked</h4>
            <p className="text-amber-200/80 leading-relaxed">
              Identity verification (KYC) is only available for traders with an active, delivered <strong>Funded Account</strong>, <strong>Instant Account</strong>, or <strong>Funded Phase Account</strong>.
            </p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Verification Status Card */}
        <div className="dash-card p-5 flex flex-col justify-between h-[300px]">
          <div>
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-sm font-semibold text-white">Compliance Status</h3>
              <span className="text-[9px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-white/5 text-neutral-400 border border-white/10">
                DIDIT SECURED
              </span>
            </div>
            <p className="text-xs text-text-secondary">Current KYC status logged on secure ledger</p>
          </div>

          <div className="flex flex-col items-center justify-center py-6">
            {status === "Verified" && (
              <div className="text-center space-y-2">
                <IconCircleCheck size={48} className="text-emerald-400 mx-auto drop-shadow-[0_0_8px_rgba(52,211,153,0.3)]" />
                <h4 className="text-base font-semibold text-white">Identity Fully Verified</h4>
                <p className="text-[10px] text-emerald-400/80 bg-emerald-500/10 px-2 py-0.5 rounded-full inline-block">
                  Cleared for Payouts
                </p>
              </div>
            )}
            {status === "Pending" && (
              <div className="text-center space-y-2">
                <IconClock size={48} className="text-amber-500 mx-auto animate-pulse" />
                <h4 className="text-base font-semibold text-white">Verification Pending</h4>
                <p className="text-[10px] text-amber-500/80 bg-amber-500/10 px-2 py-0.5 rounded-full inline-block">
                  Didit: {diditStatus}
                </p>
              </div>
            )}
            {status === "Rejected" && (
              <div className="text-center space-y-2">
                <IconCircleX size={48} className="text-rose-500 mx-auto" />
                <h4 className="text-base font-semibold text-white">Verification Failed</h4>
                <p className="text-[10px] text-rose-500/80 bg-rose-500/10 px-2 py-0.5 rounded-full inline-block">
                  Action Required
                </p>
              </div>
            )}
            {status === "Unsubmitted" && (
              <div className="text-center space-y-2">
                <IconShieldLock size={48} className="text-neutral-500 mx-auto" />
                <h4 className="text-base font-semibold text-white">Not Submitted</h4>
                <p className="text-[10px] text-neutral-500 bg-neutral-800 px-2 py-0.5 rounded-full inline-block">
                  Verification Required
                </p>
              </div>
            )}
          </div>

          <div className="border-t border-white/5 pt-3 flex gap-2 justify-between items-center text-[10px]">
            <span className="text-neutral-500">Method: {isDidit ? "Didit V3 API" : "Manual File Upload"}</span>
            {isDidit && status === "Pending" && (
              <button
                onClick={() => handleSync()}
                disabled={syncing}
                className="px-2.5 py-1 rounded bg-brand-surface border border-white/10 hover:bg-neutral-900 text-white cursor-pointer disabled:opacity-50 transition-colors font-semibold"
              >
                {syncing ? "Syncing..." : "Sync Status"}
              </button>
            )}
          </div>
        </div>

        {/* Dynamic Verification Action Panel */}
        <div className="lg:col-span-2 dash-card p-5 flex flex-col justify-between">
          <div className="space-y-4">
            {status === "Verified" ? (
              <div className="py-8 flex flex-col justify-center items-center text-center space-y-3">
                <IconUserCheck size={48} className="text-emerald-400" />
                <h3 className="text-lg font-semibold text-white font-clash-display">Compliance Approved</h3>
                <p className="text-xs text-text-secondary max-w-md leading-relaxed">
                  Thank you for completing your verification. Your identity record is fully cleared and verified through the Didit protocol. No further compliance action is required.
                </p>
                {kycData?.frontUrl && (
                  <div className="text-[10px] font-mono text-neutral-500 bg-neutral-950/60 p-2 rounded-lg border border-white/5 mt-4">
                    Didit Session: {kycData.frontUrl}
                  </div>
                )}
              </div>
            ) : status === "Pending" ? (
              <div className="space-y-4">
                <div className="flex justify-between items-center border-b border-white/5 pb-2">
                  <h3 className="text-base font-semibold text-white font-clash-display">Didit Verification Session Active</h3>
                  <span className="px-2 py-0.5 rounded text-[10px] bg-amber-500/10 text-amber-400 font-mono">
                    {diditStatus}
                  </span>
                </div>
                
                <div className="text-xs text-text-secondary space-y-2 leading-relaxed">
                  <p>
                    Your verification session is currently active. If you did not finish the verification, please resume using the button below.
                  </p>
                  <p>
                    Once completed on the Didit portal, click the Sync Status button to update your credentials instantly.
                  </p>
                </div>

                <div className="flex flex-wrap gap-3 pt-3">
                  {kycData?.backUrl && !isSimulated && (
                    <a
                      href={kycData.backUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-4 py-2 bg-white text-black hover:bg-neutral-200 text-xs font-semibold rounded-lg transition-colors inline-block"
                    >
                      Resume Verification on Didit
                    </a>
                  )}
                  <button
                    onClick={() => handleSync()}
                    disabled={syncing}
                    className="px-4 py-2 bg-neutral-900 border border-white/10 hover:bg-neutral-800 text-xs font-semibold rounded-lg text-white transition-colors"
                  >
                    {syncing ? "Syncing status..." : "Check Status"}
                  </button>
                </div>

                {/* Simulation controls panel */}
                {isSimulated && (
                  <div className="mt-6 p-4 rounded-xl border border-dashed border-amber-500/30 bg-amber-500/5 space-y-3">
                    <span className="text-[10px] font-bold text-amber-400 block tracking-wider uppercase">
                      Developer Didit Simulator Sandbox
                    </span>
                    <p className="text-[11px] text-neutral-400">
                      Since no real API keys are configured, this is running in a sandbox environment. Choose an outcome to test how the frontend responds:
                    </p>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleSync("Approved")}
                        disabled={syncing}
                        className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-black font-semibold text-[10px] rounded-lg transition-colors cursor-pointer"
                      >
                        Simulate Approval
                      </button>
                      <button
                        onClick={() => handleSync("Declined")}
                        disabled={syncing}
                        className="px-3 py-1.5 bg-rose-500 hover:bg-rose-400 text-white font-semibold text-[10px] rounded-lg transition-colors cursor-pointer"
                      >
                        Simulate Decline
                      </button>
                      <button
                        onClick={() => handleSync("In Review")}
                        disabled={syncing}
                        className="px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 font-semibold text-[10px] rounded-lg transition-colors cursor-pointer"
                      >
                        Simulate Pending Review
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : status === "Rejected" ? (
              <div className="space-y-4 py-3">
                <div className="flex items-center gap-2 text-rose-500">
                  <IconCircleX size={24} />
                  <h3 className="text-base font-semibold text-white font-clash-display">Verification Declined</h3>
                </div>
                <div className="bg-rose-500/5 border border-rose-500/20 rounded-xl p-4 space-y-1">
                  <span className="text-[10px] text-rose-400 font-bold uppercase block">Didit Verdict Decline Reason:</span>
                  <p className="text-xs text-rose-300/90 leading-relaxed font-mono">
                    {kycData?.rejectReason || "Identity document scan could not be matched with biometric selfie."}
                  </p>
                </div>
                <p className="text-xs text-text-secondary leading-relaxed">
                  Please restart the Didit verification process. Ensure you are in a well-lit room, use a physical government identity document, and complete the biometric liveness scanning sequence carefully.
                </p>
                <button
                  onClick={handleStartDidit}
                  disabled={loading}
                  className="px-4 py-2 bg-white text-black hover:bg-neutral-200 text-xs font-semibold rounded-lg transition-colors cursor-pointer"
                >
                  {loading ? "Initializing..." : "Restart Verification with Didit"}
                </button>
              </div>
            ) : (
              <div className="space-y-6">
                <div>
                  <h3 className="text-base font-semibold text-white font-clash-display mb-1">
                    Didit Global Identity KYC Verification
                  </h3>
                  <p className="text-xs text-text-secondary leading-relaxed">
                    We use Didit secure third-party compliance verification to authenticate your identity. This automated flow requires a quick biometric camera selfie scan and an upload/scan of a government ID.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1 text-xs text-neutral-400">
                  <div className="p-3 bg-neutral-950/40 rounded-xl border border-white/5 space-y-1">
                    <span className="font-semibold text-white block">1. Biometric Scan</span>
                    <span>3D liveness mapping to verify matching identity owner.</span>
                  </div>
                  <div className="p-3 bg-neutral-950/40 rounded-xl border border-white/5 space-y-1">
                    <span className="font-semibold text-white block">2. Document Integrity</span>
                    <span>Automated scanning of Passports, National IDs, or Driver's Licenses.</span>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    onClick={handleStartDidit}
                    disabled={loading || !isEligible}
                    className={`px-5 py-2.5 text-xs font-semibold rounded-xl transition-all shadow-md flex items-center gap-2 ${
                      !isEligible
                        ? "bg-neutral-800 text-neutral-500 cursor-not-allowed border border-white/10"
                        : "bg-white text-black hover:bg-neutral-200 hover:scale-[1.02] active:scale-95 cursor-pointer"
                    }`}
                  >
                    {loading
                      ? "Starting session..."
                      : !isEligible
                      ? "Verification Locked (Funded or Instant Account Required)"
                      : "Start Verification with Didit"}
                  </button>
                  {!isSimulated && kycData?.backUrl && (
                    <p className="text-[10px] text-neutral-500 mt-2">
                      Already started? Click Resume Verification or check status in the side status panel.
                    </p>
                  )}
                  {isSimulated && (
                    <div className="mt-4 p-3 bg-amber-500/10 border border-amber-500/25 rounded-lg text-[11px] text-amber-300 font-mono">
                      ⚠️ Running in simulator mode. Click "Start Verification" above to load the sandbox simulator controls.
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="mt-6 border-t border-white/5 pt-4 text-[10px] text-neutral-500 flex justify-between">
            <span>Powered by Didit® Protocol</span>
            <span>GDPR Compliant • Data Encrypted</span>
          </div>
        </div>
      </div>
    </div>
  );
}
