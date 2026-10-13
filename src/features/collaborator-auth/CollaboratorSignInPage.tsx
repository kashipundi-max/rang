"use client";

import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { IconLock, IconMail, IconUsersGroup } from "@tabler/icons-react";
import { Logo } from "@/components/Logo";
import { PageBackground } from "@/components/PageBackground";

export default function CollaboratorSignInPage() {
  const router = useRouter();
  const params = useParams<{ locale: string }>();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const submit = async (event: React.FormEvent) => {
    event.preventDefault(); setLoading(true); setError("");
    const response = await fetch("/api/auth/collaborator/signin", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email, password }) });
    const data = await response.json(); setLoading(false);
    if (!response.ok) return setError(data.error || "Unable to sign in.");
    router.push(`/${params.locale || "en"}/collaborator`);
  };
  return <main className="dashboard-clash-font relative flex min-h-screen items-center justify-center overflow-hidden bg-bg-dark px-4"><PageBackground /><section className="relative z-10 w-full max-w-md rounded-3xl border border-violet-400/15 bg-neutral-950/80 p-7 shadow-2xl backdrop-blur-xl"><div className="mb-7 text-center"><Logo size="lg" animated asLink /><div className="mx-auto mt-6 flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-500/15 text-violet-300"><IconUsersGroup size={24} /></div><h1 className="mt-4 text-2xl font-semibold text-white">Collaborator Portal</h1><p className="mt-2 text-sm text-neutral-400">Private access for admin-created collaborator accounts.</p></div>{error && <p className="mb-4 rounded-xl border border-rose-500/20 bg-rose-500/10 p-3 text-sm text-rose-300">{error}</p>}<form onSubmit={submit} className="space-y-4"><label className="relative block"><IconMail size={16} className="absolute left-3 top-3.5 text-neutral-500" /><input className="w-full rounded-xl border border-white/10 bg-white/5 py-3 pl-10 pr-3 text-white outline-none focus:border-violet-400" type="email" placeholder="Email address" value={email} onChange={(event) => setEmail(event.target.value)} required /></label><label className="relative block"><IconLock size={16} className="absolute left-3 top-3.5 text-neutral-500" /><input className="w-full rounded-xl border border-white/10 bg-white/5 py-3 pl-10 pr-3 text-white outline-none focus:border-violet-400" type="password" placeholder="Password" value={password} onChange={(event) => setPassword(event.target.value)} required /></label><button disabled={loading} className="w-full rounded-xl bg-violet-600 py-3 font-semibold text-white transition hover:bg-violet-500 disabled:opacity-50">{loading ? "Signing in..." : "Sign in to collaborator portal"}</button></form><p className="mt-5 text-center text-xs text-neutral-500">Collaborator access is issued and managed only by the admin.</p></section></main>;
}
