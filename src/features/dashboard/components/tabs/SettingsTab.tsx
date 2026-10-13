"use client";

import React, { useEffect, useState } from "react";
import {
  IconUser,
  IconLock,
  IconBell,
  IconShare,
  IconCopy,
  IconCheck,
  IconAward,
} from "../Icons";
import type { NotificationItem } from "../../index";

interface SettingsTabProps {
  profile: {
    fullName: string;
    email: string;
    twoFactorEnabled: boolean;
    marketingEmails: boolean;
    securityAlerts: boolean;
    referralCode: string;
    referralsCount: number;
    referralsEarnings: number;
  };
  certificates?: any[];
  notifications?: NotificationItem[];
  onUpdateProfile: (fields: any) => void;
}

export default function SettingsTab({ profile, certificates = [], notifications = [], onUpdateProfile }: SettingsTabProps) {
  const [name, setName] = useState(profile.fullName);
  const [email, setEmail] = useState(profile.email);
  const [copiedLink, setCopiedLink] = useState(false);
  const [emailLogs, setEmailLogs] = useState<any[]>([]);

  useEffect(() => {
    const loadEmailLogs = async () => {
      try {
        const res = await fetch("/api/email-logs");
        const data = await res.json();
        if (data.success) setEmailLogs(data.emailLogs || []);
      } catch (err) {
        console.error("Error loading email logs:", err);
      }
    };
    loadEmailLogs();
  }, []);

  const handleProfileSave = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateProfile({ fullName: name, email });
  };

  const handleCopyLink = () => {
    const link = `https://www.range4ex.com/register?ref=${profile.referralCode}`;
    navigator.clipboard.writeText(link);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  return (
    <div className="space-y-6 md:space-y-8 animate-fade-in">
      {/* Title */}
      <div className="border-b border-border-secondary pb-4">
        <h1 className="text-3xl font-clash-display font-semibold tracking-tight text-white">
          Profile Settings & Affiliates
        </h1>
        <p className="text-text-secondary text-sm">
          Update personal details, enable multi-factor security, and manage your partner referrals.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Settings Forms */}
        <div className="lg:col-span-2 space-y-6">
          {/* General profile info */}
          <div className="dash-card p-5">
            <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-1.5">
              <IconUser size={16} />
              <span>Personal Information</span>
            </h3>

            {certificates.length > 0 ? (
              <div className="mb-5 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/25 flex items-start gap-3 text-emerald-400 font-sans">
                <div className="p-2 rounded-lg bg-emerald-500/20 text-emerald-400">
                  <IconAward size={20} className="animate-bounce" />
                </div>
                <div className="space-y-0.5">
                  <h4 className="text-xs font-bold text-white">Verified Certificate Achieved</h4>
                  <p className="text-[11px] text-emerald-500/90 leading-normal">
                    Congratulations! You have earned {certificates.length} verified challenge completion {certificates.length === 1 ? "certificate" : "certificates"}.
                  </p>
                </div>
              </div>
            ) : (
              <div className="mb-5 p-4 rounded-xl bg-neutral-950/40 border border-white/5 flex items-start gap-3 text-neutral-400 font-sans">
                <div className="p-2 rounded-lg bg-neutral-900 text-neutral-500">
                  <IconAward size={20} />
                </div>
                <div className="space-y-0.5">
                  <h4 className="text-xs font-bold text-neutral-400">No Certificates Earned Yet</h4>
                  <p className="text-[11px] text-neutral-500 leading-normal">
                    Complete evaluation phase targets to obtain official credentials.
                  </p>
                </div>
              </div>
            )}

            <form onSubmit={handleProfileSave} className="space-y-4 text-xs font-mono">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-text-secondary">Full Name</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3 py-2 rounded bg-neutral-900 border border-neutral-800 text-white outline-none font-sans"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-text-secondary">Email Address</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3 py-2 rounded bg-neutral-900 border border-neutral-800 text-white outline-none font-sans"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  className="px-4 py-2 bg-white text-black hover:bg-neutral-200 text-xs font-semibold rounded cursor-pointer transition-colors font-sans"
                >
                  Save Information
                </button>
              </div>
            </form>
          </div>

          {/* Security & 2FA */}
          <div className="dash-card p-5">
            <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-1.5">
              <IconLock size={16} />
              <span>Security & 2-Factor Authentication</span>
            </h3>

            <div className="flex items-center justify-between text-xs">
              <div>
                <h4 className="font-semibold text-white">Google Authenticator (2FA)</h4>
                <p className="text-text-secondary mt-1 max-w-sm">
                  Add an extra layer of security. Verify login sessions and payout requests with standard mobile OTP tokens.
                </p>
              </div>
              <button
                onClick={() =>
                  onUpdateProfile({ twoFactorEnabled: !profile.twoFactorEnabled })
                }
                className={`px-4 py-1.5 text-xs font-semibold rounded border transition-all cursor-pointer ${
                  profile.twoFactorEnabled
                    ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/25"
                    : "bg-neutral-900 border-neutral-800 text-neutral-400 hover:text-white"
                }`}
              >
                {profile.twoFactorEnabled ? "Active (Disable)" : "Enable 2FA"}
              </button>
            </div>
          </div>

          {/* Alert Preferences */}
          <div className="dash-card p-5">
            <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-1.5">
              <IconBell size={16} />
              <span>Notification Preferences</span>
            </h3>

            <div className="space-y-3 text-xs">
              <label className="flex items-center gap-3 text-text-secondary cursor-pointer">
                <input
                  type="checkbox"
                  checked={profile.securityAlerts}
                  onChange={(e) => onUpdateProfile({ securityAlerts: e.target.checked })}
                  className="h-4 w-4 bg-neutral-900 border-neutral-800 rounded outline-none"
                />
                <span>Receive daily loss rule violation warning popups.</span>
              </label>

              <label className="flex items-center gap-3 text-text-secondary cursor-pointer">
                <input
                  type="checkbox"
                  checked={profile.marketingEmails}
                  onChange={(e) => onUpdateProfile({ marketingEmails: e.target.checked })}
                  className="h-4 w-4 bg-neutral-900 border-neutral-800 rounded outline-none"
                />
                <span>Receive newsletters, promotions, and broker calendar forecasts.</span>
              </label>
            </div>
          </div>

          <div className="dash-card p-5">
            <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-1.5">
              <IconBell size={16} />
              <span>Received Notifications</span>
            </h3>
            <div className="space-y-3 max-h-72 overflow-y-auto pr-1 custom-scrollbar">
              {notifications.length > 0 ? (
                notifications.map((notif) => (
                  <div key={notif.id} className="p-3 rounded-xl bg-neutral-950/50 border border-white/5 text-xs">
                    <div className="flex justify-between gap-3">
                      <span className="font-semibold text-white">{notif.title}</span>
                      <span
                        className={`uppercase text-[9px] font-bold ${
                          notif.type === "error"
                            ? "text-rose-400"
                            : notif.type === "warning"
                            ? "text-amber-400"
                            : notif.type === "success"
                            ? "text-emerald-400"
                            : "text-blue-400"
                        }`}
                      >
                        {notif.type}
                      </span>
                    </div>
                    <p className="text-[11px] text-neutral-400 mt-1 line-clamp-2">{notif.message}</p>
                    <div className="flex items-center justify-between gap-3 text-[9px] text-neutral-600 font-mono mt-2">
                      <span>{notif.read ? "read" : "unread"}</span>
                      <span>{notif.date}</span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-4 rounded-xl border border-dashed border-neutral-800 text-xs text-neutral-500 text-center">
                  No received notifications yet.
                </div>
              )}
            </div>
          </div>

          <div className="dash-card p-5">
            <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-1.5">
              <IconBell size={16} />
              <span>Email History</span>
            </h3>
            <div className="space-y-3 max-h-72 overflow-y-auto pr-1 custom-scrollbar">
              {emailLogs.length > 0 ? (
                emailLogs.map((log) => (
                  <div key={log.id} className="p-3 rounded-xl bg-neutral-950/50 border border-white/5 text-xs">
                    <div className="flex justify-between gap-3">
                      <span className="font-semibold text-white">{log.subject}</span>
                      <span className={`uppercase text-[9px] font-bold ${log.status === "sent" ? "text-emerald-400" : "text-rose-400"}`}>
                        {log.status}
                      </span>
                    </div>
                    <p className="text-[11px] text-neutral-400 mt-1 line-clamp-2">{log.content}</p>
                    <span className="text-[9px] text-neutral-600 font-mono mt-2 block">
                      {new Date(log.sentAt).toLocaleString()}
                    </span>
                  </div>
                ))
              ) : (
                <div className="p-4 rounded-xl border border-dashed border-neutral-800 text-xs text-neutral-500 text-center">
                  No email history recorded yet.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right: Partner Referrals */}
        <div className="dash-card p-5 flex flex-col justify-between gap-6 lg:h-[450px]">
          <div>
            <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-1.5">
              <IconShare size={16} />
              <span>Affiliate program</span>
            </h3>
            <p className="text-xs text-text-secondary leading-normal">
              Earn 5% on all challenge purchases generated through your unique partner code. Accumulated earnings can be withdrew alongside payouts.
            </p>

            {/* Referrals performance */}
            <div className="grid grid-cols-2 gap-4 mt-6">
              <div className="p-3.5 rounded bg-neutral-950 border border-neutral-900 font-mono text-center">
                <span className="text-[10px] text-neutral-500 uppercase">Referrals</span>
                <span className="block text-xl font-bold text-white mt-1">
                  {profile.referralsCount}
                </span>
              </div>
              <div className="p-3.5 rounded bg-neutral-950 border border-neutral-900 font-mono text-center">
                <span className="text-[10px] text-neutral-500 uppercase">Earnings</span>
                <span className="block text-xl font-bold text-emerald-400 mt-1">
                  ${profile.referralsEarnings}
                </span>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            {/* Promo Code Copy */}
            <div className="p-3 rounded bg-neutral-950 border border-neutral-900 flex justify-between font-mono text-xs">
              <span className="text-neutral-500">Ref Code:</span>
              <span className="text-white font-bold">{profile.referralCode}</span>
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
      </div>
    </div>
  );
}
