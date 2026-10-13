"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { IconAlertCircle, IconLock, IconMail } from "@tabler/icons-react";
import { Card } from "@/components/Card";
import { GridBg } from "@/components/GridBg";
import { Logo } from "@/components/Logo";
import { PageBackground } from "@/components/PageBackground";

export default function CrmSignInPage() {
  const router = useRouter();
  const params = useParams();
  const locale = params?.locale || "en";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  useEffect(() => {
    if (typeof window === "undefined") return;

    const searchParams = new URLSearchParams(window.location.search);
    if (searchParams.get("error") === "unauthorized") {
      setErrorMsg("Admin access is required.");
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setErrorMsg("Please fill in all fields.");
      return;
    }

    setIsSubmitting(true);
    setErrorMsg("");
    setSuccessMsg("");

    try {
      const res = await fetch("/api/auth/crm/signin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Authentication failed.");
      }

      setSuccessMsg("Signed in. Redirecting...");

      setTimeout(() => {
        router.push(`/${locale}/crm-portal`);
      }, 1000);
    } catch (err: any) {
      setErrorMsg(err.message || "Invalid credentials.");
      setIsSubmitting(false);
    }
  };

  return (
    <main className="dashboard-clash-font crm-portal-readable relative flex min-h-screen items-center justify-center overflow-hidden bg-bg-dark px-4 py-16 select-none">
      <PageBackground />
      <GridBg pattern_type="grid" opacity={0.05} mask_size={900} className="z-0" />

      <div className="relative z-10 w-full max-w-md">
        <div className="mb-6 flex justify-center">
          <Logo size="xl" animated asLink />
        </div>

        <Card animated className="w-full border-white/10 bg-neutral-950/70 p-6 shadow-2xl shadow-black/25 backdrop-blur-xl">
          {errorMsg && (
            <div className="mb-4 flex items-center gap-2 rounded-xl border border-rose-500/20 bg-rose-500/5 p-3 text-xs text-rose-400">
              <IconAlertCircle size={15} className="shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="mb-4 flex items-center gap-2 rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-3 text-xs text-emerald-400">
              <span className="h-2 w-2 shrink-0 animate-pulse rounded-full bg-emerald-500" />
              <span>{successMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="sr-only" htmlFor="crm-admin-email">
                Email address
              </label>
              <div className="relative">
                <IconMail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-500" size={16} />
                <input
                  id="crm-admin-email"
                  type="email"
                  required
                  placeholder="Email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isSubmitting}
                  className="h-12 w-full rounded-xl border border-white/10 bg-white/[0.04] pl-10 pr-4 text-sm text-white outline-none transition-all placeholder:text-neutral-500 focus:border-indigo-400/70 focus:bg-white/[0.06]"
                />
              </div>
            </div>

            <div>
              <label className="sr-only" htmlFor="crm-admin-password">
                Password
              </label>
              <div className="relative">
                <IconLock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-500" size={16} />
                <input
                  id="crm-admin-password"
                  type="password"
                  required
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isSubmitting}
                  className="h-12 w-full rounded-xl border border-white/10 bg-white/[0.04] pl-10 pr-4 text-sm text-white outline-none transition-all placeholder:text-neutral-500 focus:border-indigo-400/70 focus:bg-white/[0.06]"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="flex h-12 w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-indigo-600 text-sm font-semibold text-white shadow-lg shadow-indigo-600/20 transition-all hover:bg-indigo-500 active:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/20 border-t-white" />
                  <span>Signing in...</span>
                </>
              ) : (
                <span>Sign in</span>
              )}
            </button>
          </form>
        </Card>
      </div>
    </main>
  );
}
