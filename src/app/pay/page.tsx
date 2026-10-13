"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
  IconCreditCard,
  IconCoinBitcoin,
  IconReceipt,
  BriefcaseIcon,
} from "@/features/dashboard/components/Icons";
import { GridBg } from "@/components/GridBg";
import { getManualWallet, isManualCryptoMethod, parseManualGatewayRef } from "@/config/manualWallets";
import ManualCryptoPayment, {
  EMPTY_MANUAL_PAYMENT,
  isManualPaymentComplete,
  submitManualPaymentProof,
  type ManualPaymentValue,
} from "@/features/dashboard/components/ManualCryptoPayment";

function PaymentPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const locale = searchParams.get("locale") || "en";
  const orderId = searchParams.get("orderId");
  const platform = searchParams.get("platform") || "MT5";
  const paymentSuccess = searchParams.get("success") === "1";
  const paymentCancelled = searchParams.get("cancelled") === "1";

  const [order, setOrder] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);
  const [manualPayment, setManualPayment] = useState<ManualPaymentValue>(EMPTY_MANUAL_PAYMENT);

  useEffect(() => {
    if (!orderId) {
      setLoading(false);
      return;
    }

    const fetchOrderDetails = async () => {
      try {
        setLoading(true);
        const res = await fetch("/api/orders");
        if (res.ok) {
          const data = await res.json();
          if (data.success && data.orders) {
            const found = data.orders.find((o: any) => o.id === orderId);
            if (found) setOrder(found);
          }
        }
      } catch (err) {
        console.error("Error fetching order details:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrderDetails();
  }, [orderId]);

  const handleProcessPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderId) return;

    if (isManualCryptoMethod(order?.paymentMethod)) {
      if (!isManualPaymentComplete(manualPayment)) {
        alert("Select a wallet, then enter your transaction ID and upload the payment screenshot.");
        return;
      }
      try {
        setPaying(true);
        const data = await submitManualPaymentProof(orderId, manualPayment);
        setOrder(data.order);
        setManualPayment(EMPTY_MANUAL_PAYMENT);
      } catch (err: any) {
        alert(err.message);
      } finally {
        setPaying(false);
      }
      return;
    }

    try {
      setPaying(true);
      const res = await fetch("/api/orders/pay", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId, platform, locale }),
      });
      const data = await res.json();
      if (res.ok && data.success && data.checkoutUrl) {
        window.location.href = data.checkoutUrl;
      } else {
        alert(data.error || "Failed to start hosted checkout.");
      }
    } catch (err) {
      console.error("Payment error:", err);
      alert("Failed to start hosted checkout.");
    } finally {
      setPaying(false);
    }
  };

  if (loading) {
    return (
      <div className="h-screen w-screen bg-bg-dark flex flex-col items-center justify-center text-neutral-400 dashboard-clash-font text-xs gap-4 relative">
        <GridBg pattern_type="grid" opacity={0.06} mask_size={1200} className="z-0" />
        <div className="w-8 h-8 rounded-full border-2 border-white/10 border-t-indigo-500 animate-spin z-10" />
        <span className="text-[11px] font-medium tracking-wide text-neutral-400 z-10 font-mono">
          Resolving Secure Gateway Node...
        </span>
      </div>
    );
  }

  if (!orderId || !order) {
    return (
      <div className="h-screen w-screen bg-bg-dark flex flex-col items-center justify-center text-neutral-400 dashboard-clash-font p-6 text-center space-y-6 relative">
        <GridBg pattern_type="grid" opacity={0.06} mask_size={1200} className="z-0" />
        <div className="max-w-md p-8 rounded-2xl bg-neutral-950/80 border border-white/10 backdrop-blur-xl space-y-4 z-10 shadow-2xl">
          <h2 className="text-xl font-clash-display font-semibold text-white">Invalid Order Request</h2>
          <p className="text-xs text-neutral-400 leading-relaxed font-mono">
            No valid order reference was found. Please return to the buy challenge interface to initiate checkout.
          </p>
          <button
            onClick={() => router.push(`/${locale}/dashboard`)}
            className="w-full py-3 bg-white text-black hover:bg-neutral-200 text-xs font-semibold rounded-xl cursor-pointer transition-all"
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const isCrypto = String(order.paymentMethod || "").toLowerCase().includes("crypto");
  const isPaddle = String(order.paymentMethod || "").toLowerCase().includes("paddle");
  const isCodaPay = String(order.paymentMethod || "").toLowerCase().includes("codapay");
  const isPaid = String(order.status || "").toLowerCase() !== "pending";
  const isManual = isManualCryptoMethod(order.paymentMethod);
  const manualProof = isManual ? parseManualGatewayRef(order.gatewayRef) : null;

  return (
    <div className="min-h-screen bg-bg-dark text-text-primary dashboard-clash-font select-none antialiased relative flex items-center justify-center p-4 sm:p-6 md:p-12 overflow-x-hidden">
      <GridBg pattern_type="grid" opacity={0.06} mask_size={1200} className="z-0" />
      <div className="absolute -top-40 right-0 w-[500px] h-[500px] bg-brand-primary/5 rounded-full blur-3xl pointer-events-none z-0" />
      <div className="absolute -bottom-40 left-0 w-[600px] h-[600px] bg-brand-glow/10 rounded-full blur-3xl pointer-events-none z-0" />

      <div className="relative z-10 w-full max-w-4xl grid grid-cols-1 lg:grid-cols-12 gap-8 items-start my-auto">
        <div className="lg:col-span-7 bg-linear-to-br from-bg-card/95 via-bg-card/85 to-brand-surface/20 border border-white/10 shadow-2xl backdrop-blur-xl rounded-2xl p-6 relative overflow-hidden min-h-[500px] flex flex-col justify-between">
          {!isPaid && manualProof ? (
            <div className="flex flex-col items-center justify-center my-auto space-y-6 text-center animate-fade-in py-12">
              <div className="w-20 h-20 bg-amber-500/10 border-2 border-amber-500 rounded-full flex items-center justify-center text-amber-400">
                <IconReceipt size={32} />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-clash-display font-bold text-white tracking-wide">Payment Under Review</h3>
                <p className="text-xs text-neutral-400 max-w-sm mx-auto font-mono">
                  We received your {getManualWallet(manualProof.walletId)?.label || manualProof.walletId} transfer for order{" "}
                  <strong className="text-white font-mono">{order.id}</strong>. Your account activates once an admin verifies it.
                </p>
                <p className="text-[10px] text-neutral-500 font-mono break-all max-w-sm mx-auto">TXID: {manualProof.txid}</p>
              </div>
              <button
                onClick={() => router.push(`/${locale}/dashboard`)}
                className="px-5 py-3 bg-white text-black hover:bg-neutral-200 text-xs font-semibold rounded-xl cursor-pointer transition-all"
              >
                Return to Dashboard
              </button>
            </div>
          ) : isPaid ? (
            <div className="flex flex-col items-center justify-center my-auto space-y-6 text-center animate-fade-in py-12">
              <div className="w-20 h-20 bg-emerald-500/10 border-2 border-emerald-500 rounded-full flex items-center justify-center text-emerald-400 shadow-[0_0_60px_rgba(16,185,129,0.25)]">
                <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-clash-display font-bold text-white tracking-wide">Invoice Already Confirmed</h3>
                <p className="text-xs text-neutral-400 max-w-sm mx-auto font-mono">
                  Order <strong className="text-white font-mono">{order.id}</strong> is marked as {order.status}. Your account provisioning is queued.
                </p>
              </div>
              <button
                onClick={() => router.push(`/${locale}/dashboard`)}
                className="px-5 py-3 bg-white text-black hover:bg-neutral-200 text-xs font-semibold rounded-xl cursor-pointer transition-all"
              >
                Return to Dashboard
              </button>
            </div>
          ) : (
            <form onSubmit={handleProcessPayment} className="space-y-6">
              <div>
                <h2 className="text-xl font-clash-display font-semibold text-white tracking-tight flex items-center gap-2">
                  <IconReceipt size={22} className="text-brand-primary" />
                  <span>Hosted checkout gateway</span>
                </h2>
                <p className="text-xs text-neutral-400 mt-1 font-mono">
                  Platform Route: <strong className="text-white font-mono">{platform} Node</strong> | Payment Route: <strong className="text-white">{order.paymentMethod}</strong>
                </p>
              </div>

              {paymentCancelled && (
                <div className="p-4 bg-rose-500/5 border border-rose-500/15 rounded-xl text-rose-300 text-xs leading-normal">
                  Checkout was cancelled. Your order is still pending, so you can safely try again.
                </div>
              )}

              {paymentSuccess && (
                <div className="p-4 bg-amber-500/5 border border-amber-500/15 rounded-xl text-amber-300 text-xs leading-normal">
                  Payment page returned successfully. Your order activates only after the payment provider sends its verified webhook confirmation.
                </div>
              )}

              {isManual ? (
                <div className="space-y-4 animate-fade-in">
                  <div className="p-4 bg-emerald-500/5 border border-emerald-500/15 rounded-xl text-neutral-400 text-xs leading-normal">
                    <strong className="text-emerald-400 font-bold">Scan &amp; Pay:</strong> Send the exact amount to the wallet below, then submit your transaction ID and a screenshot for verification.
                  </div>
                  <ManualCryptoPayment
                    amount={Number(order.amountPaid || 0)}
                    value={manualPayment}
                    onChange={setManualPayment}
                    disabled={paying}
                  />
                </div>
              ) : isCrypto ? (
                <div className="space-y-5 animate-fade-in">
                  <div className="p-4 bg-amber-500/5 border border-amber-500/10 rounded-xl text-neutral-400 text-xs leading-normal">
                    <strong className="text-amber-400 font-bold">NOWPayments live checkout:</strong> You will be redirected to a hosted crypto invoice. Send funds only through the generated NOWPayments page so the order can be confirmed automatically.
                  </div>
                  <div className="flex items-center gap-4 bg-neutral-950/60 p-4 rounded-xl border border-white/5">
                    <span className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
                      <IconCoinBitcoin size={24} />
                    </span>
                    <div className="space-y-1">
                      <span className="text-xs text-white font-semibold block">Crypto invoice opens on NOWPayments</span>
                      <span className="text-[10px] text-neutral-500 font-mono block">Choose your preferred available cryptocurrency on the NOWPayments page.</span>
                    </div>
                  </div>
                </div>
              ) : isCodaPay ? (
                <div className="space-y-4 animate-fade-in">
                  <div className="p-4 bg-white/[0.03] border border-white/10 rounded-xl text-neutral-400 text-xs leading-normal">
                    <strong className="text-white font-bold">Secure CodaPay checkout:</strong> You will be redirected to the CodaPay-hosted payment page to choose and complete payment.
                  </div>
                  <div className="flex items-center gap-4 bg-neutral-950/60 p-4 rounded-xl border border-white/5">
                    <span className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white"><IconCreditCard size={24} /></span>
                    <div className="space-y-1"><span className="text-xs text-white font-semibold block">Payment opens on CodaPay</span><span className="text-[10px] text-neutral-500 font-mono block">Orders activate only after CodaPay confirms payment.</span></div>
                  </div>
                </div>
              ) : (
                <div className="space-y-4 animate-fade-in">
                  <div className="p-4 bg-white/[0.03] border border-white/10 rounded-xl text-neutral-400 text-xs leading-normal">
                    <strong className="text-white font-bold">Secure Paddle checkout:</strong> Card details are collected securely on Paddle-hosted Checkout.
                  </div>
                  <div className="flex items-center gap-4 bg-neutral-950/60 p-4 rounded-xl border border-white/5">
                    <span className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white">
                      <IconCreditCard size={24} />
                    </span>
                    <div className="space-y-1">
                      <span className="text-xs text-white font-semibold block">Card checkout opens on Paddle</span>
                      <span className="text-[10px] text-neutral-500 font-mono block">Live card payment via Paddle-hosted Checkout.</span>
                    </div>
                  </div>
                </div>
              )}

              <div className="text-[10px] text-neutral-500 leading-relaxed pt-2">
                {isManual
                  ? "An admin verifies the transaction on-chain before this order is activated."
                  : "The provider will confirm the payment before this order is activated. Do not close the provider page until checkout is complete."}
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => router.push(`/${locale}/dashboard`)}
                  className="flex-1 py-3.5 rounded-xl bg-neutral-900 border border-white/5 hover:border-white/10 text-white font-semibold cursor-pointer text-center text-xs transition-all active:scale-[0.98]"
                >
                  Pay Later
                </button>
                <button
                  type="submit"
                  disabled={paying || (isManual && !isManualPaymentComplete(manualPayment))}
                  className="flex-1 py-3.5 rounded-xl bg-white text-black hover:bg-neutral-200 font-bold cursor-pointer text-center text-xs transition-all active:scale-[0.98] shadow-[0_4px_15px_rgba(255,255,255,0.1)] flex items-center justify-center gap-2 disabled:opacity-60"
                >
                  {paying ? (
                    <>
                      <span className="h-3 w-3 rounded-full border-2 border-neutral-600 border-t-black animate-spin" />
                      <span>{isManual ? "Submitting..." : "Opening..."}</span>
                    </>
                  ) : (
                    <span>{isManual ? "Submit Payment Proof" : isCrypto ? "Open NOWPayments" : isCodaPay ? "Open CodaPay Checkout" : isPaddle ? "Open Paddle Checkout" : "Open Stripe Checkout"}</span>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>

        <div className="lg:col-span-5 bg-linear-to-br from-bg-card/75 via-bg-card/45 to-brand-surface/10 border border-white/5 backdrop-blur-xl rounded-2xl p-6 shadow-xl relative overflow-hidden flex flex-col justify-between">
          <div className="space-y-6">
            <div className="border-b border-white/5 pb-3">
              <h3 className="text-sm font-semibold text-white uppercase tracking-wider font-mono">Invoice Summary</h3>
              <p className="text-[10px] text-neutral-500 font-mono mt-0.5">Reference ID: {order.id}</p>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-white">
                  <BriefcaseIcon size={18} />
                </div>
                <div>
                  <span className="text-[10px] text-neutral-500 uppercase font-mono block">Product Details</span>
                  <span className="text-xs font-bold text-white block">{order.planName || "Prop challenge plan"}</span>
                </div>
              </div>

              <div className="p-4 bg-neutral-950/40 rounded-xl border border-white/5 space-y-3 font-mono text-[11px] text-neutral-400">
                <div className="flex justify-between">
                  <span>Selected Node:</span>
                  <span className="text-white font-semibold">{platform} Terminal</span>
                </div>
                <div className="flex justify-between">
                  <span>Promo Code:</span>
                  <span className="text-white font-semibold">{order.couponUsed || "None"}</span>
                </div>
                <div className="flex justify-between">
                  <span>Payment Gateway:</span>
                  <span className="text-white font-semibold">{isManual ? "Direct wallet (QR)" : isCrypto ? "NOWPayments" : isCodaPay ? "CodaPay" : isPaddle ? "Paddle" : "Stripe"}</span>
                </div>
                <div className="flex justify-between border-t border-white/5 pt-3 text-xs">
                  <span className="font-bold text-white">Total Amount:</span>
                  <span className="font-bold text-white text-sm">${order.amountPaid} USD</span>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-8 text-center text-neutral-600 font-mono text-[9px]">
            CodaPay, Paddle, and crypto payments are confirmed by provider notifications before activation.
          </div>
        </div>
      </div>
    </div>
  );
}

export default function PaymentPage() {
  return (
    <Suspense
      fallback={
        <div className="h-screen w-screen bg-bg-dark flex flex-col items-center justify-center text-neutral-400 dashboard-clash-font text-xs gap-4 relative">
          <GridBg pattern_type="grid" opacity={0.06} mask_size={1200} className="z-0" />
          <div className="w-8 h-8 rounded-full border-2 border-white/10 border-t-indigo-500 animate-spin z-10" />
          <span className="text-[11px] font-medium tracking-wide text-neutral-400 z-10 font-mono">
            Loading Checkout Secure Channel...
          </span>
        </div>
      }
    >
      <PaymentPageContent />
    </Suspense>
  );
}
