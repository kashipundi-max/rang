"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import Image from "next/image";
import { createPortal } from "react-dom";
import { useRouter, useParams } from "next/navigation";
import { IconCheck } from "../Icons";
import { IconBolt, IconReceipt2, IconSparkles, IconStack2 } from "@tabler/icons-react";
import { Chip, Panel, SectionLabel } from "../ui";
import {
  BUY_CHALLENGE_TYPES,
  getChallengeRule,
  getChallengeRuleByBuyLabel,
  applyWeekendHoldingAddon,
  WEEKEND_HOLDING_ADDON_PERCENT,
} from "@/lib/rulebook";
import { trackMetaEvent } from "@/lib/metaPixel";
import { isOfferLive, offerCoversTarget } from "@/lib/offerEligibility";
import { MANUAL_CRYPTO_PAYMENT_METHOD, MANUAL_WALLETS, isManualCryptoMethod, parseManualGatewayRef } from "@/config/manualWallets";
import ManualCryptoPayment, {
  WalletLogo,
  isManualPaymentComplete,
  submitManualPaymentProof,
  type ManualPaymentValue,
} from "../ManualCryptoPayment";

// Temporarily hides the card / digital-wallet (Paddle) option for everyone. Flip back to true to restore.
const PADDLE_CHECKOUT_ENABLED = false;

/**
 * Plans, coupons and offers are the same catalog for every trader and change
 * a few times a month. This tab unmounts on every tab switch, so without a
 * cache each visit re-fetched them and showed "No account sizes available"
 * until the round trip finished. The last response is kept in module scope:
 * a revisit paints the sizes immediately and still refreshes behind the paint.
 * Orders, affiliate balance and geo are per-trader and are never cached here.
 */
const catalogCache: {
  plans: any[] | null;
  coupons: any[] | null;
  offers: any[] | null;
} = { plans: null, coupons: null, offers: null };

const CATALOG_TTL_MS = 60_000;

/**
 * The in-flight (or recently finished) catalog request, shared between this
 * tab's own mount and `prefetchBuyCatalog`. Keeping the promises rather than
 * a boolean means a prefetch already on the wire is awaited instead of being
 * fired a second time when the trader opens the tab.
 */
let catalogRequest: {
  startedAt: number;
  plans: Promise<void>;
  coupons: Promise<void>;
  offers: Promise<void>;
} | null = null;

function requestCatalogJson(url: string) {
  return fetch(url)
    .then((r) => r.json())
    .catch((err) => {
      console.error(`Error fetching ${url}:`, err);
      return null;
    });
}

function loadCatalog() {
  if (catalogRequest && Date.now() - catalogRequest.startedAt < CATALOG_TTL_MS) {
    return catalogRequest;
  }
  catalogRequest = {
    startedAt: Date.now(),
    plans: requestCatalogJson("/api/pricing-plans").then((data) => {
      if (data?.success) catalogCache.plans = data.plans || [];
    }),
    coupons: requestCatalogJson("/api/coupons").then((data) => {
      if (data?.success) catalogCache.coupons = data.coupons || [];
    }),
    // Offers are optional: a missing table must not break checkout.
    offers: requestCatalogJson("/api/offers").then((data) => {
      catalogCache.offers = data?.success ? data.offers || [] : [];
    }),
  };
  return catalogRequest;
}

/**
 * Start the catalog request before this tab is opened. A trader who has just
 * signed up lands on the dashboard with no accounts and goes straight here, so
 * the dashboard warms the catalog while they read the empty-state card - by
 * the time they click through, the account sizes are already in hand.
 */
export function prefetchBuyCatalog() {
  loadCatalog();
}

const DEFAULT_MANUAL_PAYMENT: ManualPaymentValue = {
  walletId: MANUAL_WALLETS.some((wallet) => wallet.id === "USDT_BEP20") ? "USDT_BEP20" : MANUAL_WALLETS[0]?.id || "",
  txid: "",
  screenshot: null,
};

interface BuyChallengeTabProps {
  onPurchaseComplete: () => void;
  kycStatus?: "Unsubmitted" | "Pending" | "Verified" | "Rejected";
}

function getModelFromPlanName(name?: string): string {
  return getChallengeRule(name).buyLabel;
}

function ChallengeTypeIcon({ ruleKey, size = 26 }: { ruleKey: string; size?: number }) {
  if (ruleKey === "one_step_pro") return <IconBolt size={size} stroke={1.8} />;
  if (ruleKey === "instant_funding") return <IconSparkles size={size} stroke={1.8} />;
  return <IconStack2 size={size} stroke={1.8} />;
}

function isCouponActive(coupon: any) {
  const isExpired = Boolean(coupon.expiresAt && new Date(coupon.expiresAt).getTime() <= Date.now());
  return coupon.status === "active" && !isExpired;
}

function getCouponTimeLeft(expiresAt?: string) {
  if (!expiresAt) return "No expiry";
  const diff = new Date(expiresAt).getTime() - Date.now();
  if (diff <= 0) return "Expired";
  const days = Math.floor(diff / 86400000);
  const hours = Math.floor((diff % 86400000) / 3600000);
  const minutes = Math.floor((diff % 3600000) / 60000);
  if (days > 0) return `${days}d ${hours}h left`;
  if (hours > 0) return `${hours}h ${minutes}m left`;
  return `${Math.max(1, minutes)}m left`;
}

