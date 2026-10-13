import React, { useState, useEffect, useRef } from "react";
import AccountGraphModal from "./AccountGraphModal";
import PromotionManager from "./PromotionManager";
import { getManualWallet, parseManualGatewayRef } from "@/config/manualWallets";
import {
  IconSearch,
  IconUser,
  IconUserCheck,
  IconReceipt,
  IconServer,
  IconCreditCard,
  IconFlag,
  IconBell,
  IconPlus,
  IconCheck,
  IconX,
  IconChevronDown,
  IconChevronUp,
  IconEye,
  IconCopy,
  IconTicket,
  IconGift,
  IconTarget,
  IconUsers,
  IconBox,
  IconMail,
  IconCalendar,
  IconTrendingUp,
  IconShoppingCart,
  IconChartBar,
  IconKey,
  IconSettings,
  IconTrash,
} from "../Icons";
import {
  AdminPageHeader,
  AdminPanel,
  AdminSelect,
  AdminButton,
  AdminEmptyState,
  AdminTable,
  AdminIconButton,
  AdminStatCard,
  AdminWorkflowCard,
  AdminChartCard,
  AdminChartBadge,
  AdminMeter,
  AdminTrendChart,
  AdminBadge,
  AdminModal,
  AdminDetailList,
  AdminRowMenu,
  AdminToolbar,
  AdminTableFooter,
  AdminCopyValue,
  ADMIN_TD,
  ADMIN_TR,
  AdminFeedbackHost,
  Spinner,
  adminToast,
  adminConfirm,
  adminPrompt,
  VIZ,
  type AdminAccent,
} from "../AdminUI";
import { BUY_CHALLENGE_TYPES, getChallengeRule } from "@/lib/rulebook";
import {
  PHASE_FUNDED,
  PHASE_TWO,
  getNextStagePhase,
  getSelectableStagePhases,
  getStageAccountStatus,
  getStagePhases,
  getStageProfitTarget,
  planSupportsPhase,
} from "@/lib/challengeStages";

interface AdminCrmTabProps {
  forcedSubTab?: string;
  isCrmPortal?: boolean;
  /**
   * Set by the CRM portal shell so in-page navigation (workflow tiles, "Back")
   * moves the sidebar selection too. Without it the tab falls back to switching
   * its own internal sub-tab.
   */
  onNavigate?: (dashboardTab: string) => void;
}



function adminCredentialKey(platform: unknown, server: unknown, login: unknown) {
  return [platform, server, login]
    .map((value) => String(value || "").trim().toLowerCase())
    .join("|");
}
function getAccountStatusBadgeClass(status: unknown) {
  switch (status) {
    case "Active":
      return "border-blue-500/25 bg-blue-500/10 text-blue-300";
    case "Funded":
      return "border-violet-500/25 bg-violet-500/10 text-violet-300";
    case "Passed":
      return "border-emerald-500/25 bg-emerald-500/10 text-emerald-300";
    case "Failed":
      return "border-red-500/25 bg-red-500/10 text-red-300";
    default:
      return "border-neutral-700 bg-neutral-900 text-neutral-400";
  }
}
function getDefaultCouponExpiryInput() {
  const expires = new Date(Date.now() + 24 * 60 * 60 * 1000);
  expires.setMinutes(expires.getMinutes() - expires.getTimezoneOffset());
  return expires.toISOString().slice(0, 16);
}

function isCouponExpired(expiresAt?: string, now = Date.now()) {
  return Boolean(expiresAt && new Date(expiresAt).getTime() <= now);
}

function getCouponTimeLeft(expiresAt?: string, now = Date.now()) {
  if (!expiresAt) return "No expiry timer";
  const diff = new Date(expiresAt).getTime() - now;
  if (diff <= 0) return "Expired";
  const days = Math.floor(diff / 86400000);
  const hours = Math.floor((diff % 86400000) / 3600000);
  const minutes = Math.floor((diff % 3600000) / 60000);
  const seconds = Math.floor((diff % 60000) / 1000);
  if (days > 0) return `${days}d ${hours}h ${minutes}m left`;
  if (hours > 0) return `${hours}h ${minutes}m ${seconds}s left`;
  return `${minutes}m ${seconds}s left`;
}

