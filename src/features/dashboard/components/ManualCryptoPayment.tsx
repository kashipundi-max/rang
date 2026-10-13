"use client";

import React, { useEffect, useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { IconCheck } from "./Icons";
import { MANUAL_WALLETS, getManualWallet, getTxidError, type ManualWallet } from "@/config/manualWallets";

/** Coin logo with the chain logo as a small badge (e.g. USDT on TRON). */
export function WalletLogo({ wallet, size = 28 }: { wallet: Pick<ManualWallet, "logo" | "networkLogo" | "label">; size?: number }) {
  const badge = Math.round(size * 0.5);
  return (
    <span className="relative inline-block shrink-0" style={{ width: size, height: size }}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={wallet.logo} alt={wallet.label} width={size} height={size} className="h-full w-full" />
      {wallet.networkLogo && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={wallet.networkLogo}
          alt=""
          width={badge}
          height={badge}
          className="absolute -bottom-0.5 -right-1 rounded-full ring-2 ring-[#0b0a12]"
          style={{ width: badge, height: badge }}
        />
      )}
    </span>
  );
}

export interface ManualPaymentValue {
  walletId: string;
  txid: string;
  screenshot: File | null;
}

export const EMPTY_MANUAL_PAYMENT: ManualPaymentValue = { walletId: "", txid: "", screenshot: null };

export function isManualPaymentComplete(value: ManualPaymentValue) {
  return Boolean(getManualWallet(value.walletId) && !getTxidError(value.walletId, value.txid) && value.screenshot);
}

/** Uploads the TXID + screenshot for an existing pending "Crypto QR" order. */
export async function submitManualPaymentProof(orderId: string, value: ManualPaymentValue) {
  const form = new FormData();
  form.append("orderId", orderId);
  form.append("walletId", value.walletId);
  form.append("txid", value.txid.trim());
  if (value.screenshot) form.append("screenshot", value.screenshot);
  const res = await fetch("/api/orders/manual-payment", { method: "POST", body: form });
  const data = await res.json().catch(() => ({}));
  if (!res.ok || !data.success) throw new Error(data.error || "Could not submit payment proof.");
  return data;
}

interface ManualCryptoPaymentProps {
  amount: number;
  value: ManualPaymentValue;
  onChange: (value: ManualPaymentValue) => void;
  disabled?: boolean;
  /** Render only part of the form, for a multi-step checkout: the wallet + QR, or the TXID + screenshot. */
  section?: "all" | "wallet" | "proof";
}