export default function BuyChallengeTab({ onPurchaseComplete, kycStatus = "Unsubmitted" }: BuyChallengeTabProps) {
  const router = useRouter();
  const params = useParams();
  const locale = params?.locale || "en";

  const [challengeType, setChallengeType] = useState("Two Step");
  const [accountSize, setAccountSize] = useState(100000);
  const [selectedCatalogPlanId, setSelectedCatalogPlanId] = useState("");
  const [platform, setPlatform] = useState<"MT4" | "MT5">("MT5");
  const [broker, setBroker] = useState("ThinkMarkets");
  const [weekendHoldingAddon, setWeekendHoldingAddon] = useState(false);
  const [promoCode, setPromoCode] = useState("");
  const [discountPercent, setDiscountPercent] = useState(0);
  const [promoApplied, setPromoApplied] = useState(false);
  // NOWPayments is no longer offered; crypto goes through Scan & Pay with BEP20 preselected.
  const [paymentMethod, setPaymentMethod] = useState<"qr" | "paddle">("qr");
  const [manualPayment, setManualPayment] = useState<ManualPaymentValue>(DEFAULT_MANUAL_PAYMENT);
  // Shown in the confirmation popup after a QR payment proof is submitted.
  const [submittedOrder, setSubmittedOrder] = useState<{ id: string; amount: number; wallet: string; plan: string } | null>(null);
  // Card / digital-wallet (Paddle) checkout is hidden for visitors in Pakistan.
  // Defaults to available so a failed geo check never blocks the option.
  const [cardPaymentAvailable, setCardPaymentAvailable] = useState(PADDLE_CHECKOUT_ENABLED);

  const [checkoutProcessing, setCheckoutProcessing] = useState(false);
  // 1 = account (type, platform, size), 2 = wallet, 3 = payment proof.
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [showCouponInput, setShowCouponInput] = useState(false);

  // Added state for order flow
  const [orders, setOrders] = useState<any[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(true);

  // Database-loaded plans and coupons, seeded from the catalog cache so a
  // revisit renders the account sizes on the first frame.
  const [dbPlans, setDbPlans] = useState<any[]>(() => catalogCache.plans || []);
  const [loadingPlans, setLoadingPlans] = useState(() => catalogCache.plans === null);
  const [dbCoupons, setDbCoupons] = useState<any[]>(() => catalogCache.coupons || []);
  const requestedCouponHandled = useRef(false);
  const activeCoupons = useMemo(() => dbCoupons.filter(isCouponActive), [dbCoupons]);
  // Live BOGO offers apply by themselves at activation — no code — so the
  // trader only needs to see which one covers the size they picked.
  const [dbOffers, setDbOffers] = useState<any[]>(() => catalogCache.offers || []);

  // Referral Balance & Coupon Selector states
  const [referralBalance, setReferralBalance] = useState(0);
  const [useReferralBalance, setUseReferralBalance] = useState(false);

  // Filter plans based on selected challengeType name mapping
  const activeCatalogPlans = useMemo(
    () =>
      dbPlans.filter(
        (p) => String(p.status || "active").toLowerCase() === "active",
      ),
    [dbPlans],
  );
  const matchedPlans = useMemo(
    () =>
      activeCatalogPlans.filter(
        (p) => getModelFromPlanName(p.model || p.name) === challengeType,
      ),
    [activeCatalogPlans, challengeType],
  );
  
  // Show every active admin pricing catalog row returned by Supabase.
  const activeSizes = useMemo(() => {
    const sortedOptions = matchedPlans
      .map((plan) => ({
        size: Number(plan.size),
        price: Number(plan.price),
        planId: plan.id,
      }))
      .sort((a, b) => a.size - b.size || a.price - b.price);

    const uniqueSizes = new Map<number, (typeof sortedOptions)[number]>();
    sortedOptions.forEach((option) => {
      if (!uniqueSizes.has(option.size)) uniqueSizes.set(option.size, option);
    });

    return Array.from(uniqueSizes.values());
  }, [matchedPlans]);

  // Make sure the selected catalog product matches the active model options.
  useEffect(() => {
    if (activeSizes.length > 0) {
      const selectedOption = activeSizes.find(
        (s) => s.planId === selectedCatalogPlanId,
      );
      const nextOption = selectedOption || activeSizes[0];
      if (!selectedOption) {
        setSelectedCatalogPlanId(nextOption.planId);
      }
      if (accountSize !== nextOption.size) setAccountSize(nextOption.size);
    } else if (selectedCatalogPlanId) {
      setSelectedCatalogPlanId("");
    }
  }, [accountSize, activeSizes, selectedCatalogPlanId]);

  // Find active size configuration
  const activeSizeObj =
    activeSizes.find((s) => s.planId === selectedCatalogPlanId) ||
    activeSizes[0];
  const hasCatalogPlan = Boolean(activeSizeObj?.planId);
  const basePrice = activeSizeObj?.price || 0;
  const selectedPlanId = activeSizeObj?.planId || "";

  const weekendHoldingAddonFee = weekendHoldingAddon
    ? applyWeekendHoldingAddon(basePrice, true) - basePrice
    : 0;
  const subTotal = basePrice + weekendHoldingAddonFee;
  const discountAmount = subTotal * (discountPercent / 100);
  const finalPriceBeforeRefBalance = Math.ceil(subTotal - discountAmount);
  // Rounded exactly like /api/orders so the total shown here is the amount stored on the order.
  const appliedReferralDiscount = useReferralBalance
    ? Number(Math.min(finalPriceBeforeRefBalance, referralBalance).toFixed(2))
    : 0;
  const finalPrice = Number((finalPriceBeforeRefBalance - appliedReferralDiscount).toFixed(2));
  const manualPaymentReady = paymentMethod !== "qr" || isManualPaymentComplete(manualPayment);

  // Features list based on selected model
  const getFeaturesForModel = (model: string) => {
    return getChallengeRuleByBuyLabel(model).features;
  };
  const features = getFeaturesForModel(challengeType);
  const selectedRule = getChallengeRuleByBuyLabel(challengeType);
  // Store-wide offers that are live right now. Offers pinned to specific
  // traders or accounts are claimed from the Offers tab, not advertised here.
  const liveOffers = useMemo(
    () =>
      dbOffers.filter(
        (offer) =>
          !(offer.userIds || []).length &&
          !(offer.accountIds || []).length &&
          isOfferLive(offer),
      ),
    [dbOffers],
  );
  const offersForSize = (size: number) =>
    liveOffers.filter((offer) => offerCoversTarget(offer, { size, planName: challengeType }));
  const selectedSizeOffers = offersForSize(accountSize);
  const appliedOffers = selectedSizeOffers.filter((offer) => offer.type === "bogo");
  const retryOffers = selectedSizeOffers.filter((offer) => offer.type === "free_retry");

  // Fetch plans, coupons, offers, orders and referral balance.
  // These five reads are independent, so each one paints the moment it lands
  // instead of queueing behind the slowest. They used to be awaited in
  // sequence after a single Promise.all, which meant the account sizes - the
  // only thing above the fold - waited on the order ledger.
  const fetchOrdersAndTelemetry = async () => {
    const requestJson = (url: string) =>
      fetch(url)
        .then((r) => r.json())
        .catch((err) => {
          console.error(`Error fetching ${url}:`, err);
          return null;
        });

    // Catalog: shared with the dashboard's prefetch, so if the trader came
    // from the empty-state card this is already resolved and paints at once.
    // Account sizes are the first thing they need, so each list is applied the
    // moment it lands rather than queueing behind the order ledger.
    const catalog = loadCatalog();
    const plansDone = catalog.plans.then(() => {
      if (catalogCache.plans) setDbPlans(catalogCache.plans);
      setLoadingPlans(false);
    });
    catalog.coupons.then(() => {
      if (catalogCache.coupons) setDbCoupons(catalogCache.coupons);
    });
    catalog.offers.then(() => {
      if (catalogCache.offers) setDbOffers(catalogCache.offers);
    });

    setLoadingOrders(true);
    requestJson("/api/orders").then((dataOrders) => {
      if (dataOrders?.success) setOrders(dataOrders.orders || []);
      setLoadingOrders(false);
    });

    requestJson("/api/affiliate").then((dataAffiliate) => {
      if (!dataAffiliate?.success) return;
      const approvedReferrals = (dataAffiliate.referrals || []).filter(
        (r: any) => r.status === "approved"
      );
      const availableBal = approvedReferrals.reduce(
        (sum: number, r: any) => sum + r.commissionAmount,
        0
      );
      setReferralBalance(availableBal);
    });

    await plansDone;
  };

  useEffect(() => {
    fetchOrdersAndTelemetry();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Hide the card / digital-wallet option when the visitor is in Pakistan.
  useEffect(() => {
    if (!PADDLE_CHECKOUT_ENABLED) return;
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/geo", { cache: "no-store" });
        const data = await res.json();
        if (cancelled || !data?.success || data.cardPaymentAvailable !== false) return;
        setCardPaymentAvailable(false);
        setPaymentMethod((current) => (current === "paddle" ? "qr" : current));
      } catch {
        // Fail open: keep the card option visible if the geo check fails.
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (requestedCouponHandled.current || dbCoupons.length === 0) return;

    const requestedCoupon = new URLSearchParams(window.location.search)
      .get("coupon")
      ?.trim()
      .toUpperCase();
    requestedCouponHandled.current = true;

    // A ?coupon= link wins; otherwise the biggest live coupon applies by itself.
    const liveCoupon =
      (requestedCoupon &&
        dbCoupons.find(
          (coupon) =>
            String(coupon.code).toUpperCase() === requestedCoupon &&
            isCouponActive(coupon)
        )) ||
      dbCoupons
        .filter(isCouponActive)
        .sort((a, b) => Number(b.discountPercent) - Number(a.discountPercent))[0];
    if (liveCoupon) {
      setPromoCode(String(liveCoupon.code).toUpperCase());
      setDiscountPercent(Number(liveCoupon.discountPercent));
      setPromoApplied(true);
    }
  }, [dbCoupons]);

  const handleApplyPromo = () => {
    const code = promoCode.trim().toUpperCase();
    const liveCoupon = dbCoupons.find(c => c.code === code && isCouponActive(c));
    
    if (liveCoupon) {
      setDiscountPercent(Number(liveCoupon.discountPercent));
      setPromoApplied(true);
    } else if (!dbCoupons.find(c => c.code === code) && (code === "LUNAR10" || code === "SARAH10")) {
      setDiscountPercent(10);
      setPromoApplied(true);
    } else {
      alert("Invalid promo code. Check active codes in admin portal.");
    }
  };

  // Create the pending order, then immediately open its hosted payment checkout.
  const handleInitiateOrder = async () => {
    if (checkoutProcessing) return;

    if (!selectedPlanId) {
      alert("This challenge size is not available in the admin pricing catalog.");
      return;
    }

    if (!manualPaymentReady) {
      alert("Select a wallet, then enter your transaction ID and upload the payment screenshot.");
      return;
    }

    setCheckoutProcessing(true);
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          planId: selectedPlanId,
          couponUsed: promoApplied ? promoCode : "",
          paymentMethod: paymentMethod === "paddle" ? "Paddle" : MANUAL_CRYPTO_PAYMENT_METHOD,
          useReferralBalance: useReferralBalance,
          weekendHoldingAddon,
          expectedAmount: finalPrice,
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        // Fire client-side pixel event immediately on order creation
        trackMetaEvent(
          "Purchase",
          {
            value: Number(data.order.amountPaid || 0),
            currency: "USD",
            content_ids: data.order.planId ? [data.order.planId] : undefined,
            content_name:
              matchedPlans.find((p) => p.id === data.order.planId)?.name ||
              "Trading challenge",
            content_type: "product",
          },
          { eventID: `purchase_${data.order.id}` },
        );

        if (paymentMethod === "qr") {
          try {
            await submitManualPaymentProof(data.order.id, manualPayment);
            setSubmittedOrder({
              id: data.order.id,
              amount: Number(data.order.amountPaid || 0),
              wallet: MANUAL_WALLETS.find((wallet) => wallet.id === manualPayment.walletId)?.label || manualPayment.walletId,
              plan: `${selectedRule.displayName} $${accountSize.toLocaleString()}`,
            });
            setManualPayment(DEFAULT_MANUAL_PAYMENT);
            setStep(1);
          } catch (proofErr: any) {
            alert(
              `${proofErr.message} Your order ${data.order.id} was created — you can resubmit the proof from your pending orders.`,
            );
          }
          fetchOrdersAndTelemetry();
          setCheckoutProcessing(false);
          return;
        }

        fetchOrdersAndTelemetry(); // Refresh order ledger

        const paymentRes = await fetch("/api/orders/pay", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            orderId: data.order.id,
            platform,
            locale,
          }),
        });
        const paymentData = await paymentRes.json();

        if (paymentRes.ok && paymentData.success && paymentData.checkoutUrl) {
          window.location.assign(paymentData.checkoutUrl);
          return;
        }

        alert(
          paymentData.error ||
            "Your order was created, but hosted checkout could not be opened. You can retry payment from your pending orders.",
        );
        setCheckoutProcessing(false);
        return;
      }

      if (data?.code === "PRICE_CHANGED") {
        // The cached catalog was stale: drop it and reload so the summary shows
        // the real total before the trader tries again.
        catalogRequest = null;
        fetchOrdersAndTelemetry();
      }
      alert(data.error || "Failed to initiate order.");
    } catch (err: any) {
      alert("Failed to finalize checkout.");
    }

    setCheckoutProcessing(false);
  };

  const walletSelected = paymentMethod !== "qr" || Boolean(manualPayment.walletId);
  const canOpenStep = (target: 1 | 2 | 3) =>
    target === 1 || (hasCatalogPlan && (target === 2 || walletSelected));
  const goToStep = (target: 1 | 2 | 3) => {
    if (!canOpenStep(target)) return;
    setStep(target);
    document.getElementById("buy-steps")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };
  // Card checkout has no proof to upload, so it places the order from step 2.
  const isFinalStep = step === 3 || (step === 2 && paymentMethod === "paddle");
  // The order summary only appears on the last step, once the account and
  // wallet are chosen, so the first two steps stay a single focused column.
  const showSummary = isFinalStep;
  const handlePrimaryAction = () => {
    if (isFinalStep) handleInitiateOrder();
    else goToStep((step + 1) as 2 | 3);
  };
  const primaryReady = isFinalStep
    ? hasCatalogPlan && manualPaymentReady && !checkoutProcessing
    : canOpenStep((step + 1) as 2 | 3);
  const primaryLabel = isFinalStep
    ? paymentMethod === "qr"
      ? manualPaymentReady
        ? "Submit payment"
        : "Add TXID & screenshot"
      : "Place order"
    : !hasCatalogPlan
      ? loadingPlans
        ? "Loading plans..."
        : "Select an available plan"
      : step === 1
        ? "Continue to wallet"
        : "Continue to upload proof";
  // Size cards always show the coupon price: the applied coupon, or else the
  // best live coupon as a preview so traders see what they would pay.
  const bestLiveCoupon = activeCoupons.reduce<any>(
    (best, coupon) => (!best || Number(coupon.discountPercent) > Number(best.discountPercent) ? coupon : best),
    null
  );
  const cardDiscountPercent = promoApplied ? discountPercent : Number(bestLiveCoupon?.discountPercent || 0);
  const cardCouponCode = promoApplied ? promoCode : String(bestLiveCoupon?.code || "").toUpperCase();
  const couponPriceFor = (price: number) => Math.ceil(price * (1 - cardDiscountPercent / 100));

  const handlePayPendingOrder = (order: any) => {
    router.push(`/pay?orderId=${order.id}&platform=${platform}&locale=${locale}`);
  };

  return (
    <div className="relative mx-auto max-w-[1480px] space-y-4 pb-0 sm:space-y-6 xl:pb-10">
      <Panel className="flex flex-col gap-3 p-5 sm:flex-row sm:items-end sm:justify-between sm:p-7">
        <div>
          <p className="text-[12px] font-bold uppercase tracking-[0.24em] text-brand-primary">New challenge</p>
          <h1 className="mt-1.5 text-[24px] font-bold tracking-tight text-white sm:text-3xl">Buy challenge</h1>
          <p className="mt-1 text-[14px] text-text-secondary sm:text-[15px]">Pick a plan and size, then pay with crypto.</p>
        </div>
        {promoApplied && discountPercent > 0 && (
          <Chip tone="success" className="self-start sm:self-auto">{discountPercent}% OFF · {promoCode}</Chip>
        )}
      </Panel>

      <div className={`grid items-start gap-6 ${showSummary ? "xl:grid-cols-[minmax(0,1fr)_420px]" : ""}`}>
        <section id="buy-steps" className="scroll-mt-4 space-y-4">
          <nav aria-label="Checkout steps" className="dash-panel flex gap-1.5 p-1.5 sm:grid sm:grid-cols-3 sm:gap-2 sm:p-2">
            {([
              { id: 1, label: "Account" },
              { id: 2, label: "Wallet" },
              { id: 3, label: "Upload proof" },
            ] as const).map((item) => {
              const isCurrent = step === item.id;
              const isDone = step > item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  disabled={!canOpenStep(item.id)}
                  aria-current={isCurrent ? "step" : undefined}
                  onClick={() => goToStep(item.id)}
                  className={`flex min-w-0 items-center justify-center gap-2.5 rounded-2xl px-2 py-3 text-left disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto sm:flex-none sm:justify-start sm:px-4 ${isCurrent ? "flex-1" : "w-14 shrink-0"} ${
                    isCurrent ? "bg-brand-primary/[0.14] ring-1 ring-brand-primary/50" : "hover:bg-white/[0.03]"
                  }`}
                >
                  <span
                    className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[13px] font-bold sm:h-8 sm:w-8 sm:text-[14px] ${
                      isCurrent
                        ? "bg-brand-primary text-white"
                        : isDone
                          ? "bg-emerald-500/15 text-emerald-300"
                          : "border border-white/10 bg-white/[0.04] text-neutral-400"
                    }`}
                  >
                    {isDone ? <IconCheck size={13} strokeWidth={3} /> : item.id}
                  </span>
                  <span className={`truncate text-[14px] font-semibold sm:text-[15px] ${isCurrent ? "text-white" : "hidden text-neutral-400 sm:inline"}`}>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {step === 1 && (
          <>
          <Panel className="p-4 sm:p-7">
            <SectionLabel index={1}>Challenge type</SectionLabel>
            <div className="mt-4 grid grid-cols-3 gap-2.5 sm:mt-5 sm:gap-4">
              {BUY_CHALLENGE_TYPES.map((type) => {
                const rule = getChallengeRuleByBuyLabel(type);
                const isSelected = challengeType === type;
                return (
                  <button
                    key={type}
                    type="button"
                    aria-pressed={isSelected}
                    onClick={() => setChallengeType(type)}
                    className={`relative flex min-w-0 cursor-pointer flex-col justify-between rounded-2xl border p-3 text-left sm:min-h-[180px] sm:rounded-3xl sm:p-6 ${
                      isSelected
                        ? "border-brand-primary bg-brand-primary/[0.08]"
                        : "border-white/[0.09] hover:border-white/20 hover:bg-white/[0.03]"
                    }`}
                  >
                    <span
                      className={`flex h-10 w-10 items-center justify-center rounded-xl sm:h-14 sm:w-14 sm:rounded-2xl ${
                        isSelected ? "bg-brand-primary text-button-text" : "bg-white/[0.07] text-text-secondary"
                      }`}
                    >
                      <ChallengeTypeIcon ruleKey={rule.key} size={22} />
                    </span>
                    <span className="mt-4 block min-w-0 sm:mt-6">
                      <span className="block truncate text-[15px] font-bold text-white sm:text-[22px]">{rule.displayName}</span>
                      <span className="mt-1 hidden text-[14px] text-text-secondary sm:block">
                        {rule.phase2TargetPercent > 0 ? "Two evaluation phases" : rule.phase1TargetPercent > 0 ? "One evaluation phase" : "Funded right away"}
                      </span>
                    </span>
                    {isSelected && (
                      <span className="absolute right-2.5 top-2.5 flex h-5 w-5 items-center justify-center rounded-full bg-brand-primary text-button-text sm:right-5 sm:top-5 sm:h-8 sm:w-8">
                        <IconCheck size={12} strokeWidth={3} />
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </Panel>

          <Panel className="p-4 sm:p-7">
            <SectionLabel index={2}>Account size</SectionLabel>
            {activeSizes.length > 0 ? (
              <div className="mt-5 grid grid-cols-2 gap-x-3 gap-y-5 sm:mt-6 sm:grid-cols-3 sm:gap-x-4 sm:gap-y-6 lg:grid-cols-4">
                {activeSizes.map((sizeOption) => {
                  const isSelected = selectedPlanId === sizeOption.planId;
                  const sizeOffers = offersForSize(sizeOption.size);
                  const hasBogo = sizeOffers.some((offer) => offer.type === "bogo");
                  const hasRetry = sizeOffers.some((offer) => offer.type === "free_retry");
                  const badge = hasBogo ? "BUY 1 GET 1" : hasRetry ? "FREE RETRY" : cardDiscountPercent > 0 ? `${cardDiscountPercent}% OFF` : "";
                  return (
                    <button
                      key={sizeOption.planId}
                      type="button"
                      aria-pressed={isSelected}
                      onClick={() => {
                        setSelectedCatalogPlanId(sizeOption.planId);
                        setAccountSize(sizeOption.size);
                      }}
                      className={`relative cursor-pointer rounded-2xl border px-4 pb-4 pt-5 text-left sm:rounded-3xl sm:px-5 sm:pb-5 sm:pt-6 ${
                        isSelected
                          ? "border-brand-primary bg-brand-primary/[0.08]"
                          : "border-white/[0.09] hover:border-white/20 hover:bg-white/[0.03]"
                      }`}
                    >
                      {badge && (
                        <span
                          className={`absolute -top-2.5 right-3 whitespace-nowrap rounded-md px-2 py-0.5 text-[11px] font-bold tracking-wide sm:-top-3 sm:left-1/2 sm:right-auto sm:-translate-x-1/2 ${
                            hasBogo ? "bg-fuchsia-500 text-white" : hasRetry ? "bg-sky-500 text-white" : "bg-emerald-500 text-black"
                          }`}
                        >
                          {badge}
                        </span>
                      )}
                      <span className={`block text-[15px] font-bold sm:text-[18px] ${isSelected ? "text-brand-primary" : "text-white"}`}>
                        ${(sizeOption.size / 1000).toFixed(0)}K
                      </span>
                      <span className="mt-2.5 flex flex-wrap items-baseline gap-x-2 sm:mt-3">
                        <span className="text-[22px] font-extrabold leading-none text-white sm:text-[26px]">
                          ${couponPriceFor(sizeOption.price).toLocaleString()}
                        </span>
                        {cardDiscountPercent > 0 && (
                          <span className="text-[14px] text-text-muted line-through">${sizeOption.price.toLocaleString()}</span>
                        )}
                      </span>
                      {cardDiscountPercent > 0 && cardCouponCode ? (
                        <span className="mt-1.5 block text-[13px] font-semibold text-emerald-400 sm:mt-2 sm:text-[14px]">
                          {cardDiscountPercent}% off with <span className="font-mono">{cardCouponCode}</span>
                        </span>
                      ) : (
                        <span className="mt-1.5 block text-[13px] text-text-muted sm:mt-2 sm:text-[14px]">One-time fee</span>
                      )}
                    </button>
                  );
                })}
              </div>
            ) : loadingPlans ? (
              <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4" aria-busy="true" aria-label="Loading account sizes">
                {[0, 1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="h-[132px] rounded-3xl border border-white/[0.07] bg-white/[0.03]" />
                ))}
              </div>
            ) : (
              <div className="mt-6 rounded-2xl border border-dashed border-white/10 px-4 py-8 text-center text-[15px] text-text-muted">
                No account sizes available right now.
              </div>
            )}
          </Panel>

          <Panel className="p-4 sm:p-7">
            <SectionLabel index={3}>Trading platform</SectionLabel>
            <div className="mt-5 grid grid-cols-2 gap-4">
              {([
                { name: "MT4", logo: "/mt4.png" },
                { name: "MT5", logo: "/mt5.png" },
              ] as const).map((item) => {
                const isSelected = platform === item.name;
                return (
                  <button
                    key={item.name}
                    type="button"
                    aria-label={`Select ${item.name}`}
                    aria-pressed={isSelected}
                    onClick={() => setPlatform(item.name)}
                    className={`relative flex min-h-[72px] cursor-pointer items-center justify-center rounded-2xl border px-4 py-3 sm:min-h-[96px] sm:rounded-3xl ${
                      isSelected
                        ? "border-brand-primary bg-brand-primary/[0.08]"
                        : "border-white/[0.09] hover:border-white/20 hover:bg-white/[0.03]"
                    }`}
                  >
                    <Image src={item.logo} alt={`${item.name} logo`} width={120} height={48} className="h-8 w-auto max-w-[110px] object-contain sm:h-10" />
                    {isSelected && (
                      <span className="absolute right-3 top-3 flex h-6 w-6 items-center justify-center rounded-full bg-brand-primary text-button-text">
                        <IconCheck size={13} strokeWidth={3} />
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </Panel>

          {retryOffers.length > 0 && (
            <div className="rounded-3xl border border-sky-500/25 bg-sky-500/[0.08] p-5 sm:p-6">
              <p className="text-[13px] font-bold uppercase tracking-[0.16em] text-sky-300">Free retry included</p>
              <ul className="mt-2 space-y-1.5">
                {retryOffers.map((offer) => {
                  const retries = Number(offer.retryLimit) || 1;
                  return (
                    <li key={offer.id} className="text-[14px] text-white">
                      <span className="font-semibold">{offer.name}</span>
                      <span className="text-text-secondary">
                        {" "}— if this ${accountSize.toLocaleString()} {challengeType} account fails, claim {retries} free retr{retries === 1 ? "y" : "ies"} from My Accounts.
                      </span>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}

          {appliedOffers.length > 0 && (
            <div className="rounded-3xl border border-emerald-500/25 bg-emerald-500/[0.08] p-5 sm:p-6">
              <p className="text-[13px] font-bold uppercase tracking-[0.16em] text-emerald-300">Offer applied automatically</p>
              <ul className="mt-2 space-y-1.5">
                {appliedOffers.map((offer) => (
                  <li key={offer.id} className="text-[14px] text-white">
                    <span className="font-semibold">{offer.name}</span>
                    <span className="text-text-secondary">
                      {" "}— buy {Number(offer.buyQuantity) || 1}, get {Number(offer.freeQuantity) || 1} free ${accountSize.toLocaleString()} {challengeType} account{(Number(offer.freeQuantity) || 1) === 1 ? "" : "s"}. No code needed.
                    </span>
                  </li>
                ))}
              </ul>
              <p className="mt-2 text-[13px] text-text-muted">A coupon only lowers the price; it does not change this offer.</p>
            </div>
          )}

          <Panel className="p-4 sm:p-7">
            <SectionLabel index={4}>Coupon</SectionLabel>
            <div className="mt-5 flex overflow-hidden rounded-2xl border border-white/[0.09]">
              <input
                value={promoCode}
                onChange={(event) => {
                  setPromoCode(event.target.value);
                  if (promoApplied) {
                    setDiscountPercent(0);
                    setPromoApplied(false);
                  }
                }}
                placeholder="PROMO CODE"
                aria-label="Promo code"
                className="min-w-0 flex-1 bg-transparent px-4 py-3.5 text-[15px] font-semibold uppercase text-white outline-none placeholder:text-text-muted"
              />
              <button
                type="button"
                onClick={promoApplied ? () => {
                  setPromoCode("");
                  setDiscountPercent(0);
                  setPromoApplied(false);
                } : handleApplyPromo}
                className="shrink-0 cursor-pointer border-l border-white/[0.09] bg-white/[0.05] px-6 text-[15px] font-bold text-white hover:bg-white/[0.1]"
              >
                {promoApplied ? "Remove" : "Apply"}
              </button>
            </div>
            {promoApplied && (
              <p className="mt-2 text-[14px] font-semibold text-emerald-400">{promoCode} applied — {discountPercent}% off</p>
            )}
            {referralBalance > 0 && (
              <label className="mt-3 flex cursor-pointer items-center justify-between rounded-2xl border border-white/[0.09] px-4 py-3.5 text-[14px] text-text-secondary">
                <span>Use ${referralBalance.toFixed(2)} referral balance</span>
                <input type="checkbox" checked={useReferralBalance} onChange={(event) => setUseReferralBalance(event.target.checked)} className="h-5 w-5 accent-purple-500" />
              </label>
            )}

            {activeCoupons.length > 0 && (
              <div className="custom-scrollbar mt-5 flex gap-3 overflow-x-auto pb-1">
                {activeCoupons.map((coupon) => {
                  const isSelected = promoApplied && promoCode.toUpperCase() === String(coupon.code).toUpperCase();
                  return (
                    <button
                      key={coupon.id || coupon.code}
                      type="button"
                      onClick={() => {
                        setPromoCode(coupon.code);
                        setDiscountPercent(Number(coupon.discountPercent));
                        setPromoApplied(true);
                      }}
                      className={`shrink-0 cursor-pointer rounded-2xl border px-5 py-4 text-left ${
                        isSelected ? "border-emerald-500/50 bg-emerald-500/10" : "border-white/[0.09] hover:border-white/20"
                      }`}
                    >
                      <span className="block font-mono text-[15px] font-bold text-white">{coupon.code}</span>
                      <span className="mt-1 block text-[14px] font-semibold text-emerald-400">Save {coupon.discountPercent}%</span>
                      <span className="mt-0.5 block text-[12px] text-text-muted">{getCouponTimeLeft(coupon.expiresAt)}</span>
                    </button>
                  );
                })}
              </div>
            )}
          </Panel>

          <article className="dash-panel p-4 sm:p-7">
            <SectionLabel index={5} className="mb-5" action={<Chip>Optional</Chip>}>
              Add-ons
            </SectionLabel>
            <button
              type="button"
              aria-pressed={weekendHoldingAddon}
              onClick={() => setWeekendHoldingAddon((value) => !value)}
              className={`flex w-full items-start gap-3 rounded-2xl border p-4 text-left transition-all ${
                weekendHoldingAddon
                  ? "border-brand-primary bg-brand-primary/[0.12] shadow-[0_12px_30px_rgba(139,92,246,0.14)]"
                  : "border-white/[0.07] bg-white/[0.018] hover:border-white/15"
              }`}
            >
              <span
                className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md border ${
                  weekendHoldingAddon ? "border-brand-primary bg-brand-primary text-white" : "border-white/20 bg-transparent"
                }`}
              >
                {weekendHoldingAddon && <IconCheck size={12} strokeWidth={3} />}
              </span>
              <span className="min-w-0 flex-1">
                <span className="flex items-center justify-between gap-3">
                  <span className="text-[17px] font-bold text-white">Weekend holding</span>
                  <span className="shrink-0 rounded-lg border border-brand-primary/35 bg-brand-primary/10 px-2.5 py-1 text-[13px] font-bold text-brand-primary">
                    +{WEEKEND_HOLDING_ADDON_PERCENT}%
                  </span>
                </span>
                <span className="mt-1 block text-[14px] leading-relaxed text-text-secondary">
                  Hold positions through the weekend closure. Without this add-on, all positions must close before the weekend on every account type and stage.
                  {weekendHoldingAddonFee > 0 && (
                    <span className="mt-1 block font-semibold text-white">+${weekendHoldingAddonFee.toFixed(2)} added to the challenge fee</span>
                  )}
                </span>
              </span>
            </button>
          </article>

          </>
          )}

          {step === 2 && (
          <article className="dash-panel p-4 sm:p-7">
            <div className="mb-6">
              <SectionLabel index={2}>Select wallet</SectionLabel>
              <p className="mt-2 text-[15px] text-text-secondary">Pick the wallet network, then send the exact amount to the address below.</p>
            </div>
            {/* Only worth a choice when card checkout is on; otherwise go straight to the wallets. */}
            <div className={`grid gap-3 ${cardPaymentAvailable ? "" : "hidden"}`}>
              {MANUAL_WALLETS.length > 0 && (
              <button
                type="button"
                aria-pressed={paymentMethod === "qr"}
                aria-label={`Scan a QR code and pay directly from your wallet with USDT or Bitcoin`}
                onClick={() => setPaymentMethod("qr")}
                className={`relative min-h-[108px] rounded-2xl border p-4 text-left transition-all ${
                  paymentMethod === "qr" ? "border-emerald-400/70 bg-emerald-500/[0.08] shadow-[0_12px_30px_rgba(16,185,129,0.14)]" : "border-white/[0.07] bg-white/[0.018] hover:border-white/15"
                }`}
              >
                <span className="mb-1 block text-[9px] font-bold uppercase tracking-[0.16em] text-emerald-400">Scan &amp; Pay (QR)</span>
                <span className="mb-3 block text-[10px] text-neutral-500">Send directly from your wallet, then submit the TXID and a screenshot.</span>
                <span className="flex flex-wrap gap-2 pr-6">
                  {MANUAL_WALLETS.map((wallet) => (
                    <span
                      key={wallet.id}
                      className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-white/[0.08] bg-black/25 px-2.5 text-[9px] font-bold uppercase tracking-wide text-neutral-200 shadow-sm"
                    >
                      <WalletLogo wallet={wallet} size={16} />
                      <span>{wallet.label.replace(/^USDT /, "")}</span>
                    </span>
                  ))}
                </span>
                {paymentMethod === "qr" && <IconCheck size={14} className="absolute right-4 bottom-4 text-emerald-400" />}
              </button>
              )}
              {cardPaymentAvailable && (
              <button
                type="button"
                aria-pressed={paymentMethod === "paddle"}
                aria-label="Pay with Visa, Mastercard, Apple Pay, Google Pay via Paddle"
                onClick={() => setPaymentMethod("paddle")}
                className={`relative min-h-[108px] rounded-2xl border p-4 text-left transition-all ${
                  paymentMethod === "paddle" ? "border-brand-primary bg-brand-primary/[0.12] shadow-[0_12px_30px_rgba(139,92,246,0.14)]" : "border-white/[0.07] bg-white/[0.018] hover:border-white/15"
                }`}
              >
                <span className="mb-3 block text-[9px] font-bold uppercase tracking-[0.16em] text-neutral-500">Card / Digital Wallet</span>
                <span className="flex flex-wrap gap-2 pr-6">
                  <span className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-white/[0.08] bg-black/25 px-2.5 text-[9px] font-bold uppercase tracking-wide text-neutral-200 shadow-sm">
                    <svg viewBox="0 0 24 24" aria-hidden="true" className="h-4 w-4 shrink-0" fill="currentColor" style={{ color: "#1a1f71" }}>
                      <path d="M1.5 6.5A2.5 2.5 0 0 1 4 4h16a2.5 2.5 0 0 1 2.5 2.5v11A2.5 2.5 0 0 1 20 20H4a2.5 2.5 0 0 1-2.5-2.5v-11Zm3.5 1v2h3V7.5H5Zm0 4v2h14v-2H5Zm0 4v1h4v-1H5Zm6 0v1h3v-1h-3Z" />
                    </svg>
                    <span>Visa</span>
                  </span>
                  <span className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-white/[0.08] bg-black/25 px-2.5 text-[9px] font-bold uppercase tracking-wide text-neutral-200 shadow-sm">
                    <svg viewBox="0 0 24 24" aria-hidden="true" className="h-4 w-4 shrink-0" fill="currentColor" style={{ color: "#eb001b" }}>
                      <circle cx="9" cy="12" r="5" opacity="0.8" /><circle cx="15" cy="12" r="5" opacity="0.8" style={{ color: "#f79e1b" }} />
                    </svg>
                    <span>MC</span>
                  </span>
                  <span className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-white/[0.08] bg-black/25 px-2.5 text-[9px] font-bold uppercase tracking-wide text-neutral-200 shadow-sm">
                    <svg viewBox="0 0 24 24" aria-hidden="true" className="h-4 w-4 shrink-0" fill="currentColor" style={{ color: "#fff" }}>
                      <path d="M17.05 12.54c-.05-1.97 1.6-2.92 1.63-2.94-.89-1.3-2.27-1.48-2.76-1.5-1.17-.12-2.3.7-2.9.7-.6 0-1.53-.68-2.52-.66-1.3.02-2.5.76-3.16 1.93-1.35 2.35-.35 5.83.97 7.74.64.94 1.41 1.99 2.42 1.95.97-.04 1.34-.63 2.51-.63 1.17 0 1.5.63 2.52.61 1.05-.02 1.7-.95 2.34-1.89.74-1.08 1.04-2.13 1.06-2.18-.02-.01-2.03-.78-2.05-3.1l-.06.01ZM15.15 6.26c.54-.64.9-1.53.8-2.42-.77.03-1.71.52-2.26 1.16-.5.57-.93 1.49-.82 2.37.86.07 1.74-.44 2.28-1.11Z" />
                    </svg>
                    <span>Pay</span>
                  </span>
                </span>
                {paymentMethod === "paddle" && <IconCheck size={14} className="absolute right-4 top-4 text-brand-primary" />}
              </button>
              )}
            </div>
            {paymentMethod === "qr" && (
              <div className={cardPaymentAvailable ? "mt-4 rounded-2xl border border-emerald-500/15 bg-emerald-500/[0.03] p-3 sm:p-4" : ""}>
                <ManualCryptoPayment
                  amount={finalPrice}
                  value={manualPayment}
                  onChange={setManualPayment}
                  disabled={checkoutProcessing}
                  section="wallet"
                />
              </div>
            )}
          </article>
          )}

          {step === 3 && (
          <article className="dash-panel p-4 sm:p-7">
            <div className="mb-6">
              <SectionLabel index={3}>Upload payment proof</SectionLabel>
              <p className="mt-2 text-[15px] text-text-secondary">Paste the transaction hash and upload a screenshot of the payment.</p>
            </div>
            <ManualCryptoPayment
              amount={finalPrice}
              value={manualPayment}
              onChange={setManualPayment}
              disabled={checkoutProcessing}
              section="proof"
            />
          </article>
          )}

          <div className="flex items-center justify-between gap-3 pb-2">
            {step > 1 ? (
              <button
                type="button"
                onClick={() => goToStep((step - 1) as 1 | 2)}
                className="rounded-2xl border border-white/10 bg-white/[0.03] px-6 py-3.5 text-[15px] font-semibold text-white hover:bg-white/[0.07]"
              >
                ← Back
              </button>
            ) : (
              <span />
            )}
            <button
              type="button"
              disabled={!primaryReady}
              onClick={handlePrimaryAction}
              className={`min-h-[52px] flex-1 items-center justify-center gap-2 rounded-2xl px-7 py-3.5 text-[15px] font-bold sm:flex-none ${showSummary ? "hidden xl:flex" : "flex"} ${
                primaryReady
                  ? "bg-brand-primary text-white shadow-[0_14px_35px_rgba(139,92,246,0.28)] hover:brightness-110"
                  : "cursor-not-allowed bg-neutral-800 text-neutral-500"
              }`}
            >
              {checkoutProcessing ? "Submitting..." : <>{primaryLabel} <span aria-hidden="true">→</span></>}
            </button>
          </div>
        </section>

        {showSummary && (
        <aside className="dash-panel self-start overflow-hidden xl:sticky xl:top-4">
          <div
            className="p-6 text-white sm:p-7"
            style={{
              background:
                "linear-gradient(135deg, var(--color-brand-primary) 0%, color-mix(in srgb, var(--color-brand-primary) 55%, #0b1030) 100%)",
            }}
          >
            <span className="flex items-center gap-2.5 text-[13px] font-bold uppercase tracking-[0.3em] text-white/90">
              <IconReceipt2 size={19} /> Order summary
            </span>
            <div className="mt-6 flex items-center gap-4">
              <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white/20">
                <ChallengeTypeIcon ruleKey={selectedRule.key} size={28} />
              </span>
              <div className="min-w-0">
                <p className="text-[16px] font-medium text-white/85">{selectedRule.displayName} challenge</p>
                <p className="text-[40px] font-extrabold leading-tight tracking-tight">${accountSize.toLocaleString()}</p>
              </div>
            </div>
            <div className="mt-6 flex flex-wrap gap-2">
              {[platform, `${selectedRule.profitSplitPercent}% split`, paymentMethod === "paddle" ? "Card" : MANUAL_WALLETS.find((wallet) => wallet.id === manualPayment.walletId)?.label || "Crypto"].map((chip) => (
                <span key={chip} className="rounded-full bg-white/20 px-3.5 py-1.5 text-[14px] font-semibold">
                  {chip}
                </span>
              ))}
            </div>
          </div>

          <div className="p-6 sm:p-7">
            <div className="grid grid-cols-2 overflow-hidden rounded-2xl border border-white/[0.09]">
              {[
                ["Profit target", selectedRule.phase1TargetPercent > 0 ? (selectedRule.phase2TargetPercent > 0 ? `${selectedRule.phase1TargetPercent}% + ${selectedRule.phase2TargetPercent}%` : `${selectedRule.phase1TargetPercent}%`) : "None"],
                ["Min. days", selectedRule.minTradingDaysEvaluation > 0 ? String(selectedRule.minTradingDaysEvaluation) : "—"],
                ["Daily loss", `${selectedRule.dailyDrawdownPercent}%`],
                ["Max loss", `${selectedRule.overallDrawdownPercent}%`],
              ].map(([label, value], index) => (
                <div key={label} className={`p-4 sm:p-5 ${index % 2 === 0 ? "border-r border-white/[0.09]" : ""} ${index < 2 ? "border-b border-white/[0.09]" : ""}`}>
                  <span className="block text-[12px] font-bold uppercase tracking-[0.16em] text-text-muted">{label}</span>
                  <span className="mt-2 block text-[22px] font-extrabold text-white">{value}</span>
                </div>
              ))}
            </div>

            <div className="mt-5 space-y-3 border-b border-white/[0.09] pb-5 text-[15px]">
              <div className="flex justify-between text-text-secondary"><span>Challenge fee</span><span className="font-semibold text-white">${basePrice.toFixed(2)}</span></div>
              {weekendHoldingAddonFee > 0 && <div className="flex justify-between text-text-secondary"><span>Weekend holding (+{WEEKEND_HOLDING_ADDON_PERCENT}%)</span><span className="font-semibold text-white">+${weekendHoldingAddonFee.toFixed(2)}</span></div>}
              {discountPercent > 0 && <div className="flex justify-between text-emerald-400"><span>Coupon ({discountPercent}%)</span><span className="font-semibold">-${(subTotal * (discountPercent / 100)).toFixed(2)}</span></div>}
              {appliedReferralDiscount > 0 && <div className="flex justify-between text-emerald-400"><span>Referral credit</span><span className="font-semibold">-${appliedReferralDiscount.toFixed(2)}</span></div>}
            </div>

            <div className="flex items-end justify-between gap-3 py-5">
              <div>
                <span className="block text-[13px] font-bold uppercase tracking-[0.16em] text-text-muted">Total due</span>
                <span className="mt-1 block text-[13px] text-text-muted">One-time fee · KYC {kycStatus.toLowerCase()}</span>
              </div>
              <span className="text-[40px] font-extrabold leading-none tracking-tight text-white">${finalPrice.toFixed(2)}</span>
            </div>

            <button
              type="button"
              disabled={!primaryReady}
              onClick={handlePrimaryAction}
              className={`flex h-14 w-full items-center justify-center gap-2 rounded-2xl text-[16px] font-bold ${
                primaryReady
                  ? "cursor-pointer bg-brand-primary text-button-text hover:brightness-110"
                  : "cursor-not-allowed bg-white/[0.07] text-text-muted"
              }`}
            >
              {checkoutProcessing ? (
                <>
                  <span className="h-5 w-5 animate-spin rounded-full border-2 border-white/35 border-t-white" />
                  <span>{paymentMethod === "qr" ? "Submitting proof..." : "Creating order..."}</span>
                </>
              ) : (
                <>
                  <span>{primaryLabel}</span>
                  {primaryReady && <span aria-hidden="true">→</span>}
                </>
              )}
            </button>

            <div className="mt-5 flex flex-wrap justify-center gap-x-5 gap-y-2 text-[13px] text-text-muted">
              {["Secure payment", "Instant invoice", "Real support"].map((item) => (
                <span key={item} className="flex items-center gap-1.5">
                  <IconCheck size={14} className="text-emerald-400" /> {item}
                </span>
              ))}
            </div>
          </div>
        </aside>
        )}
      </div>
      {/* User Invoice Ledger / Order History (NEW SECTION) */}
      <details className="dash-panel group overflow-hidden">
        <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-5 py-4 sm:px-6">
          <div>
            <h2 className="text-[18px] font-bold text-white">Previous orders</h2>
          </div>
          <div className="flex items-center gap-3">
            <Chip>{orders.length} orders</Chip>
            <span className="text-text-muted group-open:rotate-180">⌄</span>
          </div>
        </summary>
        <div className="border-t border-white/[0.06] p-5 sm:p-6">
          {loadingOrders ? (
            <div className="text-center py-6 text-xs font-mono text-neutral-500">Loading invoice entries...</div>
          ) : orders.length === 0 ? (
            <div className="text-center py-8 border border-dashed border-neutral-800 rounded-xl text-xs text-neutral-500 font-mono">
              No orders found. Configure a challenge plan above to start.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-[14px] text-text-secondary">
                <thead>
                  <tr className="border-b border-white/[0.08] text-[12px] font-bold uppercase tracking-[0.12em] text-text-muted">
                    <th className="py-2.5">Order ID</th>
                    <th className="py-2.5">Challenge Plan</th>
                    <th className="py-2.5">Date</th>
                    <th className="py-2.5">Amount Paid</th>
                    <th className="py-2.5">Status</th>
                    <th className="py-2.5 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {orders.map((o) => {
                    const isPending = (o.status || "").toLowerCase() === "pending";
                    const isUnderReview = isPending && isManualCryptoMethod(o.paymentMethod) && Boolean(parseManualGatewayRef(o.gatewayRef));
                    return (
                      <tr key={o.id} className="hover:bg-white/[0.01]">
                        <td className="py-3 font-bold text-white">{o.id}</td>
                        <td className="py-3 text-neutral-300">{o.planName || "Unknown Plan"}</td>
                        <td className="py-3 text-neutral-500">{o.createdAt ? o.createdAt.substring(0, 10) : "N/A"}</td>
                        <td className="py-3 text-white font-bold">${o.amountPaid}</td>
                        <td className="py-3">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase ${
                              (o.status || "").toLowerCase() === "paid"
                                ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                                : isPending
                                ? "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                                : "bg-neutral-800 text-neutral-400"
                            }`}
                          >
                            {o.status}
                          </span>
                        </td>
                        <td className="py-3 text-right">
                          {isUnderReview ? (
                            <span className="text-[10px] text-emerald-400 font-bold uppercase">Under review</span>
                          ) : isPending ? (
                            <button
                              onClick={() => handlePayPendingOrder(o)}
                              className="px-3 py-1 bg-white hover:bg-neutral-200 text-black font-semibold rounded text-[10px] transition-colors cursor-pointer"
                            >
                              Pay Now
                            </button>
                          ) : (
                            <span className="text-[10px] text-neutral-600 font-bold uppercase">Paid Invoice</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </details>



      {/* Phones/tablets: the summary sits far below, so keep the total and the order button in reach. */}
      {hasCatalogPlan && showSummary && (
        <div className="sticky bottom-0 z-30 -mx-4 border-t border-white/[0.08] bg-bg-dark px-4 py-3 md:-mx-8 md:px-8 xl:hidden">
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <span className="block text-[12px] font-bold uppercase tracking-[0.14em] text-text-muted">Total due</span>
              <span className="block text-[26px] font-extrabold leading-tight text-white">${finalPrice.toFixed(2)}</span>
            </div>
            <button
              type="button"
              disabled={!primaryReady}
              onClick={handlePrimaryAction}
              className="flex min-h-[48px] shrink-0 items-center justify-center gap-2 rounded-2xl bg-brand-primary px-5 text-sm font-bold text-white shadow-[0_10px_28px_rgba(139,92,246,0.3)] transition-all active:scale-[0.98] disabled:opacity-60"
            >
              {checkoutProcessing ? (
                <>
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/35 border-t-white" />
                  <span>Submitting...</span>
                </>
              ) : (
                <span>{primaryLabel}{primaryReady ? " →" : ""}</span>
              )}
            </button>
          </div>
        </div>
      )}
      {submittedOrder && createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-labelledby="order-submitted-title">
          <div className="absolute inset-0 bg-black/80" onClick={onPurchaseComplete} />
          <div className="relative z-10 w-full max-w-sm rounded-3xl border border-emerald-500/25 bg-bg-dark p-6 text-center shadow-[0_28px_80px_rgba(0,0,0,0.5)]">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border-2 border-emerald-500 bg-emerald-500/10 text-emerald-400">
              <IconCheck size={30} strokeWidth={3} />
            </div>
            <h3 id="order-submitted-title" className="mt-4 font-clash-display text-xl font-semibold text-white">Order submitted</h3>
            <p className="mt-1.5 text-xs leading-relaxed text-neutral-400">
              Your payment proof is under review. Your account is activated as soon as an admin verifies the transaction.
            </p>
            <div className="mt-5 rounded-2xl border border-white/[0.07] bg-black/30 p-4">
              <span className="block text-[9px] font-bold uppercase tracking-[0.16em] text-neutral-500">Order ID</span>
              <div className="mt-1 flex items-center justify-center gap-2">
                <span className="select-all font-mono text-2xl font-bold text-white">{submittedOrder.id}</span>
                <button
                  type="button"
                  onClick={() => navigator.clipboard?.writeText(submittedOrder.id).catch(() => {})}
                  className="rounded-lg border border-white/10 bg-white/[0.04] px-2 py-1 text-[9px] font-semibold text-neutral-300 hover:bg-white/[0.08]"
                >
                  Copy
                </button>
              </div>
              <dl className="mt-4 space-y-1.5 border-t border-white/[0.06] pt-3 text-[11px]">
                <div className="flex justify-between gap-3"><dt className="text-neutral-500">Plan</dt><dd className="text-right text-white">{submittedOrder.plan}</dd></div>
                <div className="flex justify-between gap-3"><dt className="text-neutral-500">Amount</dt><dd className="text-white">${submittedOrder.amount.toLocaleString()}</dd></div>
                <div className="flex justify-between gap-3"><dt className="text-neutral-500">Paid with</dt><dd className="text-white">{submittedOrder.wallet}</dd></div>
                <div className="flex justify-between gap-3"><dt className="text-neutral-500">Status</dt><dd className="font-semibold text-amber-300">Under review</dd></div>
              </dl>
            </div>
            <p className="mt-3 text-[10px] text-neutral-500">Keep this order ID for support. You can track it in My Accounts.</p>
            <button
              type="button"
              onClick={onPurchaseComplete}
              className="mt-5 w-full rounded-2xl bg-brand-primary py-3.5 text-sm font-bold text-white shadow-[0_14px_35px_rgba(139,92,246,0.28)] transition-all hover:brightness-110"
            >
              Go to My Accounts →
            </button>
          </div>
        </div>,
        document.body,
      )}
    </div>
  );
}