function formatCouponExpiry(expiresAt?: string) {
  if (!expiresAt) return "No expiry set";
  return new Date(expiresAt).toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

const OFFER_TYPE_OPTIONS = [
  {
    value: "bogo",
    label: "BOGO — Buy One Get One Free",
    hint: "Buying the qualifying challenge(s) unlocks extra account(s) at no cost.",
  },
  {
    value: "free_retry",
    label: "Free Retry",
    hint: "A failed challenge can be restarted free of charge.",
  },
] as const;

type OfferFormState = {
  id: string;
  name: string;
  type: "bogo" | "free_retry";
  description: string;
  status: "active" | "paused";
  startsAt: string;
  expiresAt: string;
  accountSizes: number[];
  models: string[];
  userIds: string[];
  accountIds: string[];
  buyQuantity: number;
  freeQuantity: number;
  retryLimit: number;
  maxRedemptions: number;
};

/** Offers run longer than flash coupons, so the builder defaults to a week. */
function getDefaultOfferExpiryInput() {
  const expires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  expires.setMinutes(expires.getMinutes() - expires.getTimezoneOffset());
  return expires.toISOString().slice(0, 16);
}

/** ISO timestamp -> the local value a `datetime-local` input expects. */
function toDateTimeLocalInput(value?: string) {
  if (!value) return "";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return "";
  parsed.setMinutes(parsed.getMinutes() - parsed.getTimezoneOffset());
  return parsed.toISOString().slice(0, 16);
}

function createEmptyOfferForm(): OfferFormState {
  return {
    id: "",
    name: "",
    type: "bogo",
    description: "",
    status: "active",
    startsAt: "",
    expiresAt: getDefaultOfferExpiryInput(),
    accountSizes: [],
    models: [],
    userIds: [],
    accountIds: [],
    buyQuantity: 1,
    freeQuantity: 1,
    retryLimit: 1,
    maxRedemptions: 0,
  };
}

/** The one-line summary shown on each ledger card. */
function describeOffer(offer: any) {
  if (offer.type === "free_retry") {
    const retries = Number(offer.retryLimit) || 1;
    return `${retries} free retr${retries === 1 ? "y" : "ies"} per qualifying account`;
  }
  const buy = Number(offer.buyQuantity) || 1;
  const free = Number(offer.freeQuantity) || 1;
  return `Buy ${buy} · get ${free} free`;
}

/** "2h 5m" / "3d 4h" until a future timestamp — shown on scheduled offers. */
function formatTimeUntil(value: string, now = Date.now()) {
  const minutes = Math.max(1, Math.ceil((new Date(value).getTime() - now) / 60000));
  const days = Math.floor(minutes / 1440);
  const hours = Math.floor((minutes % 1440) / 60);
  const mins = minutes % 60;
  if (days > 0) return `${days}d ${hours}h`;
  if (hours > 0) return `${hours}h ${mins}m`;
  return `${mins}m`;
}

/** Live status of an offer, accounting for its start/expiry window. */
function getOfferState(offer: any, now = Date.now()) {
  if (offer.status === "paused") return "paused";
  if (offer.expiresAt && new Date(offer.expiresAt).getTime() <= now) return "expired";
  if (offer.startsAt && new Date(offer.startsAt).getTime() > now) return "scheduled";
  if (
    Number(offer.maxRedemptions) > 0 &&
    Number(offer.redeemedCount) >= Number(offer.maxRedemptions)
  ) {
    return "exhausted";
  }
  return "active";
}

const OFFER_STATE_BADGE: Record<string, string> = {
  active: "text-emerald-300 bg-emerald-500/10 border-emerald-500/20",
  paused: "text-amber-300 bg-amber-500/10 border-amber-500/20",
  scheduled: "text-sky-300 bg-sky-500/10 border-sky-500/20",
  expired: "text-red-300 bg-red-500/10 border-red-500/20",
  exhausted: "text-neutral-300 bg-white/5 border-white/10",
};

function AdminCrmLoadingSkeleton() {
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[0, 1, 2, 3].map((item) => (
          <div
            key={item}
            className="p-5 dash-card"
          >
            <div className="flex justify-between items-start">
              <div className="space-y-3">
                <div className="h-2.5 w-28 rounded bg-white/[0.08]" />
                <div className="h-7 w-24 rounded bg-white/[0.12]" />
              </div>
              <div className="h-10 w-10 rounded-xl bg-brand-primary/15" />
            </div>
            <div className="mt-4 h-2 w-full rounded bg-white/[0.06]" />
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="p-5 rounded-2xl dash-card">
          <div className="mb-5 flex justify-between border-b border-white/5 pb-3">
            <div className="space-y-2">
              <div className="h-4 w-48 rounded bg-white/[0.12]" />
              <div className="h-2.5 w-64 rounded bg-white/[0.06]" />
            </div>
            <div className="h-6 w-20 rounded bg-white/[0.08]" />
          </div>
          <div className="h-44 rounded-xl bg-white/[0.06]" />
          <div className="mt-4 grid grid-cols-3 gap-3">
            <div className="h-14 rounded-lg bg-white/[0.05]" />
            <div className="h-14 rounded-lg bg-white/[0.05]" />
            <div className="h-14 rounded-lg bg-white/[0.05]" />
          </div>
        </div>

        <div className="p-5 rounded-2xl dash-card">
          <div className="mb-5 flex justify-between border-b border-white/5 pb-3">
            <div className="space-y-2">
              <div className="h-4 w-44 rounded bg-white/[0.12]" />
              <div className="h-2.5 w-56 rounded bg-white/[0.06]" />
            </div>
            <div className="h-6 w-24 rounded bg-white/[0.08]" />
          </div>
          <div className="space-y-3">
            {[0, 1, 2, 3, 4].map((row) => (
              <div
                key={row}
                className="flex items-center justify-between rounded-xl border border-white/5 bg-white/[0.03] p-4"
              >
                <div className="space-y-2">
                  <div className="h-3 w-36 rounded bg-white/[0.1]" />
                  <div className="h-2 w-52 rounded bg-white/[0.06]" />
                </div>
                <div className="h-7 w-20 rounded-lg bg-white/[0.08]" />
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="flex items-center justify-center gap-3 text-[11px] font-medium text-neutral-500">
        <span className="h-2 w-2 rounded-full bg-brand-primary" />
        <span>Preparing CRM telemetry</span>
      </div>
    </div>
  );
}

/* Credential editor building blocks. Module-level on purpose: defining them
   inside the render would remount every input (and drop focus) per keystroke. */
function CredField({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <label className="flex min-w-0 flex-col gap-1.5">
      <span className="flex items-baseline justify-between gap-2 text-xs font-medium text-neutral-400">
        {label}
        {hint && <span className="font-normal text-neutral-600">{hint}</span>}
      </span>
      {children}
    </label>
  );
}

function CredSection({ title, aside, children }: { title: string; aside?: React.ReactNode; children: React.ReactNode }) {
  return (
    <section className="space-y-3 border-t border-white/[0.06] pt-5 first:border-t-0 first:pt-0">
      <div className="flex items-center justify-between gap-3">
        <h4 className="text-[13px] font-semibold text-white">{title}</h4>
        {aside}
      </div>
      {children}
    </section>
  );
}

export default function AdminCrmTab({
  forcedSubTab,
  isCrmPortal = false,
  onNavigate,
}: AdminCrmTabProps = {}) {
  const [activeSubTab, setActiveSubTab] = useState<
    | "telemetry"
    | "traders"
    | "kyc"
    | "orders"
    | "inventory"
    | "delivery"
    | "payouts"
    | "affiliates"
    | "newsletter"
    | "promotions"
    | "broadcaster"
    | "audit"
    | "coupons"
    | "offers"
    | "pricing"
  >("telemetry");

  useEffect(() => {
    if (forcedSubTab) {
      let mapped = forcedSubTab;
      if (forcedSubTab === "telemetry") mapped = "telemetry";
      if (forcedSubTab === "users") mapped = "traders";
      if (forcedSubTab === "plans") mapped = "inventory";
      if (forcedSubTab === "accounts") mapped = "delivery";
      if (forcedSubTab === "notifications") mapped = "broadcaster";
      if (forcedSubTab === "newsletter") mapped = "newsletter";
      if (forcedSubTab === "promotions") mapped = "promotions";
      if (forcedSubTab === "coupons") mapped = "coupons";
      if (forcedSubTab === "offers") mapped = "offers";
      if (forcedSubTab === "pricing") mapped = "pricing";
      setActiveSubTab(mapped as any);
      setSelectedUser(null);
    }
  }, [forcedSubTab]);

  // CRM State Data
  const [users, setUsers] = useState<any[]>([]);
  const [kycList, setKycList] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [plans, setPlans] = useState<any[]>([]);
  const [accounts, setAccounts] = useState<any[]>([]);
  const [payouts, setPayouts] = useState<any[]>([]);
  const [affiliates, setAffiliates] = useState<any[]>([]);
  const [referrals, setReferrals] = useState<any[]>([]);
  const [notifLogs, setNotifLogs] = useState<any[]>([]);
  const [emailLogs, setEmailLogs] = useState<any[]>([]);
  const [newsletterSubscribers, setNewsletterSubscribers] = useState<any[]>([]);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [coupons, setCoupons] = useState<any[]>([]);
  const [offers, setOffers] = useState<any[]>([]);
  const [pricingPlans, setPricingPlans] = useState<any[]>([]);
  const [pricingCatalogMessage, setPricingCatalogMessage] = useState("");
  // Inline price editing in the catalog ledger: which card is open, the draft
  // value being typed, and whether its save request is still in flight.
  const [editingPricingPlanId, setEditingPricingPlanId] = useState<string | null>(
    null,
  );
  const [editingPricingPlanPrice, setEditingPricingPlanPrice] = useState("");
  const [savingPricingPlanId, setSavingPricingPlanId] = useState<string | null>(
    null,
  );
  // `loading` is the first-paint state and swaps the whole desk for a skeleton.
  // `refreshing` is every later reload - it leaves the data on screen and only
  // spins the refresh icon, so hitting refresh (or saving a change) no longer
  // blanks the page the admin is reading.
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const hasLoadedOnce = useRef(false);
  const [generatedDashboardPasswords, setGeneratedDashboardPasswords] =
    useState<Record<string, string>>({});

  // Search/Filters
  const [userSearch, setUserSearch] = useState("");
  const [userRoleFilter, setUserRoleFilter] = useState("all");
  const [newPricingPlan, setNewPricingPlan] = useState({
    model: "Two Step",
    size: 100000,
    price: 449,
  });
  // When true, the Account Size field is a free-form number input instead of
  // the preset dropdown, so admins can publish a catalog product at any size.
  const [customPricingSize, setCustomPricingSize] = useState(false);
  // Same idea for container (inventory) accounts: free-form size input.
  const [customContainerSize, setCustomContainerSize] = useState(false);
  const [customContainerEditSize, setCustomContainerEditSize] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any | null>(null);

  // Form states
  const [newPlan, setNewPlan] = useState({
    platform: "MT5",
    login: "",
    password: "",
    server: "Range4ex-Demo",
    size: 100000,
    price: 499,
    name: "TWO STEP",
    externalStatisticsId: "",
    graphLink: "",
  });

  const [newCoupon, setNewCoupon] = useState({
    code: "",
    discountPercent: 10,
    expiresAt: getDefaultCouponExpiryInput(),
  });
  const [couponNow, setCouponNow] = useState(Date.now());

  // Offers desk: the builder form doubles as the editor (a non-empty `id`
  // means "update that row" rather than "create a new one").
  const [offerForm, setOfferForm] = useState<OfferFormState>(createEmptyOfferForm);
  const [savingOffer, setSavingOffer] = useState(false);
  const [offerMessage, setOfferMessage] = useState("");
  const [offerError, setOfferError] = useState("");
  const [offerUserSearch, setOfferUserSearch] = useState("");
  const [offerAccountSearch, setOfferAccountSearch] = useState("");

  const [deliveryForm, setDeliveryForm] = useState<any>(null); // holds account to deliver
  const [graphAccount, setGraphAccount] = useState<any | null>(null);
  const [kycReview, setKycReview] = useState<any>(null); // holds kyc request to review
  const [payoutReview, setPayoutReview] = useState<any>(null); // holds payout to review
  const [affiliateRateForm, setAffiliateRateForm] = useState<any>(null); // holds affiliate to adjust
  const [editingOrder, setEditingOrder] = useState<any | null>(null);
  const [kycFilter, setKycFilter] = useState("all");
  const [kycSearch, setKycSearch] = useState("");
  const [kycVerdict, setKycVerdict] = useState<"approved" | "rejected" | null>(null);
  const [payoutVerdict, setPayoutVerdict] = useState<"paid" | "rejected" | null>(null);
  const [accountSearch, setAccountSearch] = useState("");
  const [newsViolationsAccount, setNewsViolationsAccount] = useState<any | null>(null);
  const [tempPasswordUser, setTempPasswordUser] = useState<any | null>(null);
  // Status picked in the "Change status" modal, saved only on "Save status".
  const [orderStatusDraft, setOrderStatusDraft] = useState("");
  useEffect(() => {
    setOrderStatusDraft(editingOrder?.status || "");
  }, [editingOrder?.id]);
  const [viewingOrder, setViewingOrder] = useState<any | null>(null);
  const [viewingCredentialsOrder, setViewingCredentialsOrder] = useState<
    any | null
  >(null);
  const [deletingAccountId, setDeletingAccountId] = useState<string | null>(
    null,
  );
  const [deletingOrderId, setDeletingOrderId] = useState<string | null>(null);
  // Credential editor helpers: container picker filters + submit lock.
  const [showAllContainerSizes, setShowAllContainerSizes] = useState(false);
  const [containerSearch, setContainerSearch] = useState("");
  const [deliverySaving, setDeliverySaving] = useState(false);
  const [isCustomManualBalance, setIsCustomManualBalance] = useState(false);
  const [isEditingUser, setIsEditingUser] = useState(false);
  const [userEditForm, setUserEditForm] = useState<any>({
    name: "",
    email: "",
    phone: "",
    country: "",
    role: "trader",
    status: "active",
    referredBy: "",
  });

  const [showAddForm, setShowAddForm] = useState(false);

  useEffect(() => {
    if (activeSubTab !== "coupons" && activeSubTab !== "offers") return;
    const timer = window.setInterval(() => setCouponNow(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, [activeSubTab]);

  // Plans manual status edit state
  const [editingPlanId, setEditingPlanId] = useState<string | null>(null);
  const [editPlanStatus, setEditPlanStatus] = useState<
    "available" | "delivered"
  >("available");
  const [editPlanOrderId, setEditPlanOrderId] = useState<string>("");

  const handleSavePlanStatus = (planId: string) => {
    return runBusy(`plan-status:${planId}`, async () => {
      try {
        const res = await fetch("/api/challenge-inventory", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id: planId,
            status: editPlanStatus,
            orderId: editPlanStatus === "delivered" ? editPlanOrderId : "",
          }),
        });
        if (res.ok) {
          setEditingPlanId(null);
          fetchCrmData();
        }
      } catch (err) {
        adminToast.error("Error saving status change.");
      }
    });
  };

  // Toggle plan password visibility state
  const [revealedPlanPasswords, setRevealedPlanPasswords] = useState<
    Record<string, boolean>
  >({});
  const toggleRevealPassword = (planId: string) => {
    setRevealedPlanPasswords((prev) => ({
      ...prev,
      [planId]: !prev[planId],
    }));
  };

  // Plan Details View/Edit modal states
  const [selectedPlanDetails, setSelectedPlanDetails] = useState<any | null>(
    null,
  );
  const [isEditingPlan, setIsEditingPlan] = useState(false);
  const [planEditType, setPlanEditType] = useState<"status" | "credentials">(
    "status",
  );
  const [planEditForm, setPlanEditForm] = useState<any>({
    platform: "MT5",
    size: 100000,
    login: "",
    password: "",
    server: "",
    status: "available",
    orderId: "",
  });

  // Graph ID / graph link editor inside the container view. Saved on its own
  // (not through the credentials form) so it also works on delivered containers.
  const [containerGraphForm, setContainerGraphForm] = useState<{
    editing: boolean;
    saving: boolean;
    graphLink: string;
    externalStatisticsId: string;
  }>({ editing: false, saving: false, graphLink: "", externalStatisticsId: "" });

  const handleSaveContainerGraph = async () => {
    if (!selectedPlanDetails) return;
    const graphLink = containerGraphForm.graphLink.trim();
    const externalStatisticsId = containerGraphForm.externalStatisticsId.trim();
    setContainerGraphForm((prev) => ({ ...prev, saving: true }));
    try {
      const res = await fetch("/api/challenge-inventory", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: selectedPlanDetails.id,
          graphLink,
          externalStatisticsId,
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setSelectedPlanDetails({ ...selectedPlanDetails, ...data.plan });
        setContainerGraphForm({
          editing: false,
          saving: false,
          graphLink: data.plan.graphLink || "",
          externalStatisticsId: data.plan.externalStatisticsId || "",
        });
        fetchCrmData();
        return;
      }
      adminToast.error(data.error || "Error saving graph link.");
    } catch (err) {
      console.error("Error saving container graph:", err);
      adminToast.error("Error saving graph link.");
    }
    setContainerGraphForm((prev) => ({ ...prev, saving: false }));
  };

  const handleSavePlanDetails = (e: React.FormEvent) => {
    e.preventDefault();
    return runBusy("plan-details", async () => {
      try {
        const res = await fetch("/api/challenge-inventory", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id: selectedPlanDetails.id,
            ...planEditForm,
          }),
        });
        const data = await res.json();
        if (res.ok && data.success) {
          adminToast.success("Inventory account updated successfully.");
          setIsEditingPlan(false);
          setSelectedPlanDetails(null);
          fetchCrmData();
        } else {
          adminToast.error(data.error || "Error saving configuration updates.");
        }
      } catch (err) {
        console.error("Error saving plan details:", err);
        adminToast.error("Error saving configuration updates.");
      }
    });
  };

  // UI state for sub-panels
  const [innerUserTab, setInnerUserTab] = useState<
    "accounts" | "orders" | "kyc" | "payouts" | "notifications" | "emails"
  >("accounts");
  const [orderStatusFilter, setOrderStatusFilter] = useState<string>("All");
  const [orderSearchText, setOrderSearchText] = useState<string>("");
  const [inventorySizeFilter, setInventorySizeFilter] = useState<
    number | "All"
  >("All");
  const [inventoryPlatformFilter, setInventoryPlatformFilter] =
    useState<string>("All");
  const [inventorySearch, setInventorySearch] = useState("");
  const [couponSearch, setCouponSearch] = useState("");
  const [broadcastSearch, setBroadcastSearch] = useState("");
  const [broadcastChannelFilter, setBroadcastChannelFilter] = useState("all");
  const [showBroadcastForm, setShowBroadcastForm] = useState(false);
  const [auditSearch, setAuditSearch] = useState("");
  const [auditActionFilter, setAuditActionFilter] = useState("all");
  const [affiliateSearch, setAffiliateSearch] = useState("");
  const [affiliateView, setAffiliateView] = useState("sales");
  const [referralStatusFilter, setReferralStatusFilter] = useState("all");
  const [newsletterSearch, setNewsletterSearch] = useState("");
  const [newsletterFilter, setNewsletterFilter] = useState("all");
  const [payoutSearch, setPayoutSearch] = useState("");
  const [payoutStatusFilter, setPayoutStatusFilter] = useState("all");
  const [pricingSearch, setPricingSearch] = useState("");
  const [pricingModelFilter, setPricingModelFilter] = useState("all");
  const [showPricingForm, setShowPricingForm] = useState(false);
  const [offerSearch, setOfferSearch] = useState("");
  const [offerStateFilter, setOfferStateFilter] = useState("all");
  const [showOfferForm, setShowOfferForm] = useState(false);
  const [couponFilter, setCouponFilter] = useState("all");
  const [showCouponForm, setShowCouponForm] = useState(false);
  const [inventoryStatusFilter, setInventoryStatusFilter] =
    useState<string>("All");
  const [deliveryFilter, setDeliveryFilter] = useState<
    "pending" | "delivered" | "all"
  >("pending");

  const inventoryAccountSizes = [5000, 10000, 25000, 50000, 100000, 200000];
  const availableDeliveryPlans = plans.filter(
    (plan) =>
      plan.status === "available" &&
      !accounts.some(
        (account) =>
          account.deliveryStatus === "delivered" &&
          adminCredentialKey(account.platform, account.server, account.login) ===
            adminCredentialKey(plan.platform, plan.server, plan.login),
      ),
  );

  const orderStatusFilters = [
    { label: "All Orders", value: "All" },
    { label: "New Account Request", value: "New Account Request" },
    { label: "Active", value: "Active" },
    { label: "Unpaid / Abandoned", value: "Unpaid" },
    { label: "Passed", value: "Passed" },
    { label: "Phase2", value: "Step2 Active" },
    { label: "Failed", value: "Failed" },
    { label: "Live", value: "Live Active" },
  ];

  // Broadcast Form
  const [broadcastForm, setBroadcastForm] = useState({
    targetUserId: "all",
    title: "System Maintenance Alert",
    message:
      "Our trading network will undergo a scheduled gateway update on Sunday at 02:00 UTC. Trading feeds will remain operational.",
    type: "info" as "warning" | "success" | "info" | "error",
    channel: "in_app" as "email" | "in_app",
  });

  // Copied helper state
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // In-flight actions, keyed by what they touch (e.g. "kyc:<userId>"). Drives
  // every spinner in the CRM and stops a second click firing the same request.
  const [busy, setBusy] = useState<Record<string, boolean>>({});
  const busyRef = useRef<Record<string, boolean>>({});
  const isBusy = (key: string) => Boolean(busy[key]);
  const runBusy = async <T,>(key: string, task: () => Promise<T>) => {
    if (busyRef.current[key]) return undefined;
    busyRef.current[key] = true;
    setBusy((current) => ({ ...current, [key]: true }));
    try {
      return await task();
    } finally {
      delete busyRef.current[key];
      setBusy((current) => {
        const next = { ...current };
        delete next[key];
        return next;
      });
    }
  };

  // Load the CRM datasets once, on mount.
  //
  // This used to depend on `activeSubTab`, so every switch between desks
  // refetched all thirteen endpoints and flipped the panel back to its loading
  // state - the whole CRM reloaded to move between two tabs that were already
  // populated. Switching desks needs no new data: the state is already in
  // memory, and the eighteen mutation handlers each call `fetchCrmData()`
  // themselves, so anything the admin actually changes still refreshes.
  useEffect(() => {
    fetchCrmData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchCrmData = async () => {
    if (hasLoadedOnce.current) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    try {
      const [
        resUsers,
        resKyc,
        resOrders,
        resPlans,
        resAccounts,
        resPayouts,
        resAffiliates,
        resNotifs,
        resAudit,
        resCoupons,
        resOffers,
        resPricing,
        resEmailLogs,
        resNewsletter,
      ] = await Promise.all([
        fetch("/api/users").then((r) => r.json()),
        fetch("/api/kyc").then((r) => r.json()),
        fetch("/api/orders").then((r) => r.json()),
        fetch("/api/challenge-inventory").then((r) => r.json()),
        fetch("/api/accounts").then((r) => r.json()),
        fetch("/api/payouts").then((r) => r.json()),
        fetch("/api/affiliate").then((r) => r.json()),
        fetch("/api/notifications").then((r) => r.json()),
        fetch("/api/audit-logs").then((r) => r.json()),
        fetch("/api/coupons").then((r) => r.json()),
        fetch("/api/offers").then((r) => r.json()),
        fetch("/api/pricing-plans").then((r) => r.json()),
        fetch("/api/email-logs").then((r) => r.json()),
        fetch("/api/newsletter").then((r) => r.json()),
      ]);

      if (resUsers.success) setUsers(resUsers.users || []);
      if (resKyc.success) setKycList(resKyc.kyc || []);
      if (resOrders.success) setOrders(resOrders.orders || []);
      if (resPlans.success) setPlans(resPlans.plans || []);
      if (resAccounts.success) setAccounts(resAccounts.accounts || []);
      if (resPayouts.success) setPayouts(resPayouts.payouts || []);
      if (resAffiliates.success) {
        setAffiliates(resAffiliates.affiliates || []);
        setReferrals(resAffiliates.referrals || []);
      }
      if (resNotifs.success) setNotifLogs(resNotifs.notifications || []);
      if (resAudit.success) setAuditLogs(resAudit.logs || []);
      if (resCoupons.success) setCoupons(resCoupons.coupons || []);
      if (resOffers.success) setOffers(resOffers.offers || []);
      if (resPricing.success) setPricingPlans(resPricing.plans || []);
      if (resEmailLogs.success) setEmailLogs(resEmailLogs.emailLogs || []);
      if (resNewsletter.success) setNewsletterSubscribers(resNewsletter.subscribers || []);
    } catch (error) {
      console.error("Error loading CRM telemetry:", error);
    } finally {
      hasLoadedOnce.current = true;
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Admin "Refresh now" on the graph modal: skips the 30 min ShowMyTrades window
  // for this one account and swaps the fresh row into the modal + accounts list.
  const handleRefreshGraphNow = async (accountId: string) => {
    try {
      const res = await fetch("/api/accounts/refresh-stats", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ accountId }),
      });
      const data = await res.json();
      if (data.account) {
        setAccounts((current) => current.map((a) => (a.id === accountId ? data.account : a)));
        setGraphAccount((current: any) =>
          current && current.id === accountId ? { ...current, ...data.account } : current,
        );
      }
      if (data.success) adminToast.success("Graph refreshed from ShowMyTrades.");
      else adminToast.error(data.error || "Unable to refresh graph.");
    } catch {
      adminToast.error("Unable to refresh graph.");
    }
  };

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(label);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleImpersonateUser = (userId: string) => {
    return runBusy(`impersonate:${userId}`, async () => {
      try {
        const res = await fetch("/api/auth/crm/impersonate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId }),
        });
        const data = await res.json();
        if (res.ok && data.success) {
          adminToast.success(
            `Authentication successful. Redirecting to ${data.user.name}'s dashboard...`,
          );
          const pathSegments = window.location.pathname.split("/");
          const locale = pathSegments[1] || "en";
          window.location.href = `/${locale}/dashboard`;
        } else {
          adminToast.error(data.error || "Impersonation login failed.");
        }
      } catch (err) {
        console.error("Impersonation error:", err);
        adminToast.error("Error initiating user impersonation.");
      }
    });
  };

  // 1. Approve / Reject KYC via API
  const handleReviewKyc = (
    userId: string,
    status: "approved" | "rejected" | "needs_review",
    reason: string,
  ) => {
    return runBusy(`kyc:${userId}`, async () => {
      try {
        const res = await fetch("/api/kyc", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId, status, rejectReason: reason }),
        });
        const data = await res.json();
        if (res.ok && data.success) {
          adminToast.success(
            status === "approved" ? "KYC approved." : status === "rejected" ? "KYC rejected — trader asked to resubmit." : "KYC updated.",
          );
          setKycReview(null);
          fetchCrmData();
        } else {
          adminToast.error(data.error || "Error updating KYC status.");
        }
      } catch (err) {
        console.error("Error updating KYC status:", err);
        adminToast.error("Error updating KYC status.");
      }
    });
  };

  const handleSyncKyc = (userId: string) => {
    return runBusy(`kyc-sync:${userId}`, async () => {
      try {
        const res = await fetch("/api/kyc", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ method: "didit-sync", userId }),
        });
        const data = await res.json();
        if (res.ok && data.success) {
          adminToast.success(
            `Didit status synced successfully! Current Status: ${data.kyc.addressUrl}`,
          );
          if (kycReview && kycReview.userId === userId) {
            setKycReview((prev: any) => ({
              ...prev,
              ...data.kyc,
            }));
          }
          fetchCrmData();
        } else {
          adminToast.error(data.error || "Error syncing KYC status.");
        }
      } catch (err) {
        console.error("Error syncing KYC status:", err);
        adminToast.error("Error syncing KYC status.");
      }
    });
  };

  // 2. Mark Order Paid/Refunded via API
  const handleUpdateOrderStatus = (orderId: string, status: string) => {
    return runBusy(`order:${orderId}`, async () => {
      try {
        const res = await fetch("/api/orders", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ orderId, status }),
        });
        const data = await res.json();
        if (res.ok && data.success) {
          // Reflect the change straight away; the refetch then reconciles any
          // account-side effects the API applied alongside it.
          setOrders((current) =>
            current.map((order) => (order.id === orderId ? { ...order, status } : order)),
          );
          adminToast.success(`Order ${orderId} updated to ${status}.`);
          fetchCrmData();
          return true;
        }
        adminToast.error(data.error || "Could not update the order.");
      } catch (err) {
        console.error("Error updating order:", err);
        adminToast.error("Could not update the order. Check your connection and try again.");
      }
      return false;
    });
  };

  // Pin an order's account(s) to the legacy (pre-2026-09) rulebook, or move them
  // back to the current rules. Sent without a status so the API only flips the flag.
  const handleUpdateOrderRuleVersion = (orderId: string, legacyRules: boolean) => {
    return runBusy(`order-rules:${orderId}`, async () => {
      try {
        const res = await fetch("/api/orders", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ orderId, legacyRules }),
        });
        const data = await res.json();
        if (res.ok && data.success) {
          setEditingOrder((current: any) =>
            current && current.id === orderId ? { ...current, legacyRules } : current,
          );
          fetchCrmData();
        } else {
          adminToast.error(data.error || "Error updating rule version.");
        }
      } catch (err) {
        console.error("Error updating rule version:", err);
        adminToast.error("Error updating rule version.");
      }
    });
  };

  // 3. Create Challenge Inventory Account via API
  const handleCreatePlan = (e: React.FormEvent) => {
    e.preventDefault();
    return runBusy("plan-create", async () => {
      if (!Number.isFinite(Number(newPlan.size)) || Number(newPlan.size) <= 0) {
        adminToast.error("Enter a valid account size.");
        return;
      }
      try {
        const payload = {
          size: Number(newPlan.size),
          platform: newPlan.platform,
          login: newPlan.login,
          password: newPlan.password,
          server: newPlan.server,
          externalStatisticsId: newPlan.externalStatisticsId,
          graphLink: newPlan.graphLink.trim(),
        };

        const res = await fetch("/api/challenge-inventory", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const data = await res.json();
        if (res.ok && data.success) {
          adminToast.success("Inventory account added.");
          setCustomContainerSize(false);
          setNewPlan({
            platform: "MT5",
            login: "",
            password: "",
            server: "Range4ex-Demo",
            size: 100000,
            price: 499,
            name: "TWO STEP",
            externalStatisticsId: "",
            graphLink: "",
          });
          fetchCrmData();
        } else {
          adminToast.error(data.error || "Error creating plan.");
        }
      } catch (err) {
        console.error("Error creating plan:", err);
        adminToast.error("Error creating plan.");
      }
    });
  };

  // 4. Delete Challenge Plan via API
  const handleDeletePlan = (id: string) => {
    return runBusy(`plan-delete:${id}`, async () => {
      if (
        !(await adminConfirm({
          title: "Delete this container?",
          message: "The login will be removed from the inventory pool.",
          confirmLabel: "Delete",
          tone: "danger",
        }))
      )
        return;
      try {
        const res = await fetch(`/api/challenge-inventory?id=${id}`, {
          method: "DELETE",
        });
        const data = await res.json();
        if (res.ok && data.success) {
          adminToast.success("Inventory account deleted.");
          fetchCrmData();
        } else {
          adminToast.error(data.error || "Error deleting plan.");
        }
      } catch (err) {
        console.error("Error deleting plan:", err);
        adminToast.error("Error deleting plan.");
      }
    });
  };

  // 5. Deliver Account Credentials via API
  const handleDeliverAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    if (deliverySaving) return;
    const wasDelivered = deliveryForm.deliveryStatus === "delivered";
    setDeliverySaving(true);
    try {
      const payload = { ...deliveryForm };
      const res = await fetch("/api/accounts", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: payload.isNewAccount
            ? "next-" + Math.floor(100000 + Math.random() * 900000).toString()
            : payload.id,
          userId: payload.userId,
          orderId: payload.orderId,
          platform: payload.platform,
          login: payload.login,
          passwordMaster: payload.passwordMaster,
          passwordInvestor: payload.passwordInvestor || "GENERATED_INVEST_PASS",
          server: payload.server,
          profitTarget: payload.profitTarget,
          balance: payload.balance,
          equity: payload.equity || payload.balance,
          status: payload.status,
          phase: payload.phase,
          graphLink: payload.graphLink,
          externalStatisticsId:
            payload.externalStatisticsId || payload.statisticsApiId || "",
          inventoryItemId: payload.inventoryItemId || undefined,
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        adminToast.success(
          wasDelivered
            ? "Credentials updated."
            : "Account delivered. The trader has been notified.",
        );
        setDeliveryForm(null);
        fetchCrmData();
      } else {
        adminToast.error(data.error || "Error saving account credentials.");
      }
    } catch (err) {
      console.error("Error delivering account:", err);
      adminToast.error("Error saving account credentials.");
    } finally {
      setDeliverySaving(false);
    }
  };

  // Remove an account request / provisioned account attached to an order.
  const handleDeleteAccountRequest = async (account: any) => {
    const label = `#${account.login || account.id} (${account.phase || "Unknown stage"})`;
    if (
      !(await adminConfirm({
        title: `Delete account ${label}?`,
        message:
          "This removes the account request from the order and releases any inventory credentials it was holding. This cannot be undone.",
        confirmLabel: "Delete account",
        tone: "danger",
      }))
    )
      return;

    setDeletingAccountId(account.id);
    try {
      const res = await fetch(
        `/api/accounts?id=${encodeURIComponent(account.id)}`,
        { method: "DELETE" },
      );
      const data = await res.json();
      if (res.ok && data.success) {
        adminToast.success(`Account ${label} deleted.`);
        await fetchCrmData();
      } else {
        adminToast.error(data.error || "Error deleting account request.");
      }
    } catch (err) {
      console.error("Error deleting account request:", err);
      adminToast.error("Error deleting account request.");
    } finally {
      setDeletingAccountId(null);
    }
  };

  const handleDeleteOrder = async (order: any) => {
    const label = `${order.id}${order.userName ? ` — ${order.userName}` : ""}`;
    if (
      !(await adminConfirm({
        title: `Delete order ${label}?`,
        message:
          "This permanently removes the order and any trading accounts created from it, and releases the inventory credentials they were holding. This cannot be undone.",
        confirmLabel: "Delete order",
        tone: "danger",
      }))
    )
      return;

    setDeletingOrderId(order.id);
    try {
      const res = await fetch(
        `/api/orders?id=${encodeURIComponent(order.id)}`,
        { method: "DELETE" },
      );
      const data = await res.json();
      if (res.ok && data.success) {
        adminToast.success(
          `Order ${order.id} deleted.` +
            (data.removedAccounts
              ? ` ${data.removedAccounts} linked account(s) also removed.`
              : ""),
        );
        await fetchCrmData();
      } else {
        adminToast.error(data.error || "Error deleting order.");
      }
    } catch (err) {
      console.error("Error deleting order:", err);
      adminToast.error("Error deleting order.");
    } finally {
      setDeletingOrderId(null);
    }
  };

  // Fill the editor from a container. Balance/target follow the container size.
  const applyContainerToForm = (form: any, plan: any) => {
    const balance = Number(plan.size) || form.balance || 100000;
    return {
      ...form,
      inventoryItemId: plan.id,
      platform: plan.platform || "MT5",
      login: plan.login || "",
      passwordMaster: plan.password || "",
      server: plan.server || "",
      balance,
      equity: balance,
      profitTarget: Math.round(
        getStageProfitTarget(getPlanNameForAccount(form), form.phase, balance),
      ),
      graphLink: plan.graphLink || form.graphLink || "",
      externalStatisticsId:
        plan.externalStatisticsId || form.externalStatisticsId || "",
    };
  };

  // The API only accepts a container whose platform/server/login match, so
  // editing any of those turns the delivery into a manual one.
  const updateDeliveryCredential = (
    field: "platform" | "server" | "login",
    value: string,
  ) => {
    setDeliveryForm((prev: any) => {
      if (!prev) return prev;
      const next = { ...prev, [field]: value };
      if (prev.inventoryItemId && prev[field] !== value) next.inventoryItemId = "";
      return next;
    });
  };

  const generateTradingPassword = (prefix: string) => {
    const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789";
    const body = Array.from(
      { length: 7 },
      () => alphabet[Math.floor(Math.random() * alphabet.length)],
    ).join("");
    return `${prefix}${body}!`;
  };


  const openCredentialEditor = (
    account: any,
    mode: "deliver" | "edit" = "edit",
  ) => {
    const isPending =
      account.deliveryStatus !== "delivered" || mode === "deliver";

    setIsCustomManualBalance(false);
    setShowAllContainerSizes(false);
    setContainerSearch("");
    const baseForm: any = {
      id: account.id,
      isNewAccount: Boolean(account.isNewAccount),
      orderSize: Number(account.balance) || 0,
      inventoryItemId: "",
      userId: account.userId,
      orderId: account.orderId,
      platform: account.platform || "MT5",
      login: account.login || account.id,
      passwordMaster:
        account.passwordMaster === "GENERATED_MASTER_PASS"
          ? isPending
            ? "Mpass" + Math.floor(1000 + Math.random() * 9000)
            : ""
          : account.passwordMaster || "",
      passwordInvestor:
        account.passwordInvestor === "GENERATED_INVEST_PASS"
          ? isPending
            ? "Ipass" + Math.floor(1000 + Math.random() * 9000)
            : ""
          : account.passwordInvestor || "",
      server:
        account.server === "Range4ex-PendingServer"
          ? isPending
            ? "Range4ex-Live01"
            : ""
          : account.server || "",
      profitTarget: account.profitTarget,
      graphLink: account.graphLink || "",
      externalStatisticsId:
        account.externalStatisticsId || account.statisticsApiId || "",
      balance: account.balance,
      equity: account.equity || account.balance,
      status: account.status || "Active",
      phase: account.phase || "Phase 1 (Evaluation)",
      deliveryStatus: account.deliveryStatus || "pending",
      userName: account.userName,
      userEmail: account.userEmail,
      statisticsPayload: account.statisticsPayload,
      statisticsUpdatedAt: account.statisticsUpdatedAt,
      simulateObjectivePassed: false,
    };

    // Pending delivery: pre-select the first ready container of the ordered
    // size (same platform first) so delivery is usually a single click.
    if (isPending && account.deliveryStatus !== "delivered") {
      const match = availableDeliveryPlans
        .filter((plan) => Number(plan.size) === baseForm.orderSize)
        .sort(
          (a, b) =>
            Number(b.platform === baseForm.platform) -
            Number(a.platform === baseForm.platform),
        )[0];
      setDeliveryForm(match ? applyContainerToForm(baseForm, match) : baseForm);
      return;
    }
    setDeliveryForm(baseForm);
  };

  // Save User Edits via API
  const handleSaveUserEdit = (e: React.FormEvent) => {
    e.preventDefault();
    return runBusy("user-edit", async () => {
      try {
        const res = await fetch("/api/users", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId: selectedUser.id,
            ...userEditForm,
          }),
        });
        const data = await res.json();
        if (res.ok && data.success) {
          adminToast.success("User profile updated successfully.");
          setIsEditingUser(false);
          fetchCrmData();
          setSelectedUser(data.user);
        } else {
          adminToast.error(data.error || "Error updating user.");
        }
      } catch (err) {
        console.error("Error updating user:", err);
        adminToast.error("Error updating user.");
      }
    });
  };

  const makeTemporaryDashboardPassword = () => {
    const alphabet =
      "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789";
    const suffix = Array.from(
      { length: 8 },
      () => alphabet[Math.floor(Math.random() * alphabet.length)],
    ).join("");
    return `Dash-${suffix}!`;
  };

  const handleResetDashboardPassword = (user: any) => {
    return runBusy(`user-reset:${user.id}`, async () => {
      const newPassword = makeTemporaryDashboardPassword();
      try {
        const res = await fetch("/api/users", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId: user.id,
            newPassword,
          }),
        });
        const data = await res.json();
        if (res.ok && data.success) {
          setGeneratedDashboardPasswords((prev) => ({
            ...prev,
            [user.id]: newPassword,
          }));
          setTempPasswordUser(user);
          await fetchCrmData();
        } else {
          adminToast.error(data.error || "Error resetting dashboard password.");
        }
      } catch (err) {
        console.error("Error resetting dashboard password:", err);
        adminToast.error("Error resetting dashboard password.");
      }
    });
  };

  // Helper to trigger credential delivery from Orders desk
  const handleDeliverFromOrder = (o: any) => {
    if (isUnpaidOrder(o)) {
      adminToast.error("This order has not been paid. Account delivery is disabled until payment is confirmed.");
      return;
    }

    const orderAccs = accounts.filter((a) => a.orderId === o.id);
    let acc =
      orderAccs.find((a) => a.deliveryStatus === "pending") ||
      orderAccs[orderAccs.length - 1];
    if (!acc) {
      const tempId = Math.floor(100000 + Math.random() * 900000).toString();
      const planObj = pricingPlans.find((p) => p.id === o.planId);
      const planSize = planObj ? planObj.size : o.amountPaid * 200 || 100000;
      acc = {
        id: tempId,
        isNewAccount: true,
        userId: o.userId,
        orderId: o.id,
        platform: "MT5",
        login: tempId,
        passwordMaster: "Mpass" + Math.floor(1000 + Math.random() * 9000),
        server: "Range4ex-Live01",
        balance: planSize,
        status: "Active",
        phase: "Phase 1 (Evaluation)",
        deliveryStatus: "pending",
        profitTarget: Math.round(planSize * 0.1),
        graphLink: "",
        externalStatisticsId: "",
        userName: o.userName,
        userEmail: o.userEmail,
      };
    }
    openCredentialEditor(
      acc,
      acc.deliveryStatus === "delivered" ? "edit" : "deliver",
    );
  };

  const handleDeliverNextStage = (a: any) => {
    // One Step and Instant plans skip Phase 2 — Evaluation goes straight to Funded (Live).
    const planName = getPlanNameForAccount(a);
    const nextPhase = getNextStagePhase(planName, a.phase) || PHASE_FUNDED;
    const nextStatus = getStageAccountStatus(nextPhase);
    const profitTarget = Math.round(
      getStageProfitTarget(planName, nextPhase, a.balance),
    );

    setIsCustomManualBalance(false);
    setDeliveryForm({
      id: "next-" + Math.floor(100000 + Math.random() * 900000).toString(),
      userId: a.userId,
      orderId: a.orderId,
      platform: a.platform || "MT5",
      login: "",
      passwordMaster: "",
      passwordInvestor: "",
      server: "",
      profitTarget: profitTarget,
      balance: a.balance,
      equity: a.balance,
      status: nextStatus,
      phase: nextPhase,
      graphLink: "",
      externalStatisticsId: "",
      deliveryStatus: "pending",
      isNewAccount: true,
    });
  };

  // 6. Approve / Reject Payout via API
  const handleReviewPayout = (
    payoutId: string,
    status: "paid" | "rejected",
    notes: string,
  ) => {
    return runBusy(`payout:${payoutId}`, async () => {
      try {
        const res = await fetch("/api/payouts", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ payoutId, status, notes }),
        });
        const data = await res.json();
        if (res.ok && data.success) {
          adminToast.success(status === "paid" ? "Payout approved and marked paid." : "Payout rejected.");
          setPayoutReview(null);
          fetchCrmData();
        } else {
          adminToast.error(data.error || "Error updating payout status.");
        }
      } catch (err) {
        console.error("Error updating payout status:", err);
        adminToast.error("Error updating payout status.");
      }
    });
  };

  // 7. Adjust Affiliate Rate via API
  const handleUpdateAffiliateRate = (e: React.FormEvent) => {
    e.preventDefault();
    return runBusy("affiliate-rate", async () => {
      try {
        const res = await fetch("/api/affiliate", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "update_rate",
            affiliateUserId: affiliateRateForm.userId,
            commissionRate: affiliateRateForm.commissionRate,
          }),
        });
        const data = await res.json();
        if (res.ok && data.success) {
          adminToast.success("Affiliate commission rate updated.");
          setAffiliateRateForm(null);
          fetchCrmData();
        } else {
          adminToast.error(data.error || "Error adjusting affiliate rate.");
        }
      } catch (err) {
        console.error("Error adjusting affiliate rate:", err);
        adminToast.error("Error adjusting affiliate rate.");
      }
    });
  };

  // 8. Pay Referral Commission via API
  const handlePayReferral = (referredUserId: string, orderId: string) => {
    return runBusy(`referral:${orderId}`, async () => {
      try {
        const res = await fetch("/api/affiliate", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "update_referral",
            referredUserId,
            orderId,
            status: "paid",
          }),
        });
        const data = await res.json();
        if (res.ok && data.success) {
          adminToast.success("Affiliate referral commission marked as paid.");
          fetchCrmData();
        } else {
          adminToast.error(data.error || "Error completing referral payment.");
        }
      } catch (err) {
        console.error("Error paying referral commission:", err);
        adminToast.error("Error completing referral payment.");
      }
    });
  };

  // 9. Broadcast alerts via API
  const handleBroadcast = (e: React.FormEvent) => {
    e.preventDefault();
    return runBusy("broadcast", async () => {
      try {
        const res = await fetch("/api/notifications", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            targetUserId: broadcastForm.targetUserId,
            title: broadcastForm.title,
            message: broadcastForm.message,
            type: broadcastForm.type,
            channel: broadcastForm.channel,
          }),
        });
        const data = await res.json();
        if (res.ok && data.success) {
          adminToast.success(`Broadcast successful! Dispatched to receiver(s).`);
          setShowBroadcastForm(false);
          setBroadcastForm({
            ...broadcastForm,
            title: "System Alert",
            message: "",
          });
          fetchCrmData();
        } else {
          adminToast.error(data.error || "Error broadcasting notifications.");
        }
      } catch (err) {
        console.error("Error broadcasting:", err);
        adminToast.error("Error broadcasting notifications.");
      }
    });
  };

  // 10. Coupons management via API
  const handleCreateCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    return runBusy("coupon-create", async () => {
      try {
        const res = await fetch("/api/coupons", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            code: newCoupon.code,
            discountPercent: newCoupon.discountPercent,
            expiresAt: new Date(newCoupon.expiresAt).toISOString(),
            status: "active",
          }),
        });
        const data = await res.json();
        if (res.ok && data.success) {
          adminToast.success("Coupon code created successfully.");
          setShowCouponForm(false);
          setNewCoupon({
            code: "",
            discountPercent: 10,
            expiresAt: getDefaultCouponExpiryInput(),
          });
          fetchCrmData();
        } else {
          adminToast.error(data.error || "Error creating coupon.");
        }
      } catch (err) {
        console.error("Error creating coupon:", err);
        adminToast.error("Error creating coupon.");
      }
    });
  };

  const handleDeleteCoupon = (code: string) => {
    return runBusy(`coupon-delete:${code}`, async () => {
      if (
        !(await adminConfirm({
          title: `Delete coupon ${code}?`,
          confirmLabel: "Delete",
          tone: "danger",
        }))
      )
        return;
      try {
        const res = await fetch(`/api/coupons?code=${code}`, {
          method: "DELETE",
        });
        const data = await res.json();
        if (res.ok && data.success) {
          adminToast.success("Coupon retired successfully.");
          fetchCrmData();
        } else {
          adminToast.error(data.error || "Error deleting coupon.");
        }
      } catch (err) {
        console.error("Error deleting coupon:", err);
        adminToast.error("Error deleting coupon.");
      }
    });
  };

  // 10.5 Offers management (BOGO / free retry) via API
  const toggleOfferScopeValue = <T extends string | number>(
    field: "accountSizes" | "models" | "userIds" | "accountIds",
    value: T,
  ) => {
    setOfferForm((current) => {
      const list = current[field] as T[];
      const next = list.includes(value)
        ? list.filter((item) => item !== value)
        : [...list, value];
      return { ...current, [field]: next } as OfferFormState;
    });
  };

  const startNewOffer = () => {
    setOfferForm(createEmptyOfferForm());
    setOfferMessage("");
    setOfferError("");
  };

  /** Load an existing offer back into the builder so it can be edited in place. */
  const startEditOffer = (offer: any) => {
    setOfferForm({
      id: offer.id,
      name: offer.name || "",
      type: offer.type === "free_retry" ? "free_retry" : "bogo",
      description: offer.description || "",
      status: offer.status === "paused" ? "paused" : "active",
      startsAt: toDateTimeLocalInput(offer.startsAt),
      expiresAt: toDateTimeLocalInput(offer.expiresAt),
      accountSizes: (offer.accountSizes || []).map(Number),
      models: offer.models || [],
      userIds: offer.userIds || [],
      accountIds: offer.accountIds || [],
      buyQuantity: Number(offer.buyQuantity) || 1,
      freeQuantity: Number(offer.freeQuantity) || 1,
      retryLimit: Number(offer.retryLimit) || 1,
      maxRedemptions: Number(offer.maxRedemptions) || 0,
    });
    setOfferMessage("");
    setOfferError("");
    setShowOfferForm(true);
  };

  const openNewOffer = () => {
    startNewOffer();
    setShowOfferForm(true);
  };

  const handleSaveOffer = async (e: React.FormEvent) => {
    e.preventDefault();
    setOfferMessage("");
    setOfferError("");

    if (!offerForm.name.trim()) {
      setOfferError("Give the offer a name so it can be recognised in the ledger.");
      return;
    }

    setSavingOffer(true);
    try {
      const res = await fetch("/api/offers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...(offerForm.id ? { id: offerForm.id } : {}),
          name: offerForm.name.trim(),
          type: offerForm.type,
          description: offerForm.description.trim(),
          status: offerForm.status,
          startsAt: offerForm.startsAt
            ? new Date(offerForm.startsAt).toISOString()
            : "",
          expiresAt: offerForm.expiresAt
            ? new Date(offerForm.expiresAt).toISOString()
            : "",
          accountSizes: offerForm.accountSizes,
          models: offerForm.models,
          userIds: offerForm.userIds,
          accountIds: offerForm.accountIds,
          buyQuantity: offerForm.buyQuantity,
          freeQuantity: offerForm.freeQuantity,
          retryLimit: offerForm.retryLimit,
          maxRedemptions: offerForm.maxRedemptions,
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setOfferMessage(
          offerForm.id
            ? `Offer "${data.offer.name}" updated.`
            : `Offer "${data.offer.name}" created.`,
        );
        startNewOffer();
        setShowOfferForm(false);
        fetchCrmData();
      } else {
        setOfferError(data.error || "Error saving offer.");
      }
    } catch (err) {
      console.error("Error saving offer:", err);
      setOfferError("Error saving offer.");
    } finally {
      setSavingOffer(false);
    }
  };

  const handleToggleOfferStatus = (offer: any) => {
    return runBusy(`offer:${offer.id}`, async () => {
      const nextStatus = offer.status === "paused" ? "active" : "paused";
      setOfferMessage("");
      setOfferError("");
      try {
        const res = await fetch("/api/offers", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: offer.id, status: nextStatus }),
        });
        const data = await res.json();
        if (res.ok && data.success) {
          setOfferMessage(
            `Offer "${offer.name}" ${nextStatus === "paused" ? "paused" : "resumed"}.`,
          );
          fetchCrmData();
        } else {
          setOfferError(data.error || "Error updating offer.");
        }
      } catch (err) {
        console.error("Error updating offer:", err);
        setOfferError("Error updating offer.");
      }
    });
  };

  /** Pull a scheduled offer's start forward to now so it goes live immediately. */
  const handleGoLiveNow = (offer: any) => {
    return runBusy(`offer:${offer.id}`, async () => {
      setOfferMessage("");
      setOfferError("");
      try {
        const res = await fetch("/api/offers", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...offer,
            status: "active",
            startsAt: new Date().toISOString(),
          }),
        });
        const data = await res.json();
        if (res.ok && data.success) {
          setOfferMessage(`Offer "${offer.name}" is live now.`);
          fetchCrmData();
        } else {
          setOfferError(data.error || "Error updating offer.");
        }
      } catch (err) {
        console.error("Error updating offer:", err);
        setOfferError("Error updating offer.");
      }
    });
  };

  const handleDeleteOffer = (offer: any) => {
    return runBusy(`offer:${offer.id}`, async () => {
      if (
        !(await adminConfirm({
          title: `Delete the offer "${offer.name}"?`,
          confirmLabel: "Delete",
          tone: "danger",
        }))
      )
        return;
      setOfferMessage("");
      setOfferError("");
      try {
        const res = await fetch(`/api/offers?id=${encodeURIComponent(offer.id)}`, {
          method: "DELETE",
        });
        const data = await res.json();
        if (res.ok && data.success) {
          if (offerForm.id === offer.id) startNewOffer();
          setOfferMessage("Offer deleted.");
          fetchCrmData();
        } else {
          setOfferError(data.error || "Error deleting offer.");
        }
      } catch (err) {
        console.error("Error deleting offer:", err);
        setOfferError("Error deleting offer.");
      }
    });
  };

  const handleCreatePricingPlan = (e: React.FormEvent) => {
    e.preventDefault();
    return runBusy("pricing-create", async () => {
      try {
        const res = await fetch("/api/pricing-plans", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(newPricingPlan),
        });
        const data = await res.json();
        if (res.ok && data.success) {
          const createdPlan = data.plan;
          setPricingPlans((currentPlans) =>
            [createdPlan, ...currentPlans.filter((plan) => plan.id !== createdPlan.id)].sort(
              (a, b) =>
                String(a.model).localeCompare(String(b.model)) ||
                Number(a.size) - Number(b.size),
            ),
          );
          setPricingCatalogMessage(
            `${createdPlan.model} $${Number(createdPlan.size).toLocaleString()} added successfully.`,
          );
          setNewPricingPlan({
            model: "Two Step",
            size: 100000,
            price: 449,
          });
          setCustomPricingSize(false);
          setShowPricingForm(false);
        } else {
          adminToast.error(data.error || "Error creating pricing plan.");
        }
      } catch (err) {
        console.error("Error creating pricing plan:", err);
        adminToast.error("Error creating pricing plan.");
      }
    });
  };

  const startEditingPricingPlan = (plan: any) => {
    setPricingCatalogMessage("");
    setEditingPricingPlanId(plan.id);
    setEditingPricingPlanPrice(String(plan.price ?? ""));
  };

  const cancelEditingPricingPlan = () => {
    setEditingPricingPlanId(null);
    setEditingPricingPlanPrice("");
  };

  // The POST route upserts on a model+size derived id, so re-publishing the
  // same plan with a new price is the update path - no extra endpoint needed.
  const handleUpdatePricingPlanPrice = async (plan: any) => {
    const price = Number(editingPricingPlanPrice);
    if (!editingPricingPlanPrice.trim() || Number.isNaN(price) || price < 0) {
      adminToast.error("Enter a valid price.");
      return;
    }
    if (price === Number(plan.price)) {
      cancelEditingPricingPlan();
      return;
    }

    setSavingPricingPlanId(plan.id);
    try {
      const res = await fetch("/api/pricing-plans", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: getChallengeRule(plan.model).buyLabel,
          size: Number(plan.size),
          price,
          status: plan.status || "active",
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        const updatedPlan = data.plan;
        setPricingPlans((currentPlans) =>
          currentPlans.map((p) => (p.id === updatedPlan.id ? updatedPlan : p)),
        );
        setPricingCatalogMessage(
          `${updatedPlan.model} $${Number(updatedPlan.size).toLocaleString()} price updated to $${Number(updatedPlan.price).toLocaleString()}.`,
        );
        cancelEditingPricingPlan();
      } else {
        adminToast.error(data.error || "Error updating pricing plan.");
      }
    } catch (err) {
      console.error("Error updating pricing plan:", err);
      adminToast.error("Error updating pricing plan.");
    } finally {
      setSavingPricingPlanId(null);
    }
  };

  const handleDeletePricingPlan = (id: string) => {
    return runBusy(`pricing-delete:${id}`, async () => {
      if (
        !(await adminConfirm({
          title: "Delete this price?",
          message: "The size will disappear from the buy page.",
          confirmLabel: "Delete",
          tone: "danger",
        }))
      )
        return;
      try {
        const res = await fetch(`/api/pricing-plans?id=${id}`, {
          method: "DELETE",
        });
        const data = await res.json();
        if (res.ok && data.success) {
          setPricingPlans((currentPlans) =>
            currentPlans.filter((plan) => plan.id !== id),
          );
          if (editingPricingPlanId === id) cancelEditingPricingPlan();
          setPricingCatalogMessage("Pricing configuration retired successfully.");
        } else {
          adminToast.error(data.error || "Error deleting pricing plan.");
        }
      } catch (err) {
        console.error("Error deleting pricing plan:", err);
        adminToast.error("Error deleting pricing plan.");
      }
    });
  };

  const openUserProfile = (u: any) => {
    setSelectedUser(u);
    setIsEditingUser(false);
    setInnerUserTab("accounts");
    setUserEditForm({
      name: u.name,
      email: u.email,
      phone: u.phone || "",
      country: u.country || "",
      role: u.role || "trader",
      status: u.status || "active",
      referredBy: u.referredBy || "",
    });
  };

  // Filtered Users
  const userRoleFilters = [
    { label: "All users", value: "all" },
    { label: "Traders", value: "trader" },
    { label: "Affiliates", value: "affiliate" },
    { label: "Staff", value: "staff" },
    { label: "KYC approved", value: "kyc-approved" },
    { label: "No KYC", value: "kyc-none" },
  ];
  const matchesUserRole = (u: any, filterValue: string) => {
    const role = String(u?.role || "trader");
    if (filterValue === "all") return true;
    if (filterValue === "staff") return ["admin", "support", "collaborator"].includes(role);
    if (filterValue === "kyc-approved")
      return kycList.some((k) => k.userId === u.id && k.status === "approved");
    if (filterValue === "kyc-none") return !kycList.some((k) => k.userId === u.id);
    return role === filterValue;
  };
  const searchedUsers = users.filter((u) => {
    const search = (userSearch || "").toLowerCase();
    if (!search) return true;
    return [u?.name, u?.email, u?.id, u?.phone].some((v) =>
      String(v || "").toLowerCase().includes(search),
    );
  });
  const filteredUsers = searchedUsers
    .filter((u) => matchesUserRole(u, userRoleFilter))
    .sort(
      (a, b) =>
        new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime(),
    );

  const formatOrderDateTime = (value?: string) => {
    if (!value) return "Not recorded";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "Not recorded";
    return date.toLocaleString([], {
      year: "numeric",
      month: "short",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Plan model name ("One Step" / "Two Step" / "Instant") drives which stages an order runs through.
  const getPlanNameForOrder = (order: any) => String(order?.planName || "");

  /**
   * The orders API joins the plan as a single `"<name> $<size>K"` string. The
   * table shows the two halves in separate columns, so split them back apart —
   * and prefer the linked trading account's real size when one exists.
   */
  const getOrderPlanParts = (order: any, linkedAccount?: any) => {
    const planName = getPlanNameForOrder(order);
    const match = planName.match(/^(.*?)\s*\$([\d.,]+)K$/i);
    const challenge = (match ? match[1] : planName).trim() || "Unknown plan";
    const parsedSize = match
      ? Number(String(match[2]).replace(/,/g, "")) * 1000
      : NaN;
    const size = Number(linkedAccount?.size) || (Number.isFinite(parsedSize) ? parsedSize : 0);
    return { challenge, size };
  };

  const getPlanNameForAccount = (account: any) =>
    String(
      account?.accountType ||
        orders.find((o: any) => o.id === account?.orderId)?.planName ||
        "",
    );

  const isArchivedOrder = (order: any) => {
    const status = String(order.status || "").toLowerCase();
    const gatewayRef = String(order.gatewayRef || "").toLowerCase();
    const hasCheckoutGateway =
      gatewayRef.startsWith("stripe:") || gatewayRef.startsWith("paddle:") || gatewayRef.startsWith("nowpayments:") || gatewayRef.startsWith("manual:");
    const hasAssignedAccount = accounts.some(
      (account: any) => account.orderId === order.id,
    );
    return status === "pending" && !hasCheckoutGateway && !hasAssignedAccount;
  };

  const isUnpaidOrder = (order: any) => {
    const normalizedStatus = String(order.status || "").toLowerCase();
    const hasAssignedAccount = accounts.some(
      (account: any) => account.orderId === order.id,
    );

    if (hasAssignedAccount) return false;

    // "failed" here (with no assigned account, guaranteed by the early return
    // above) only ever means a payment/fulfillment failure — a genuine
    // trading-challenge "Failed" always has an account attached.
    return [
      "pending",
      "failed",
      "payment failed",
      "unpaid",
      "cancelled",
      "canceled",
      "expired",
      "archived",
    ].includes(normalizedStatus) || isArchivedOrder(order);
  };
  const getNewAccountRequestsForOrder = (order: any) => {
    return accounts.filter((account: any) => {
      const phase = String(account.phase || "");
      return (
        account.orderId === order.id &&
        account.deliveryStatus === "pending" &&
        ["Phase 2 (Verification)", "Funded (Live)"].includes(phase)
      );
    });
  };

  const isNewAccountRequestOrder = (order: any) =>
    getNewAccountRequestsForOrder(order).length > 0;

  const unpaidOrdersCount = orders.filter(isUnpaidOrder).length;

  const matchesOrderSearch = (o: any) => {
    const search = (orderSearchText || "").toLowerCase();
    if (!search) return true;
    const orderAccountsForSearch = accounts.filter(
      (account: any) => account.orderId === o.id,
    );
    return (
      (o.userName || "").toLowerCase().includes(search) ||
      (o.userEmail || "").toLowerCase().includes(search) ||
      (o.id || "").toLowerCase().includes(search) ||
      orderAccountsForSearch.some(
        (account: any) =>
          (account.login || "").toLowerCase().includes(search) ||
          (account.server || "").toLowerCase().includes(search) ||
          (account.platform || "").toLowerCase().includes(search),
      )
    );
  };

  // Delivered accounts on this order that are currently trading (any phase).
  const getActiveAccountsForOrder = (order: any) =>
    accounts.filter(
      (account: any) =>
        account.orderId === order.id &&
        account.deliveryStatus === "delivered" &&
        String(account.status || "Active") === "Active",
    );

  const matchesOrderStatus = (o: any, filterValue: string) =>
    filterValue === "All"
      ? !isUnpaidOrder(o)
      : filterValue === "Unpaid"
        ? isUnpaidOrder(o)
        : filterValue === "New Account Request"
          ? isNewAccountRequestOrder(o)
          : filterValue === "Active"
            ? !isUnpaidOrder(o) &&
              (o.status === "Active" || getActiveAccountsForOrder(o).length > 0)
            : filterValue === "Failed"
              ? o.status === "Failed" &&
                accounts.some((account: any) => account.orderId === o.id)
              : o.status === filterValue;

  // Counts shown on the filter pills — scoped to the current search so the
  // numbers always describe the rows the admin would actually land on.
  const searchedOrders = orders.filter(matchesOrderSearch);
  const orderFilterCounts = orderStatusFilters.reduce<Record<string, number>>(
    (acc, filter) => {
      acc[filter.value] = searchedOrders.filter((o) =>
        matchesOrderStatus(o, filter.value),
      ).length;
      return acc;
    },
    {},
  );

  const showOrderCredentials = orderStatusFilter === "Active";

  const filteredOrders = searchedOrders
    .filter((o) => matchesOrderStatus(o, orderStatusFilter))
    .sort((a, b) => {
      const newestA = new Date(a.createdAt || a.updatedAt || 0).getTime();
      const newestB = new Date(b.createdAt || b.updatedAt || 0).getTime();
      return newestB - newestA;
    });

  const getOrderDisplay = (order: any) => {
    const user = users.find((item) => item.id === order.userId);
    const orderAccounts = accounts.filter(
      (account) => account.orderId === order.id,
    );
    const linkedAccount = orderAccounts[0];
    const archived = isArchivedOrder(order);
    const newAccountRequests = getNewAccountRequestsForOrder(order);
    const hasNewAccountRequest = newAccountRequests.length > 0;
    const normalizedStatus = String(order.status || "").toLowerCase();
    const deliveredCount = orderAccounts.filter(
      (account) => account.deliveryStatus === "delivered",
    ).length;
    const pendingDeliveryCount = orderAccounts.length - deliveredCount;

    const paymentState = archived
      ? "unpaid"
      : orderAccounts.length > 0
        ? "paid"
        : normalizedStatus === "payment failed" || normalizedStatus === "failed"
          ? "failed"
          : normalizedStatus === "pending"
            ? "pending"
            : "paid";
    const payment =
      paymentState === "paid"
        ? {
            label: "Paid",
            className:
              "border-emerald-500/30 bg-emerald-500/10 text-emerald-300",
          }
        : paymentState === "failed"
          ? {
              label: "Payment failed",
              className: "border-red-500/30 bg-red-500/10 text-red-300",
            }
          : paymentState === "unpaid"
            ? {
                label: "Unpaid",
                className:
                  "border-neutral-600 bg-neutral-800/80 text-neutral-300",
              }
            : {
                label: "Payment pending",
                className:
                  "border-amber-500/30 bg-amber-500/10 text-amber-300",
              };

    const deliveryState =
      orderAccounts.length === 0
        ? "unassigned"
        : pendingDeliveryCount === 0
          ? "delivered"
          : deliveredCount > 0
            ? "partial"
            : hasNewAccountRequest
              ? "requested"
              : "pending";
    const delivery =
      deliveryState === "delivered"
        ? {
            label: "Delivered",
            className:
              "border-emerald-500/30 bg-emerald-500/10 text-emerald-300",
          }
        : deliveryState === "partial"
          ? {
              label: "Partially delivered",
              className: "border-blue-500/30 bg-blue-500/10 text-blue-300",
            }
          : deliveryState === "requested"
            ? {
                label: "New account requested",
                className: "border-cyan-500/30 bg-cyan-500/10 text-cyan-300",
              }
            : deliveryState === "pending"
              ? {
                  label: "Delivery pending",
                  className:
                    "border-amber-500/30 bg-amber-500/10 text-amber-300",
                }
              : {
                  label: "Not assigned",
                  className:
                    "border-neutral-700 bg-neutral-900 text-neutral-400",
                };

    // order.status can lag behind the account's real state (e.g. a legacy "Paid"
    // value left over from checkout), so once an account is attached, show its
    // actual status (Active/Passed/Failed/Funded) — the same value the "Linked
    // trading accounts" panel shows — instead of the order's own status field.
    const latestAccount =
      orderAccounts.length > 0
        ? orderAccounts.reduce((prev, current) =>
            new Date(prev.createdAt || 0) > new Date(current.createdAt || 0) ? prev : current,
          )
        : undefined;
    // With zero accounts attached, "Failed" can only mean the payment/checkout
    // never went through (a real trading-challenge Failed always has an
    // account) — label it as such instead of the ambiguous bare "Failed".
    const preAccountStatusBadgeMap: Record<string, { label: string; className: string }> = {
      Pending: {
        label: "Pending",
        className: "border-neutral-600 bg-neutral-800/80 text-neutral-300",
      },
      Paid: {
        label: "Paid",
        className: "border-teal-500/30 bg-teal-500/10 text-teal-300",
      },
      Failed: {
        label: "Payment Failed",
        className: "border-red-500/30 bg-red-500/10 text-red-300",
      },
      "Payment Failed": {
        label: "Payment Failed",
        className: "border-red-500/30 bg-red-500/10 text-red-300",
      },
    };
    const status = latestAccount
      ? {
          label: latestAccount.status || "Unknown",
          className: getAccountStatusBadgeClass(latestAccount.status),
        }
      : preAccountStatusBadgeMap[String(order.status || "")] || {
          label: order.status || "Unknown",
          className: "border-neutral-700 bg-neutral-900 text-neutral-400",
        };

    const gatewayRef = String(order.gatewayRef || "");
    const paymentProvider = gatewayRef.startsWith("stripe:")
      ? "Stripe"
      : gatewayRef.startsWith("paddle:")
        ? "Paddle"
        : gatewayRef.startsWith("nowpayments:")
          ? "NOWPayments"
        : gatewayRef.startsWith("manual:")
          ? `Direct wallet (${getManualWallet(parseManualGatewayRef(gatewayRef)?.walletId)?.label || parseManualGatewayRef(gatewayRef)?.walletId})`
        : order.paymentMethod || "Not selected";

    return {
      user,
      orderAccounts,
      linkedAccount,
      archived,
      hasNewAccountRequest,
      deliveredCount,
      payment,
      paymentState,
      delivery,
      status,
      gatewayRef,
      paymentProvider,
    };
  };
  const getInventoryAccountStatus = (plan: any) => {
    const assignedAccount = accounts.find(
      (a: any) => String(a.login) === String(plan.login),
    );
    return plan.status || (assignedAccount ? "delivered" : "available");
  };

  const getAvailableInventoryCountBySize = (size: number) =>
    plans.filter(
      (plan) =>
        Number(plan.size) === size &&
        getInventoryAccountStatus(plan) === "available",
    ).length;

  // Container sizes: standard ladder + every catalog product size + any size
  // already sitting in the pool, so custom sizes show up in filters too.
  const containerSizeOptions = Array.from(
    new Set<number>([
      ...inventoryAccountSizes,
      ...pricingPlans.map((plan: any) => Number(plan.size)),
      ...plans.map((plan: any) => Number(plan.size)),
    ]),
  )
    .filter((size) => Number.isFinite(size) && size > 0)
    .sort((a, b) => a - b);

  const availableInventoryCount = plans.filter(
    (plan) => getInventoryAccountStatus(plan) === "available",
  ).length;
  const usedInventoryCount = plans.length - availableInventoryCount;
  const availableInventoryByPlatform = (platform: string) =>
    plans.filter(
      (plan) =>
        plan.platform === platform &&
        getInventoryAccountStatus(plan) === "available",
    ).length;

  const filteredInventoryPlans = plans.filter((plan) => {
    const matchesSize =
      inventorySizeFilter === "All" ||
      Number(plan.size) === inventorySizeFilter;
    const matchesPlatform =
      inventoryPlatformFilter === "All" ||
      plan.platform === inventoryPlatformFilter;
    const matchesStatus =
      inventoryStatusFilter === "All" ||
      getInventoryAccountStatus(plan) === inventoryStatusFilter;
    return matchesSize && matchesPlatform && matchesStatus;
  });

  // Derive telemetry summary
  const registeredTraders = users.filter(
    (user) => String(user.role || "trader").toLowerCase() === "trader",
  );
  const totalTraders = registeredTraders.length;
  const activeTradersCount = registeredTraders.filter(
    (user) => String(user.status || "active").toLowerCase() === "active",
  ).length;
  const pendingKycCount = kycList.filter((k) => k.status === "pending").length;
  const approvedKycCount = kycList.filter(
    (k) => k.status === "approved",
  ).length;
  const rejectedKycCount = kycList.filter(
    (k) => k.status === "rejected",
  ).length;
  const needsReviewKycCount = kycList.filter(
    (k) => k.status === "needs_review",
  ).length;
  const sortedKycList = [...kycList].sort((a, b) => {
    const rank: Record<string, number> = {
      pending: 0,
      needs_review: 1,
      rejected: 2,
      approved: 3,
    };
    const statusDelta = (rank[a.status] ?? 4) - (rank[b.status] ?? 4);
    if (statusDelta !== 0) return statusDelta;
    return (
      new Date(b.updatedAt || 0).getTime() -
      new Date(a.updatedAt || 0).getTime()
    );
  });

  const totalAccountsCount = accounts.length;
  const deliveredAccountsCount = accounts.filter(
    (a) => a.deliveryStatus === "delivered",
  ).length;
  const pendingDeliveryCount = accounts.filter(
    (a) => a.deliveryStatus === "pending",
  ).length;

  const accountOrderIds = new Set(accounts.map((account) => account.orderId));
  const paidOrderStatuses = new Set([
    "paid",
    "active",
    "passed",
    "step2 active",
    "live active",
  ]);
  const paidOrders = orders.filter(
    (order) =>
      accountOrderIds.has(order.id) ||
      paidOrderStatuses.has(String(order.status || "").toLowerCase()),
  );
  const totalRevenue = paidOrders.reduce(
    (sum, order) => sum + Number(order.amountPaid || 0),
    0,
  );

  /* Earnings breakdown shown on the orders desk. Only paid orders count, and
     each one is bucketed by its local calendar day so "today" matches what the
     admin sees on their own clock rather than UTC. */
  const dayKey = (value?: string) => {
    const date = new Date(value || 0);
    if (Number.isNaN(date.getTime())) return "";
    return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
  };
  const now = new Date();
  const todayKey = dayKey(now.toISOString());
  const yesterdayKey = dayKey(
    new Date(now.getTime() - 86_400_000).toISOString(),
  );

  const earningsByDay = new Map<string, { total: number; orders: number }>();
  paidOrders.forEach((order) => {
    const key = dayKey(order.createdAt || order.updatedAt);
    if (!key) return;
    const bucket = earningsByDay.get(key) || { total: 0, orders: 0 };
    bucket.total += Number(order.amountPaid || 0);
    bucket.orders += 1;
    earningsByDay.set(key, bucket);
  });

  const emptyBucket = { total: 0, orders: 0 };
  const todayEarnings = earningsByDay.get(todayKey) || emptyBucket;
  const yesterdayEarnings = earningsByDay.get(yesterdayKey) || emptyBucket;
  const peakDayEarnings = [...earningsByDay.values()].reduce(
    (best, bucket) => (bucket.total > best.total ? bucket : best),
    emptyBucket,
  );
  const monthEarnings = paidOrders.reduce(
    (acc, order) => {
      const date = new Date(order.createdAt || order.updatedAt || 0);
      if (
        Number.isNaN(date.getTime()) ||
        date.getFullYear() !== now.getFullYear() ||
        date.getMonth() !== now.getMonth()
      ) {
        return acc;
      }
      return { total: acc.total + Number(order.amountPaid || 0), orders: acc.orders + 1 };
    },
    { total: 0, orders: 0 },
  );

  const formatMoney = (value: number) =>
    `$${value.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  const pluralOrders = (count: number) =>
    `from ${count} order${count === 1 ? "" : "s"}`;

  // Conversion calculations
  const usersWithOrders = new Set(orders.map((o) => o.userId)).size;
  const orderCreatePercent =
    totalTraders > 0 ? Math.round((usersWithOrders / totalTraders) * 100) : 0;

  const payingUsersCount = new Set(paidOrders.map((o) => o.userId)).size;

  const paidOrdersCount = paidOrders.length;
  const orderPaidPercent =
    orders.length > 0 ? Math.round((paidOrdersCount / orders.length) * 100) : 0;

  // Withdrawals / Payouts totals
  const totalPayoutsPaid = payouts
    .filter((p) =>
      ["paid", "Approved", "Approved & Paid", "Approved & paid"].includes(
        p.status,
      ),
    )
    .reduce((sum, p) => sum + (p.amount || 0), 0);
  const totalPayoutsPending = payouts
    .filter((p) => ["pending", "Pending"].includes(p.status))
    .reduce((sum, p) => sum + (p.amount || 0), 0);

  const DAY_MS = 86_400_000;
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);

  /* ---------------------------------------------------------------- *
   * Signup & order velocity
   *
   * The old registration chart plotted a running total, so it could only
   * ever slope upward and said nothing about a slow week. These series are
   * new-per-day instead, which is the number an operator actually acts on.
   * ---------------------------------------------------------------- */
  const todayStart = startOfToday.getTime();
  const createdBetween = (items: any[], from: number, to: number) =>
    items.filter((item) => {
      const created = new Date(item.createdAt || 0).getTime();
      return Number.isFinite(created) && created >= from && created < to;
    }).length;

  const dailySeries = (items: any[], days: number) =>
    Array.from({ length: days }, (_, index) => {
      const from = todayStart - (days - 1 - index) * DAY_MS;
      return {
        label: new Date(from).toLocaleDateString([], {
          month: "short",
          day: "numeric",
        }),
        value: createdBetween(items, from, from + DAY_MS),
      };
    });

  const trendWindowDays = 14;
  const signupSeries = dailySeries(registeredTraders, trendWindowDays);
  const orderSeries = dailySeries(orders, trendWindowDays);

  const weekStart = todayStart - 6 * DAY_MS;
  const prevWeekStart = weekStart - 7 * DAY_MS;

  const todayUsersCount = createdBetween(
    registeredTraders,
    todayStart,
    todayStart + DAY_MS,
  );
  const weekUsersCount = createdBetween(
    registeredTraders,
    weekStart,
    todayStart + DAY_MS,
  );
  const prevWeekUsersCount = createdBetween(
    registeredTraders,
    prevWeekStart,
    weekStart,
  );
  const todayOrdersCount = createdBetween(
    orders,
    todayStart,
    todayStart + DAY_MS,
  );
  const weekOrdersCount = createdBetween(orders, weekStart, todayStart + DAY_MS);
  const prevWeekOrdersCount = createdBetween(orders, prevWeekStart, weekStart);

  /** Week-over-week change. Null when there is no prior week to compare against. */
  const weekOverWeek = (current: number, previous: number) => {
    if (previous <= 0) return null;
    return Math.round(((current - previous) / previous) * 100);
  };
  const usersWoW = weekOverWeek(weekUsersCount, prevWeekUsersCount);
  const ordersWoW = weekOverWeek(weekOrdersCount, prevWeekOrdersCount);

  /**
   * Turns a daily series into SVG paths on a 0-100 viewBox. Charts are drawn
   * against `max`, never a floating baseline, so a flat week reads as flat.
   */
  const buildTrend = (series: { label: string; value: number }[]) => {
    // Round the top of the scale up to an even number so the midpoint tick is
    // exact rather than a rounded half.
    const peak = Math.max(1, ...series.map((point) => point.value));
    const max = peak % 2 === 0 ? peak : peak + 1;
    const points = series.map((point, index) => ({
      ...point,
      x: series.length === 1 ? 0 : (index / (series.length - 1)) * 100,
      y: 94 - (point.value / max) * 84,
    }));
    const line = points
      .map(
        (point, index) =>
          `${index === 0 ? "M" : "L"} ${point.x.toFixed(2)} ${point.y.toFixed(2)}`,
      )
      .join(" ");
    return {
      max,
      points,
      line,
      area: `${line} L 100 100 L 0 100 Z`,
      total: series.reduce((sum, point) => sum + point.value, 0),
    };
  };
  const signupTrend = buildTrend(signupSeries);
  const orderTrend = buildTrend(orderSeries);

  const percentage = (value: number, total: number) =>
    total > 0 ? Math.round((value / total) * 100) : 0;

  const payingUsersPercent = percentage(payingUsersCount, totalTraders);

  const deliveredAccountsPercent = percentage(
    deliveredAccountsCount,
    totalAccountsCount,
  );
  const pendingDeliveryPercent = percentage(
    pendingDeliveryCount,
    totalAccountsCount,
  );

  const kycChartMax = Math.max(
    approvedKycCount,
    pendingKycCount,
    rejectedKycCount,
    needsReviewKycCount,
  );

  const revenueChartMax = Math.max(
    totalRevenue,
    totalPayoutsPaid,
    totalPayoutsPending,
  );

  const phase1Accounts = accounts.filter(
    (account) => account.phase === "Phase 1 (Evaluation)",
  );
  const phase2Accounts = accounts.filter(
    (account) => account.phase === "Phase 2 (Verification)",
  );
  const phase2OrderIds = new Set(
    phase2Accounts.map((account) => account.orderId),
  );
  const fundedOrderIds = new Set(
    accounts
      .filter(
        (account) =>
          account.phase === "Funded (Live)" || account.status === "Funded",
      )
      .map((account) => account.orderId),
  );
  const phase1PassedCount = phase1Accounts.filter(
    (account) =>
      account.status === "Passed" || phase2OrderIds.has(account.orderId),
  ).length;
  const phase2PassedCount = phase2Accounts.filter(
    (account) =>
      account.status === "Passed" || fundedOrderIds.has(account.orderId),
  ).length;
  const phase1PassPercent = percentage(
    phase1PassedCount,
    phase1Accounts.length,
  );
  const phase2PassPercent = percentage(
    phase2PassedCount,
    phase2Accounts.length,
  );
  const fundedPercent = percentage(fundedOrderIds.size, paidOrdersCount);

  const allocatedAccounts = accounts.filter(
    (account) =>
      account.deliveryStatus === "delivered" && account.status !== "Failed",
  );
  const platformInsights = [
    { label: "MetaTrader 5 (MT5)", key: "MT5", color: VIZ.brand },
    { label: "MetaTrader 4 (MT4)", key: "MT4", color: VIZ.orange },
    { label: "cTrader Client", key: "cTrader", color: VIZ.good },
  ].map((platform) => {
    const count = allocatedAccounts.filter(
      (account) => account.platform === platform.key,
    ).length;
    return {
      ...platform,
      count,
      percent: percentage(count, allocatedAccounts.length),
    };
  });

  // --- Offers desk derived data ------------------------------------------
  // Sizes come from the live pricing catalog so a custom catalog product is
  // selectable too; the standard ladder is unioned in so a fresh install still
  // shows something, and the form's own picks survive a catalog change.
  const offerCatalogSizes = Array.from(
    new Set<number>([
      ...inventoryAccountSizes,
      ...pricingPlans
        .map((plan: any) => Number(plan.size))
        .filter((size: number) => Number.isFinite(size) && size > 0),
      ...offerForm.accountSizes,
    ]),
  ).sort((a, b) => a - b);

  const offerUserQuery = offerUserSearch.trim().toLowerCase();
  const offerSelectableUsers = users.filter((user: any) => user.role !== "admin");
  const offerFilteredUsers = offerUserQuery
    ? offerSelectableUsers.filter(
        (user: any) =>
          String(user.name || "").toLowerCase().includes(offerUserQuery) ||
          String(user.email || "").toLowerCase().includes(offerUserQuery),
      )
    : offerSelectableUsers;

  const offerAccountQuery = offerAccountSearch.trim().toLowerCase();
  const offerFilteredAccounts = offerAccountQuery
    ? accounts.filter((account: any) => {
        const owner = users.find((user: any) => user.id === account.userId);
        return [
          account.login,
          account.platform,
          account.status,
          owner?.name,
          owner?.email,
        ]
          .map((value) => String(value || "").toLowerCase())
          .some((value) => value.includes(offerAccountQuery));
      })
    : accounts;

  const offerUserLabel = (userId: string) => {
    const user = users.find((item: any) => item.id === userId);
    return user?.name || user?.email || userId;
  };
  const offerAccountLabel = (accountId: string) => {
    const account = accounts.find((item: any) => item.id === accountId);
    if (!account) return accountId;
    return `${account.platform || "MT5"} · ${account.login || account.id}`;
  };

  const activeOffersCount = offers.filter(
    (offer: any) => getOfferState(offer, couponNow) === "active",
  ).length;

  return (
    <div className="space-y-6 relative text-neutral-200">
      <AdminFeedbackHost />
      {/* Sub-Tabs Capsule Navigation */}
      {!isCrmPortal && (
        <div className="flex flex-wrap gap-1.5 p-1 rounded-2xl bg-neutral-950/60 border border-white/5 backdrop-blur-xl">
          {[
            {
              id: "telemetry",
              label: "Control Dashboard",
              icon: <IconServer size={13} />,
            },
            {
              id: "traders",
              label: "User Profiles",
              icon: <IconUser size={13} />,
            },
            {
              id: "kyc",
              label: "KYC Review Desk",
              icon: <IconUserCheck size={13} />,
              badge: pendingKycCount,
            },
            {
              id: "orders",
              label: "Orders Ledger",
              icon: <IconReceipt size={13} />,
            },
            {
              id: "inventory",
              label: "Plans Inventory",
              icon: <IconPlus size={13} />,
            },
            {
              id: "coupons",
              label: "Coupons Manager",
              icon: <IconTicket size={13} />,
            },
            {
              id: "offers",
              label: "Offers Manager",
              icon: <IconGift size={13} />,
            },
            {
              id: "payouts",
              label: "Payout Split Audits",
              icon: <IconCreditCard size={13} />,
            },
            {
              id: "affiliates",
              label: "Affiliates",
              icon: <IconFlag size={13} />,
            },
            {
              id: "newsletter",
              label: "Newsletter",
              icon: <IconBell size={13} />,
              badge: newsletterSubscribers.length,
            },
            {
              id: "promotions",
              label: "Email Promotions",
              icon: <IconBell size={13} />,
            },
            {
              id: "broadcaster",
              label: "Broadcaster",
              icon: <IconBell size={13} />,
            },
            {
              id: "audit",
              label: "Audit Trail",
              icon: <IconReceipt size={13} />,
            },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                setActiveSubTab(tab.id as any);
                setSelectedUser(null);
              }}
              className={`py-2 px-3 rounded-xl text-xs font-semibold flex items-center gap-2 cursor-pointer transition-all duration-300 relative ${
                activeSubTab === tab.id
                  ? "bg-white text-black shadow-lg font-bold"
                  : "text-neutral-455 hover:text-white hover:bg-white/[0.03]"
              }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
              {tab.badge && tab.badge > 0 ? (
                <span
                  className={`text-[9px] px-1.5 py-0.5 rounded-full font-mono font-bold ${
                    activeSubTab === tab.id
                      ? "bg-black text-white"
                      : "bg-amber-500/20 text-amber-400 border border-amber-500/20"
                  }`}
                >
                  {tab.badge}
                </span>
              ) : null}
            </button>
          ))}
        </div>
      )}

      {loading ? (
        <AdminCrmLoadingSkeleton />
      ) : (
        <div className="animate-fade-in">
          {/* 0. TELEMETRY OVERVIEW DESK (ONLY GRAPHS & TELEMETRY STATS) */}
          {activeSubTab === "telemetry" && (
            <div className="space-y-8 animate-fade-in">
              <AdminPageHeader
                title="Dashboard"
                subtitle="Platform health at a glance."
                onRefresh={fetchCrmData}
                refreshing={refreshing}
              />

              {/* KPI Stats Row */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <AdminStatCard
                  label="Total Users"
                  value={totalTraders}
                  hint={`${activeTradersCount} active profiles`}
                  accent="blue"
                  icon={<IconUsers size={16} />}
                />
                <AdminStatCard
                  label="Total Orders"
                  value={orders.length}
                  hint={`${paidOrdersCount} paid · ${unpaidOrdersCount} unpaid`}
                  accent="orange"
                  icon={<IconShoppingCart size={16} />}
                />
                <AdminStatCard
                  label="Revenue"
                  value={formatMoney(totalRevenue)}
                  hint="Gross from paid challenge orders"
                  accent="emerald"
                  icon={<IconCreditCard size={16} />}
                />
                <AdminStatCard
                  label="Open Queue"
                  value={pendingKycCount + pendingDeliveryCount}
                  hint={`${pendingKycCount} KYC · ${pendingDeliveryCount} deliveries`}
                  accent="amber"
                  icon={<IconServer size={16} />}
                />
              </div>

              <div className="space-y-5">
                <div className="flex items-center gap-3">
                  <IconChartBar size={15} className="text-neutral-500" />
                  <h3 className="text-sm font-semibold text-white">
                    Platform analytics
                  </h3>
                  <div className="h-px flex-1 bg-white/[0.06]" />
                </div>

                <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                  {/* Sign-up velocity */}
                  <AdminChartCard
                    title="New registrations"
                    subtitle={`Sign-ups per day over the last ${trendWindowDays} days.`}
                    badge={
                      usersWoW === null ? (
                        <AdminChartBadge>
                          {weekUsersCount} this week
                        </AdminChartBadge>
                      ) : (
                        <AdminChartBadge tone={usersWoW >= 0 ? "up" : "down"}>
                          {usersWoW >= 0 ? "+" : ""}
                          {usersWoW}% WoW
                        </AdminChartBadge>
                      )
                    }
                  >
                    <AdminTrendChart
                      trend={signupTrend}
                      color={VIZ.brand}
                      unit="sign-ups"
                      gradientId="vizSignupTrend"
                    />
                    <div className="mt-4 grid grid-cols-3 gap-3 border-t border-white/[0.06] pt-4">
                      {[
                        { label: "Today", value: todayUsersCount },
                        { label: "This week", value: weekUsersCount },
                        { label: "All time", value: totalTraders },
                      ].map((item) => (
                        <div key={item.label}>
                          <span className="block font-mono text-[9px] font-semibold uppercase tracking-[0.12em] text-neutral-500">
                            {item.label}
                          </span>
                          <span className="mt-1 block text-lg font-semibold text-white">
                            {item.value}
                          </span>
                        </div>
                      ))}
                    </div>
                  </AdminChartCard>

                  {/* Order velocity */}
                  <AdminChartCard
                    title="New orders"
                    subtitle={`Orders placed per day over the last ${trendWindowDays} days.`}
                    badge={
                      ordersWoW === null ? (
                        <AdminChartBadge>
                          {weekOrdersCount} this week
                        </AdminChartBadge>
                      ) : (
                        <AdminChartBadge tone={ordersWoW >= 0 ? "up" : "down"}>
                          {ordersWoW >= 0 ? "+" : ""}
                          {ordersWoW}% WoW
                        </AdminChartBadge>
                      )
                    }
                  >
                    <AdminTrendChart
                      trend={orderTrend}
                      color={VIZ.orange}
                      unit="orders"
                      gradientId="vizOrderTrend"
                    />
                    <div className="mt-4 grid grid-cols-3 gap-3 border-t border-white/[0.06] pt-4">
                      {[
                        { label: "Today", value: todayOrdersCount },
                        { label: "This week", value: weekOrdersCount },
                        { label: "All time", value: orders.length },
                      ].map((item) => (
                        <div key={item.label}>
                          <span className="block font-mono text-[9px] font-semibold uppercase tracking-[0.12em] text-neutral-500">
                            {item.label}
                          </span>
                          <span className="mt-1 block text-lg font-semibold text-white">
                            {item.value}
                          </span>
                        </div>
                      ))}
                    </div>
                  </AdminChartCard>

                  {/* Signup -> order -> payment funnel */}
                  <AdminChartCard
                    title="Conversion funnel"
                    subtitle="How far registered traders get before paying."
                    badge={
                      <AdminChartBadge>
                        {orderPaidPercent}% of orders paid
                      </AdminChartBadge>
                    }
                  >
                    <div className="space-y-4">
                      <AdminMeter
                        label="Registered"
                        value={totalTraders}
                        percent={100}
                        color={VIZ.brand}
                      />
                      <AdminMeter
                        label="Placed an order"
                        value={`${usersWithOrders} · ${orderCreatePercent}%`}
                        percent={orderCreatePercent}
                        color={VIZ.brand}
                      />
                      <AdminMeter
                        label="Paid at least once"
                        value={`${payingUsersCount} · ${payingUsersPercent}%`}
                        percent={payingUsersPercent}
                        color={VIZ.brand}
                      />
                    </div>
                    <p className="mt-4 border-t border-white/[0.06] pt-3 text-[10px] text-neutral-600">
                      Percentages are of all {totalTraders} registered traders.
                    </p>
                  </AdminChartCard>

                  {/* Revenue vs payouts */}
                  <AdminChartCard
                    title="Revenue & payouts"
                    subtitle="Gross intake against what has been paid back out."
                    badge={
                      <AdminChartBadge>
                        Net {formatMoney(totalRevenue - totalPayoutsPaid)}
                      </AdminChartBadge>
                    }
                  >
                    <div className="space-y-4">
                      {[
                        {
                          label: "Gross revenue",
                          amount: totalRevenue,
                          color: VIZ.good,
                        },
                        {
                          label: "Paid payouts",
                          amount: totalPayoutsPaid,
                          color: VIZ.critical,
                        },
                        {
                          label: "Pending audits",
                          amount: totalPayoutsPending,
                          color: VIZ.warning,
                        },
                      ].map((flow) => (
                        <AdminMeter
                          key={flow.label}
                          label={flow.label}
                          value={formatMoney(flow.amount)}
                          percent={percentage(flow.amount, revenueChartMax)}
                          color={flow.color}
                        />
                      ))}
                    </div>
                    <p className="mt-4 border-t border-white/[0.06] pt-3 text-[10px] text-neutral-600">
                      Bars are scaled to the largest of the three figures.
                    </p>
                  </AdminChartCard>

                  {/* Evaluation pass rates */}
                  <AdminChartCard
                    title="Evaluation pass rates"
                    subtitle="How traders progress through each challenge stage."
                    badge={
                      <AdminChartBadge>
                        {fundedOrderIds.size} funded
                      </AdminChartBadge>
                    }
                  >
                    <div className="space-y-4">
                      <AdminMeter
                        label="Phase 1"
                        value={`${phase1PassPercent}%`}
                        percent={phase1PassPercent}
                        color={VIZ.brand}
                        note={`${phase1PassedCount} of ${phase1Accounts.length} passed`}
                      />
                      <AdminMeter
                        label="Phase 2"
                        value={`${phase2PassPercent}%`}
                        percent={phase2PassPercent}
                        color={VIZ.brand}
                        note={`${phase2PassedCount} of ${phase2Accounts.length} passed`}
                      />
                      <AdminMeter
                        label="Funded"
                        value={`${fundedPercent}%`}
                        percent={fundedPercent}
                        color={VIZ.good}
                        note={`${fundedOrderIds.size} of ${paidOrdersCount} paid orders funded`}
                      />
                    </div>
                  </AdminChartCard>

                  {/* Platform mix */}
                  <AdminChartCard
                    title="Platform distribution"
                    subtitle="Which terminals delivered accounts are running on."
                    badge={
                      <AdminChartBadge>
                        {allocatedAccounts.length} allocated
                      </AdminChartBadge>
                    }
                  >
                    <div className="space-y-4">
                      {platformInsights.map((platform) => (
                        <AdminMeter
                          key={platform.key}
                          label={platform.label}
                          value={`${platform.count} · ${platform.percent}%`}
                          percent={platform.percent}
                          color={platform.color}
                        />
                      ))}
                    </div>
                    <p className="mt-4 border-t border-white/[0.06] pt-3 text-[10px] text-neutral-600">
                      Based on {allocatedAccounts.length} delivered, non-failed
                      accounts.
                    </p>
                  </AdminChartCard>
                </div>
              </div>
            </div>
          )}
          {/* 1. USER PROFILES DESK */}
          {activeSubTab === "traders" && (
            <div className="space-y-5">
              <AdminPageHeader
                title="Users"
                subtitle="Profiles, roles, KYC and account access."
                onRefresh={fetchCrmData}
                refreshing={refreshing}
              />

              <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
                <AdminStatCard label="Total users" value={users.length} hint={`${weekUsersCount} joined this week`} />
                <AdminStatCard label="New today" value={todayUsersCount} hint="Registrations since midnight" />
                <AdminStatCard label="KYC approved" value={approvedKycCount} hint={`${pendingKycCount} pending review`} />
                <AdminStatCard
                  label="With accounts"
                  value={new Set(accounts.map((a: any) => a.userId)).size}
                  hint={`${accounts.length} trading accounts`}
                />
              </div>

              <AdminPanel flush>
                <AdminToolbar
                  search={userSearch}
                  onSearch={setUserSearch}
                  placeholder="Search name, email, phone or ID"
                  filters={userRoleFilters.map((f) => ({
                    ...f,
                    count: searchedUsers.filter((u) => matchesUserRole(u, f.value)).length,
                  }))}
                  filter={userRoleFilter}
                  onFilter={setUserRoleFilter}
                />

                {filteredUsers.length === 0 ? (
                  <AdminEmptyState
                    icon={<IconUser size={28} />}
                    title="No users found"
                    hint="Try another search or filter."
                  />
                ) : (
                  <>
                    <AdminTable
                      minWidth={1080}
                      dense
                      bordered
                      columns={[
                        { key: "user", label: "User" },
                        { key: "phone", label: "Phone" },
                        { key: "country", label: "Country" },
                        { key: "role", label: "Role" },
                        { key: "kyc", label: "KYC" },
                        { key: "accounts", label: "Accounts" },
                        { key: "joined", label: "Joined" },
                        { key: "actions", label: "Actions", align: "right" },
                      ]}
                    >
                      {filteredUsers.map((u) => {
                        const userAccounts = accounts.filter((a) => a.userId === u.id);
                        const totalBalance = userAccounts.reduce((sum, a) => sum + (Number(a.balance) || 0), 0);
                        const kycStatus = kycList.find((k) => k.userId === u.id)?.status;
                        const resetting = isBusy(`user-reset:${u.id}`);

                        return (
                          <tr key={u.id} className={ADMIN_TR}>
                            <td className={`max-w-[240px] ${ADMIN_TD}`}>
                              <button
                                type="button"
                                onClick={() => openUserProfile(u)}
                                className="block max-w-full truncate text-left text-xs font-medium text-white hover:underline"
                              >
                                {u.name || "Unnamed"}
                              </button>
                              <span className="block truncate text-[11px] text-neutral-500">{u.email}</span>
                            </td>
                            <td className={`whitespace-nowrap text-xs text-neutral-300 ${ADMIN_TD}`}>
                              {u.phone || "—"}
                            </td>
                            <td className={`text-xs text-neutral-300 ${ADMIN_TD}`}>{u.country || "—"}</td>
                            <td className={ADMIN_TD}>
                              <div className="flex flex-wrap gap-1">
                                <AdminBadge
                                  tone={u.role === "admin" ? "warning" : u.role === "affiliate" ? "info" : "neutral"}
                                >
                                  {u.role || "trader"}
                                </AdminBadge>
                                {u.status && u.status !== "active" && <AdminBadge status={u.status} />}
                              </div>
                            </td>
                            <td className={ADMIN_TD}>
                              {kycStatus ? (
                                <AdminBadge status={kycStatus} />
                              ) : (
                                <span className="text-[11px] text-neutral-600">Not submitted</span>
                              )}
                            </td>
                            <td className={ADMIN_TD}>
                              {userAccounts.length > 0 ? (
                                <>
                                  <span className="block text-xs text-white tabular-nums">{userAccounts.length}</span>
                                  <span className="block text-[11px] text-neutral-500 tabular-nums">
                                    ${totalBalance.toLocaleString()}
                                  </span>
                                </>
                              ) : (
                                <span className="text-[11px] text-neutral-600">None</span>
                              )}
                            </td>
                            <td className={`whitespace-nowrap text-[11px] text-neutral-400 ${ADMIN_TD}`}>
                              {formatOrderDateTime(u.createdAt)}
                            </td>
                            <td className={ADMIN_TD}>
                              <div className="flex items-center justify-end gap-1.5">
                                <AdminIconButton
                                  icon={<IconEye size={15} />}
                                  label="View profile"
                                  onClick={() => openUserProfile(u)}
                                />
                                {resetting ? (
                                  <span className="inline-flex h-8 w-8 items-center justify-center text-neutral-400">
                                    <Spinner size={15} />
                                  </span>
                                ) : (
                                  <AdminRowMenu
                                    items={[
                                      {
                                        label: "Set temporary password",
                                        icon: <IconKey size={14} />,
                                        onClick: () => handleResetDashboardPassword(u),
                                      },
                                      {
                                        label: "Login as user",
                                        icon: <IconUser size={14} />,
                                        onClick: () => handleImpersonateUser(u.id),
                                      },
                                      {
                                        label: "Copy email",
                                        icon: <IconCopy size={14} />,
                                        onClick: () => {
                                          handleCopy(String(u.email || ""), `${u.id}-email`);
                                          adminToast.info("Email copied");
                                        },
                                      },
                                    ]}
                                  />
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </AdminTable>
                    <AdminTableFooter shown={filteredUsers.length} total={users.length} noun="users" />
                  </>
                )}
              </AdminPanel>

              {tempPasswordUser && generatedDashboardPasswords[tempPasswordUser.id] && (
                <AdminModal
                  open
                  size="sm"
                  onClose={() => setTempPasswordUser(null)}
                  title="Temporary password set"
                  subtitle={tempPasswordUser.email}
                  footer={
                    <>
                      <AdminButton onClick={() => setTempPasswordUser(null)}>Done</AdminButton>
                      <AdminButton
                        variant="primary"
                        onClick={() =>
                          handleCopy(generatedDashboardPasswords[tempPasswordUser.id], `${tempPasswordUser.id}-temp`)
                        }
                      >
                        {copiedId === `${tempPasswordUser.id}-temp` ? "Copied" : "Copy password"}
                      </AdminButton>
                    </>
                  }
                >
                  <p className="text-[13px] text-neutral-400">
                    Share this with the user. It replaces their old password, which is stored hashed and can&apos;t be shown.
                  </p>
                  <div className="mt-4 select-all rounded-lg border border-emerald-500/20 bg-emerald-500/[0.06] px-4 py-3 font-mono text-base text-white">
                    {generatedDashboardPasswords[tempPasswordUser.id]}
                  </div>
                </AdminModal>
              )}
            </div>
          )}

          {/* 2. KYC REVIEW DESK */}
          {activeSubTab === "kyc" && (
            <div className="space-y-5">
              <AdminPageHeader
                title="KYC requests"
                subtitle="Review identity verification submissions."
                onRefresh={fetchCrmData}
                refreshing={refreshing}
              />

              <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
                <AdminStatCard label="Pending" value={pendingKycCount} hint="Waiting for review" />
                <AdminStatCard label="Needs review" value={needsReviewKycCount} hint="Flagged by Didit" />
                <AdminStatCard label="Approved" value={approvedKycCount} hint="Verified traders" />
                <AdminStatCard label="Rejected" value={rejectedKycCount} hint="Asked to resubmit" />
              </div>

              <AdminPanel flush>
                {(() => {
                  const search = kycSearch.trim().toLowerCase();
                  const searched = sortedKycList.filter(
                    (k) =>
                      !search ||
                      [k.userName, k.userEmail, k.userId].some((v) =>
                        String(v || "").toLowerCase().includes(search),
                      ),
                  );
                  const rows = searched.filter((k) => kycFilter === "all" || k.status === kycFilter);
                  const countFor = (value: string) =>
                    searched.filter((k) => value === "all" || k.status === value).length;
                  return (
                    <>
                      <AdminToolbar
                        search={kycSearch}
                        onSearch={setKycSearch}
                        placeholder="Search name, email or user ID"
                        filters={[
                          { value: "all", label: "All", count: countFor("all") },
                          { value: "pending", label: "Pending", count: countFor("pending") },
                          { value: "needs_review", label: "Needs review", count: countFor("needs_review") },
                          { value: "approved", label: "Approved", count: countFor("approved") },
                          { value: "rejected", label: "Rejected", count: countFor("rejected") },
                        ]}
                        filter={kycFilter}
                        onFilter={setKycFilter}
                      />
                      {rows.length === 0 ? (
                        <AdminEmptyState
                          icon={<IconUserCheck size={28} />}
                          title="No KYC requests"
                          hint={kycFilter === "all" && !search ? "Submissions will appear here." : "Try another search or filter."}
                        />
                      ) : (
                        <>
                          <AdminTable
                            minWidth={900}
                            dense
                            bordered
                            columns={[
                              { key: "trader", label: "Trader" },
                              { key: "method", label: "Method" },
                              { key: "gateway", label: "Gateway status" },
                              { key: "status", label: "Status" },
                              { key: "submitted", label: "Updated" },
                              { key: "actions", label: "Actions", align: "right" },
                            ]}
                          >
                            {rows.map((k) => {
                              const isDidit = k.documentType === "didit";
                              return (
                                <tr key={k.userId} className={ADMIN_TR}>
                                  <td className={`max-w-[260px] ${ADMIN_TD}`}>
                                    <button
                                      type="button"
                                      onClick={() => setKycReview(k)}
                                      className="block max-w-full truncate text-left text-xs font-medium text-white hover:underline"
                                    >
                                      {k.userName || "Unknown trader"}
                                    </button>
                                    <span className="block truncate text-[11px] text-neutral-500">{k.userEmail}</span>
                                  </td>
                                  <td className={`text-xs text-neutral-300 ${ADMIN_TD}`}>
                                    {isDidit ? (
                                      "Didit"
                                    ) : (
                                      <span className="capitalize">{String(k.documentType || "").replace(/_/g, " ")}</span>
                                    )}
                                  </td>
                                  <td className={`text-[11px] text-neutral-400 ${ADMIN_TD}`}>
                                    {isDidit ? k.addressUrl || "Unknown" : "Manual upload"}
                                  </td>
                                  <td className={ADMIN_TD}>
                                    {isBusy(`kyc:${k.userId}`) ? (
                                      <span className="inline-flex items-center gap-1.5 text-[11px] text-neutral-400">
                                        <Spinner size={11} /> Updating…
                                      </span>
                                    ) : (
                                      <AdminBadge status={k.status} />
                                    )}
                                  </td>
                                  <td className={`whitespace-nowrap text-[11px] text-neutral-400 ${ADMIN_TD}`}>
                                    {formatOrderDateTime(k.updatedAt)}
                                  </td>
                                  <td className={ADMIN_TD}>
                                    <div className="flex items-center justify-end gap-1.5">
                                      <AdminButton variant="primary" onClick={() => setKycReview(k)}>
                                        Review
                                      </AdminButton>
                                      {isDidit && (
                                        <AdminRowMenu
                                          items={[
                                            {
                                              label: "Sync from Didit",
                                              icon: <IconSettings size={14} />,
                                              onClick: () => handleSyncKyc(k.userId),
                                              disabled: isBusy(`kyc-sync:${k.userId}`),
                                            },
                                          ]}
                                        />
                                      )}
                                    </div>
                                  </td>
                                </tr>
                              );
                            })}
                          </AdminTable>
                          <AdminTableFooter shown={rows.length} total={kycList.length} noun="requests" />
                        </>
                      )}
                    </>
                  );
                })()}
              </AdminPanel>

              {kycReview &&
                (() => {
                  const deciding = isBusy(`kyc:${kycReview.userId}`);
                  const syncing = isBusy(`kyc-sync:${kycReview.userId}`);
                  const isDidit = kycReview.documentType === "didit";
                  const docLink = (value: unknown) =>
                    typeof value === "string" && /^https?:\/\//.test(value) ? (
                      <a href={value} target="_blank" rel="noopener noreferrer" className="text-emerald-300 hover:underline">
                        Open
                      </a>
                    ) : value ? (
                      "Uploaded"
                    ) : (
                      <span className="text-neutral-500">Missing</span>
                    );
                  return (
                    <AdminModal
                      open
                      busy={deciding}
                      onClose={() => setKycReview(null)}
                      title={kycReview.userName || "KYC review"}
                      subtitle={kycReview.userEmail}
                      footer={
                        <>
                          {isDidit && (
                            <AdminButton
                              loading={syncing}
                              disabled={deciding}
                              onClick={() => handleSyncKyc(kycReview.userId)}
                              className="mr-auto"
                            >
                              Sync from Didit
                            </AdminButton>
                          )}
                          <AdminButton
                            variant="danger"
                            loading={deciding && kycVerdict === "rejected"}
                            disabled={deciding}
                            onClick={async () => {
                              const reason = await adminPrompt({
                                title: "Reject KYC",
                                message: "The trader will see this reason and be asked to resubmit.",
                                placeholder: "e.g. Document is blurry, please upload a clearer photo",
                                confirmLabel: "Reject",
                                tone: "danger",
                              });
                              if (reason === null) return;
                              setKycVerdict("rejected");
                              handleReviewKyc(kycReview.userId, "rejected", reason);
                            }}
                          >
                            Reject
                          </AdminButton>
                          <AdminButton
                            variant="success"
                            loading={deciding && kycVerdict === "approved"}
                            disabled={deciding}
                            onClick={() => {
                              setKycVerdict("approved");
                              handleReviewKyc(kycReview.userId, "approved", "");
                            }}
                          >
                            Approve
                          </AdminButton>
                        </>
                      }
                    >
                      <div className="space-y-5">
                        <div className="flex flex-wrap gap-2">
                          <AdminBadge status={kycReview.status} />
                          {isDidit && <AdminBadge status={kycReview.addressUrl}>Didit: {kycReview.addressUrl || "Unknown"}</AdminBadge>}
                        </div>

                        <AdminDetailList
                          rows={
                            isDidit
                              ? [
                                  ["Session ID", <span key="sid" className="select-all font-mono text-xs">{kycReview.frontUrl || "—"}</span>],
                                  ["Gateway status", kycReview.addressUrl || "Unknown"],
                                  ["Verification link", docLink(kycReview.backUrl)],
                                  ["Updated", formatOrderDateTime(kycReview.updatedAt)],
                                ]
                              : [
                                  ["Document type", <span key="dt" className="capitalize">{String(kycReview.documentType || "").replace(/_/g, " ")}</span>],
                                  ["Front", docLink(kycReview.frontUrl)],
                                  ["Back", kycReview.backUrl ? docLink(kycReview.backUrl) : <span key="nb" className="text-neutral-500">Not required</span>],
                                  ["Selfie", docLink(kycReview.selfieUrl)],
                                  ["Proof of address", docLink(kycReview.addressUrl)],
                                  ["Updated", formatOrderDateTime(kycReview.updatedAt)],
                                ]
                          }
                        />

                        {kycReview.rejectReason && (
                          <div className="rounded-xl border border-rose-500/20 bg-rose-500/[0.06] p-3">
                            <span className="block text-xs font-medium text-rose-300">Last rejection reason</span>
                            <p className="mt-1 text-[13px] leading-relaxed text-neutral-200">{kycReview.rejectReason}</p>
                          </div>
                        )}
                      </div>
                    </AdminModal>
                  );
                })()}
            </div>
          )}

          {activeSubTab === "orders" && (
            <div className="space-y-5">
              <AdminPageHeader
                title="Orders"
                subtitle="Verify payments, update stages and deliver accounts."
                onRefresh={fetchCrmData}
                refreshing={refreshing}
              />

              <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
                <AdminStatCard
                  label="Today"
                  value={formatMoney(todayEarnings.total)}
                  hint={pluralOrders(todayEarnings.orders)}
                />
                <AdminStatCard
                  label="Yesterday"
                  value={formatMoney(yesterdayEarnings.total)}
                  hint={pluralOrders(yesterdayEarnings.orders)}
                />
                <AdminStatCard
                  label="This month"
                  value={formatMoney(monthEarnings.total)}
                  hint={pluralOrders(monthEarnings.orders)}
                />
                <AdminStatCard
                  label="Awaiting delivery"
                  value={pendingDeliveryCount}
                  hint={`${unpaidOrdersCount} unpaid orders`}
                />
              </div>

              <AdminPanel flush>
                <div className="space-y-3 border-b border-white/[0.06] p-4">
                  <div className="relative w-full lg:max-w-sm">
                    <IconSearch
                      className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500"
                      size={14}
                    />
                    <input
                      type="search"
                      placeholder="Search name, email, order ID or login"
                      value={orderSearchText}
                      onChange={(event) => setOrderSearchText(event.target.value)}
                      className="h-10 w-full rounded-lg border border-white/[0.08] bg-black/25 pl-9 pr-3 text-[13px] text-white outline-none transition-colors placeholder:text-neutral-600 focus:border-white/25"
                    />
                  </div>
                  <div className="-mx-1 flex gap-1.5 overflow-x-auto px-1 pb-0.5">
                    {orderStatusFilters.map((filter) => {
                      const isSelected = orderStatusFilter === filter.value;
                      return (
                        <button
                          key={filter.value}
                          type="button"
                          onClick={() => setOrderStatusFilter(filter.value)}
                          className={`inline-flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                            isSelected
                              ? "bg-white text-black"
                              : "text-neutral-400 hover:bg-white/[0.05] hover:text-white"
                          }`}
                        >
                          {filter.label}
                          <span className={`tabular-nums ${isSelected ? "text-black/55" : "text-neutral-600"}`}>
                            {orderFilterCounts[filter.value] ?? 0}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {filteredOrders.length === 0 ? (
                  <AdminEmptyState
                    icon={<IconReceipt size={28} />}
                    title="No orders found"
                    hint="Try another search or filter."
                  />
                ) : (
                  <>
                    <AdminTable
                      minWidth={showOrderCredentials ? 1320 : 1080}
                      dense
                      bordered
                      columns={[
                        { key: "order", label: "Order" },
                        { key: "customer", label: "Customer" },
                        { key: "plan", label: "Plan" },
                        { key: "amount", label: "Amount" },
                        { key: "payment", label: "Payment" },
                        { key: "delivery", label: "Delivery" },
                        { key: "account", label: "Account status" },
                        ...(showOrderCredentials
                          ? [{ key: "credentials", label: "Login credentials" }]
                          : []),
                        { key: "date", label: "Date" },
                        { key: "actions", label: "Actions", align: "right" as const },
                      ]}
                    >
                      {filteredOrders.map((order) => {
                        const display = getOrderDisplay(order);
                        const plan = getOrderPlanParts(order, display.linkedAccount);
                        const isPaid = display.paymentState === "paid";
                        const fullyDelivered =
                          display.orderAccounts.length > 0 &&
                          display.orderAccounts.every((a: any) => a.deliveryStatus === "delivered");
                        // Account status only means something once credentials are out, so
                        // show the newest delivered account (Active / Passed / Failed / Funded).
                        const liveAccount = display.orderAccounts
                          .filter((a: any) => a.deliveryStatus === "delivered")
                          .reduce(
                            (latest: any, current: any) =>
                              !latest || new Date(current.createdAt || 0) > new Date(latest.createdAt || 0)
                                ? current
                                : latest,
                            null,
                          );
                        const updating = isBusy(`order:${order.id}`);
                        const deleting = deletingOrderId === order.id;

                        return (
                          <tr key={order.id} className="transition-colors hover:bg-white/[0.02]">
                            <td className="px-3 py-2.5 align-middle">
                              <button
                                type="button"
                                onClick={() => setViewingOrder(order)}
                                className="font-mono text-xs font-semibold text-white hover:underline"
                              >
                                {order.id}
                              </button>
                              {(display.hasNewAccountRequest || order.legacyRules || display.archived) && (
                                <div className="mt-1 flex flex-wrap gap-1">
                                  {display.hasNewAccountRequest && <AdminBadge tone="info">New request</AdminBadge>}
                                  {order.legacyRules && <AdminBadge tone="warning">Legacy</AdminBadge>}
                                  {display.archived && <AdminBadge tone="neutral">Archived</AdminBadge>}
                                </div>
                              )}
                            </td>

                            <td className="max-w-[200px] px-3 py-2.5 align-middle">
                              <span className="block truncate text-xs font-medium text-white">
                                {order.userName || "Unknown client"}
                              </span>
                              <span className="block truncate text-[11px] text-neutral-500">
                                {order.userEmail || "—"}
                              </span>
                            </td>

                            <td className="whitespace-nowrap px-3 py-2.5 align-middle">
                              <span className="block text-xs text-white">{plan.challenge}</span>
                              <span className="block text-[11px] text-neutral-500">
                                {plan.size > 0 ? `$${plan.size.toLocaleString()}` : "—"}
                                {display.linkedAccount?.platform ? ` · ${display.linkedAccount.platform}` : ""}
                              </span>
                            </td>

                            <td className="px-3 py-2.5 align-middle">
                              <span className="block text-xs font-medium text-white tabular-nums">
                                {formatMoney(Number(order.amountPaid || 0))}
                              </span>
                              <span
                                className="block max-w-[140px] truncate text-[11px] text-neutral-500"
                                title={display.paymentProvider}
                              >
                                {display.paymentProvider}
                              </span>
                            </td>

                            <td className="px-3 py-2.5 align-middle">
                              <AdminBadge status={display.payment.label}>{display.payment.label}</AdminBadge>
                            </td>

                            <td className="px-3 py-2.5 align-middle">
                              {isPaid ? (
                                <AdminBadge status={display.delivery.label}>{display.delivery.label}</AdminBadge>
                              ) : (
                                <span className="text-[11px] text-neutral-600">—</span>
                              )}
                            </td>

                            <td className="px-3 py-2.5 align-middle">
                              {updating ? (
                                <span className="inline-flex items-center gap-1.5 text-[11px] text-neutral-400">
                                  <Spinner size={11} /> Updating…
                                </span>
                              ) : liveAccount ? (
                                <AdminBadge status={liveAccount.status}>{liveAccount.status || "Unknown"}</AdminBadge>
                              ) : (
                                <span className="text-[11px] text-neutral-600">—</span>
                              )}
                            </td>

                            {showOrderCredentials && (
                              <td className="px-3 py-2.5 align-middle">
                                {(() => {
                                  const credAccounts = getActiveAccountsForOrder(order);
                                  if (credAccounts.length === 0) {
                                    return <span className="text-[11px] text-neutral-600">Not delivered</span>;
                                  }
                                  return (
                                    <div className="space-y-1.5">
                                      {credAccounts.map((acc: any) => (
                                        <div key={acc.id} className="space-y-0.5">
                                          {(
                                            [
                                              ["Login", String(acc.login || ""), `${acc.id}-row-login`],
                                              ["Server", String(acc.server || ""), `${acc.id}-row-server`],
                                              ["Password", String(acc.passwordMaster || ""), `${acc.id}-row-master`],
                                            ] as const
                                          ).map(([label, value, copyKey]) => (
                                            <div key={label} className="flex items-center gap-1.5 text-[11px]">
                                              <span className="w-14 shrink-0 text-neutral-500">{label}</span>
                                              <span className="max-w-[150px] truncate font-mono text-white" title={value}>
                                                {value || "—"}
                                              </span>
                                              {value && (
                                                <button
                                                  type="button"
                                                  onClick={() => handleCopy(value, copyKey)}
                                                  title={`Copy ${label.toLowerCase()}`}
                                                  className="shrink-0 text-neutral-500 transition-colors hover:text-white"
                                                >
                                                  {copiedId === copyKey ? (
                                                    <IconCheck size={12} className="text-emerald-400" />
                                                  ) : (
                                                    <IconCopy size={12} />
                                                  )}
                                                </button>
                                              )}
                                            </div>
                                          ))}
                                        </div>
                                      ))}
                                    </div>
                                  );
                                })()}
                              </td>
                            )}

                            <td className="whitespace-nowrap px-3 py-2.5 align-middle text-[11px] text-neutral-400">
                              {formatOrderDateTime(order.createdAt)}
                            </td>

                            <td className="px-3 py-2.5 align-middle">
                              <div className="flex items-center justify-end gap-1.5">
                                {isPaid && !fullyDelivered && (
                                  <AdminButton variant="primary" onClick={() => handleDeliverFromOrder(order)}>
                                    Deliver
                                  </AdminButton>
                                )}
                                <AdminIconButton
                                  icon={<IconEye size={15} />}
                                  label="View order"
                                  onClick={() => setViewingOrder(order)}
                                />
                                {deleting ? (
                                  <span className="inline-flex h-8 w-8 items-center justify-center text-neutral-400">
                                    <Spinner size={15} />
                                  </span>
                                ) : (
                                  <AdminRowMenu
                                    items={[
                                      {
                                        label: "Change status",
                                        icon: <IconSettings size={14} />,
                                        onClick: () => setEditingOrder(order),
                                        disabled: updating,
                                      },
                                      {
                                        label: fullyDelivered ? "Edit credentials" : "Deliver account",
                                        icon: <IconBox size={14} />,
                                        onClick: () => handleDeliverFromOrder(order),
                                        disabled: !isPaid,
                                        hint: isPaid ? undefined : "Payment required before delivery",
                                      },
                                      {
                                        label: "View credentials",
                                        icon: <IconKey size={14} />,
                                        onClick: () => setViewingCredentialsOrder(order),
                                        disabled: display.orderAccounts.length === 0,
                                      },
                                      {
                                        label: "Equity graph",
                                        icon: <IconChartBar size={14} />,
                                        onClick: () => display.linkedAccount && setGraphAccount(display.linkedAccount),
                                        disabled: !display.linkedAccount,
                                      },
                                      {
                                        label: "Copy order ID",
                                        icon: <IconCopy size={14} />,
                                        onClick: () => {
                                          handleCopy(order.id, order.id);
                                          adminToast.info(`Copied ${order.id}`);
                                        },
                                      },
                                      {
                                        label: "Delete order",
                                        icon: <IconTrash size={14} />,
                                        onClick: () => handleDeleteOrder(order),
                                        tone: "danger",
                                      },
                                    ]}
                                  />
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </AdminTable>

                    <div className="border-t border-white/[0.06] px-4 py-3 text-xs text-neutral-500">
                      Showing {filteredOrders.length} of {orders.length} orders
                    </div>
                  </>
                )}
              </AdminPanel>

              {/* Change status */}
              {(() => {
                if (!editingOrder) return null;
                const planName = getPlanNameForOrder(editingOrder);
                const stages = getStagePhases(planName);
                const saving = isBusy(`order:${editingOrder.id}`);
                const savingRules = isBusy(`order-rules:${editingOrder.id}`);
                const options = [
                  { value: "Pending", label: "Pending", hint: "Awaiting payment" },
                  { value: "Paid", label: "Paid", hint: "Payment confirmed, nothing delivered yet" },
                  { value: "Active", label: "Active", hint: "Phase 1 account is live" },
                  { value: "Passed", label: "Passed", hint: "Trader passed the current stage" },
                  ...(planSupportsPhase(planName, PHASE_TWO)
                    ? [{ value: "Step2 Active", label: "Phase 2 active", hint: "Verification account is live" }]
                    : []),
                  { value: "Live Active", label: "Funded", hint: "Live funded account" },
                  { value: "Failed", label: "Failed", hint: "Rules breached" },
                  { value: "Replaced", label: "Replaced", hint: "Superseded by a new account" },
                ];
                const draft = orderStatusDraft || editingOrder.status;
                const unchanged = draft === editingOrder.status;

                return (
                  <AdminModal
                    open
                    size="sm"
                    busy={saving}
                    onClose={() => setEditingOrder(null)}
                    title="Change order status"
                    subtitle={`${editingOrder.id} · ${planName || "Unknown plan"}`}
                    footer={
                      <>
                        <AdminButton onClick={() => setEditingOrder(null)} disabled={saving}>
                          Cancel
                        </AdminButton>
                        <AdminButton
                          variant="primary"
                          loading={saving}
                          disabled={unchanged}
                          onClick={async () => {
                            const ok = await handleUpdateOrderStatus(editingOrder.id, draft);
                            if (ok) setEditingOrder(null);
                          }}
                        >
                          {saving ? "Saving…" : "Save status"}
                        </AdminButton>
                      </>
                    }
                  >
                    {stages.length > 0 && (
                      <p className="mb-3 text-xs text-neutral-500">
                        Stages for this plan: {stages.join(" → ")}
                      </p>
                    )}
                    <div role="radiogroup" className="space-y-1.5">
                      {options.map((option) => {
                        const selected = draft === option.value;
                        const current = editingOrder.status === option.value;
                        return (
                          <button
                            key={option.value}
                            type="button"
                            role="radio"
                            aria-checked={selected}
                            disabled={saving}
                            onClick={() => setOrderStatusDraft(option.value)}
                            className={`flex w-full items-center gap-3 rounded-lg border px-3 py-2.5 text-left transition-colors disabled:cursor-not-allowed disabled:opacity-60 ${
                              selected
                                ? "border-white/40 bg-white/[0.06]"
                                : "border-white/[0.07] hover:border-white/20 hover:bg-white/[0.03]"
                            }`}
                          >
                            <span
                              aria-hidden
                              className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full border ${
                                selected ? "border-white" : "border-white/25"
                              }`}
                            >
                              {selected && <span className="h-2 w-2 rounded-full bg-white" />}
                            </span>
                            <span className="min-w-0 flex-1">
                              <span className="block text-[13px] font-medium text-white">{option.label}</span>
                              <span className="block text-xs text-neutral-500">{option.hint}</span>
                            </span>
                            {current && <AdminBadge tone="neutral">Current</AdminBadge>}
                          </button>
                        );
                      })}
                    </div>

                    <div className="mt-5 flex items-center justify-between gap-4 border-t border-white/[0.07] pt-4">
                      <div className="min-w-0">
                        <span className="block text-[13px] font-medium text-white">Legacy rulebook</span>
                        <span className="block text-xs text-neutral-500">
                          Keep this order on the pre-2026-09 rules.
                        </span>
                      </div>
                      <button
                        type="button"
                        role="switch"
                        aria-checked={Boolean(editingOrder.legacyRules)}
                        disabled={savingRules || saving}
                        onClick={() =>
                          handleUpdateOrderRuleVersion(editingOrder.id, !editingOrder.legacyRules)
                        }
                        className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full border transition-colors disabled:opacity-60 ${
                          editingOrder.legacyRules
                            ? "border-amber-400/60 bg-amber-500/40"
                            : "border-white/15 bg-white/[0.08]"
                        }`}
                      >
                        <span
                          className={`absolute flex h-4 w-4 items-center justify-center rounded-full bg-white text-black transition-[left] ${
                            editingOrder.legacyRules ? "left-[22px]" : "left-[3px]"
                          }`}
                        >
                          {savingRules && <Spinner size={10} />}
                        </span>
                      </button>
                    </div>
                  </AdminModal>
                );
              })()}

              {/* Credentials */}
              <AdminModal
                open={Boolean(viewingCredentialsOrder)}
                onClose={() => setViewingCredentialsOrder(null)}
                title="Trading credentials"
                subtitle={viewingCredentialsOrder ? `Order ${viewingCredentialsOrder.id}` : undefined}
              >
                {viewingCredentialsOrder &&
                  (() => {
                    const orderAccounts = accounts.filter(
                      (a) => a.orderId === viewingCredentialsOrder.id,
                    );
                    if (orderAccounts.length === 0) {
                      return (
                        <p className="py-8 text-center text-[13px] text-neutral-500">
                          No trading account has been assigned to this order yet.
                        </p>
                      );
                    }
                    return (
                      <div className="space-y-4">
                        {orderAccounts.map((acc) => {
                          const fields: [string, string, string][] = [
                            ["Login", String(acc.login || ""), `${acc.id}-login`],
                            ["Server", String(acc.server || ""), `${acc.id}-server`],
                            ["Master password", String(acc.passwordMaster || ""), `${acc.id}-master`],
                          ];
                          return (
                            <div key={acc.id} className="rounded-xl border border-white/[0.08] p-4">
                              <div className="flex flex-wrap items-start justify-between gap-3">
                                <div>
                                  <span className="block font-mono text-sm font-semibold text-white">
                                    #{acc.login}
                                  </span>
                                  <span className="block text-xs text-neutral-500">
                                    {acc.platform} · {acc.phase}
                                  </span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <AdminBadge status={acc.status} />
                                  <AdminBadge status={acc.deliveryStatus === "delivered" ? "Delivered" : "Pending delivery"} />
                                </div>
                              </div>

                              <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
                                {fields.map(([label, value, copyKey]) => (
                                  <div
                                    key={label}
                                    className="flex items-center justify-between gap-2 rounded-lg bg-white/[0.03] px-3 py-2"
                                  >
                                    <div className="min-w-0">
                                      <span className="block text-[11px] text-neutral-500">{label}</span>
                                      <span className="block truncate font-mono text-[13px] text-white">
                                        {value || "—"}
                                      </span>
                                    </div>
                                    {value && (
                                      <button
                                        type="button"
                                        onClick={() => handleCopy(value, copyKey)}
                                        title={`Copy ${label.toLowerCase()}`}
                                        className="shrink-0 text-neutral-500 transition-colors hover:text-white"
                                      >
                                        {copiedId === copyKey ? (
                                          <IconCheck size={14} className="text-emerald-400" />
                                        ) : (
                                          <IconCopy size={14} />
                                        )}
                                      </button>
                                    )}
                                  </div>
                                ))}
                              </div>

                              <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
                                <span className="text-xs text-neutral-500">
                                  Balance ${Number(acc.balance || 0).toLocaleString()} · Equity $
                                  {Number(acc.equity || 0).toLocaleString()}
                                </span>
                                <div className="flex gap-2">
                                  <AdminButton
                                    onClick={() =>
                                      handleCopy(
                                        `Platform: ${acc.platform}\nLogin: ${acc.login}\nServer: ${acc.server}\nMaster Password: ${acc.passwordMaster}`,
                                        `${acc.id}-all`,
                                      )
                                    }
                                  >
                                    {copiedId === `${acc.id}-all` ? "Copied" : "Copy all"}
                                  </AdminButton>
                                  <AdminButton
                                    variant="primary"
                                    onClick={() =>
                                      openCredentialEditor(
                                        acc,
                                        acc.deliveryStatus === "delivered" ? "edit" : "deliver",
                                      )
                                    }
                                  >
                                    {acc.deliveryStatus === "delivered" ? "Edit" : "Deliver"}
                                  </AdminButton>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    );
                  })()}
              </AdminModal>
            </div>
          )}

              {/* Order details */}
              {viewingOrder &&
                (() => {
                  const display = getOrderDisplay(viewingOrder);
                  const proof = parseManualGatewayRef(viewingOrder.gatewayRef);
                  const isPaid = display.paymentState === "paid";
                  return (
                    <AdminModal
                      open
                      size="lg"
                      onClose={() => setViewingOrder(null)}
                      title={`Order ${viewingOrder.id}`}
                      subtitle={formatOrderDateTime(viewingOrder.createdAt)}
                      footer={
                        <>
                          <AdminButton
                            loading={isBusy(`impersonate:${viewingOrder.userId}`)}
                            onClick={() => handleImpersonateUser(viewingOrder.userId)}
                          >
                            Login as client
                          </AdminButton>
                          <AdminButton
                            onClick={() => {
                              setViewingOrder(null);
                              setEditingOrder(viewingOrder);
                            }}
                          >
                            Change status
                          </AdminButton>
                          <AdminButton
                            variant="primary"
                            disabled={!isPaid}
                            title={isPaid ? undefined : "Payment required before delivery"}
                            onClick={() => {
                              const order = viewingOrder;
                              setViewingOrder(null);
                              handleDeliverFromOrder(order);
                            }}
                          >
                            Deliver account
                          </AdminButton>
                        </>
                      }
                    >
                      <div className="space-y-6">
                        <div className="flex flex-wrap gap-2">
                          <AdminBadge status={display.status.label}>{display.status.label}</AdminBadge>
                          <AdminBadge status={display.payment.label}>{display.payment.label}</AdminBadge>
                          <AdminBadge status={display.delivery.label}>
                            {display.delivery.label} · {display.deliveredCount}/{display.orderAccounts.length}
                          </AdminBadge>
                          {display.hasNewAccountRequest && <AdminBadge tone="info">New account request</AdminBadge>}
                          {viewingOrder.legacyRules && <AdminBadge tone="warning">Legacy rules</AdminBadge>}
                        </div>

                        <div className="grid gap-6 md:grid-cols-2">
                          <section>
                            <h4 className="mb-1 text-xs font-medium text-neutral-500">Order</h4>
                            <AdminDetailList
                              rows={[
                                ["Plan", viewingOrder.planName || "Unknown plan"],
                                ["Amount", formatMoney(Number(viewingOrder.amountPaid || 0))],
                                ["Payment", display.paymentProvider],
                                ["Coupon", viewingOrder.couponUsed || "None"],
                                [
                                  "Referral balance",
                                  `$${Number(viewingOrder.referralBalanceApplied || 0).toLocaleString()}`,
                                ],
                                ["Reference", proof ? "Wallet transfer" : display.gatewayRef || "—"],
                                ["Updated", formatOrderDateTime(viewingOrder.updatedAt)],
                              ]}
                            />
                          </section>
                          <section>
                            <h4 className="mb-1 text-xs font-medium text-neutral-500">Customer</h4>
                            <AdminDetailList
                              rows={[
                                ["Name", viewingOrder.userName || display.user?.name || "Unknown"],
                                ["Email", viewingOrder.userEmail || display.user?.email || "—"],
                                ["Country", display.user?.country || "—"],
                                ["Phone", display.user?.phone || "—"],
                                ["User ID", <span key="uid" className="font-mono text-xs">{viewingOrder.userId || "—"}</span>],
                              ]}
                            />
                          </section>
                        </div>

                        {proof && (
                          <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-emerald-500/20 bg-emerald-500/[0.05] p-3">
                            <div className="min-w-0 flex-1">
                              <span className="block text-xs text-emerald-300">
                                {getManualWallet(proof.walletId)?.label || proof.walletId} · Transaction ID
                              </span>
                              <span className="mt-1 block select-all break-all font-mono text-xs text-neutral-200">
                                {proof.txid}
                              </span>
                            </div>
                            <AdminButton
                              loading={isBusy(`proof:${viewingOrder.id}`)}
                              onClick={() => {
                                // Open synchronously so the popup is not blocked, then point it at the signed URL.
                                const tab = window.open("", "_blank");
                                runBusy(`proof:${viewingOrder.id}`, async () => {
                                  try {
                                    const res = await fetch(
                                      `/api/orders/manual-payment?orderId=${encodeURIComponent(viewingOrder.id)}`,
                                    );
                                    const data = await res.json();
                                    if (!res.ok || !data.url) throw new Error(data.error || "Screenshot unavailable.");
                                    if (tab) tab.location.href = data.url;
                                  } catch (err: any) {
                                    tab?.close();
                                    adminToast.error(err.message);
                                  }
                                });
                              }}
                            >
                              View screenshot
                            </AdminButton>
                          </div>
                        )}

                        <section>
                          <div className="mb-2 flex items-center justify-between gap-3">
                            <h4 className="text-xs font-medium text-neutral-500">
                              Trading accounts ({display.orderAccounts.length})
                            </h4>
                            {display.orderAccounts.length > 0 && (
                              <button
                                type="button"
                                onClick={() => {
                                  setViewingOrder(null);
                                  setViewingCredentialsOrder(viewingOrder);
                                }}
                                className="text-xs font-medium text-neutral-300 hover:text-white"
                              >
                                View credentials →
                              </button>
                            )}
                          </div>
                          {display.orderAccounts.length > 0 ? (
                            <div className="divide-y divide-white/[0.05] rounded-xl border border-white/[0.08]">
                              {display.orderAccounts.map((account) => (
                                <div key={account.id} className="flex flex-wrap items-center gap-3 px-4 py-3">
                                  <div className="min-w-0 flex-1">
                                    <span className="block font-mono text-[13px] font-semibold text-white">
                                      #{account.login || account.id}
                                    </span>
                                    <span className="block text-xs text-neutral-500">
                                      {account.platform} · {account.phase || "—"} · {account.server || "Server pending"}
                                    </span>
                                  </div>
                                  <AdminBadge status={account.status} />
                                  <AdminBadge status={account.deliveryStatus === "delivered" ? "Delivered" : "Pending"} />
                                  <AdminButton
                                    variant="danger"
                                    loading={deletingAccountId === account.id}
                                    onClick={() => handleDeleteAccountRequest(account)}
                                  >
                                    Delete
                                  </AdminButton>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p className="rounded-xl border border-dashed border-white/10 py-6 text-center text-[13px] text-neutral-500">
                              No trading account assigned yet.
                            </p>
                          )}
                        </section>
                      </div>
                    </AdminModal>
                  );
                })()}

          {activeSubTab === "inventory" && (
            <div className="space-y-5">
              <AdminPageHeader
                title="Account containers"
                subtitle="Pre-filled trading accounts ready for instant delivery."
                onRefresh={fetchCrmData}
                refreshing={refreshing}
              />

              <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
                <AdminStatCard label="Total containers" value={plans.length} hint="Provisioned accounts" />
                <AdminStatCard label="Available" value={availableInventoryCount} hint="Ready to deliver" />
                <AdminStatCard label="Used" value={usedInventoryCount} hint="Already assigned" />
                <AdminStatCard
                  label="Free by platform"
                  value={`${availableInventoryByPlatform("MT5")} / ${availableInventoryByPlatform("MT4")}`}
                  hint="MT5 / MT4"
                />
              </div>

              {showAddForm && (
                <AdminPanel
                  title="Add container account"
                  subtitle="Credentials added here become available for instant delivery."
                >
                  <form onSubmit={handleCreatePlan} className="space-y-5">
                    <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
                      <div className="flex flex-col gap-1.5">
                        <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.12em] text-neutral-500">
                          Platform
                        </span>
                        <div className="grid grid-cols-3 gap-2">
                          {["MT5", "MT4", "cTrader"].map((platform) => (
                            <button
                              key={platform}
                              type="button"
                              onClick={() =>
                                setNewPlan({ ...newPlan, platform })
                              }
                              className={`h-10 rounded-lg border text-[11px] font-semibold transition-colors ${
                                newPlan.platform === platform
                                  ? "border-brand-primary bg-brand-primary text-button-text"
                                  : "border-white/[0.08] bg-black/30 text-neutral-400 hover:border-white/20 hover:text-white"
                              }`}
                            >
                              {platform}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="flex min-w-0 flex-col gap-1.5">
                        <AdminSelect
                          label="Account Size"
                          value={
                            customContainerSize ||
                            !containerSizeOptions.includes(Number(newPlan.size))
                              ? "custom"
                              : String(newPlan.size)
                          }
                          onChange={(value) => {
                            if (value === "custom") {
                              setCustomContainerSize(true);
                              setNewPlan({ ...newPlan, size: 0 });
                              return;
                            }
                            setCustomContainerSize(false);
                            setNewPlan({ ...newPlan, size: Number(value) });
                          }}
                          options={[
                            ...containerSizeOptions.map((size) => ({
                              label: `$${size.toLocaleString()}`,
                              value: String(size),
                            })),
                            { label: "Custom size…", value: "custom" },
                          ]}
                        />
                        {(customContainerSize ||
                          !containerSizeOptions.includes(
                            Number(newPlan.size),
                          )) && (
                          <input
                            type="number"
                            min={1}
                            step={1}
                            value={newPlan.size || ""}
                            onChange={(event) =>
                              setNewPlan({
                                ...newPlan,
                                size: Number(event.target.value),
                              })
                            }
                            placeholder="e.g. 15000"
                            required
                            className="h-10 w-full rounded-lg border border-white/[0.08] bg-black/30 px-3 text-xs text-white outline-none transition-colors placeholder:text-neutral-600 hover:border-white/20 focus:border-brand-primary/50"
                          />
                        )}
                      </div>

                      <label className="flex min-w-0 flex-col gap-1.5">
                        <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.12em] text-neutral-500">
                          Server Name
                        </span>
                        <input
                          type="text"
                          value={newPlan.server}
                          onChange={(event) =>
                            setNewPlan({ ...newPlan, server: event.target.value })
                          }
                          placeholder="Range4ex-Demo"
                          required
                          className="h-10 w-full rounded-lg border border-white/[0.08] bg-black/30 px-3 text-xs text-white outline-none transition-colors placeholder:text-neutral-600 hover:border-white/20 focus:border-brand-primary/50"
                        />
                      </label>
                    </div>

                    <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
                      <label className="flex min-w-0 flex-col gap-1.5">
                        <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.12em] text-neutral-500">
                          Platform Login
                        </span>
                        <input
                          type="text"
                          value={newPlan.login}
                          onChange={(event) =>
                            setNewPlan({ ...newPlan, login: event.target.value })
                          }
                          placeholder="e.g. 998127"
                          required
                          className="h-10 w-full rounded-lg border border-white/[0.08] bg-black/30 px-3 text-xs text-white outline-none transition-colors placeholder:text-neutral-600 hover:border-white/20 focus:border-brand-primary/50"
                        />
                      </label>
                      <label className="flex min-w-0 flex-col gap-1.5">
                        <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.12em] text-neutral-500">
                          Master Password
                        </span>
                        <input
                          type="text"
                          value={newPlan.password}
                          onChange={(event) =>
                            setNewPlan({
                              ...newPlan,
                              password: event.target.value,
                            })
                          }
                          placeholder="MasterPass123"
                          required
                          className="h-10 w-full rounded-lg border border-white/[0.08] bg-black/30 px-3 text-xs text-white outline-none transition-colors placeholder:text-neutral-600 hover:border-white/20 focus:border-brand-primary/50"
                        />
                      </label>
                      <label className="flex min-w-0 flex-col gap-1.5">
                        <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.12em] text-neutral-500">
                          Graph ID
                          <span className="ml-1 normal-case tracking-normal text-neutral-600">
                            (optional)
                          </span>
                        </span>
                        <input
                          type="text"
                          value={newPlan.externalStatisticsId}
                          onChange={(event) =>
                            setNewPlan({
                              ...newPlan,
                              externalStatisticsId: event.target.value,
                            })
                          }
                          placeholder="mt5-7373031-..."
                          className="h-10 w-full rounded-lg border border-white/[0.08] bg-black/30 px-3 text-xs text-white outline-none transition-colors placeholder:text-neutral-600 hover:border-white/20 focus:border-brand-primary/50"
                        />
                      </label>
                    </div>

                    <label className="flex min-w-0 flex-col gap-1.5">
                      <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.12em] text-neutral-500">
                        Graph Link
                        <span className="ml-1 normal-case tracking-normal text-neutral-600">
                          (optional)
                        </span>
                      </span>
                      <input
                        type="url"
                        value={newPlan.graphLink}
                        onChange={(event) =>
                          setNewPlan({
                            ...newPlan,
                            graphLink: event.target.value,
                          })
                        }
                        placeholder="https://www.myfxbook.com/..."
                        className="h-10 w-full rounded-lg border border-white/[0.08] bg-black/30 px-3 text-xs text-white outline-none transition-colors placeholder:text-neutral-600 hover:border-white/20 focus:border-brand-primary/50"
                      />
                    </label>

                    <div className="flex justify-end gap-2 border-t border-white/[0.06] pt-4">
                      <AdminButton onClick={() => setShowAddForm(false)}>
                        Cancel
                      </AdminButton>
                      <AdminButton variant="primary" type="submit" loading={isBusy("plan-create")}>
                        {!isBusy("plan-create") && <IconPlus size={14} />}
                        Add container
                      </AdminButton>
                    </div>
                  </form>
                </AdminPanel>
              )}

              <AdminPanel flush>
                {(() => {
                  const search = inventorySearch.trim().toLowerCase();
                  const rows = filteredInventoryPlans.filter(
                    (p) =>
                      !search ||
                      [p.login, p.server, p.platform, p.orderId].some((v) =>
                        String(v || "").toLowerCase().includes(search),
                      ),
                  );
                  const selectCls =
                    "h-10 rounded-lg border border-white/[0.08] bg-black/25 px-3 text-xs text-white outline-none transition-colors focus:border-white/25";
                  return (
                    <>
                      <AdminToolbar
                        search={inventorySearch}
                        onSearch={setInventorySearch}
                        placeholder="Search login, server or order ID"
                        filters={[
                          { label: "All", value: "All", count: plans.length },
                          { label: "Available", value: "available", count: availableInventoryCount },
                          { label: "Delivered", value: "delivered", count: usedInventoryCount },
                        ]}
                        filter={inventoryStatusFilter}
                        onFilter={setInventoryStatusFilter}
                        actions={
                          <>
                            <select
                              value={inventoryPlatformFilter}
                              onChange={(e) => setInventoryPlatformFilter(e.target.value)}
                              className={selectCls}
                              aria-label="Platform"
                            >
                              <option value="All" className="bg-neutral-950">All platforms</option>
                              <option value="MT5" className="bg-neutral-950">MT5</option>
                              <option value="MT4" className="bg-neutral-950">MT4</option>
                              <option value="cTrader" className="bg-neutral-950">cTrader</option>
                            </select>
                            <select
                              value={String(inventorySizeFilter)}
                              onChange={(e) =>
                                setInventorySizeFilter(e.target.value === "All" ? "All" : Number(e.target.value))
                              }
                              className={selectCls}
                              aria-label="Account size"
                            >
                              <option value="All" className="bg-neutral-950">All sizes</option>
                              {containerSizeOptions.map((size) => (
                                <option key={size} value={String(size)} className="bg-neutral-950">
                                  ${size.toLocaleString()} · {getAvailableInventoryCountBySize(size)} free
                                </option>
                              ))}
                            </select>
                            <AdminButton
                              variant={showAddForm ? "ghost" : "primary"}
                              onClick={() => setShowAddForm(!showAddForm)}
                            >
                              {showAddForm ? <IconX size={14} /> : <IconPlus size={14} />}
                              {showAddForm ? "Close" : "Add container"}
                            </AdminButton>
                          </>
                        }
                      />

                      {rows.length === 0 ? (
                        <AdminEmptyState
                          icon={<IconBox size={28} />}
                          title="No containers found"
                          hint="Try another search or filter, or add accounts to the pool."
                        />
                      ) : (
                        <>
                          <AdminTable
                            minWidth={980}
                            dense
                            bordered
                            columns={[
                              { key: "account", label: "Account" },
                              { key: "server", label: "Server" },
                              { key: "login", label: "Login" },
                              { key: "password", label: "Password" },
                              { key: "status", label: "Status" },
                              { key: "order", label: "Order" },
                              { key: "added", label: "Added" },
                              { key: "actions", label: "Actions", align: "right" },
                            ]}
                          >
                            {rows.map((p) => {
                              const assignedAccount = accounts.find(
                                (a: any) => String(a.login) === String(p.login),
                              );
                              const initialStatus =
                                p.status || (assignedAccount ? "delivered" : "available");
                              const initialOrderId = p.orderId || assignedAccount?.orderId || "";
                              const isAvailable = initialStatus === "available";
                              const openDetails = () => {
                                setSelectedPlanDetails(p);
                                setIsEditingPlan(false);
                                setContainerGraphForm({
                                  editing: false,
                                  saving: false,
                                  graphLink: p.graphLink || "",
                                  externalStatisticsId: p.externalStatisticsId || "",
                                });
                                setPlanEditForm({
                                  platform: p.platform || "MT5",
                                  size: p.size || 100000,
                                  login: p.login || "",
                                  password: p.password || "",
                                  server: p.server || "",
                                  status: initialStatus,
                                  orderId: initialOrderId,
                                });
                              };

                              return (
                                <tr key={p.id} className={ADMIN_TR}>
                                  <td className={ADMIN_TD}>
                                    <span className="block text-xs font-medium text-white tabular-nums">
                                      ${Number(p.size || 0).toLocaleString()}
                                    </span>
                                    <span className="block text-[11px] text-neutral-500">{p.platform}</span>
                                  </td>
                                  <td className={`text-xs text-neutral-300 ${ADMIN_TD}`}>{p.server || "—"}</td>
                                  <td className={ADMIN_TD}>
                                    <AdminCopyValue
                                      value={String(p.login || "")}
                                      copied={copiedId === `${p.id}-inv-login`}
                                      onCopy={() => handleCopy(String(p.login || ""), `${p.id}-inv-login`)}
                                    />
                                  </td>
                                  <td className={ADMIN_TD}>
                                    <div className="flex items-center gap-1.5">
                                      <span className="font-mono text-xs text-neutral-300">
                                        {revealedPlanPasswords[p.id] ? p.password : "••••••••"}
                                      </span>
                                      <button
                                        type="button"
                                        onClick={() => toggleRevealPassword(p.id)}
                                        title={revealedPlanPasswords[p.id] ? "Hide password" : "Reveal password"}
                                        aria-label={revealedPlanPasswords[p.id] ? "Hide password" : "Reveal password"}
                                        className="text-neutral-500 transition-colors hover:text-white"
                                      >
                                        <IconEye size={12} />
                                      </button>
                                    </div>
                                  </td>
                                  <td className={ADMIN_TD}>
                                    {editingPlanId === p.id ? (
                                      <div className="flex items-center gap-1.5">
                                        <select
                                          value={editPlanStatus}
                                          onChange={(event) => setEditPlanStatus(event.target.value as any)}
                                          className="h-8 rounded-lg border border-white/[0.08] bg-black/40 px-2 text-[11px] text-white outline-none"
                                        >
                                          <option value="available">Available</option>
                                          <option value="delivered">Delivered</option>
                                        </select>
                                        {editPlanStatus === "delivered" && (
                                          <input
                                            type="text"
                                            value={editPlanOrderId}
                                            onChange={(event) => setEditPlanOrderId(event.target.value)}
                                            placeholder="Order ID"
                                            className="h-8 w-28 rounded-lg border border-white/[0.08] bg-black/40 px-2 text-[11px] text-white outline-none placeholder:text-neutral-600"
                                          />
                                        )}
                                        <AdminIconButton
                                          icon={<IconCheck size={13} />}
                                          label="Save status"
                                          loading={isBusy(`plan-status:${p.id}`)}
                                          onClick={() => handleSavePlanStatus(p.id)}
                                        />
                                        <AdminIconButton
                                          icon={<IconX size={13} />}
                                          label="Cancel"
                                          onClick={() => setEditingPlanId(null)}
                                        />
                                      </div>
                                    ) : (
                                      <AdminBadge tone={isAvailable ? "success" : "neutral"}>{isAvailable ? "Available" : "Delivered"}</AdminBadge>
                                    )}
                                  </td>
                                  <td className={`font-mono text-[11px] text-neutral-400 ${ADMIN_TD}`}>
                                    {!isAvailable && initialOrderId ? initialOrderId : "—"}
                                  </td>
                                  <td className={`whitespace-nowrap text-[11px] text-neutral-400 tabular-nums ${ADMIN_TD}`}>
                                    {p.createdAt ? formatOrderDateTime(p.createdAt) : "—"}
                                  </td>
                                  <td className={ADMIN_TD}>
                                    <div className="flex items-center justify-end gap-1.5">
                                      <AdminIconButton
                                        icon={<IconEye size={15} />}
                                        label="View and edit container"
                                        onClick={openDetails}
                                      />
                                      {isBusy(`plan-delete:${p.id}`) ? (
                                        <span className="inline-flex h-8 w-8 items-center justify-center text-neutral-400">
                                          <Spinner size={15} />
                                        </span>
                                      ) : (
                                        <AdminRowMenu
                                          items={[
                                            {
                                              label: "Change status",
                                              icon: <IconSettings size={14} />,
                                              onClick: () => {
                                                setEditingPlanId(p.id);
                                                setEditPlanStatus(initialStatus as any);
                                                setEditPlanOrderId(initialOrderId);
                                              },
                                            },
                                            {
                                              label: "Copy credentials",
                                              icon: <IconCopy size={14} />,
                                              onClick: () => {
                                                handleCopy(
                                                  `Platform: ${p.platform}\nLogin: ${p.login}\nServer: ${p.server}\nPassword: ${p.password}`,
                                                  `${p.id}-inv-all`,
                                                );
                                                adminToast.info("Credentials copied");
                                              },
                                            },
                                            {
                                              label: "Decommission",
                                              icon: <IconTrash size={14} />,
                                              onClick: () => handleDeletePlan(p.id),
                                              tone: "danger",
                                            },
                                          ]}
                                        />
                                      )}
                                    </div>
                                  </td>
                                </tr>
                              );
                            })}
                          </AdminTable>
                          <AdminTableFooter shown={rows.length} total={plans.length} noun="containers" />
                        </>
                      )}
                    </>
                  );
                })()}
              </AdminPanel>
            </div>
          )}

          {/* 4.5 COUPONS MANAGER */}
          {activeSubTab === "coupons" && (
            <div className="space-y-5">
              <AdminPageHeader
                title="Coupons"
                subtitle="Create and retire promotional discount codes."
                onRefresh={fetchCrmData}
                refreshing={refreshing}
              />

              {(() => {
                const isExpired = (c: any) =>
                  Boolean(c.isExpired) || isCouponExpired(c.expiresAt, couponNow);
                const search = couponSearch.trim().toLowerCase();
                const searched = coupons.filter(
                  (c) => !search || String(c.code || "").toLowerCase().includes(search),
                );
                const matches = (c: any, value: string) =>
                  value === "all" ? true : value === "expired" ? isExpired(c) : !isExpired(c);
                const rows = searched
                  .filter((c) => matches(c, couponFilter))
                  .sort(
                    (a, b) =>
                      new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime(),
                  );
                const activeCount = coupons.filter((c) => !isExpired(c)).length;
                const fieldCls =
                  "h-10 w-full rounded-lg border border-white/[0.08] bg-black/25 px-3 text-[13px] text-white outline-none transition-colors placeholder:text-neutral-600 focus:border-white/25";

                return (
                  <>
                    <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
                      <AdminStatCard label="Total coupons" value={coupons.length} hint="All codes in the database" />
                      <AdminStatCard label="Active" value={activeCount} hint="Usable at checkout" />
                      <AdminStatCard label="Expired" value={coupons.length - activeCount} hint="No longer usable" />
                      <AdminStatCard
                        label="Best discount"
                        value={`${Math.max(0, ...coupons.filter((c) => !isExpired(c)).map((c) => Number(c.discountPercent) || 0))}%`}
                        hint="Highest active code"
                      />
                    </div>

                    <AdminPanel flush>
                      <AdminToolbar
                        search={couponSearch}
                        onSearch={setCouponSearch}
                        placeholder="Search coupon code"
                        filters={[
                          { label: "All", value: "all", count: searched.length },
                          { label: "Active", value: "active", count: searched.filter((c) => matches(c, "active")).length },
                          { label: "Expired", value: "expired", count: searched.filter((c) => matches(c, "expired")).length },
                        ]}
                        filter={couponFilter}
                        onFilter={setCouponFilter}
                        actions={
                          <AdminButton variant="primary" onClick={() => setShowCouponForm(true)}>
                            <IconPlus size={14} />
                            New coupon
                          </AdminButton>
                        }
                      />

                      {rows.length === 0 ? (
                        <AdminEmptyState
                          icon={<IconTicket size={28} />}
                          title="No coupons found"
                          hint={
                            coupons.length === 0
                              ? "No coupons in the database. Default codes like LUNAR10 work as fallback."
                              : "Try another search or filter."
                          }
                        />
                      ) : (
                        <>
                          <AdminTable
                            minWidth={760}
                            dense
                            bordered
                            columns={[
                              { key: "code", label: "Code" },
                              { key: "discount", label: "Discount" },
                              { key: "status", label: "Status" },
                              { key: "expires", label: "Expires" },
                              { key: "left", label: "Time left" },
                              { key: "actions", label: "Actions", align: "right" },
                            ]}
                          >
                            {rows.map((c) => {
                              const expired = isExpired(c);
                              return (
                                <tr key={c.code} className={ADMIN_TR}>
                                  <td className={ADMIN_TD}>
                                    <AdminCopyValue
                                      value={String(c.code || "").toUpperCase()}
                                      copied={copiedId === `coupon-${c.code}`}
                                      onCopy={() => handleCopy(String(c.code || ""), `coupon-${c.code}`)}
                                    />
                                  </td>
                                  <td className={`text-xs font-medium text-white tabular-nums ${ADMIN_TD}`}>
                                    {c.discountPercent}% off
                                  </td>
                                  <td className={ADMIN_TD}>
                                    <AdminBadge tone={expired ? "danger" : "success"}>
                                      {expired ? "Expired" : "Active"}
                                    </AdminBadge>
                                  </td>
                                  <td className={`whitespace-nowrap text-[11px] text-neutral-400 ${ADMIN_TD}`}>
                                    {formatCouponExpiry(c.expiresAt)}
                                  </td>
                                  <td
                                    className={`whitespace-nowrap text-[11px] tabular-nums ${expired ? "text-neutral-600" : "text-neutral-300"} ${ADMIN_TD}`}
                                  >
                                    {getCouponTimeLeft(c.expiresAt, couponNow)}
                                  </td>
                                  <td className={ADMIN_TD}>
                                    <div className="flex items-center justify-end">
                                      <AdminIconButton
                                        icon={<IconTrash size={14} />}
                                        label="Delete coupon"
                                        tone="danger"
                                        loading={isBusy(`coupon-delete:${c.code}`)}
                                        onClick={() => handleDeleteCoupon(c.code)}
                                      />
                                    </div>
                                  </td>
                                </tr>
                              );
                            })}
                          </AdminTable>
                          <AdminTableFooter shown={rows.length} total={coupons.length} noun="coupons" />
                        </>
                      )}
                    </AdminPanel>

                    <AdminModal
                      open={showCouponForm}
                      size="sm"
                      busy={isBusy("coupon-create")}
                      onClose={() => setShowCouponForm(false)}
                      title="New coupon"
                      subtitle="Percentage discount applied at challenge checkout."
                      footer={
                        <>
                          <AdminButton onClick={() => setShowCouponForm(false)}>Cancel</AdminButton>
                          <AdminButton
                            variant="primary"
                            type="submit"
                            form="coupon-create-form"
                            loading={isBusy("coupon-create")}
                          >
                            Create coupon
                          </AdminButton>
                        </>
                      }
                    >
                      <form id="coupon-create-form" onSubmit={handleCreateCoupon} className="space-y-4">
                        <label className="block space-y-1.5">
                          <span className="block text-xs font-medium text-neutral-400">Code</span>
                          <input
                            type="text"
                            value={newCoupon.code}
                            onChange={(e) => setNewCoupon({ ...newCoupon, code: e.target.value })}
                            placeholder="e.g. SUMMER25"
                            className={`${fieldCls} font-mono uppercase`}
                            required
                          />
                        </label>
                        <label className="block space-y-1.5">
                          <span className="block text-xs font-medium text-neutral-400">Discount (%)</span>
                          <input
                            type="number"
                            value={newCoupon.discountPercent}
                            onChange={(e) =>
                              setNewCoupon({ ...newCoupon, discountPercent: Number(e.target.value) })
                            }
                            className={fieldCls}
                            required
                            min="1"
                            max="100"
                          />
                        </label>
                        <label className="block space-y-1.5">
                          <span className="block text-xs font-medium text-neutral-400">Expires at</span>
                          <input
                            type="datetime-local"
                            value={newCoupon.expiresAt}
                            onChange={(e) => setNewCoupon({ ...newCoupon, expiresAt: e.target.value })}
                            className={fieldCls}
                            required
                          />
                          <span className="block text-[11px] text-neutral-500">
                            The code stops working automatically after this time.
                          </span>
                        </label>
                      </form>
                    </AdminModal>
                  </>
                );
              })()}
            </div>
          )}

          {/* 4.6 OFFERS MANAGER (BOGO / FREE RETRY) */}
          {activeSubTab === "offers" && (
            <div className="space-y-5">
              <AdminPageHeader
                title="Offers"
                subtitle="Buy-one-get-one bundles and free retries, scoped to the accounts and traders you choose."
                onRefresh={fetchCrmData}
                refreshing={refreshing}
              />

              {(offerMessage || (offerError && !showOfferForm)) && (
                <div
                  className={`rounded-xl border px-4 py-3 text-xs ${
                    offerError
                      ? "border-red-500/25 bg-red-500/10 text-red-200"
                      : "border-emerald-500/25 bg-emerald-500/10 text-emerald-200"
                  }`}
                >
                  {offerError || offerMessage}
                </div>
              )}

              <AdminModal
                open={showOfferForm}
                size="xl"
                busy={savingOffer}
                onClose={() => setShowOfferForm(false)}
                title={offerForm.id ? "Edit offer" : "New offer"}
                subtitle={
                  offerForm.id
                    ? "Editing an existing offer — redemptions are preserved."
                    : "Offers are applied automatically at checkout to the accounts they match."
                }
                footer={
                  <>
                    <AdminButton onClick={() => setShowOfferForm(false)} disabled={savingOffer}>
                      Cancel
                    </AdminButton>
                    <AdminButton variant="primary" type="submit" form="offer-form" loading={savingOffer}>
                      {offerForm.id ? "Update offer" : "Publish offer"}
                    </AdminButton>
                  </>
                }
              >
                {offerError && (
                  <div className="mb-4 rounded-xl border border-rose-500/25 bg-rose-500/10 px-4 py-3 text-xs text-rose-200">
                    {offerError}
                  </div>
                )}
              <form id="offer-form" onSubmit={handleSaveOffer} className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
                  {/* Left Panel: Offer basics */}
                  <div className="lg:col-span-1 dash-card p-5 space-y-5">
                    <div>
                      <h3 className="text-sm font-bold text-white tracking-tight flex items-center gap-2">
                        <span className="h-2 w-2 rounded-full bg-fuchsia-500 shadow-[0_0_8px_rgba(217,70,239,0.6)]" />
                        <span>{offerForm.id ? "Edit Offer" : "Offer Builder"}</span>
                      </h3>
                      <p className="text-[10px] text-neutral-450 mt-1 font-mono">
                        {offerForm.id
                          ? "Editing an existing offer — redemptions are preserved."
                          : "Bundle deals that a percentage coupon cannot express."}
                      </p>
                    </div>

                    <div className="space-y-2">
                      <label className="text-neutral-500 text-[10px] uppercase font-bold block font-mono">
                        Offer Type
                      </label>
                      {OFFER_TYPE_OPTIONS.map((option) => {
                        const selected = offerForm.type === option.value;
                        return (
                          <button
                            key={option.value}
                            type="button"
                            aria-pressed={selected}
                            onClick={() =>
                              setOfferForm({ ...offerForm, type: option.value })
                            }
                            className={`w-full rounded-xl border p-3 text-left transition-all ${
                              selected
                                ? "border-fuchsia-500/40 bg-fuchsia-500/10"
                                : "border-white/5 bg-neutral-950/60 hover:border-white/15"
                            }`}
                          >
                            <span className="flex items-center gap-2 text-xs font-bold text-white">
                              <IconGift
                                size={14}
                                className={
                                  selected ? "text-fuchsia-300" : "text-neutral-500"
                                }
                              />
                              {option.label}
                            </span>
                            <span className="mt-1 block text-[10px] leading-relaxed text-neutral-500">
                              {option.hint}
                            </span>
                          </button>
                        );
                      })}
                    </div>

                    <div className="space-y-4 text-xs font-mono text-neutral-400">
                      <div className="space-y-1">
                        <label className="text-neutral-500 text-[10px] uppercase font-bold block">
                          Offer Name
                        </label>
                        <input
                          type="text"
                          value={offerForm.name}
                          onChange={(e) =>
                            setOfferForm({ ...offerForm, name: e.target.value })
                          }
                          placeholder="e.g. Black Friday BOGO"
                          className="w-full px-3 py-2.5 rounded-xl bg-neutral-950 border border-white/5 text-white outline-none focus:border-white/10 text-sm font-semibold font-mono"
                          required
                        />
                      </div>

                      <p className="text-[10px] leading-relaxed text-emerald-300/80 bg-emerald-500/5 border border-emerald-500/15 rounded-xl px-3 py-2">
                        Offers apply automatically to every trader and account in
                        scope while live — no code needed. Coupon codes only give
                        a price discount at checkout.
                      </p>

                      {offerForm.type === "bogo" ? (
                        <div className="grid grid-cols-2 gap-3">
                          <div className="space-y-1">
                            <label className="text-neutral-500 text-[10px] uppercase font-bold block">
                              Buy Qty
                            </label>
                            <input
                              type="number"
                              min="1"
                              max="10"
                              value={offerForm.buyQuantity}
                              onChange={(e) =>
                                setOfferForm({
                                  ...offerForm,
                                  buyQuantity: Number(e.target.value),
                                })
                              }
                              className="w-full px-3 py-2.5 rounded-xl bg-neutral-950 border border-white/5 text-white outline-none focus:border-white/10 text-sm font-semibold font-mono"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-neutral-500 text-[10px] uppercase font-bold block">
                              Free Qty
                            </label>
                            <input
                              type="number"
                              min="1"
                              max="10"
                              value={offerForm.freeQuantity}
                              onChange={(e) =>
                                setOfferForm({
                                  ...offerForm,
                                  freeQuantity: Number(e.target.value),
                                })
                              }
                              className="w-full px-3 py-2.5 rounded-xl bg-neutral-950 border border-white/5 text-white outline-none focus:border-white/10 text-sm font-semibold font-mono"
                            />
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-1">
                          <label className="text-neutral-500 text-[10px] uppercase font-bold block">
                            Free Retries Per Account
                          </label>
                          <input
                            type="number"
                            min="1"
                            max="10"
                            value={offerForm.retryLimit}
                            onChange={(e) =>
                              setOfferForm({
                                ...offerForm,
                                retryLimit: Number(e.target.value),
                              })
                            }
                            className="w-full px-3 py-2.5 rounded-xl bg-neutral-950 border border-white/5 text-white outline-none focus:border-white/10 text-sm font-semibold font-mono"
                          />
                          <p className="text-[9px] text-neutral-500">
                            How many times a failed challenge in scope can be restarted
                            for free.
                          </p>
                        </div>
                      )}

                      <div className="space-y-1">
                        <label className="text-neutral-500 text-[10px] uppercase font-bold block">
                          Max Redemptions
                        </label>
                        <input
                          type="number"
                          min="0"
                          value={offerForm.maxRedemptions}
                          onChange={(e) =>
                            setOfferForm({
                              ...offerForm,
                              maxRedemptions: Number(e.target.value),
                            })
                          }
                          className="w-full px-3 py-2.5 rounded-xl bg-neutral-950 border border-white/5 text-white outline-none focus:border-white/10 text-sm font-semibold font-mono"
                        />
                        <p className="text-[9px] text-neutral-500">
                          0 means unlimited redemptions.
                        </p>
                      </div>

                      <div className="grid grid-cols-1 gap-3">
                        <div className="space-y-1">
                          <label className="text-neutral-500 text-[10px] uppercase font-bold block">
                            Starts (optional)
                          </label>
                          <input
                            type="datetime-local"
                            value={offerForm.startsAt}
                            onChange={(e) =>
                              setOfferForm({ ...offerForm, startsAt: e.target.value })
                            }
                            className="w-full px-3 py-2.5 rounded-xl bg-neutral-950 border border-white/5 text-white outline-none focus:border-white/10 text-sm font-semibold font-mono"
                          />
                          {offerForm.startsAt &&
                          new Date(offerForm.startsAt).getTime() > Date.now() ? (
                            <p className="text-[9px] text-sky-300">
                              Scheduled — goes live in{" "}
                              {formatTimeUntil(new Date(offerForm.startsAt).toISOString())}. Clear
                              this field to start immediately.
                            </p>
                          ) : (
                            <p className="text-[9px] text-neutral-500">
                              Leave blank to start immediately.
                            </p>
                          )}
                        </div>
                        <div className="space-y-1">
                          <label className="text-neutral-500 text-[10px] uppercase font-bold block">
                            Expires
                          </label>
                          <input
                            type="datetime-local"
                            value={offerForm.expiresAt}
                            onChange={(e) =>
                              setOfferForm({ ...offerForm, expiresAt: e.target.value })
                            }
                            className="w-full px-3 py-2.5 rounded-xl bg-neutral-950 border border-white/5 text-white outline-none focus:border-white/10 text-sm font-semibold font-mono"
                          />
                          <p className="text-[9px] text-neutral-500">
                            Leave blank for an offer that never expires.
                          </p>
                        </div>
                      </div>

                      <div className="space-y-1">
                        <label className="text-neutral-500 text-[10px] uppercase font-bold block">
                          Launch State
                        </label>
                        <div className="flex gap-2">
                          {(["active", "paused"] as const).map((state) => (
                            <button
                              key={state}
                              type="button"
                              aria-pressed={offerForm.status === state}
                              onClick={() =>
                                setOfferForm({ ...offerForm, status: state })
                              }
                              className={`flex-1 rounded-xl border px-3 py-2 text-[11px] font-bold uppercase transition-all ${
                                offerForm.status === state
                                  ? state === "active"
                                    ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-300"
                                    : "border-amber-500/40 bg-amber-500/10 text-amber-300"
                                  : "border-white/5 bg-neutral-950/60 text-neutral-500 hover:border-white/15"
                              }`}
                            >
                              {state}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="space-y-1">
                        <label className="text-neutral-500 text-[10px] uppercase font-bold block">
                          Internal Note (optional)
                        </label>
                        <textarea
                          value={offerForm.description}
                          onChange={(e) =>
                            setOfferForm({
                              ...offerForm,
                              description: e.target.value,
                            })
                          }
                          rows={3}
                          placeholder="Who this is for, what it replaces…"
                          className="w-full resize-y px-3 py-2.5 rounded-xl bg-neutral-950 border border-white/5 text-white outline-none focus:border-white/10 text-xs font-mono"
                        />
                      </div>
                    </div>

                  </div>

                  {/* Right Panel: Scope — which accounts and which traders */}
                  <div className="lg:col-span-2 space-y-4">
                    <div className="dash-card p-5 space-y-5">
                      <div>
                        <h3 className="text-sm font-bold text-white tracking-tight flex items-center gap-2">
                          <IconTarget size={16} className="text-fuchsia-400" />
                          <span>Apply On Specific Accounts</span>
                        </h3>
                        <p className="text-[10px] text-neutral-450 mt-1 font-mono">
                          Leave a group untouched to apply the offer to all of it.
                        </p>
                      </div>

                      <div className="space-y-2">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <label className="text-neutral-500 text-[10px] uppercase font-bold font-mono">
                            Account Sizes
                          </label>
                          <span className="text-[9px] font-mono text-neutral-500">
                            {offerForm.accountSizes.length === 0
                              ? "All sizes"
                              : `${offerForm.accountSizes.length} selected`}
                            {offerForm.accountSizes.length > 0 && (
                              <button
                                type="button"
                                onClick={() =>
                                  setOfferForm({ ...offerForm, accountSizes: [] })
                                }
                                className="ml-2 text-fuchsia-400 hover:text-fuchsia-300 cursor-pointer"
                              >
                                Clear
                              </button>
                            )}
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {offerCatalogSizes.map((size) => {
                            const selected = offerForm.accountSizes.includes(size);
                            return (
                              <button
                                key={size}
                                type="button"
                                aria-pressed={selected}
                                onClick={() =>
                                  toggleOfferScopeValue("accountSizes", size)
                                }
                                className={`rounded-lg border px-3 py-2 text-[11px] font-bold font-mono transition-all ${
                                  selected
                                    ? "border-fuchsia-500/40 bg-fuchsia-500/15 text-white"
                                    : "border-white/5 bg-neutral-950/60 text-neutral-400 hover:border-white/20"
                                }`}
                              >
                                ${size.toLocaleString()}
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <label className="text-neutral-500 text-[10px] uppercase font-bold font-mono">
                            Challenge Models
                          </label>
                          <span className="text-[9px] font-mono text-neutral-500">
                            {offerForm.models.length === 0
                              ? "All models"
                              : `${offerForm.models.length} selected`}
                            {offerForm.models.length > 0 && (
                              <button
                                type="button"
                                onClick={() =>
                                  setOfferForm({ ...offerForm, models: [] })
                                }
                                className="ml-2 text-fuchsia-400 hover:text-fuchsia-300 cursor-pointer"
                              >
                                Clear
                              </button>
                            )}
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {BUY_CHALLENGE_TYPES.map((model) => {
                            const selected = offerForm.models.includes(model);
                            return (
                              <button
                                key={model}
                                type="button"
                                aria-pressed={selected}
                                onClick={() => toggleOfferScopeValue("models", model)}
                                className={`rounded-lg border px-3 py-2 text-[11px] font-bold font-mono transition-all ${
                                  selected
                                    ? "border-fuchsia-500/40 bg-fuchsia-500/15 text-white"
                                    : "border-white/5 bg-neutral-950/60 text-neutral-400 hover:border-white/20"
                                }`}
                              >
                                {model}
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                        {/* Specific traders */}
                        <div className="space-y-2">
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <label className="text-neutral-500 text-[10px] uppercase font-bold font-mono">
                              Specific Traders
                            </label>
                            <span className="text-[9px] font-mono text-neutral-500">
                              {offerForm.userIds.length === 0
                                ? "All traders"
                                : `${offerForm.userIds.length} selected`}
                              {offerForm.userIds.length > 0 && (
                                <button
                                  type="button"
                                  onClick={() =>
                                    setOfferForm({ ...offerForm, userIds: [] })
                                  }
                                  className="ml-2 text-fuchsia-400 hover:text-fuchsia-300 cursor-pointer"
                                >
                                  Clear
                                </button>
                              )}
                            </span>
                          </div>
                          <input
                            type="text"
                            value={offerUserSearch}
                            onChange={(e) => setOfferUserSearch(e.target.value)}
                            placeholder="Search name or email…"
                            className="w-full px-3 py-2 rounded-lg bg-neutral-950 border border-white/5 text-white outline-none focus:border-white/10 text-xs font-mono"
                          />
                          <div className="max-h-[210px] overflow-y-auto rounded-xl border border-white/5 bg-neutral-950/40 divide-y divide-white/5">
                            {offerFilteredUsers.length > 0 ? (
                              offerFilteredUsers.slice(0, 100).map((user: any) => {
                                const selected = offerForm.userIds.includes(user.id);
                                return (
                                  <button
                                    key={user.id}
                                    type="button"
                                    onClick={() =>
                                      toggleOfferScopeValue("userIds", user.id)
                                    }
                                    className="flex w-full items-center justify-between gap-3 px-3 py-2 text-left hover:bg-white/[0.03] transition-colors cursor-pointer"
                                  >
                                    <span className="min-w-0">
                                      <span className="block truncate text-xs font-medium text-white">
                                        {user.name || "Unnamed"}
                                      </span>
                                      <span className="block truncate text-[10px] text-neutral-500 font-mono">
                                        {user.email}
                                      </span>
                                    </span>
                                    <span
                                      className={`h-4 w-4 shrink-0 rounded-md border flex items-center justify-center transition-all ${
                                        selected
                                          ? "bg-fuchsia-500 border-fuchsia-500 text-white"
                                          : "border-white/20"
                                      }`}
                                    >
                                      {selected && <IconCheck size={10} />}
                                    </span>
                                  </button>
                                );
                              })
                            ) : (
                              <p className="px-3 py-6 text-center text-[11px] text-neutral-500 font-mono">
                                No traders match this search.
                              </p>
                            )}
                          </div>
                          {offerForm.userIds.length > 0 && (
                            <div className="flex flex-wrap gap-1.5">
                              {offerForm.userIds.map((userId) => (
                                <span
                                  key={userId}
                                  className="inline-flex items-center gap-1.5 rounded-md border border-fuchsia-500/20 bg-fuchsia-500/10 px-2 py-1 text-[9px] font-mono text-fuchsia-200"
                                >
                                  {offerUserLabel(userId)}
                                  <button
                                    type="button"
                                    onClick={() =>
                                      toggleOfferScopeValue("userIds", userId)
                                    }
                                    className="text-fuchsia-300 hover:text-white cursor-pointer"
                                    aria-label={`Remove ${offerUserLabel(userId)}`}
                                  >
                                    <IconX size={9} />
                                  </button>
                                </span>
                              ))}
                            </div>
                          )}
                        </div>

                        {/* Specific live accounts */}
                        <div className="space-y-2">
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <label className="text-neutral-500 text-[10px] uppercase font-bold font-mono">
                              Specific Trading Accounts
                            </label>
                            <span className="text-[9px] font-mono text-neutral-500">
                              {offerForm.accountIds.length === 0
                                ? "Not pinned"
                                : `${offerForm.accountIds.length} selected`}
                              {offerForm.accountIds.length > 0 && (
                                <button
                                  type="button"
                                  onClick={() =>
                                    setOfferForm({ ...offerForm, accountIds: [] })
                                  }
                                  className="ml-2 text-fuchsia-400 hover:text-fuchsia-300 cursor-pointer"
                                >
                                  Clear
                                </button>
                              )}
                            </span>
                          </div>
                          <input
                            type="text"
                            value={offerAccountSearch}
                            onChange={(e) => setOfferAccountSearch(e.target.value)}
                            placeholder="Search login, owner, or status…"
                            className="w-full px-3 py-2 rounded-lg bg-neutral-950 border border-white/5 text-white outline-none focus:border-white/10 text-xs font-mono"
                          />
                          <div className="max-h-[210px] overflow-y-auto rounded-xl border border-white/5 bg-neutral-950/40 divide-y divide-white/5">
                            {offerFilteredAccounts.length > 0 ? (
                              offerFilteredAccounts
                                .slice(0, 100)
                                .map((account: any) => {
                                  const selected = offerForm.accountIds.includes(
                                    account.id,
                                  );
                                  const owner = users.find(
                                    (user: any) => user.id === account.userId,
                                  );
                                  return (
                                    <button
                                      key={account.id}
                                      type="button"
                                      onClick={() =>
                                        toggleOfferScopeValue("accountIds", account.id)
                                      }
                                      className="flex w-full items-center justify-between gap-3 px-3 py-2 text-left hover:bg-white/[0.03] transition-colors cursor-pointer"
                                    >
                                      <span className="min-w-0">
                                        <span className="block truncate text-xs font-medium text-white font-mono">
                                          {account.platform || "MT5"} ·{" "}
                                          {account.login || account.id}
                                        </span>
                                        <span className="block truncate text-[10px] text-neutral-500">
                                          {owner?.name || owner?.email || "Unassigned"} ·{" "}
                                          {account.status || "Active"}
                                        </span>
                                      </span>
                                      <span
                                        className={`h-4 w-4 shrink-0 rounded-md border flex items-center justify-center transition-all ${
                                          selected
                                            ? "bg-fuchsia-500 border-fuchsia-500 text-white"
                                            : "border-white/20"
                                        }`}
                                      >
                                        {selected && <IconCheck size={10} />}
                                      </span>
                                    </button>
                                  );
                                })
                            ) : (
                              <p className="px-3 py-6 text-center text-[11px] text-neutral-500 font-mono">
                                No accounts match this search.
                              </p>
                            )}
                          </div>
                          <p className="text-[9px] text-neutral-500 font-mono">
                            Pinning accounts is how a free retry reaches one trader&apos;s
                            failed challenge instead of the whole size bracket.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </form>
              </AdminModal>

              {/* Offers ledger */}
              {(() => {
                const search = offerSearch.trim().toLowerCase();
                const searched = offers.filter(
                  (offer: any) =>
                    !search ||
                    [offer.name, offer.description, offer.id].some((v) =>
                      String(v || "").toLowerCase().includes(search),
                    ),
                );
                const stateCount = (value: string) =>
                  searched.filter(
                    (offer: any) => value === "all" || getOfferState(offer, couponNow) === value,
                  ).length;
                const rows = searched.filter(
                  (offer: any) =>
                    offerStateFilter === "all" || getOfferState(offer, couponNow) === offerStateFilter,
                );
                const stateTone = (state: string) =>
                  state === "active"
                    ? "success"
                    : state === "paused"
                      ? "warning"
                      : state === "scheduled"
                        ? "info"
                        : state === "expired"
                          ? "danger"
                          : "neutral";
                return (
                  <>
                    <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
                      <AdminStatCard label="Live offers" value={activeOffersCount} hint="Auto-applied at checkout" />
                      <AdminStatCard
                        label="Scheduled"
                        value={offers.filter((o: any) => getOfferState(o, couponNow) === "scheduled").length}
                        hint="Start later"
                      />
                      <AdminStatCard
                        label="Paused"
                        value={offers.filter((o: any) => o.status === "paused").length}
                        hint="Switched off"
                      />
                      <AdminStatCard
                        label="Redemptions"
                        value={offers.reduce((sum: number, o: any) => sum + (Number(o.redeemedCount) || 0), 0)}
                        hint="Across all offers"
                      />
                    </div>

                    <AdminPanel flush>
                      <AdminToolbar
                        search={offerSearch}
                        onSearch={setOfferSearch}
                        placeholder="Search offer name"
                        filters={[
                          { label: "All", value: "all", count: stateCount("all") },
                          { label: "Live", value: "active", count: stateCount("active") },
                          { label: "Scheduled", value: "scheduled", count: stateCount("scheduled") },
                          { label: "Paused", value: "paused", count: stateCount("paused") },
                          { label: "Expired", value: "expired", count: stateCount("expired") },
                          { label: "Used up", value: "exhausted", count: stateCount("exhausted") },
                        ]}
                        filter={offerStateFilter}
                        onFilter={setOfferStateFilter}
                        actions={
                          <AdminButton variant="primary" onClick={openNewOffer}>
                            <IconPlus size={14} />
                            New offer
                          </AdminButton>
                        }
                      />

                      {rows.length === 0 ? (
                        <AdminEmptyState
                          icon={<IconGift size={28} />}
                          title="No offers found"
                          hint={offers.length === 0 ? "Create a BOGO bundle or a free retry." : "Try another search or filter."}
                        />
                      ) : (
                        <>
                          <AdminTable
                            minWidth={1180}
                            dense
                            bordered
                            columns={[
                              { key: "offer", label: "Offer" },
                              { key: "type", label: "Type" },
                              { key: "applies", label: "Applies to" },
                              { key: "targets", label: "Targets" },
                              { key: "window", label: "Window" },
                              { key: "redeemed", label: "Redeemed" },
                              { key: "status", label: "Status" },
                              { key: "actions", label: "Actions", align: "right" },
                            ]}
                          >
                            {rows.map((offer: any) => {
                              const state = getOfferState(offer, couponNow);
                              const busyOffer = isBusy(`offer:${offer.id}`);
                              return (
                                <tr key={offer.id} className={ADMIN_TR}>
                                  <td className={`max-w-[260px] ${ADMIN_TD}`}>
                                    <button
                                      type="button"
                                      onClick={() => startEditOffer(offer)}
                                      className="block max-w-full truncate text-left text-xs font-medium text-white hover:underline"
                                    >
                                      {offer.name}
                                    </button>
                                    <span className="block truncate text-[11px] text-neutral-500" title={describeOffer(offer)}>
                                      {describeOffer(offer)}
                                    </span>
                                  </td>
                                  <td className={ADMIN_TD}>
                                    <AdminBadge tone="accent">
                                      {offer.type === "free_retry" ? "Free retry" : "BOGO"}
                                    </AdminBadge>
                                  </td>
                                  <td className={`max-w-[200px] ${ADMIN_TD}`}>
                                    <span className="block truncate text-xs text-neutral-300">
                                      {offer.accountSizes?.length
                                        ? offer.accountSizes
                                            .map((size: number) => `$${Number(size).toLocaleString()}`)
                                            .join(", ")
                                        : "All sizes"}
                                    </span>
                                    <span className="block truncate text-[11px] text-neutral-500">
                                      {offer.models?.length ? offer.models.join(", ") : "All models"}
                                    </span>
                                  </td>
                                  <td className={`max-w-[180px] ${ADMIN_TD}`}>
                                    <span className="block truncate text-xs text-neutral-300">
                                      {offer.userIds?.length
                                        ? offer.userIds.length === 1
                                          ? offerUserLabel(offer.userIds[0])
                                          : `${offer.userIds.length} traders`
                                        : "All traders"}
                                    </span>
                                    <span className="block truncate text-[11px] text-neutral-500">
                                      {offer.accountIds?.length
                                        ? offer.accountIds.length === 1
                                          ? offerAccountLabel(offer.accountIds[0])
                                          : `${offer.accountIds.length} accounts pinned`
                                        : "No accounts pinned"}
                                    </span>
                                  </td>
                                  <td className={`whitespace-nowrap text-[11px] text-neutral-400 ${ADMIN_TD}`}>
                                    <span className="block">
                                      {offer.startsAt ? formatCouponExpiry(offer.startsAt) : "Immediate"}
                                    </span>
                                    <span className="block text-neutral-500">
                                      → {offer.expiresAt ? formatCouponExpiry(offer.expiresAt) : "No expiry"}
                                    </span>
                                  </td>
                                  <td className={`whitespace-nowrap text-xs text-white tabular-nums ${ADMIN_TD}`}>
                                    {Number(offer.redeemedCount) || 0}
                                    <span className="text-neutral-500">
                                      {Number(offer.maxRedemptions) > 0 ? ` / ${offer.maxRedemptions}` : " / ∞"}
                                    </span>
                                  </td>
                                  <td className={ADMIN_TD}>
                                    {busyOffer ? (
                                      <span className="inline-flex items-center gap-1.5 text-[11px] text-neutral-400">
                                        <Spinner size={11} /> Updating…
                                      </span>
                                    ) : (
                                      <AdminBadge tone={stateTone(state)}>
                                        {state === "scheduled" && offer.startsAt
                                          ? `Starts in ${formatTimeUntil(offer.startsAt)}`
                                          : state === "active"
                                            ? "Live"
                                            : state === "exhausted"
                                              ? "Used up"
                                              : state}
                                      </AdminBadge>
                                    )}
                                  </td>
                                  <td className={ADMIN_TD}>
                                    <div className="flex items-center justify-end gap-1.5">
                                      <AdminButton onClick={() => startEditOffer(offer)} disabled={busyOffer}>
                                        Edit
                                      </AdminButton>
                                      <AdminRowMenu
                                        items={[
                                          {
                                            label: offer.status === "paused" ? "Resume offer" : "Pause offer",
                                            icon: <IconSettings size={14} />,
                                            onClick: () => handleToggleOfferStatus(offer),
                                            disabled: busyOffer,
                                          },
                                          ...(state === "scheduled"
                                            ? [
                                                {
                                                  label: "Go live now",
                                                  icon: <IconCheck size={14} />,
                                                  onClick: () => handleGoLiveNow(offer),
                                                  disabled: busyOffer,
                                                },
                                              ]
                                            : []),
                                          {
                                            label: "Delete offer",
                                            icon: <IconTrash size={14} />,
                                            onClick: () => handleDeleteOffer(offer),
                                            tone: "danger" as const,
                                            disabled: busyOffer,
                                          },
                                        ]}
                                      />
                                    </div>
                                  </td>
                                </tr>
                              );
                            })}
                          </AdminTable>
                          <AdminTableFooter shown={rows.length} total={offers.length} noun="offers" />
                        </>
                      )}
                    </AdminPanel>
                  </>
                );
              })()}
            </div>
          )}

          {/* 4.7 SIZES & PRICING CATALOG MANAGER */}
          {activeSubTab === "pricing" && (
            <div className="space-y-5">
              <AdminPageHeader
                title="Sizes & pricing"
                subtitle="The account sizes and prices offered in the purchase flow."
                onRefresh={fetchCrmData}
                refreshing={refreshing}
              />

              {(() => {
                const catalog = pricingPlans.filter((p) =>
                  BUY_CHALLENGE_TYPES.includes(getChallengeRule(p.model).buyLabel),
                );
                const search = pricingSearch.trim().toLowerCase();
                const searched = catalog.filter(
                  (p) =>
                    !search ||
                    [p.model, getChallengeRule(p.model).buyLabel, String(p.size), String(p.price)].some((v) =>
                      String(v || "").toLowerCase().includes(search),
                    ),
                );
                const rows = searched
                  .filter((p) => pricingModelFilter === "all" || getChallengeRule(p.model).buyLabel === pricingModelFilter)
                  .sort(
                    (a, b) =>
                      String(getChallengeRule(a.model).buyLabel).localeCompare(String(getChallengeRule(b.model).buyLabel)) ||
                      Number(a.size) - Number(b.size),
                  );
                const prices = catalog.map((p) => Number(p.price) || 0);
                const fieldCls =
                  "h-10 w-full rounded-lg border border-white/[0.08] bg-black/25 px-3 text-[13px] text-white outline-none transition-colors placeholder:text-neutral-600 focus:border-white/25";

                return (
                  <>
                    <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
                      <AdminStatCard label="Catalog products" value={catalog.length} hint="Sizes on sale" />
                      <AdminStatCard
                        label="Challenge models"
                        value={new Set(catalog.map((p) => getChallengeRule(p.model).buyLabel)).size}
                        hint={BUY_CHALLENGE_TYPES.join(" · ")}
                      />
                      <AdminStatCard
                        label="Lowest price"
                        value={prices.length ? formatMoney(Math.min(...prices)) : "—"}
                        hint="Cheapest entry"
                      />
                      <AdminStatCard
                        label="Highest price"
                        value={prices.length ? formatMoney(Math.max(...prices)) : "—"}
                        hint="Largest account"
                      />
                    </div>

                    {pricingCatalogMessage && (
                      <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/[0.08] px-4 py-3 text-xs text-emerald-300">
                        {pricingCatalogMessage}
                      </div>
                    )}

                    <AdminPanel flush>
                      <AdminToolbar
                        search={pricingSearch}
                        onSearch={setPricingSearch}
                        placeholder="Search model, size or price"
                        filters={[
                          { label: "All", value: "all", count: searched.length },
                          ...BUY_CHALLENGE_TYPES.map((type) => ({
                            label: type,
                            value: type,
                            count: searched.filter((p) => getChallengeRule(p.model).buyLabel === type).length,
                          })),
                        ]}
                        filter={pricingModelFilter}
                        onFilter={setPricingModelFilter}
                        actions={
                          <AdminButton variant="primary" onClick={() => setShowPricingForm(true)}>
                            <IconPlus size={14} />
                            Add size
                          </AdminButton>
                        }
                      />

                      {rows.length === 0 ? (
                        <AdminEmptyState
                          icon={<IconCreditCard size={28} />}
                          title="No pricing plans found"
                          hint={
                            catalog.length === 0
                              ? "Add a size before traders can purchase a challenge."
                              : "Try another search or filter."
                          }
                        />
                      ) : (
                        <>
                          <AdminTable
                            minWidth={720}
                            dense
                            bordered
                            columns={[
                              { key: "model", label: "Model" },
                              { key: "size", label: "Account size" },
                              { key: "price", label: "Price" },
                              { key: "ratio", label: "Fee / size" },
                              { key: "actions", label: "Actions", align: "right" },
                            ]}
                          >
                            {rows.map((p) => {
                              const accountType = getChallengeRule(p.model).buyLabel;
                              const editing = editingPricingPlanId === p.id;
                              const saving = savingPricingPlanId === p.id;
                              return (
                                <tr key={p.id} className={ADMIN_TR}>
                                  <td className={ADMIN_TD}>
                                    <AdminBadge
                                      tone={
                                        accountType === "Instant"
                                          ? "success"
                                          : accountType === "One Step"
                                            ? "info"
                                            : accountType === "Two Step"
                                              ? "warning"
                                              : "neutral"
                                      }
                                    >
                                      {accountType}
                                    </AdminBadge>
                                  </td>
                                  <td className={`text-xs font-medium text-white tabular-nums ${ADMIN_TD}`}>
                                    ${Number(p.size).toLocaleString()}
                                  </td>
                                  <td className={ADMIN_TD}>
                                    {editing ? (
                                      <div className="flex items-center gap-1.5">
                                        <span className="text-xs text-neutral-500">$</span>
                                        <input
                                          type="number"
                                          autoFocus
                                          value={editingPricingPlanPrice}
                                          onChange={(e) => setEditingPricingPlanPrice(e.target.value)}
                                          onKeyDown={(e) => {
                                            if (e.key === "Enter") {
                                              e.preventDefault();
                                              handleUpdatePricingPlanPrice(p);
                                            } else if (e.key === "Escape") {
                                              e.preventDefault();
                                              cancelEditingPricingPlan();
                                            }
                                          }}
                                          min="0"
                                          className="h-8 w-24 rounded-lg border border-white/20 bg-black/40 px-2 text-xs text-white outline-none focus:border-white/40"
                                        />
                                      </div>
                                    ) : (
                                      <span className="text-xs font-medium text-white tabular-nums">
                                        {formatMoney(Number(p.price) || 0)}
                                      </span>
                                    )}
                                  </td>
                                  <td className={`text-[11px] text-neutral-400 tabular-nums ${ADMIN_TD}`}>
                                    {Number(p.size) > 0
                                      ? `${((Number(p.price) / Number(p.size)) * 100).toFixed(2)}%`
                                      : "—"}
                                  </td>
                                  <td className={ADMIN_TD}>
                                    <div className="flex items-center justify-end gap-1.5">
                                      {editing ? (
                                        <>
                                          <AdminButton
                                            variant="primary"
                                            loading={saving}
                                            onClick={() => handleUpdatePricingPlanPrice(p)}
                                          >
                                            Save
                                          </AdminButton>
                                          <AdminButton onClick={cancelEditingPricingPlan} disabled={saving}>
                                            Cancel
                                          </AdminButton>
                                        </>
                                      ) : (
                                        <>
                                          <AdminButton onClick={() => startEditingPricingPlan(p)}>
                                            Edit price
                                          </AdminButton>
                                          <AdminIconButton
                                            icon={<IconTrash size={14} />}
                                            label="Delete size"
                                            tone="danger"
                                            loading={isBusy(`pricing-delete:${p.id}`)}
                                            onClick={() => handleDeletePricingPlan(p.id)}
                                          />
                                        </>
                                      )}
                                    </div>
                                  </td>
                                </tr>
                              );
                            })}
                          </AdminTable>
                          <AdminTableFooter shown={rows.length} total={catalog.length} noun="sizes" />
                        </>
                      )}
                    </AdminPanel>

                    <AdminModal
                      open={showPricingForm}
                      size="sm"
                      busy={isBusy("pricing-create")}
                      onClose={() => setShowPricingForm(false)}
                      title="Add size"
                      subtitle="Adds a size and price to the purchase flow."
                      footer={
                        <>
                          <AdminButton onClick={() => setShowPricingForm(false)}>Cancel</AdminButton>
                          <AdminButton
                            variant="primary"
                            type="submit"
                            form="pricing-create-form"
                            loading={isBusy("pricing-create")}
                          >
                            Add to catalog
                          </AdminButton>
                        </>
                      }
                    >
                      <form id="pricing-create-form" onSubmit={handleCreatePricingPlan} className="space-y-4">
                        <label className="block space-y-1.5">
                          <span className="block text-xs font-medium text-neutral-400">Challenge model</span>
                          <select
                            value={newPricingPlan.model}
                            onChange={(e) => setNewPricingPlan({ ...newPricingPlan, model: e.target.value })}
                            className={fieldCls}
                          >
                            {BUY_CHALLENGE_TYPES.map((type) => (
                              <option key={type} value={type} className="bg-neutral-950">
                                {type}
                              </option>
                            ))}
                          </select>
                        </label>
                        <label className="block space-y-1.5">
                          <span className="block text-xs font-medium text-neutral-400">Account size ($)</span>
                          <select
                            value={customPricingSize ? "custom" : String(newPricingPlan.size)}
                            onChange={(e) => {
                              if (e.target.value === "custom") {
                                setCustomPricingSize(true);
                                setNewPricingPlan({ ...newPricingPlan, size: 0 });
                                return;
                              }
                              setCustomPricingSize(false);
                              setNewPricingPlan({ ...newPricingPlan, size: Number(e.target.value) });
                            }}
                            className={fieldCls}
                            required
                          >
                            {inventoryAccountSizes.map((size) => (
                              <option key={size} value={size} className="bg-neutral-950">
                                ${size.toLocaleString()}
                              </option>
                            ))}
                            <option value="custom" className="bg-neutral-950">Custom size…</option>
                          </select>
                          {customPricingSize && (
                            <input
                              type="number"
                              value={newPricingPlan.size || ""}
                              onChange={(e) => setNewPricingPlan({ ...newPricingPlan, size: Number(e.target.value) })}
                              placeholder="e.g. 15000"
                              className={fieldCls}
                              required
                              min="1"
                              step="1"
                              autoFocus
                            />
                          )}
                        </label>
                        <label className="block space-y-1.5">
                          <span className="block text-xs font-medium text-neutral-400">Price ($)</span>
                          <input
                            type="number"
                            value={newPricingPlan.price}
                            onChange={(e) => setNewPricingPlan({ ...newPricingPlan, price: Number(e.target.value) })}
                            placeholder="e.g. 499"
                            className={fieldCls}
                            required
                            min="0"
                          />
                        </label>
                      </form>
                    </AdminModal>
                  </>
                );
              })()}
            </div>
          )}

          {/* 5. ACCOUNT DELIVERY DESK */}
          {activeSubTab === "delivery" && (
            <div className="space-y-5">
              <AdminPageHeader
                title="Accounts"
                subtitle="Deliver credentials and manage trading accounts."
                onRefresh={fetchCrmData}
                refreshing={refreshing}
              />

              <AdminPanel flush>
                <div className="flex flex-col gap-3 border-b border-white/[0.06] p-4 lg:flex-row lg:items-center lg:justify-between">
                  <div className="-mx-1 flex gap-1.5 overflow-x-auto px-1">
                    {[
                      { id: "pending", label: "Awaiting delivery", count: pendingDeliveryCount },
                      { id: "delivered", label: "Delivered", count: deliveredAccountsCount },
                      { id: "all", label: "All", count: accounts.length },
                    ].map((filter) => {
                      const isSelected = deliveryFilter === filter.id;
                      return (
                        <button
                          key={filter.id}
                          type="button"
                          onClick={() => setDeliveryFilter(filter.id as any)}
                          className={`inline-flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                            isSelected ? "bg-white text-black" : "text-neutral-400 hover:bg-white/[0.05] hover:text-white"
                          }`}
                        >
                          {filter.label}
                          <span className={`tabular-nums ${isSelected ? "text-black/55" : "text-neutral-600"}`}>
                            {filter.count}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                  <div className="relative w-full lg:max-w-xs">
                    <IconSearch
                      className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500"
                      size={14}
                    />
                    <input
                      type="search"
                      placeholder="Search login, trader or order"
                      value={accountSearch}
                      onChange={(e) => setAccountSearch(e.target.value)}
                      className="h-10 w-full rounded-lg border border-white/[0.08] bg-black/25 pl-9 pr-3 text-[13px] text-white outline-none transition-colors placeholder:text-neutral-600 focus:border-white/25"
                    />
                  </div>
                </div>

                {(() => {
                  const query = accountSearch.trim().toLowerCase();
                  const rows = accounts
                    .filter((a) =>
                      deliveryFilter === "all" ? true : a.deliveryStatus === deliveryFilter,
                    )
                    .filter(
                      (a) =>
                        !query ||
                        [a.login, a.id, a.userName, a.userEmail, a.orderId, a.server]
                          .map((v) => String(v || "").toLowerCase())
                          .some((v) => v.includes(query)),
                    );
                  if (rows.length === 0) {
                    return (
                      <AdminEmptyState
                        icon={<IconServer size={28} />}
                        title={deliveryFilter === "pending" && !query ? "Delivery queue is clear" : "No accounts found"}
                        hint={deliveryFilter === "pending" && !query ? "Every paid account has its credentials." : "Try another search or filter."}
                      />
                    );
                  }
                  return (
                    <AdminTable
                      minWidth={880}
                      columns={[
                        { key: "account", label: "Account" },
                        { key: "trader", label: "Trader" },
                        { key: "stage", label: "Stage" },
                        { key: "status", label: "Status" },
                        { key: "delivery", label: "Delivery" },
                        { key: "news", label: "News rule" },
                        { key: "actions", label: "", align: "right" },
                      ]}
                    >
                      {rows.map((a) => {
                        const nextStage =
                          a.status === "Passed" && getNextStagePhase(getPlanNameForAccount(a), a.phase);
                        const delivered = a.deliveryStatus === "delivered";
                        return (
                          <tr
                            key={a.id}
                            className="border-b border-white/[0.04] transition-colors last:border-0 hover:bg-white/[0.02]"
                          >
                            <td className="px-4 py-3.5 align-middle">
                              <span className="block font-mono text-[13px] font-semibold text-white">
                                #{a.login || a.id}
                              </span>
                              <span className="block text-xs text-neutral-500">
                                {a.platform} · ${Number(a.balance || 0).toLocaleString()}
                              </span>
                            </td>
                            <td className="max-w-[220px] px-4 py-3.5 align-middle">
                              <span className="block truncate text-[13px] text-white">{a.userName || "—"}</span>
                              <span className="block truncate font-mono text-xs text-neutral-500">{a.orderId}</span>
                            </td>
                            <td className="px-4 py-3.5 align-middle text-[13px] text-neutral-300">{a.phase}</td>
                            <td className="px-4 py-3.5 align-middle">
                              <AdminBadge status={a.status} />
                            </td>
                            <td className="px-4 py-3.5 align-middle">
                              <AdminBadge status={delivered ? "Delivered" : "Pending"} />
                            </td>
                            <td className="px-4 py-3.5 align-middle">
                              {(a.newsViolations?.length ?? 0) > 0 ? (
                                <button
                                  type="button"
                                  onClick={() => setNewsViolationsAccount(a)}
                                  className="text-left"
                                  title="View news violations"
                                >
                                  <AdminBadge tone="warning">
                                    {new Set(a.newsViolations.map((v: any) => v.ticket)).size} flagged
                                  </AdminBadge>
                                  <span className="mt-1 block text-xs text-neutral-500">
                                    −{formatMoney(Number(a.newsProfitToDeduct || 0))}
                                  </span>
                                </button>
                              ) : (
                                <span className="text-xs text-neutral-600">—</span>
                              )}
                            </td>
                            <td className="px-4 py-3.5 align-middle">
                              <div className="flex items-center justify-end gap-1.5">
                                {nextStage ? (
                                  <AdminButton variant="primary" onClick={() => handleDeliverNextStage(a)}>
                                    Deliver next stage
                                  </AdminButton>
                                ) : !delivered ? (
                                  <AdminButton variant="primary" onClick={() => openCredentialEditor(a, "deliver")}>
                                    Deliver
                                  </AdminButton>
                                ) : null}
                                {deletingAccountId === a.id ? (
                                  <span className="inline-flex h-8 w-8 items-center justify-center text-neutral-400">
                                    <Spinner size={15} />
                                  </span>
                                ) : (
                                  <AdminRowMenu
                                    items={[
                                      {
                                        label: delivered ? "Edit credentials" : "Deliver account",
                                        icon: <IconKey size={14} />,
                                        onClick: () => openCredentialEditor(a, delivered ? "edit" : "deliver"),
                                      },
                                      {
                                        label: "Equity graph",
                                        icon: <IconChartBar size={14} />,
                                        onClick: () => setGraphAccount(a),
                                      },
                                      {
                                        label: "News violations",
                                        icon: <IconCalendar size={14} />,
                                        onClick: () => setNewsViolationsAccount(a),
                                        disabled: !(a.newsViolations?.length > 0),
                                      },
                                      {
                                        label: "Delete account",
                                        icon: <IconTrash size={14} />,
                                        onClick: () => handleDeleteAccountRequest(a),
                                        tone: "danger",
                                      },
                                    ]}
                                  />
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </AdminTable>
                  );
                })()}
              </AdminPanel>

              {newsViolationsAccount && (
                <AdminModal
                  open
                  size="lg"
                  onClose={() => setNewsViolationsAccount(null)}
                  title="News violations"
                  subtitle={`#${newsViolationsAccount.login || newsViolationsAccount.id} · ${newsViolationsAccount.userName || ""} · −${formatMoney(Number(newsViolationsAccount.newsProfitToDeduct || 0))} not withdrawable`}
                >
                  <p className="mb-3 text-xs text-neutral-500">
                    Soft breach — the account stays active. Each trade&apos;s positive profit is deducted once from withdrawable profit.
                  </p>
                  <AdminTable
                    minWidth={720}
                    dense
                    bordered
                    columns={[
                      { key: "trade", label: "Trade" },
                      { key: "event", label: "News event" },
                      { key: "when", label: "Timing" },
                      { key: "profit", label: "Profit deducted", align: "right" },
                    ]}
                  >
                    {(newsViolationsAccount.newsViolations || []).map((v: any, index: number, list: any[]) => {
                      const firstForTicket = list.findIndex((item) => item.ticket === v.ticket) === index;
                      return (
                        <tr key={`${v.ticket}-${v.eventTime}-${v.type}`}>
                          <td className="px-3 py-2.5 align-middle">
                            <span className="block font-mono text-xs text-white">{v.symbol} #{v.ticket}</span>
                            <span className="block text-[11px] text-neutral-500">
                              {v.type === "opened_in_window" ? "Opened in window" : "Closed in window"}
                            </span>
                          </td>
                          <td className="px-3 py-2.5 align-middle">
                            <span className="block text-xs text-white">{v.currency} · {v.eventTitle}</span>
                            <span className="block text-[11px] text-neutral-500">
                              {new Date(v.eventTime).toISOString().slice(0, 16).replace("T", " ")} UTC
                            </span>
                          </td>
                          <td className="px-3 py-2.5 align-middle text-xs text-neutral-300 tabular-nums">
                            {v.secondsFromEvent === 0
                              ? "At release"
                              : `${Math.abs(v.secondsFromEvent)}s ${v.secondsFromEvent < 0 ? "before" : "after"}`}
                          </td>
                          <td className="px-3 py-2.5 text-right align-middle text-xs tabular-nums">
                            {!firstForTicket ? (
                              <span className="text-neutral-600">counted above</span>
                            ) : v.profit > 0 ? (
                              <span className="text-rose-300">−{formatMoney(Number(v.profit))}</span>
                            ) : (
                              <span className="text-neutral-500">0 (loss)</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </AdminTable>
                </AdminModal>
              )}
            </div>
          )}

              {/* Credential editor: one place to deliver a new account or edit a delivered one */}
              {deliveryForm &&
                (() => {
                  const isDelivered = deliveryForm.deliveryStatus === "delivered";
                  const orderSize = Number(deliveryForm.orderSize || deliveryForm.balance || 0);
                  const containerQuery = containerSearch.trim().toLowerCase();
                  const pickableContainers = availableDeliveryPlans
                    .filter(
                      (plan) =>
                        showAllContainerSizes ||
                        !orderSize ||
                        Number(plan.size) === orderSize,
                    )
                    .filter(
                      (plan) =>
                        !containerQuery ||
                        [plan.login, plan.server, plan.platform]
                          .map((v) => String(v || "").toLowerCase())
                          .some((v) => v.includes(containerQuery)),
                    )
                    .sort(
                      (a, b) =>
                        Number(b.platform === deliveryForm.platform) -
                        Number(a.platform === deliveryForm.platform),
                    );
                  const selectedContainer = deliveryForm.inventoryItemId
                    ? plans.find((p) => p.id === deliveryForm.inventoryItemId)
                    : null;
                  const sizeIsCustom =
                    isCustomManualBalance ||
                    !containerSizeOptions.includes(Number(deliveryForm.balance));
                  const fieldCls =
                    "h-9 w-full rounded-lg border border-white/[0.08] bg-white/[0.03] px-3 text-[13px] text-white outline-none transition-colors placeholder:text-neutral-600 hover:border-white/15 focus:border-white/30";
                  const setBalance = (newBalance: number) =>
                    setDeliveryForm({
                      ...deliveryForm,
                      balance: newBalance,
                      equity: newBalance,
                      profitTarget: Math.round(
                        getStageProfitTarget(
                          getPlanNameForAccount(deliveryForm),
                          deliveryForm.phase,
                          newBalance,
                        ),
                      ),
                    });
                  const credentialsText = `Platform: ${deliveryForm.platform}\nLogin: ${deliveryForm.login}\nServer: ${deliveryForm.server}\nMaster Password: ${deliveryForm.passwordMaster}`;
                  const subtitle = [
                    deliveryForm.userName || deliveryForm.userEmail || deliveryForm.userId || "Unknown trader",
                    deliveryForm.orderId && `Order ${deliveryForm.orderId}`,
                    orderSize && `$${orderSize.toLocaleString()}`,
                    deliveryForm.phase,
                  ]
                    .filter(Boolean)
                    .join(" · ");

                  return (
                    <AdminModal
                      open
                      size="lg"
                      busy={deliverySaving}
                      onClose={() => setDeliveryForm(null)}
                      title={
                        <span className="flex items-center gap-2">
                          {isDelivered ? "Edit credentials" : "Deliver account"}
                          <AdminBadge status={isDelivered ? "Delivered" : "Pending"} />
                        </span>
                      }
                      subtitle={subtitle}
                      footer={
                        <>
                          <div className="mr-auto flex gap-2">
                            <AdminButton onClick={() => handleCopy(credentialsText, "delivery-form-all")}>
                              {copiedId === "delivery-form-all" ? (
                                <IconCheck size={13} className="text-emerald-400" />
                              ) : (
                                <IconCopy size={13} />
                              )}
                              {copiedId === "delivery-form-all" ? "Copied" : "Copy"}
                            </AdminButton>
                            {(deliveryForm.externalStatisticsId || deliveryForm.graphLink) && (
                              <AdminButton onClick={() => setGraphAccount(deliveryForm)}>
                                <IconChartBar size={13} />
                                Graph
                              </AdminButton>
                            )}
                          </div>
                          <AdminButton onClick={() => setDeliveryForm(null)} disabled={deliverySaving}>
                            Cancel
                          </AdminButton>
                          <AdminButton
                            variant="primary"
                            type="submit"
                            form="admin-credential-form"
                            loading={deliverySaving}
                          >
                            {deliverySaving
                              ? "Saving…"
                              : isDelivered
                                ? "Save changes"
                                : "Deliver to trader"}
                          </AdminButton>
                        </>
                      }
                    >
                      <form id="admin-credential-form" onSubmit={handleDeliverAccount} className="space-y-5">
                        {!isDelivered && (
                          <CredSection
                            title="Container"
                            aside={
                              <label className="flex cursor-pointer items-center gap-2 text-xs text-neutral-400">
                                <input
                                  type="checkbox"
                                  checked={showAllContainerSizes}
                                  onChange={(e) => setShowAllContainerSizes(e.target.checked)}
                                  className="h-3.5 w-3.5 accent-white"
                                />
                                All sizes
                              </label>
                            }
                          >
                            <div className="relative">
                              <IconSearch
                                size={14}
                                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500"
                              />
                              <input
                                type="search"
                                value={containerSearch}
                                onChange={(e) => setContainerSearch(e.target.value)}
                                placeholder="Search login or server"
                                className={`${fieldCls} pl-9`}
                              />
                            </div>

                            {pickableContainers.length === 0 ? (
                              <p className="rounded-lg border border-dashed border-white/10 px-4 py-4 text-center text-xs text-neutral-500">
                                {orderSize && !showAllContainerSizes
                                  ? `No ready container for $${orderSize.toLocaleString()}. Tick "All sizes", or enter the login details manually below.`
                                  : "No ready containers. Enter the login details manually below."}
                              </p>
                            ) : (
                              <div className="max-h-48 divide-y divide-white/[0.05] overflow-y-auto rounded-lg border border-white/[0.08]">
                                {pickableContainers.map((plan) => {
                                  const selected = deliveryForm.inventoryItemId === plan.id;
                                  return (
                                    <button
                                      key={plan.id}
                                      type="button"
                                      onClick={() =>
                                        setDeliveryForm(
                                          selected
                                            ? { ...deliveryForm, inventoryItemId: "" }
                                            : applyContainerToForm(deliveryForm, plan),
                                        )
                                      }
                                      className={`flex w-full items-center gap-3 px-3 py-2 text-left transition-colors ${
                                        selected ? "bg-white/[0.06]" : "hover:bg-white/[0.03]"
                                      }`}
                                    >
                                      <span
                                        aria-hidden
                                        className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full border ${
                                          selected ? "border-white" : "border-white/25"
                                        }`}
                                      >
                                        {selected && <span className="h-2 w-2 rounded-full bg-white" />}
                                      </span>
                                      <span className="w-12 shrink-0 text-xs font-medium text-neutral-300">{plan.platform}</span>
                                      <span className="w-20 shrink-0 text-[13px] font-medium text-white tabular-nums">
                                        ${Number(plan.size || 0).toLocaleString()}
                                      </span>
                                      <span className="min-w-0 flex-1 truncate font-mono text-xs text-neutral-500">
                                        #{plan.login} · {plan.server}
                                      </span>
                                    </button>
                                  );
                                })}
                              </div>
                            )}
                          </CredSection>
                        )}

                        <CredSection
                          title="Login details"
                          aside={
                            selectedContainer ? (
                              <span className="text-xs text-emerald-300">From container #{selectedContainer.login}</span>
                            ) : !isDelivered ? (
                              <span className="text-xs text-neutral-500">Manual entry</span>
                            ) : undefined
                          }
                        >
                          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                            <CredField label="Platform">
                              <div className="grid h-9 grid-cols-3 gap-1 rounded-lg border border-white/[0.08] bg-white/[0.03] p-0.5">
                                {["MT5", "MT4", "cTrader"].map((platform) => (
                                  <button
                                    key={platform}
                                    type="button"
                                    onClick={() => updateDeliveryCredential("platform", platform)}
                                    className={`rounded-md text-xs font-medium transition-colors ${
                                      deliveryForm.platform === platform
                                        ? "bg-white text-black"
                                        : "text-neutral-400 hover:text-white"
                                    }`}
                                  >
                                    {platform}
                                  </button>
                                ))}
                              </div>
                            </CredField>
                            <CredField label="Account size">
                              <select
                                value={sizeIsCustom ? "custom" : String(deliveryForm.balance)}
                                onChange={(e) => {
                                  if (e.target.value === "custom") {
                                    setIsCustomManualBalance(true);
                                    return;
                                  }
                                  setIsCustomManualBalance(false);
                                  setBalance(Number(e.target.value));
                                }}
                                className={`${fieldCls} cursor-pointer`}
                              >
                                {containerSizeOptions.map((size) => (
                                  <option key={size} value={size} className="bg-neutral-950">
                                    ${size.toLocaleString()}
                                  </option>
                                ))}
                                <option value="custom" className="bg-neutral-950">
                                  Custom size…
                                </option>
                              </select>
                              {sizeIsCustom && (
                                <input
                                  type="number"
                                  min={1}
                                  step={100}
                                  value={deliveryForm.balance || ""}
                                  onChange={(e) => setBalance(Number(e.target.value))}
                                  placeholder="e.g. 75000"
                                  className={`${fieldCls} mt-2`}
                                  required
                                />
                              )}
                            </CredField>
                            <CredField label="Login ID">
                              <input
                                type="text"
                                value={deliveryForm.login || ""}
                                onChange={(e) => updateDeliveryCredential("login", e.target.value)}
                                placeholder="e.g. 998127"
                                className={`${fieldCls} font-mono`}
                                required
                              />
                            </CredField>
                            <CredField label="Server">
                              <input
                                type="text"
                                value={deliveryForm.server || ""}
                                onChange={(e) => updateDeliveryCredential("server", e.target.value)}
                                placeholder="Range4ex-Live01"
                                className={fieldCls}
                                required
                              />
                            </CredField>
                            {(
                              [
                                ["passwordMaster", "Master password", "M"],
                              ] as const
                            ).map(([field, label, prefix]) => (
                              <CredField key={field} label={label}>
                                <div className="relative">
                                  <input
                                    type="text"
                                    value={deliveryForm[field] || ""}
                                    onChange={(e) =>
                                      setDeliveryForm({ ...deliveryForm, [field]: e.target.value })
                                    }
                                    className={`${fieldCls} pr-20 font-mono`}
                                    required
                                  />
                                  <button
                                    type="button"
                                    onClick={() =>
                                      setDeliveryForm({
                                        ...deliveryForm,
                                        [field]: generateTradingPassword(prefix),
                                      })
                                    }
                                    className="absolute right-1 top-1/2 h-7 -translate-y-1/2 rounded-md px-2.5 text-xs font-medium text-neutral-400 transition-colors hover:bg-white/[0.06] hover:text-white"
                                  >
                                    Generate
                                  </button>
                                </div>
                              </CredField>
                            ))}
                          </div>
                          {!isDelivered && selectedContainer && (
                            <p className="text-xs text-neutral-500">
                              Changing platform, server or login un-links the container.
                            </p>
                          )}
                        </CredSection>

                        <CredSection title="Stage">
                          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                            <CredField label="Phase">
                              <select
                                value={deliveryForm.phase}
                                onChange={(e) => {
                                  const newPhase = e.target.value;
                                  setDeliveryForm({
                                    ...deliveryForm,
                                    phase: newPhase,
                                    profitTarget: Math.round(
                                      getStageProfitTarget(
                                        getPlanNameForAccount(deliveryForm),
                                        newPhase,
                                        deliveryForm.balance || 100000,
                                      ),
                                    ),
                                  });
                                }}
                                className={`${fieldCls} cursor-pointer`}
                              >
                                {/* Only the stages this plan actually runs (One Step and Instant have no Phase 2). */}
                                {getSelectableStagePhases(
                                  getPlanNameForAccount(deliveryForm),
                                  deliveryForm.phase,
                                ).map((phase) => (
                                  <option key={phase} value={phase} className="bg-neutral-950">
                                    {phase === PHASE_FUNDED ? "Funded (Live)" : phase}
                                  </option>
                                ))}
                              </select>
                            </CredField>
                            <CredField label="Status">
                              <select
                                value={deliveryForm.status}
                                onChange={(e) =>
                                  setDeliveryForm({ ...deliveryForm, status: e.target.value })
                                }
                                className={`${fieldCls} cursor-pointer`}
                              >
                                {["Active", "Passed", "Failed", "Funded"].map((status) => (
                                  <option key={status} value={status} className="bg-neutral-950">
                                    {status}
                                  </option>
                                ))}
                              </select>
                            </CredField>
                            <CredField label="Profit target" hint="USD">
                              <input
                                type="number"
                                value={deliveryForm.profitTarget ?? ""}
                                onChange={(e) =>
                                  setDeliveryForm({
                                    ...deliveryForm,
                                    profitTarget: Number(e.target.value),
                                  })
                                }
                                className={`${fieldCls} tabular-nums`}
                                required
                              />
                            </CredField>
                          </div>
                        </CredSection>

                        <CredSection title="Performance graph" aside={<span className="text-xs text-neutral-500">Optional</span>}>
                          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                            <CredField label="Graph link">
                              <input
                                type="url"
                                value={deliveryForm.graphLink || ""}
                                onChange={(e) =>
                                  setDeliveryForm({ ...deliveryForm, graphLink: e.target.value })
                                }
                                placeholder="https://www.myfxbook.com/..."
                                className={fieldCls}
                              />
                            </CredField>
                            <CredField label="Graph ID">
                              <input
                                type="text"
                                value={deliveryForm.externalStatisticsId || ""}
                                onChange={(e) =>
                                  setDeliveryForm({
                                    ...deliveryForm,
                                    externalStatisticsId: e.target.value,
                                  })
                                }
                                placeholder="mt5-1030835-..."
                                className={`${fieldCls} font-mono`}
                              />
                            </CredField>
                          </div>
                        </CredSection>
                      </form>
                    </AdminModal>
                  );
                })()}

          {/* 6. PAYOUT SPLIT AUDITS */}
          {activeSubTab === "payouts" && (
            <div className="space-y-5">
              <AdminPageHeader
                title="Payouts"
                subtitle="Review and approve trader withdrawal requests."
                onRefresh={fetchCrmData}
                refreshing={refreshing}
              />

              {(() => {
                const statusOf = (p: any) => String(p.status || "").toLowerCase();
                const search = payoutSearch.trim().toLowerCase();
                const searched = payouts.filter(
                  (p) =>
                    !search ||
                    [p.userName, p.userEmail, p.id, p.accountId, p.paymentMethod].some((v) =>
                      String(v || "").toLowerCase().includes(search),
                    ),
                );
                const countFor = (value: string) =>
                  searched.filter((p) => value === "all" || statusOf(p) === value).length;
                const rows = searched
                  .filter((p) => payoutStatusFilter === "all" || statusOf(p) === payoutStatusFilter)
                  .sort(
                    (a, b) =>
                      Number(statusOf(b) === "pending") - Number(statusOf(a) === "pending") ||
                      new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime(),
                  );
                return (
                  <>
                    <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
                      <AdminStatCard
                        label="Pending review"
                        value={formatMoney(totalPayoutsPending)}
                        hint={`${payouts.filter((p) => statusOf(p) === "pending").length} requests`}
                      />
                      <AdminStatCard label="Paid out" value={formatMoney(totalPayoutsPaid)} hint="All time" />
                      <AdminStatCard
                        label="Paid requests"
                        value={payouts.filter((p) => statusOf(p) === "paid").length}
                        hint="Approved and sent"
                      />
                      <AdminStatCard
                        label="Rejected"
                        value={payouts.filter((p) => statusOf(p) === "rejected").length}
                        hint="Declined requests"
                      />
                    </div>

                    <AdminPanel flush>
                      <AdminToolbar
                        search={payoutSearch}
                        onSearch={setPayoutSearch}
                        placeholder="Search trader, payout ID or account"
                        filters={[
                          { label: "All", value: "all", count: countFor("all") },
                          { label: "Pending", value: "pending", count: countFor("pending") },
                          { label: "Paid", value: "paid", count: countFor("paid") },
                          { label: "Rejected", value: "rejected", count: countFor("rejected") },
                        ]}
                        filter={payoutStatusFilter}
                        onFilter={setPayoutStatusFilter}
                      />

                      {rows.length === 0 ? (
                        <AdminEmptyState
                          icon={<IconCreditCard size={28} />}
                          title="No payout requests"
                          hint={payouts.length === 0 ? "Withdrawal requests from traders will appear here." : "Try another search or filter."}
                        />
                      ) : (
                        <>
                          <AdminTable
                            minWidth={1000}
                            dense
                            bordered
                            columns={[
                              { key: "payout", label: "Payout" },
                              { key: "trader", label: "Trader" },
                              { key: "account", label: "Account" },
                              { key: "amount", label: "Amount" },
                              { key: "share", label: "Trader share" },
                              { key: "method", label: "Method" },
                              { key: "status", label: "Status" },
                              { key: "date", label: "Requested" },
                              { key: "actions", label: "Actions", align: "right" },
                            ]}
                          >
                            {rows.map((p) => {
                              const isPending = statusOf(p) === "pending";
                              return (
                                <tr key={p.id} className={ADMIN_TR}>
                                  <td className={ADMIN_TD}>
                                    <button
                                      type="button"
                                      onClick={() => setPayoutReview(p)}
                                      className="font-mono text-xs font-semibold text-white hover:underline"
                                    >
                                      {p.id}
                                    </button>
                                  </td>
                                  <td className={`max-w-[200px] ${ADMIN_TD}`}>
                                    <span className="block truncate text-xs font-medium text-white">{p.userName || "—"}</span>
                                    {p.userEmail && (
                                      <span className="block truncate text-[11px] text-neutral-500">{p.userEmail}</span>
                                    )}
                                  </td>
                                  <td className={`font-mono text-[11px] text-neutral-300 ${ADMIN_TD}`}>{p.accountId || "—"}</td>
                                  <td className={`text-xs font-medium text-white tabular-nums ${ADMIN_TD}`}>
                                    {formatMoney(Number(p.amount || 0))}
                                  </td>
                                  <td className={`text-xs text-emerald-300 tabular-nums ${ADMIN_TD}`}>
                                    {formatMoney(Number(p.profitSplitAmount || 0))}
                                  </td>
                                  <td className={`max-w-[140px] truncate text-[11px] text-neutral-400 ${ADMIN_TD}`}>
                                    {p.paymentMethod || "—"}
                                  </td>
                                  <td className={ADMIN_TD}>
                                    {isBusy(`payout:${p.id}`) ? (
                                      <span className="inline-flex items-center gap-1.5 text-[11px] text-neutral-400">
                                        <Spinner size={11} /> Updating…
                                      </span>
                                    ) : (
                                      <AdminBadge status={p.status} />
                                    )}
                                  </td>
                                  <td className={`whitespace-nowrap text-[11px] text-neutral-400 ${ADMIN_TD}`}>
                                    {formatOrderDateTime(p.createdAt)}
                                  </td>
                                  <td className={ADMIN_TD}>
                                    <div className="flex items-center justify-end">
                                      <AdminButton
                                        variant={isPending ? "primary" : "ghost"}
                                        onClick={() => setPayoutReview(p)}
                                      >
                                        {isPending ? "Review" : "View"}
                                      </AdminButton>
                                    </div>
                                  </td>
                                </tr>
                              );
                            })}
                          </AdminTable>
                          <AdminTableFooter shown={rows.length} total={payouts.length} noun="payouts" />
                        </>
                      )}
                    </AdminPanel>
                  </>
                );
              })()}

              {payoutReview &&
                (() => {
                  const deciding = isBusy(`payout:${payoutReview.id}`);
                  const isPending = String(payoutReview.status).toLowerCase() === "pending";
                  return (
                    <AdminModal
                      open
                      size="sm"
                      busy={deciding}
                      onClose={() => setPayoutReview(null)}
                      title={`Payout ${payoutReview.id}`}
                      subtitle={payoutReview.userName}
                      footer={
                        isPending ? (
                          <>
                            <AdminButton
                              variant="danger"
                              loading={deciding && payoutVerdict === "rejected"}
                              disabled={deciding}
                              onClick={async () => {
                                const reason = await adminPrompt({
                                  title: "Reject payout",
                                  message: "The trader will see this reason.",
                                  placeholder: "e.g. Consistency rule not met",
                                  confirmLabel: "Reject",
                                  tone: "danger",
                                });
                                if (reason === null) return;
                                setPayoutVerdict("rejected");
                                handleReviewPayout(payoutReview.id, "rejected", reason);
                              }}
                            >
                              Reject
                            </AdminButton>
                            <AdminButton
                              variant="success"
                              loading={deciding && payoutVerdict === "paid"}
                              disabled={deciding}
                              onClick={() => {
                                setPayoutVerdict("paid");
                                handleReviewPayout(
                                  payoutReview.id,
                                  "paid",
                                  "Approved trades compliance audit. Dispatched split payment successfully.",
                                );
                              }}
                            >
                              Approve & mark paid
                            </AdminButton>
                          </>
                        ) : (
                          <AdminButton onClick={() => setPayoutReview(null)}>Close</AdminButton>
                        )
                      }
                    >
                      <div className="space-y-4">
                        <AdminBadge status={payoutReview.status} />
                        <AdminDetailList
                          rows={[
                            ["Requested", formatMoney(Number(payoutReview.amount || 0))],
                            [
                              "Trader share",
                              <span key="ts" className="text-emerald-300">
                                {formatMoney(Number(payoutReview.profitSplitAmount || 0))}
                              </span>,
                            ],
                            ["Firm share", formatMoney(Number(payoutReview.firmShareAmount || 0))],
                            ["Account", payoutReview.accountId],
                            ["Method", payoutReview.paymentMethod || "—"],
                            [
                              "Pay to",
                              <span key="pt" className="select-all break-all font-mono text-xs">
                                {payoutReview.paymentDetails || "—"}
                              </span>,
                            ],
                            ["Requested on", formatOrderDateTime(payoutReview.createdAt)],
                            ...(payoutReview.notes ? [["Notes", payoutReview.notes] as [string, string]] : []),
                          ]}
                        />
                      </div>
                    </AdminModal>
                  );
                })()}
            </div>
          )}

          {/* 7. AFFILIATE REFERRALS */}
          {activeSubTab === "affiliates" && (
            <div className="space-y-5">
              <AdminPageHeader
                title="Affiliates"
                subtitle="Partner registry, referral sales and commission payouts."
                onRefresh={fetchCrmData}
                refreshing={refreshing}
              />

              {(() => {
                const refStatus = (r: any) => String(r.status || "pending").toLowerCase();
                const search = affiliateSearch.trim().toLowerCase();
                const searchedRefs = referrals.filter(
                  (r) =>
                    !search ||
                    [r.referredName, r.referralCode, r.orderId].some((v) =>
                      String(v || "").toLowerCase().includes(search),
                    ),
                );
                const refCount = (value: string) =>
                  searchedRefs.filter((r) => value === "all" || refStatus(r) === value).length;
                const refRows = searchedRefs.filter(
                  (r) => referralStatusFilter === "all" || refStatus(r) === referralStatusFilter,
                );
                const partnerRows = affiliates.filter(
                  (a) =>
                    !search ||
                    [a.name, a.referralCode, a.userId].some((v) =>
                      String(v || "").toLowerCase().includes(search),
                    ),
                );
                const sumCommission = (status: string) =>
                  referrals
                    .filter((r) => refStatus(r) === status)
                    .reduce((sum, r) => sum + (Number(r.commissionAmount) || 0), 0);
                return (
                  <>
                    <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
                      <AdminStatCard label="Partners" value={affiliates.length} hint="Registered affiliates" />
                      <AdminStatCard label="Referral sales" value={referrals.length} hint="Tracked orders" />
                      <AdminStatCard label="Owed" value={formatMoney(sumCommission("approved"))} hint="Approved, not yet paid" />
                      <AdminStatCard label="Paid" value={formatMoney(sumCommission("paid"))} hint="Commission sent" />
                    </div>

                    <AdminPanel flush>
                      <AdminToolbar
                        search={affiliateSearch}
                        onSearch={setAffiliateSearch}
                        placeholder="Search name, referral code or order ID"
                        filters={[
                          { label: "Referral sales", value: "sales" },
                          { label: "Partners", value: "partners", count: partnerRows.length },
                        ]}
                        filter={affiliateView}
                        onFilter={setAffiliateView}
                      />

                      {affiliateView === "partners" ? (
                        partnerRows.length === 0 ? (
                          <AdminEmptyState
                            icon={<IconUsers size={28} />}
                            title="No partners found"
                            hint="Affiliates appear here once they register."
                          />
                        ) : (
                          <>
                            <AdminTable
                              minWidth={720}
                              dense
                              bordered
                              columns={[
                                { key: "partner", label: "Partner" },
                                { key: "code", label: "Referral code" },
                                { key: "rate", label: "Commission" },
                                { key: "sales", label: "Sales" },
                                { key: "earned", label: "Earned" },
                                { key: "actions", label: "Actions", align: "right" },
                              ]}
                            >
                              {partnerRows.map((a) => {
                                const partnerRefs = referrals.filter((r) => r.referralCode === a.referralCode);
                                const earned = partnerRefs.reduce(
                                  (sum, r) => sum + (Number(r.commissionAmount) || 0),
                                  0,
                                );
                                return (
                                  <tr key={a.userId} className={ADMIN_TR}>
                                    <td className={`max-w-[220px] ${ADMIN_TD}`}>
                                      <span className="block truncate text-xs font-medium text-white">{a.name || "—"}</span>
                                      <span className="block truncate font-mono text-[11px] text-neutral-500">{a.userId}</span>
                                    </td>
                                    <td className={ADMIN_TD}>
                                      <AdminCopyValue
                                        value={String(a.referralCode || "")}
                                        copied={copiedId === `aff-${a.userId}`}
                                        onCopy={() => handleCopy(String(a.referralCode || ""), `aff-${a.userId}`)}
                                      />
                                    </td>
                                    <td className={`text-xs text-white tabular-nums ${ADMIN_TD}`}>{a.commissionRate}%</td>
                                    <td className={`text-xs text-neutral-300 tabular-nums ${ADMIN_TD}`}>{partnerRefs.length}</td>
                                    <td className={`text-xs text-emerald-300 tabular-nums ${ADMIN_TD}`}>{formatMoney(earned)}</td>
                                    <td className={ADMIN_TD}>
                                      <div className="flex items-center justify-end">
                                        <AdminButton
                                          onClick={() =>
                                            setAffiliateRateForm({
                                              userId: a.userId,
                                              commissionRate: a.commissionRate,
                                              name: a.name,
                                            })
                                          }
                                        >
                                          Edit rate
                                        </AdminButton>
                                      </div>
                                    </td>
                                  </tr>
                                );
                              })}
                            </AdminTable>
                            <AdminTableFooter shown={partnerRows.length} total={affiliates.length} noun="partners" />
                          </>
                        )
                      ) : (
                        <>
                          <div className="-mx-1 flex gap-1.5 overflow-x-auto border-b border-white/[0.06] px-5 py-3">
                            {[
                              { label: "All", value: "all" },
                              { label: "Pending", value: "pending" },
                              { label: "Approved", value: "approved" },
                              { label: "Paid", value: "paid" },
                            ].map((f) => {
                              const selected = referralStatusFilter === f.value;
                              return (
                                <button
                                  key={f.value}
                                  type="button"
                                  onClick={() => setReferralStatusFilter(f.value)}
                                  className={`inline-flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                                    selected ? "bg-white/[0.08] text-white" : "text-neutral-500 hover:text-white"
                                  }`}
                                >
                                  {f.label}
                                  <span className="tabular-nums text-neutral-600">{refCount(f.value)}</span>
                                </button>
                              );
                            })}
                          </div>
                          {refRows.length === 0 ? (
                            <AdminEmptyState
                              icon={<IconReceipt size={28} />}
                              title="No referral sales"
                              hint={referrals.length === 0 ? "Sales made with a referral code will appear here." : "Try another search or filter."}
                            />
                          ) : (
                            <>
                              <AdminTable
                                minWidth={760}
                                dense
                                bordered
                                columns={[
                                  { key: "user", label: "Referred user" },
                                  { key: "order", label: "Order" },
                                  { key: "code", label: "Referral code" },
                                  { key: "commission", label: "Commission" },
                                  { key: "status", label: "Status" },
                                  { key: "actions", label: "Actions", align: "right" },
                                ]}
                              >
                                {refRows.map((r, i) => (
                                  <tr key={`${r.orderId}-${i}`} className={ADMIN_TR}>
                                    <td className={`max-w-[220px] truncate text-xs font-medium text-white ${ADMIN_TD}`}>
                                      {r.referredName || "—"}
                                    </td>
                                    <td className={`font-mono text-[11px] text-neutral-300 ${ADMIN_TD}`}>{r.orderId || "—"}</td>
                                    <td className={`font-mono text-xs text-neutral-300 ${ADMIN_TD}`}>{r.referralCode}</td>
                                    <td className={`text-xs text-emerald-300 tabular-nums ${ADMIN_TD}`}>
                                      {formatMoney(Number(r.commissionAmount) || 0)}
                                    </td>
                                    <td className={ADMIN_TD}>
                                      {isBusy(`referral:${r.orderId}`) ? (
                                        <span className="inline-flex items-center gap-1.5 text-[11px] text-neutral-400">
                                          <Spinner size={11} /> Updating…
                                        </span>
                                      ) : (
                                        <AdminBadge status={r.status || "pending"} />
                                      )}
                                    </td>
                                    <td className={ADMIN_TD}>
                                      <div className="flex items-center justify-end">
                                        {refStatus(r) === "approved" ? (
                                          <AdminButton
                                            variant="primary"
                                            loading={isBusy(`referral:${r.orderId}`)}
                                            onClick={() => handlePayReferral(r.referredUserId, r.orderId)}
                                          >
                                            Mark paid
                                          </AdminButton>
                                        ) : (
                                          <span className="text-[11px] text-neutral-600">—</span>
                                        )}
                                      </div>
                                    </td>
                                  </tr>
                                ))}
                              </AdminTable>
                              <AdminTableFooter shown={refRows.length} total={referrals.length} noun="referral sales" />
                            </>
                          )}
                        </>
                      )}
                    </AdminPanel>

                    <AdminModal
                      open={Boolean(affiliateRateForm)}
                      size="sm"
                      busy={isBusy("affiliate-rate")}
                      onClose={() => setAffiliateRateForm(null)}
                      title="Commission rate"
                      subtitle={affiliateRateForm?.name}
                      footer={
                        <>
                          <AdminButton onClick={() => setAffiliateRateForm(null)}>Cancel</AdminButton>
                          <AdminButton
                            variant="primary"
                            type="submit"
                            form="affiliate-rate-form"
                            loading={isBusy("affiliate-rate")}
                          >
                            Save rate
                          </AdminButton>
                        </>
                      }
                    >
                      {affiliateRateForm && (
                        <form id="affiliate-rate-form" onSubmit={handleUpdateAffiliateRate}>
                          <label className="block space-y-1.5">
                            <span className="block text-xs font-medium text-neutral-400">Commission (%)</span>
                            <input
                              type="number"
                              value={affiliateRateForm.commissionRate}
                              onChange={(e) =>
                                setAffiliateRateForm({
                                  ...affiliateRateForm,
                                  commissionRate: Number(e.target.value),
                                })
                              }
                              className="h-10 w-full rounded-lg border border-white/[0.08] bg-black/25 px-3 text-[13px] text-white outline-none focus:border-white/25"
                              min="1"
                              max="100"
                            />
                          </label>
                        </form>
                      )}
                    </AdminModal>
                  </>
                );
              })()}
            </div>
          )}

          {/* 8. NEWSLETTER SUBSCRIBERS */}
          {activeSubTab === "newsletter" && (
            <div className="space-y-5">
              <AdminPageHeader
                title="Newsletter"
                subtitle="Emails collected from the homepage and footer signup forms."
                onRefresh={fetchCrmData}
                refreshing={refreshing}
              />

              {(() => {
                const mailStatus = (s: any) => String(s.emailStatus || "pending").toLowerCase();
                const search = newsletterSearch.trim().toLowerCase();
                const searched = newsletterSubscribers.filter(
                  (s) =>
                    !search ||
                    [s.email, s.source].some((v) => String(v || "").toLowerCase().includes(search)),
                );
                const countFor = (value: string) =>
                  searched.filter((s) => value === "all" || mailStatus(s) === value).length;
                const rows = searched
                  .filter((s) => newsletterFilter === "all" || mailStatus(s) === newsletterFilter)
                  .sort(
                    (a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime(),
                  );
                const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
                return (
                  <>
                    <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
                      <AdminStatCard label="Subscribers" value={newsletterSubscribers.length} hint="All signups" />
                      <AdminStatCard
                        label="This week"
                        value={newsletterSubscribers.filter((s) => new Date(s.createdAt || 0).getTime() >= weekAgo).length}
                        hint="Last 7 days"
                      />
                      <AdminStatCard
                        label="Welcome sent"
                        value={newsletterSubscribers.filter((s) => mailStatus(s) === "sent").length}
                        hint="Confirmation delivered"
                      />
                      <AdminStatCard
                        label="Failed"
                        value={newsletterSubscribers.filter((s) => mailStatus(s) === "failed").length}
                        hint="Email bounced"
                      />
                    </div>

                    <AdminPanel flush>
                      <AdminToolbar
                        search={newsletterSearch}
                        onSearch={setNewsletterSearch}
                        placeholder="Search email or source"
                        filters={[
                          { label: "All", value: "all", count: countFor("all") },
                          { label: "Sent", value: "sent", count: countFor("sent") },
                          { label: "Pending", value: "pending", count: countFor("pending") },
                          { label: "Failed", value: "failed", count: countFor("failed") },
                        ]}
                        filter={newsletterFilter}
                        onFilter={setNewsletterFilter}
                        actions={
                          rows.length > 0 ? (
                            <AdminButton
                              onClick={() => {
                                handleCopy(rows.map((s) => s.email).join(", "), "newsletter-all");
                                adminToast.info(`Copied ${rows.length} emails`);
                              }}
                            >
                              <IconCopy size={14} />
                              Copy emails
                            </AdminButton>
                          ) : null
                        }
                      />

                      {rows.length === 0 ? (
                        <AdminEmptyState
                          icon={<IconMail size={28} />}
                          title="No subscribers found"
                          hint={newsletterSubscribers.length === 0 ? "Newsletter signups will appear here." : "Try another search or filter."}
                        />
                      ) : (
                        <>
                          <AdminTable
                            minWidth={720}
                            dense
                            bordered
                            columns={[
                              { key: "email", label: "Email" },
                              { key: "source", label: "Source" },
                              { key: "confirmation", label: "Confirmation" },
                              { key: "status", label: "Status" },
                              { key: "date", label: "Subscribed" },
                            ]}
                          >
                            {rows.map((subscriber) => (
                              <tr key={subscriber.id} className={ADMIN_TR}>
                                <td className={ADMIN_TD}>
                                  <AdminCopyValue
                                    value={String(subscriber.email || "")}
                                    mono={false}
                                    maxWidth={260}
                                    copied={copiedId === `nl-${subscriber.id}`}
                                    onCopy={() => handleCopy(String(subscriber.email || ""), `nl-${subscriber.id}`)}
                                  />
                                </td>
                                <td className={`text-xs capitalize text-neutral-300 ${ADMIN_TD}`}>
                                  {subscriber.source || "unknown"}
                                </td>
                                <td className={ADMIN_TD}>
                                  <AdminBadge status={subscriber.emailStatus || "pending"} />
                                </td>
                                <td className={ADMIN_TD}>
                                  <AdminBadge status={subscriber.status || "active"} />
                                </td>
                                <td className={`whitespace-nowrap text-[11px] text-neutral-400 ${ADMIN_TD}`}>
                                  {formatOrderDateTime(subscriber.createdAt)}
                                </td>
                              </tr>
                            ))}
                          </AdminTable>
                          <AdminTableFooter shown={rows.length} total={newsletterSubscribers.length} noun="subscribers" />
                        </>
                      )}
                    </AdminPanel>
                  </>
                );
              })()}
            </div>
          )}

          {/* 8.5 EMAIL PROMOTIONS */}
          {activeSubTab === "promotions" && <PromotionManager users={users} />}

          {/* 9. ALERT BROADCASTS */}
          {activeSubTab === "broadcaster" && (
            <div className="space-y-5">
              <AdminPageHeader
                title="Broadcasts"
                subtitle="Send in-app and email alerts to traders."
                onRefresh={fetchCrmData}
                refreshing={refreshing}
              />

              {(() => {
                const search = broadcastSearch.trim().toLowerCase();
                const searched = notifLogs.filter(
                  (log) =>
                    !search ||
                    [log.title, log.message, log.userName, log.userEmail].some((v) =>
                      String(v || "").toLowerCase().includes(search),
                    ),
                );
                const countFor = (value: string) =>
                  searched.filter((log) => value === "all" || String(log.channel) === value).length;
                const rows = searched
                  .filter((log) => broadcastChannelFilter === "all" || String(log.channel) === broadcastChannelFilter)
                  .sort((a, b) => new Date(b.sentAt || 0).getTime() - new Date(a.sentAt || 0).getTime());
                const dayAgo = Date.now() - 24 * 60 * 60 * 1000;
                const fieldCls =
                  "h-10 w-full rounded-lg border border-white/[0.08] bg-black/25 px-3 text-[13px] text-white outline-none transition-colors placeholder:text-neutral-600 focus:border-white/25";
                return (
                  <>
                    <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
                      <AdminStatCard label="Alerts sent" value={notifLogs.length} hint="All time" />
                      <AdminStatCard
                        label="Last 24 hours"
                        value={notifLogs.filter((l) => new Date(l.sentAt || 0).getTime() >= dayAgo).length}
                        hint="Recent alerts"
                      />
                      <AdminStatCard
                        label="In-app"
                        value={notifLogs.filter((l) => l.channel === "in_app").length}
                        hint="Dashboard notifications"
                      />
                      <AdminStatCard
                        label="Email"
                        value={notifLogs.filter((l) => l.channel === "email").length}
                        hint="Sent by email"
                      />
                    </div>

                    <AdminPanel flush>
                      <AdminToolbar
                        search={broadcastSearch}
                        onSearch={setBroadcastSearch}
                        placeholder="Search title, message or recipient"
                        filters={[
                          { label: "All", value: "all", count: countFor("all") },
                          { label: "In-app", value: "in_app", count: countFor("in_app") },
                          { label: "Email", value: "email", count: countFor("email") },
                        ]}
                        filter={broadcastChannelFilter}
                        onFilter={setBroadcastChannelFilter}
                        actions={
                          <AdminButton variant="primary" onClick={() => setShowBroadcastForm(true)}>
                            <IconBell size={14} />
                            New alert
                          </AdminButton>
                        }
                      />

                      {rows.length === 0 ? (
                        <AdminEmptyState
                          icon={<IconBell size={28} />}
                          title="No alerts found"
                          hint={notifLogs.length === 0 ? "Alerts you send will be logged here." : "Try another search or filter."}
                        />
                      ) : (
                        <>
                          <AdminTable
                            minWidth={960}
                            dense
                            bordered
                            columns={[
                              { key: "alert", label: "Alert" },
                              { key: "recipient", label: "Recipient" },
                              { key: "type", label: "Type" },
                              { key: "channel", label: "Channel" },
                              { key: "date", label: "Sent" },
                            ]}
                          >
                            {rows.map((log) => (
                              <tr key={log.id} className={ADMIN_TR}>
                                <td className={`max-w-[380px] ${ADMIN_TD}`}>
                                  <span className="block truncate text-xs font-medium text-white">{log.title}</span>
                                  <span className="block truncate text-[11px] text-neutral-500" title={log.message}>
                                    {log.message}
                                  </span>
                                </td>
                                <td className={`max-w-[220px] ${ADMIN_TD}`}>
                                  <span className="block truncate text-xs text-neutral-300">{log.userName || "—"}</span>
                                  <span className="block truncate text-[11px] text-neutral-500">{log.userEmail}</span>
                                </td>
                                <td className={ADMIN_TD}>
                                  <AdminBadge
                                    tone={
                                      log.type === "success"
                                        ? "success"
                                        : log.type === "warning"
                                          ? "warning"
                                          : log.type === "error"
                                            ? "danger"
                                            : "info"
                                    }
                                  >
                                    {log.type || "info"}
                                  </AdminBadge>
                                </td>
                                <td className={`text-xs text-neutral-300 ${ADMIN_TD}`}>
                                  {log.channel === "in_app" ? "In-app" : log.channel === "email" ? "Email" : log.channel}
                                </td>
                                <td className={`whitespace-nowrap text-[11px] text-neutral-400 ${ADMIN_TD}`}>
                                  {formatOrderDateTime(log.sentAt)}
                                </td>
                              </tr>
                            ))}
                          </AdminTable>
                          <AdminTableFooter shown={rows.length} total={notifLogs.length} noun="alerts" />
                        </>
                      )}
                    </AdminPanel>

                    <AdminModal
                      open={showBroadcastForm}
                      busy={isBusy("broadcast")}
                      onClose={() => setShowBroadcastForm(false)}
                      title="New alert"
                      subtitle="Sent to one trader or everyone."
                      footer={
                        <>
                          <AdminButton onClick={() => setShowBroadcastForm(false)}>Cancel</AdminButton>
                          <AdminButton
                            variant="primary"
                            type="submit"
                            form="broadcast-form"
                            loading={isBusy("broadcast")}
                          >
                            Send alert
                          </AdminButton>
                        </>
                      }
                    >
                      <form id="broadcast-form" onSubmit={handleBroadcast} className="space-y-4">
                        <label className="block space-y-1.5">
                          <span className="block text-xs font-medium text-neutral-400">Recipient</span>
                          <select
                            value={broadcastForm.targetUserId}
                            onChange={(e) => setBroadcastForm({ ...broadcastForm, targetUserId: e.target.value })}
                            className={fieldCls}
                          >
                            <option value="all" className="bg-neutral-950">All traders</option>
                            {users.map((u) => (
                              <option key={u.id} value={u.id} className="bg-neutral-950">
                                {u.name} ({u.email})
                              </option>
                            ))}
                          </select>
                        </label>
                        <label className="block space-y-1.5">
                          <span className="block text-xs font-medium text-neutral-400">Title</span>
                          <input
                            type="text"
                            value={broadcastForm.title}
                            onChange={(e) => setBroadcastForm({ ...broadcastForm, title: e.target.value })}
                            className={fieldCls}
                            required
                          />
                        </label>
                        <label className="block space-y-1.5">
                          <span className="block text-xs font-medium text-neutral-400">Message</span>
                          <textarea
                            value={broadcastForm.message}
                            onChange={(e) => setBroadcastForm({ ...broadcastForm, message: e.target.value })}
                            className="h-28 w-full resize-none rounded-lg border border-white/[0.08] bg-black/25 px-3 py-2.5 text-[13px] text-white outline-none focus:border-white/25"
                            required
                          />
                        </label>
                        <div className="grid grid-cols-2 gap-3">
                          <label className="block space-y-1.5">
                            <span className="block text-xs font-medium text-neutral-400">Type</span>
                            <select
                              value={broadcastForm.type}
                              onChange={(e) => setBroadcastForm({ ...broadcastForm, type: e.target.value as any })}
                              className={fieldCls}
                            >
                              <option value="info" className="bg-neutral-950">Info</option>
                              <option value="success" className="bg-neutral-950">Success</option>
                              <option value="warning" className="bg-neutral-950">Warning</option>
                              <option value="error" className="bg-neutral-950">Critical</option>
                            </select>
                          </label>
                          <label className="block space-y-1.5">
                            <span className="block text-xs font-medium text-neutral-400">Channel</span>
                            <select
                              value={broadcastForm.channel}
                              onChange={(e) => setBroadcastForm({ ...broadcastForm, channel: e.target.value as any })}
                              className={fieldCls}
                            >
                              <option value="in_app" className="bg-neutral-950">In-app</option>
                              <option value="email" className="bg-neutral-950">Email</option>
                            </select>
                          </label>
                        </div>
                      </form>
                    </AdminModal>
                  </>
                );
              })()}
            </div>
          )}

          {/* 9. AUDIT TRAIL LOGS */}
          {activeSubTab === "audit" && (
            <div className="space-y-5">
              <AdminPageHeader
                title="Audit trail"
                subtitle="Every privileged action recorded on the platform."
                onRefresh={fetchCrmData}
                refreshing={refreshing}
              />

              {(() => {
                const search = auditSearch.trim().toLowerCase();
                const searched = auditLogs.filter(
                  (log) =>
                    !search ||
                    [log.userName, log.userId, log.targetId, log.targetType, log.action, log.description].some((v) =>
                      String(v || "").toLowerCase().includes(search),
                    ),
                );
                const actions = Array.from(new Set(auditLogs.map((log) => String(log.action || "")))).filter(Boolean);
                const rows = searched
                  .filter((log) => auditActionFilter === "all" || String(log.action) === auditActionFilter)
                  .sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
                const label = (value: string) => value.replace(/_/g, " ");
                return (
                  <AdminPanel flush>
                    <AdminToolbar
                      search={auditSearch}
                      onSearch={setAuditSearch}
                      placeholder="Search operator, target or details"
                      filters={[
                        { label: "All", value: "all", count: searched.length },
                        ...actions.map((action) => ({
                          label: label(action),
                          value: action,
                          count: searched.filter((log) => String(log.action) === action).length,
                        })),
                      ]}
                      filter={auditActionFilter}
                      onFilter={setAuditActionFilter}
                    />
                    {rows.length === 0 ? (
                      <AdminEmptyState
                        icon={<IconReceipt size={28} />}
                        title="No audit records"
                        hint={auditLogs.length === 0 ? "Privileged actions will be recorded here." : "Try another search or filter."}
                      />
                    ) : (
                      <>
                        <AdminTable
                          minWidth={1000}
                          dense
                          bordered
                          columns={[
                            { key: "date", label: "Time" },
                            { key: "operator", label: "Operator" },
                            { key: "target", label: "Target" },
                            { key: "action", label: "Action" },
                            { key: "details", label: "Details" },
                          ]}
                        >
                          {rows.map((log) => (
                            <tr key={log.id} className={ADMIN_TR}>
                              <td className={`whitespace-nowrap text-[11px] text-neutral-400 ${ADMIN_TD}`}>
                                {formatOrderDateTime(log.createdAt)}
                              </td>
                              <td className={`max-w-[200px] ${ADMIN_TD}`}>
                                <span className="block truncate text-xs font-medium text-white">{log.userName || "—"}</span>
                                <span className="block truncate font-mono text-[11px] text-neutral-500">{log.userId}</span>
                              </td>
                              <td className={`max-w-[180px] ${ADMIN_TD}`}>
                                <span className="block truncate text-[11px] capitalize text-neutral-300">{log.targetType}</span>
                                <span className="block truncate font-mono text-[11px] text-neutral-500">{log.targetId}</span>
                              </td>
                              <td className={ADMIN_TD}>
                                <AdminBadge
                                  tone={
                                    log.action === "account_delivery"
                                      ? "accent"
                                      : log.action === "account_status_override" || log.action === "account_update"
                                        ? "warning"
                                        : log.action === "order_status_update"
                                          ? "info"
                                          : "neutral"
                                  }
                                >
                                  {label(String(log.action || ""))}
                                </AdminBadge>
                              </td>
                              <td className={`max-w-[420px] text-[11px] text-neutral-400 ${ADMIN_TD}`}>
                                <span className="line-clamp-2" title={log.description}>
                                  {log.description}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </AdminTable>
                        <AdminTableFooter shown={rows.length} total={auditLogs.length} noun="records" />
                      </>
                    )}
                  </AdminPanel>
                );
              })()}
            </div>
          )}
          {/* Plan Details View/Edit Modal Overlay */}
          {selectedPlanDetails && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <div
                className="absolute inset-0 bg-black/75"
                onClick={() => setSelectedPlanDetails(null)}
              />
              <div className="relative z-10 w-full max-w-lg bg-neutral-950 border border-white/10 rounded-2xl p-6 shadow-2xl space-y-4 font-mono text-xs text-neutral-450">
                <div className="flex justify-between items-center border-b border-white/5 pb-2">
                  <h4 className="text-sm font-semibold text-white font-clash-display">
                    {isEditingPlan
                      ? "Edit Inventory Account"
                      : "Inventory Account Details"}
                  </h4>
                  <button
                    onClick={() => setSelectedPlanDetails(null)}
                    className="text-neutral-400 hover:text-white cursor-pointer"
                  >
                    <IconX size={16} />
                  </button>
                </div>

                {isEditingPlan ? (
                  <form
                    onSubmit={handleSavePlanDetails}
                    className="space-y-4 text-xs font-mono text-neutral-400 animate-fade-in"
                  >
                    {/* Toggle Group */}
                    <div className="grid grid-cols-2 gap-2 bg-neutral-905 p-1 rounded-xl border border-white/5">
                      <button
                        type="button"
                        onClick={() => setPlanEditType("status")}
                        className={`py-1.5 rounded-lg text-center font-bold transition-all cursor-pointer text-[10px] uppercase tracking-wider ${
                          planEditType === "status"
                            ? "bg-white text-black shadow-md"
                            : "text-neutral-500 hover:text-white"
                        }`}
                      >
                        Status Only
                      </button>
                      <button
                        type="button"
                        onClick={() => setPlanEditType("credentials")}
                        className={`py-1.5 rounded-lg text-center font-bold transition-all cursor-pointer text-[10px] uppercase tracking-wider ${
                          planEditType === "credentials"
                            ? "bg-white text-black shadow-md"
                            : "text-neutral-500 hover:text-white"
                        }`}
                      >
                        Credentials Only
                      </button>
                    </div>

                    {planEditType === "status" ? (
                      <div className="grid grid-cols-2 gap-3 p-3 bg-neutral-900 border border-white/5 rounded-xl animate-fade-in">
                        <div className="space-y-1">
                          <span className="text-neutral-500 block uppercase text-[9px]">
                            Status
                          </span>
                          <select
                            value={planEditForm.status}
                            onChange={(e) =>
                              setPlanEditForm({
                                ...planEditForm,
                                status: e.target.value as any,
                              })
                            }
                            className="w-full px-3 py-2 rounded-lg bg-neutral-900 border border-white/5 text-white outline-none"
                          >
                            <option value="available">AVAILABLE</option>
                            <option value="delivered">DELIVERED</option>
                          </select>
                        </div>
                        {planEditForm.status === "delivered" && (
                          <div className="space-y-1">
                            <span className="text-neutral-500 block uppercase text-[9px]">
                              Order ID
                            </span>
                            <input
                              type="text"
                              value={planEditForm.orderId}
                              onChange={(e) =>
                                setPlanEditForm({
                                  ...planEditForm,
                                  orderId: e.target.value,
                                })
                              }
                              className="w-full px-3 py-2 rounded-lg bg-neutral-900 border border-white/5 text-white outline-none"
                            />
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="space-y-4 p-3 bg-neutral-900 border border-white/5 rounded-xl animate-fade-in">
                        <div className="grid grid-cols-2 gap-3">
                          <div className="space-y-1">
                            <span className="text-neutral-500 block uppercase text-[9px]">
                              Platform
                            </span>
                            <select
                              value={planEditForm.platform}
                              onChange={(e) =>
                                setPlanEditForm({
                                  ...planEditForm,
                                  platform: e.target.value,
                                })
                              }
                              className="w-full px-3 py-2 rounded-lg bg-neutral-900 border border-white/5 text-white outline-none"
                            >
                              <option value="MT4">MT4</option>
                              <option value="MT5">MT5</option>
                              <option value="cTrader">cTrader</option>
                            </select>
                          </div>
                          <div className="space-y-1">
                            <span className="text-neutral-500 block uppercase text-[9px]">
                              Account Size ($)
                            </span>
                            <select
                              value={
                                customContainerEditSize ||
                                !containerSizeOptions.includes(
                                  Number(planEditForm.size),
                                )
                                  ? "custom"
                                  : planEditForm.size
                              }
                              onChange={(e) => {
                                if (e.target.value === "custom") {
                                  setCustomContainerEditSize(true);
                                  return;
                                }
                                setCustomContainerEditSize(false);
                                setPlanEditForm({
                                  ...planEditForm,
                                  size: Number(e.target.value),
                                });
                              }}
                              className="w-full px-3 py-2 rounded-lg bg-neutral-900 border border-white/5 text-white outline-none"
                            >
                              {containerSizeOptions.map((size) => (
                                <option key={size} value={size}>
                                  ${size.toLocaleString()}
                                </option>
                              ))}
                              <option value="custom">Custom size…</option>
                            </select>
                            {(customContainerEditSize ||
                              !containerSizeOptions.includes(
                                Number(planEditForm.size),
                              )) && (
                              <input
                                type="number"
                                min={1}
                                step={1}
                                value={planEditForm.size || ""}
                                onChange={(e) =>
                                  setPlanEditForm({
                                    ...planEditForm,
                                    size: Number(e.target.value),
                                  })
                                }
                                placeholder="e.g. 15000"
                                required
                                className="mt-2 w-full px-3 py-2 rounded-lg bg-neutral-900 border border-white/5 text-white outline-none"
                              />
                            )}
                          </div>
                        </div>

                        <div className="space-y-1">
                          <span className="text-neutral-500 block uppercase text-[9px]">
                            Server Name
                          </span>
                          <input
                            type="text"
                            value={planEditForm.server}
                            onChange={(e) =>
                              setPlanEditForm({
                                ...planEditForm,
                                server: e.target.value,
                              })
                            }
                            className="w-full px-3 py-2 rounded-lg bg-neutral-900 border border-white/5 text-white outline-none"
                            required
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div className="space-y-1">
                            <span className="text-neutral-500 block uppercase text-[9px]">
                              Login Reference ID
                            </span>
                            <input
                              type="text"
                              value={planEditForm.login}
                              onChange={(e) =>
                                setPlanEditForm({
                                  ...planEditForm,
                                  login: e.target.value,
                                })
                              }
                              className="w-full px-3 py-2 rounded-lg bg-neutral-900 border border-white/5 text-white outline-none"
                              required
                            />
                          </div>
                          <div className="space-y-1">
                            <span className="text-neutral-500 block uppercase text-[9px]">
                              Master Password
                            </span>
                            <input
                              type="text"
                              value={planEditForm.password}
                              onChange={(e) =>
                                setPlanEditForm({
                                  ...planEditForm,
                                  password: e.target.value,
                                })
                              }
                              className="w-full px-3 py-2 rounded-lg bg-neutral-900 border border-white/5 text-white outline-none"
                              required
                            />
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="flex gap-2 pt-2">
                      <AdminButton
                        variant="primary"
                        type="submit"
                        loading={isBusy("plan-details")}
                        className="flex-1 py-2.5"
                      >
                        Save changes
                      </AdminButton>
                      <button
                        type="button"
                        onClick={() => setIsEditingPlan(false)}
                        className="flex-1 py-2.5 bg-neutral-800 hover:bg-neutral-700 text-xs font-semibold border border-neutral-700 text-white rounded-xl cursor-pointer transition-colors"
                      >
                        Back to View
                      </button>
                    </div>
                  </form>
                ) : (
                  <div className="space-y-4">
                    <div className="p-4 bg-neutral-900 border border-white/5 rounded-xl space-y-3.5">
                      <div className="grid grid-cols-2 gap-x-4 gap-y-3">
                        <div>
                          <span className="text-neutral-500 block text-[9px] uppercase font-bold">
                            Platform
                          </span>
                          <span className="text-white font-bold text-sm block mt-0.5">
                            {selectedPlanDetails.platform}
                          </span>
                        </div>
                        <div>
                          <span className="text-neutral-500 block text-[9px] uppercase font-bold">
                            Capital Size
                          </span>
                          <span className="text-emerald-400 font-bold text-sm block mt-0.5">
                            ${(selectedPlanDetails.size || 0).toLocaleString()}{" "}
                            USD
                          </span>
                        </div>
                        <div className="col-span-2 border-t border-white/5 pt-2">
                          <span className="text-neutral-500 block text-[9px] uppercase font-bold">
                            Server Host
                          </span>
                          <span className="text-neutral-200 font-bold block mt-0.5">
                            {selectedPlanDetails.server}
                          </span>
                        </div>
                        <div className="border-t border-white/5 pt-2">
                          <span className="text-neutral-500 block text-[9px] uppercase font-bold">
                            Login ID
                          </span>
                          <span className="text-white font-bold block mt-0.5">
                            {selectedPlanDetails.login}
                          </span>
                        </div>
                        <div className="border-t border-white/5 pt-2">
                          <span className="text-neutral-500 block text-[9px] uppercase font-bold">
                            Password
                          </span>
                          <span className="text-white font-bold block mt-0.5">
                            {selectedPlanDetails.password}
                          </span>
                        </div>
                        <div className="col-span-2 border-t border-white/5 pt-2">
                          <span className="text-neutral-500 block text-[9px] uppercase font-bold">
                            Status
                          </span>
                          <span className="mt-1 block">
                            {planEditForm.status === "available" ? (
                              <span className="px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[9px] font-bold">
                                AVAILABLE FOR DELIVERY
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 rounded bg-rose-500/10 border border-rose-500/20 text-rose-400 text-[9px] font-bold">
                                DELIVERED (USED)
                              </span>
                            )}
                          </span>
                        </div>
                        {planEditForm.status === "delivered" &&
                          planEditForm.orderId && (
                            <div className="col-span-2 border-t border-white/5 pt-2">
                              <span className="text-neutral-500 block text-[9px] uppercase font-bold">
                                Delivered Order Reference
                              </span>
                              <span className="text-neutral-300 font-bold block mt-0.5">
                                #{planEditForm.orderId}
                              </span>
                            </div>
                          )}
                        <div className="col-span-2 border-t border-white/5 pt-2">
                          <span className="text-neutral-500 block text-[9px] uppercase font-bold">
                            Added On
                          </span>
                          <span className="text-neutral-300 font-bold block mt-0.5">
                            {formatOrderDateTime(selectedPlanDetails.createdAt)}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="p-4 bg-neutral-900 border border-white/5 rounded-xl space-y-3">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-neutral-500 block text-[9px] uppercase font-bold">
                          Graph
                        </span>
                        {!containerGraphForm.editing && (
                          <button
                            type="button"
                            onClick={() =>
                              setContainerGraphForm({
                                editing: true,
                                saving: false,
                                graphLink: selectedPlanDetails.graphLink || "",
                                externalStatisticsId:
                                  selectedPlanDetails.externalStatisticsId || "",
                              })
                            }
                            className="text-[10px] font-semibold text-cyan-300 hover:text-cyan-200 cursor-pointer"
                          >
                            Edit graph
                          </button>
                        )}
                      </div>

                      {containerGraphForm.editing ? (
                        <div className="space-y-3">
                          <div className="space-y-1">
                            <span className="text-neutral-500 block uppercase text-[9px]">
                              Graph Link (URL)
                            </span>
                            <input
                              type="url"
                              value={containerGraphForm.graphLink}
                              onChange={(e) =>
                                setContainerGraphForm({
                                  ...containerGraphForm,
                                  graphLink: e.target.value,
                                })
                              }
                              placeholder="https://www.myfxbook.com/..."
                              className="w-full px-3 py-2 rounded-lg bg-neutral-950 border border-white/5 text-white outline-none"
                            />
                          </div>
                          <div className="space-y-1">
                            <span className="text-neutral-500 block uppercase text-[9px]">
                              Graph ID
                            </span>
                            <input
                              type="text"
                              value={containerGraphForm.externalStatisticsId}
                              onChange={(e) =>
                                setContainerGraphForm({
                                  ...containerGraphForm,
                                  externalStatisticsId: e.target.value,
                                })
                              }
                              placeholder="mt5-7373031-..."
                              className="w-full px-3 py-2 rounded-lg bg-neutral-950 border border-white/5 text-white outline-none"
                            />
                          </div>
                          {planEditForm.status === "delivered" && (
                            <p className="text-[10px] text-neutral-500">
                              This container is delivered — the trader account
                              using it gets the same graph.
                            </p>
                          )}
                          <div className="flex gap-2">
                            <button
                              type="button"
                              disabled={containerGraphForm.saving}
                              onClick={handleSaveContainerGraph}
                              className="flex-1 py-2 bg-white text-black hover:bg-neutral-200 text-xs font-semibold rounded-lg cursor-pointer transition-colors disabled:opacity-50"
                            >
                              {containerGraphForm.saving ? "Saving…" : "Save graph"}
                            </button>
                            <button
                              type="button"
                              onClick={() =>
                                setContainerGraphForm({
                                  ...containerGraphForm,
                                  editing: false,
                                })
                              }
                              className="flex-1 py-2 bg-neutral-800 hover:bg-neutral-700 text-xs font-semibold border border-neutral-700 text-white rounded-lg cursor-pointer transition-colors"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-2.5">
                          <div>
                            <span className="text-neutral-500 block text-[9px] uppercase">
                              Graph Link
                            </span>
                            {selectedPlanDetails.graphLink ? (
                              <a
                                href={selectedPlanDetails.graphLink}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="mt-0.5 inline-flex items-center gap-1 break-all font-bold text-cyan-300 hover:text-cyan-200 underline underline-offset-2"
                              >
                                {selectedPlanDetails.graphLink}
                              </a>
                            ) : (
                              <span className="text-neutral-500 block mt-0.5">
                                No graph link
                              </span>
                            )}
                          </div>
                          <div>
                            <span className="text-neutral-500 block text-[9px] uppercase">
                              Graph ID
                            </span>
                            <span className="text-neutral-200 font-bold block mt-0.5 break-all">
                              {selectedPlanDetails.externalStatisticsId ||
                                "Not assigned"}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          setCustomContainerEditSize(false);
                          setIsEditingPlan(true);
                        }}
                        className="flex-1 py-2.5 bg-white text-black hover:bg-neutral-200 text-xs font-semibold rounded-xl cursor-pointer transition-colors"
                      >
                        Edit Configuration
                      </button>
                      <button
                        onClick={() => setSelectedPlanDetails(null)}
                        className="flex-1 py-2.5 bg-neutral-800 hover:bg-neutral-700 text-xs font-semibold border border-neutral-700 text-white rounded-xl cursor-pointer transition-colors"
                      >
                        Close
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
          {/* User profile */}
          {selectedUser &&
            (() => {
              const saving = isBusy("user-edit");
              const fieldCls =
                "h-10 w-full rounded-lg border border-white/[0.08] bg-black/30 px-3 text-[13px] text-white outline-none transition-colors placeholder:text-neutral-600 focus:border-white/25";
              const userAccounts = accounts.filter((a) => a.userId === selectedUser.id);
              const userOrders = orders.filter((o) => o.userId === selectedUser.id);
              const userKyc = kycList.find((k) => k.userId === selectedUser.id);
              const userPayouts = payouts.filter((p) => p.userId === selectedUser.id);
              const userNotifs = notifLogs.filter((log) => log.userId === selectedUser.id);
              const userEmails = emailLogs.filter((log) => log.userId === selectedUser.id);
              const referrer = selectedUser.referredBy
                ? users.find((u) => u.id === selectedUser.referredBy)?.name || selectedUser.referredBy
                : "Direct signup";
              const emptyRow = (text: string) => (
                <p className="rounded-xl border border-dashed border-white/10 py-6 text-center text-[13px] text-neutral-500">
                  {text}
                </p>
              );

              if (isEditingUser) {
                const field = (key: string, label: string, type = "text", required = false) => (
                  <label className="flex flex-col gap-1.5">
                    <span className="text-xs text-neutral-500">{label}</span>
                    <input
                      type={type}
                      value={userEditForm[key] || ""}
                      onChange={(e) => setUserEditForm({ ...userEditForm, [key]: e.target.value })}
                      className={fieldCls}
                      required={required}
                    />
                  </label>
                );
                return (
                  <AdminModal
                    open
                    busy={saving}
                    onClose={() => setIsEditingUser(false)}
                    title="Edit profile"
                    subtitle={selectedUser.email}
                    footer={
                      <>
                        <AdminButton onClick={() => setIsEditingUser(false)} disabled={saving}>
                          Cancel
                        </AdminButton>
                        <AdminButton variant="primary" type="submit" form="admin-user-edit" loading={saving}>
                          {saving ? "Saving…" : "Save changes"}
                        </AdminButton>
                      </>
                    }
                  >
                    <form id="admin-user-edit" onSubmit={handleSaveUserEdit} className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      {field("name", "Full name", "text", true)}
                      {field("email", "Email", "email", true)}
                      {field("phone", "Phone")}
                      {field("country", "Country", "text", true)}
                      <label className="flex flex-col gap-1.5">
                        <span className="text-xs text-neutral-500">Role</span>
                        <select
                          value={userEditForm.role}
                          onChange={(e) => setUserEditForm({ ...userEditForm, role: e.target.value })}
                          className={`${fieldCls} cursor-pointer`}
                        >
                          <option value="trader" className="bg-neutral-950">Trader</option>
                          <option value="affiliate" className="bg-neutral-950">Affiliate</option>
                          <option value="support" className="bg-neutral-950">Support</option>
                          <option value="admin" className="bg-neutral-950">Admin</option>
                        </select>
                      </label>
                      <label className="flex flex-col gap-1.5">
                        <span className="text-xs text-neutral-500">Status</span>
                        <select
                          value={userEditForm.status}
                          onChange={(e) => setUserEditForm({ ...userEditForm, status: e.target.value })}
                          className={`${fieldCls} cursor-pointer`}
                        >
                          <option value="active" className="bg-neutral-950">Active</option>
                          <option value="suspended" className="bg-neutral-950">Suspended</option>
                          <option value="banned" className="bg-neutral-950">Banned</option>
                        </select>
                      </label>
                      <div className="sm:col-span-2">{field("referredBy", "Referred by (user ID)")}</div>
                    </form>
                  </AdminModal>
                );
              }

              return (
                <AdminModal
                  open
                  size="lg"
                  onClose={() => setSelectedUser(null)}
                  title={selectedUser.name || "User"}
                  subtitle={selectedUser.email}
                  footer={
                    <>
                      <AdminButton
                        loading={isBusy(`impersonate:${selectedUser.id}`)}
                        onClick={() => handleImpersonateUser(selectedUser.id)}
                        className="mr-auto"
                      >
                        Login as user
                      </AdminButton>
                      <AdminButton
                        loading={isBusy(`user-reset:${selectedUser.id}`)}
                        onClick={() => handleResetDashboardPassword(selectedUser)}
                      >
                        Set temporary password
                      </AdminButton>
                      <AdminButton variant="primary" onClick={() => setIsEditingUser(true)}>
                        Edit profile
                      </AdminButton>
                    </>
                  }
                >
                  <div className="space-y-5">
                    <div className="grid grid-cols-2 gap-x-6 gap-y-3 sm:grid-cols-3">
                      {[
                        ["Phone", selectedUser.phone || "—"],
                        ["Country", selectedUser.country || "—"],
                        ["Registered", selectedUser.createdAt ? new Date(selectedUser.createdAt).toLocaleDateString() : "—"],
                        ["Role", selectedUser.role || "trader"],
                        ["Partner code", affiliates.find((a) => a.userId === selectedUser.id)?.referralCode || "—"],
                        ["Referred by", referrer],
                      ].map(([label, value]) => (
                        <div key={label} className="min-w-0">
                          <span className="block text-xs text-neutral-500">{label}</span>
                          <span className="block truncate text-[13px] capitalize text-white" title={String(value)}>
                            {value}
                          </span>
                        </div>
                      ))}
                    </div>

                    <div className="-mx-1 flex gap-1 overflow-x-auto border-b border-white/[0.07] px-1">
                      {[
                        { id: "accounts", label: "Accounts", count: userAccounts.length },
                        { id: "orders", label: "Orders", count: userOrders.length },
                        { id: "kyc", label: "KYC" },
                        { id: "payouts", label: "Payouts", count: userPayouts.length },
                        { id: "notifications", label: "Notifications", count: userNotifs.length },
                        { id: "emails", label: "Emails", count: userEmails.length },
                      ].map((innerTab) => (
                        <button
                          key={innerTab.id}
                          type="button"
                          onClick={() => setInnerUserTab(innerTab.id as any)}
                          className={`-mb-px shrink-0 border-b-2 px-3 py-2 text-[13px] font-medium transition-colors ${
                            innerUserTab === innerTab.id
                              ? "border-white text-white"
                              : "border-transparent text-neutral-500 hover:text-neutral-200"
                          }`}
                        >
                          {innerTab.label}
                          {innerTab.count !== undefined && (
                            <span className="ml-1.5 text-xs text-neutral-600">{innerTab.count}</span>
                          )}
                        </button>
                      ))}
                    </div>

                    <div className="max-h-[360px] space-y-2 overflow-y-auto pr-1">
                      {innerUserTab === "accounts" &&
                        (userAccounts.length === 0
                          ? emptyRow("No trading accounts assigned.")
                          : userAccounts.map((a) => (
                              <div key={a.id} className="flex flex-wrap items-center gap-3 rounded-xl border border-white/[0.07] px-4 py-3">
                                <div className="min-w-0 flex-1">
                                  <span className="block font-mono text-[13px] font-semibold text-white">
                                    #{a.login} <span className="font-sans text-xs font-normal text-neutral-500">{a.platform}</span>
                                  </span>
                                  <span className="block text-xs text-neutral-500">
                                    {a.phase} · ${Number(a.balance || 0).toLocaleString()}
                                  </span>
                                </div>
                                <AdminBadge status={a.status} />
                                <AdminBadge status={a.deliveryStatus === "delivered" ? "Delivered" : "Pending"} />
                                {a.status === "Passed" && getNextStagePhase(getPlanNameForAccount(a), a.phase) && (
                                  <AdminButton variant="primary" onClick={() => handleDeliverNextStage(a)}>
                                    Next stage
                                  </AdminButton>
                                )}
                                <AdminButton
                                  onClick={() => openCredentialEditor(a, a.deliveryStatus === "delivered" ? "edit" : "deliver")}
                                >
                                  {a.deliveryStatus === "delivered" ? "Credentials" : "Deliver"}
                                </AdminButton>
                              </div>
                            )))}

                      {innerUserTab === "orders" &&
                        (userOrders.length === 0
                          ? emptyRow("No orders placed.")
                          : userOrders.map((o) => (
                              <div key={o.id} className="flex items-center justify-between gap-3 rounded-xl border border-white/[0.07] px-4 py-3">
                                <div className="min-w-0">
                                  <span className="block text-[13px] text-white">{o.planName}</span>
                                  <span className="block font-mono text-xs text-neutral-500">
                                    {o.id} · {formatOrderDateTime(o.createdAt)}
                                  </span>
                                </div>
                                <div className="flex items-center gap-3">
                                  <span className="text-[13px] text-white tabular-nums">
                                    {formatMoney(Number(o.amountPaid || 0))}
                                  </span>
                                  <AdminBadge status={o.status} />
                                </div>
                              </div>
                            )))}

                      {innerUserTab === "kyc" &&
                        (!userKyc
                          ? emptyRow("No KYC submitted.")
                          : (
                            <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-white/[0.07] px-4 py-3">
                              <div className="min-w-0">
                                <span className="block text-[13px] capitalize text-white">
                                  {String(userKyc.documentType || "").replace(/_/g, " ")}
                                </span>
                                <span className="block text-xs text-neutral-500">
                                  Updated {formatOrderDateTime(userKyc.updatedAt)}
                                </span>
                                {userKyc.rejectReason && (
                                  <span className="mt-1 block text-xs text-rose-300">{userKyc.rejectReason}</span>
                                )}
                              </div>
                              <div className="flex items-center gap-2">
                                <AdminBadge status={userKyc.status} />
                                <AdminButton
                                  variant="primary"
                                  onClick={() => {
                                    setSelectedUser(null);
                                    setKycReview(userKyc);
                                  }}
                                >
                                  Review
                                </AdminButton>
                              </div>
                            </div>
                          ))}

                      {innerUserTab === "payouts" &&
                        (userPayouts.length === 0
                          ? emptyRow("No payouts requested.")
                          : userPayouts.map((p) => (
                              <div key={p.id} className="flex items-center justify-between gap-3 rounded-xl border border-white/[0.07] px-4 py-3">
                                <div>
                                  <span className="block text-[13px] text-white tabular-nums">
                                    {formatMoney(Number(p.amount || 0))}
                                  </span>
                                  <span className="block text-xs text-neutral-500">
                                    Trader share {formatMoney(Number(p.profitSplitAmount || 0))}
                                  </span>
                                </div>
                                <AdminBadge status={p.status} />
                              </div>
                            )))}

                      {innerUserTab === "notifications" &&
                        (userNotifs.length === 0
                          ? emptyRow("No notifications sent.")
                          : userNotifs.map((log) => (
                              <div key={log.id} className="rounded-xl border border-white/[0.07] px-4 py-3">
                                <div className="flex items-start justify-between gap-3">
                                  <span className="text-[13px] font-medium text-white">{log.title}</span>
                                  <AdminBadge status={log.type} />
                                </div>
                                <p className="mt-1 whitespace-pre-wrap text-xs leading-relaxed text-neutral-400">{log.message}</p>
                                <span className="mt-1.5 block text-[11px] text-neutral-600">
                                  {log.channel} · {log.read ? "read" : "unread"} · {formatOrderDateTime(log.sentAt)}
                                </span>
                              </div>
                            )))}

                      {innerUserTab === "emails" &&
                        (userEmails.length === 0
                          ? emptyRow("No emails logged.")
                          : userEmails.map((log) => (
                              <div key={log.id} className="rounded-xl border border-white/[0.07] px-4 py-3">
                                <div className="flex items-start justify-between gap-3">
                                  <span className="text-[13px] font-medium text-white">{log.subject}</span>
                                  <AdminBadge status={log.status} />
                                </div>
                                {log.error && <p className="mt-1 text-xs text-rose-300">{log.error}</p>}
                                <span className="mt-1.5 block text-[11px] text-neutral-600">
                                  {log.toEmail} · {formatOrderDateTime(log.sentAt)}
                                </span>
                              </div>
                            )))}
                    </div>
                  </div>
                </AdminModal>
              );
            })()}

          {graphAccount && (
            <AccountGraphModal
              account={graphAccount}
              trades={[]}
              onClose={() => setGraphAccount(null)}
              onRefreshNow={
                graphAccount.externalStatisticsId || graphAccount.statisticsApiId
                  ? () => handleRefreshGraphNow(graphAccount.id)
                  : undefined
              }
            />
          )}
        </div>
      )}
    </div>
  );
}


