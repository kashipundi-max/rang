"use client";

import React, { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { Card } from "@/components/Card";
import { Logo } from "@/components/Logo";
import { PageBackground } from "@/components/PageBackground";
import { GridBg } from "@/components/GridBg";
import { IconMail, IconLock, IconUser, IconKey, IconAlertCircle, IconArrowRight } from "@tabler/icons-react";

export default function CrmSignUpPage() {
  const router = useRouter();
  const params = useParams();
  const locale = params?.locale || "en";

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passcode, setPasscode] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !password || !passcode) {
      setErrorMsg("Please fill in all fields.");
      return;
    }

    setIsSubmitting(true);
    setErrorMsg("");
    setSuccessMsg("");

    try {
      const res = await fetch("/api/auth/crm/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password, passcode }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Administrative registration failed.");
      }

      setSuccessMsg("Administrator registered successfully. Initializing console access...");
      
      // Redirect to crm portal
      setTimeout(() => {
        router.push(`/${locale}/crm-portal`);
      }, 1000);
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to register. Please check your passcode.");
      setIsSubmitting(false);
    }
  };

  return (
    <main className="dashboard-clash-font crm-portal-readable relative min-h-screen bg-bg-dark flex items-center justify-center py-16 px-4 overflow-hidden select-none">
      {/* Background aesthetics */}
      <PageBackground />
      <GridBg pattern_type="grid" opacity={0.06} mask_size={1000} className="z-0" />
      
      {/* Glowing Admin-themed Orbs */}
      <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-indigo-500/10 rounded-full blur-3xl pointer-events-none z-0" />
      <div className="absolute -bottom-40 left-1/4 w-[400px] h-[400px] bg-purple-500/5 rounded-full blur-3xl pointer-events-none z-0" />

      <div className="relative z-10 w-full max-w-md">
        {/* Header Logo */}
        <div className="flex flex-col items-center mb-8">
          <Logo size="xl" animated asLink />
          <div className="mt-4 flex items-center gap-1.5 px-3 py-1 rounded-full border border-indigo-500/20 bg-indigo-500/5 text-indigo-400 text-[10px] font-mono font-bold tracking-wider uppercase">
            <span className="h-1.5 w-1.5 rounded-full bg-indigo-400 animate-ping" />
            CRM Portal Gateway
          </div>
        </div>

        <Card animated showOrbs className="w-full border-indigo-500/15">
          {/* Title */}
          <div className="text-center mb-6 relative z-10">
            <h1 className="text-xl font-bold tracking-tight text-white font-clash-display">
              Register Admin Profile
            </h1>
            <p className="text-xs text-text-secondary mt-2">
              Create a secure administrator account to manage portal directories.
            </p>
          </div>

          {/* Error & Success States */}
          {errorMsg && (
            <div className="mb-4 p-3 rounded-xl border border-rose-500/20 bg-rose-500/5 flex gap-2 items-center text-xs text-rose-400 font-mono relative z-10">
              <IconAlertCircle size={15} className="shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="mb-4 p-3 rounded-xl border border-emerald-500/20 bg-emerald-500/5 flex gap-2 items-center text-xs text-emerald-400 font-mono relative z-10">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Registration Form */}
          <form onSubmit={handleSubmit} className="space-y-4 relative z-10">
            <div className="space-y-1.5">
              <label className="text-[10px] uppercase font-bold tracking-wider text-text-secondary font-mono">
                Administrator Name
              </label>
              <div className="relative">
                <IconUser className="absolute left-3.5 top-3 text-neutral-500" size={15} />
                <input
                  type="text"
                  required
                  placeholder="John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={isSubmitting}
                  className="w-full pl-10 pr-4 py-2.5 text-xs rounded-xl bg-neutral-950/40 border border-white/5 focus:border-indigo-500/50 text-white outline-none transition-all"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] uppercase font-bold tracking-wider text-text-secondary font-mono">
                Admin Email Address
              </label>
              <div className="relative">
                <IconMail className="absolute left-3.5 top-3 text-neutral-500" size={15} />
                <input
                  type="email"
                  required
                  placeholder="admin@firm.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isSubmitting}
                  className="w-full pl-10 pr-4 py-2.5 text-xs rounded-xl bg-neutral-950/40 border border-white/5 focus:border-indigo-500/50 text-white outline-none transition-all"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] uppercase font-bold tracking-wider text-text-secondary font-mono">
                Console Password
              </label>
              <div className="relative">
                <IconLock className="absolute left-3.5 top-3 text-neutral-500" size={15} />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isSubmitting}
                  className="w-full pl-10 pr-4 py-2.5 text-xs rounded-xl bg-neutral-950/40 border border-white/5 focus:border-indigo-500/50 text-white outline-none transition-all"
                />
              </div>
            </div>

            <div className="space-y-1.5 bg-indigo-950/20 border border-indigo-500/10 rounded-xl p-3.5">
              <label className="text-[10px] uppercase font-bold tracking-wider text-indigo-400 font-mono block mb-1.5">
                Admin Security Passcode
              </label>
              <div className="relative">
                <IconKey className="absolute left-3.5 top-3 text-indigo-400/70" size={15} />
                <input
                  type="text"
                  required
                  placeholder="Enter security passcode (e.g. ADMIN123)"
                  value={passcode}
                  onChange={(e) => setPasscode(e.target.value)}
                  disabled={isSubmitting}
                  className="w-full pl-10 pr-4 py-2.5 text-xs rounded-xl bg-neutral-955 border border-indigo-500/20 focus:border-indigo-500/50 text-white outline-none transition-all font-mono"
                />
              </div>
              <span className="text-[9px] text-neutral-500 block mt-1.5 font-mono">
                Required to authorize administrator role initialization.
              </span>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full mt-2 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white text-xs font-bold font-mono tracking-wide flex items-center justify-center gap-1.5 shadow-lg shadow-indigo-600/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <span className="h-4 w-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                  <span>Registering...</span>
                </>
              ) : (
                <>
                  <span>Create Admin Profile</span>
                  <IconArrowRight size={14} />
                </>
              )}
            </button>
          </form>

          {/* Footer links */}
          <div className="mt-6 pt-5 border-t border-white/5 flex justify-between items-center text-[10px] font-mono text-neutral-500 relative z-10">
            <button
              onClick={() => router.push("/auth/signin")}
              className="hover:text-text-primary transition-colors cursor-pointer"
            >
              ← Go to User Console
            </button>
            <button
              onClick={() => router.push(`/${locale}/crm-portal/signin`)}
              className="text-indigo-400 hover:text-indigo-300 font-bold transition-colors cursor-pointer"
            >
              Back to Login
            </button>
          </div>
        </Card>
      </div>
    </main>
  );
}