export default function ManualCryptoPayment({ amount, value, onChange, disabled, section = "all" }: ManualCryptoPaymentProps) {
  const showWallet = section !== "proof";
  const showProof = section !== "wallet";
  const wallet = getManualWallet(value.walletId);
  const [copied, setCopied] = useState(false);
  const [previewUrl, setPreviewUrl] = useState("");
  // Only flag the TXID once the trader has typed something.
  const txidError = value.txid.trim() ? getTxidError(value.walletId, value.txid) : "";

  useEffect(() => {
    if (!value.screenshot) {
      setPreviewUrl("");
      return;
    }
    const url = URL.createObjectURL(value.screenshot);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [value.screenshot]);

  const copyAddress = async () => {
    if (!wallet) return;
    try {
      await navigator.clipboard.writeText(wallet.address);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // Clipboard can be blocked; the address is still selectable.
    }
  };

  if (MANUAL_WALLETS.length === 0) {
    return (
      <p className="rounded-2xl border border-dashed border-white/10 px-4 py-4 text-center text-[11px] text-neutral-500">
        QR wallet payments are not configured yet.
      </p>
    );
  }

  return (
    <div className="space-y-4">
      {showWallet && (
      <div>
        <span className="mb-2 block text-[9px] font-bold uppercase tracking-[0.16em] text-neutral-500">Select wallet network</span>
        <div className="grid grid-cols-1 gap-2 min-[420px]:grid-cols-2 sm:grid-cols-3">
          {MANUAL_WALLETS.map((item) => {
            const isSelected = item.id === value.walletId;
            return (
              <button
                key={item.id}
                type="button"
                disabled={disabled}
                aria-pressed={isSelected}
                onClick={() => onChange({ ...value, walletId: item.id })}
                className={`relative flex min-h-[60px] items-center gap-2.5 rounded-xl border px-3 py-2 text-left transition-all disabled:opacity-60 ${
                  isSelected ? "border-emerald-400/70 bg-emerald-500/[0.1]" : "border-white/[0.07] bg-white/[0.018] hover:border-white/15"
                }`}
              >
                <WalletLogo wallet={item} />
                <span className="min-w-0 pr-3">
                  <span className="block text-[11px] font-bold text-white">{item.label}</span>
                  <span className="mt-0.5 block text-[9px] leading-tight text-neutral-500">{item.network}</span>
                </span>
                {isSelected && <IconCheck size={12} className="absolute right-2.5 top-2.5 text-emerald-400" />}
              </button>
            );
          })}
        </div>
      </div>
      )}

      {showProof && !wallet && (
        <p className="rounded-2xl border border-dashed border-white/10 px-4 py-4 text-center text-[11px] text-neutral-500">
          Select a wallet first.
        </p>
      )}

      {wallet && (
        <div className="animate-fade-in space-y-4">
          {showWallet && (
          <div className="flex flex-col items-center gap-4 rounded-2xl border border-white/[0.07] bg-black/25 p-3 sm:flex-row sm:items-start sm:p-4">
            <div className="shrink-0 rounded-xl bg-white p-2.5">
              <QRCodeSVG
                value={wallet.address}
                size={148}
                level="H"
                imageSettings={{ src: wallet.networkLogo || wallet.logo, width: 34, height: 34, excavate: true }}
              />
            </div>
            <div className="min-w-0 flex-1 space-y-3 text-center sm:text-left">
              <div>
                <span className="block text-[9px] font-bold uppercase tracking-wide text-neutral-500">Send exactly</span>
                <span className="mt-0.5 block font-clash-display text-xl font-semibold text-white">
                  ${amount.toLocaleString()} <span className="text-xs text-neutral-400">in {wallet.asset}</span>
                </span>
              </div>
              <div>
                <span className="flex items-center justify-center gap-2 text-[9px] font-bold uppercase tracking-wide text-neutral-500 sm:justify-start">
                  <WalletLogo wallet={wallet} size={18} />
                  {wallet.network} address
                </span>
                <div className="mt-1 flex items-center gap-2">
                  <code className="min-w-0 flex-1 select-all break-all rounded-lg border border-white/[0.07] bg-black/30 px-2.5 py-2 text-left font-mono text-[10px] text-neutral-200">
                    {wallet.address}
                  </code>
                  <button
                    type="button"
                    onClick={copyAddress}
                    className="shrink-0 rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2 text-[10px] font-semibold text-white hover:bg-white/[0.08]"
                  >
                    {copied ? "Copied" : "Copy"}
                  </button>
                </div>
              </div>
              <p className="rounded-lg border border-amber-500/20 bg-amber-500/[0.06] px-2.5 py-2 text-[10px] leading-relaxed text-amber-300">
                Send only {wallet.asset} on the {wallet.network} network. Funds sent on any other network cannot be recovered.
              </p>
            </div>
          </div>
          )}

          {showProof && section === "proof" && (
            <div className="flex items-center gap-2.5 rounded-2xl border border-white/[0.07] bg-black/25 px-3 py-2.5">
              <WalletLogo wallet={wallet} size={22} />
              <span className="min-w-0 flex-1 text-[11px] text-neutral-300">
                Paid <span className="font-semibold text-white">${amount.toLocaleString()}</span> with{" "}
                <span className="font-semibold text-white">{wallet.label}</span> ({wallet.network})
              </span>
            </div>
          )}

          {showProof && (
          <>
          <label className="block">
            <span className="mb-1.5 block text-[9px] font-bold uppercase tracking-[0.16em] text-neutral-500">Transaction ID (TXID / hash)</span>
            <input
              value={value.txid}
              disabled={disabled}
              onChange={(event) => onChange({ ...value, txid: event.target.value.trim() })}
              aria-invalid={Boolean(txidError)}
              placeholder="Paste the transaction hash from your wallet"
              spellCheck={false}
              autoComplete="off"
              className={`w-full rounded-2xl border bg-black/25 px-4 py-3 font-mono text-[11px] text-white outline-none placeholder:font-sans placeholder:text-neutral-600 ${
                txidError ? "border-rose-500/60 focus:border-rose-500/70" : "border-white/[0.08] focus:border-emerald-400/60"
              }`}
            />
            {txidError && <span className="mt-1.5 block text-[10px] text-rose-400">{txidError}</span>}
          </label>

          <div>
            <span className="mb-1.5 block text-[9px] font-bold uppercase tracking-[0.16em] text-neutral-500">Payment screenshot</span>
            <label
              className={`flex cursor-pointer items-center gap-3 rounded-2xl border border-dashed px-4 py-3 transition-colors ${
                value.screenshot ? "border-emerald-400/40 bg-emerald-500/[0.05]" : "border-white/15 bg-black/20 hover:border-white/25"
              } ${disabled ? "pointer-events-none opacity-60" : ""}`}
            >
              {previewUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={previewUrl} alt="Payment screenshot preview" className="h-12 w-12 shrink-0 rounded-lg object-cover" />
              ) : (
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg border border-white/10 text-lg text-neutral-500">+</span>
              )}
              <span className="min-w-0 flex-1">
                <span className="block truncate text-[11px] font-semibold text-white">
                  {value.screenshot ? value.screenshot.name : "Upload screenshot"}
                </span>
                <span className="block text-[9px] text-neutral-500">PNG, JPG or WEBP · max 5 MB</span>
              </span>
              <input
                type="file"
                accept="image/png,image/jpeg,image/webp"
                className="sr-only"
                disabled={disabled}
                onChange={(event) => {
                  const file = event.target.files?.[0] || null;
                  if (file && file.size > 5 * 1024 * 1024) {
                    alert("Screenshot must be 5 MB or smaller.");
                    event.target.value = "";
                    return;
                  }
                  onChange({ ...value, screenshot: file });
                }}
              />
            </label>
          </div>
          </>
          )}
        </div>
      )}
    </div>
  );
}
