"use client";

import React, { useEffect, useState } from "react";
import {
  IconBrandDiscord,
  IconChevronLeft,
  IconChevronRight,
  IconStar,
  IconLayoutGrid,
  IconChartBar,
  IconShoppingCart,
  IconGift as IconGiftTabler,
  IconChartLine,
  IconHistory,
  IconTrophy,
  IconBook2,
  IconShieldCheck,
  IconWallet,
  IconUsers,
  IconNews,
  IconBell,
  IconSettings,
  IconLogout,
} from "@tabler/icons-react";
import { DISCORD_INVITE_URL } from "@/config/community";
import { NotificationItem } from "../index";
// Warms the Buy Challenge catalog on hover so the tab paints its account
// sizes immediately instead of fetching them after it mounts.
import { prefetchBuyCatalog } from "./tabs/BuyChallengeTab";
import { Logo } from "@/components/Logo";
import {
  GaugeIcon,
  BriefcaseIcon,
  ShoppingCartIcon,
  ActivityIcon,
  HistoryIcon,
  TrophyIcon,
  ShieldIcon,
  FingerprintIcon,
  CreditCardIcon,
  NewspaperIcon,
  BellIcon,
  SlidersIcon,
  HelpIcon,
  XIcon,
  IconTicket,
  IconGift,
} from "./Icons";

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  notifications: NotificationItem[];
  mobileOpen: boolean;
  setMobileOpen: (open: boolean) => void;
  userRole?: string;
  isCrmPortal?: boolean;
  /** Shows an amber dot on KYC until verification is approved. */
  kycPending?: boolean;
}

interface SidebarItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  badge?: number;
  dot?: boolean;
}

interface SidebarSection {
  title: string;
  items: SidebarItem[];
}

export default function Sidebar({
  activeTab,
  setActiveTab,
  notifications,
  mobileOpen,
  setMobileOpen,
  userRole = "trader",
  isCrmPortal = false,
  kycPending = false,
}: SidebarProps) {
  const unreadCount = notifications.filter((n) => !n.read).length;
  const canCollapse = isCrmPortal && userRole === "admin";
  const [isCollapsed, setIsCollapsed] = useState(false);

  useEffect(() => {
    if (!canCollapse) {
      setIsCollapsed(false);
      return;
    }

    setIsCollapsed(window.localStorage.getItem("admin-sidebar-collapsed") === "true");
  }, [canCollapse]);

  const toggleCollapsed = () => {
    const nextValue = !isCollapsed;
    setIsCollapsed(nextValue);
    window.localStorage.setItem("admin-sidebar-collapsed", String(nextValue));
  };

  const ICON = 20;
  const traderSections: SidebarSection[] = [
    {
      title: "Main",
      items: [
        { id: "overview", label: "Dashboard", icon: <IconLayoutGrid size={ICON} stroke={1.7} /> },
        { id: "accounts", label: "My accounts", icon: <IconChartBar size={ICON} stroke={1.7} /> },
        { id: "buy", label: "Buy challenge", icon: <IconShoppingCart size={ICON} stroke={1.7} /> },
        { id: "offers", label: "Offers", icon: <IconGiftTabler size={ICON} stroke={1.7} /> },
      ],
    },
    {
      title: "Trading",
      items: [
        { id: "performance", label: "Analytics", icon: <IconChartLine size={ICON} stroke={1.7} /> },
        { id: "history", label: "Trade log", icon: <IconHistory size={ICON} stroke={1.7} /> },
        { id: "rules", label: "Rule book", icon: <IconBook2 size={ICON} stroke={1.7} /> },
        { id: "achievements", label: "Achievements", icon: <IconTrophy size={ICON} stroke={1.7} /> },
      ],
    },
    {
      title: "Account",
      items: [
        { id: "kyc", label: "KYC", icon: <IconShieldCheck size={ICON} stroke={1.7} />, dot: kycPending },
        { id: "payouts", label: "Withdraw", icon: <IconWallet size={ICON} stroke={1.7} /> },
        { id: "referrals", label: "Referrals", icon: <IconUsers size={ICON} stroke={1.7} /> },
        { id: "settings", label: "Settings", icon: <IconSettings size={ICON} stroke={1.7} /> },
      ],
    },
    {
      title: "Support",
      items: [
        {
          id: "notifications",
          label: "Alerts",
          icon: <IconBell size={ICON} stroke={1.7} />,
          badge: unreadCount > 0 ? unreadCount : undefined,
        },
        { id: "news", label: "News", icon: <IconNews size={ICON} stroke={1.7} /> },
      ],
    },
  ];

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/signout", { method: "POST" });
    } catch (error) {
      console.error("Failed to sign out cleanly:", error);
    } finally {
      const locale = window.location.pathname.split("/")[1] || "en";
      window.location.href = `/${locale}/auth/signin`;
    }
  };

  const crmSections: SidebarSection[] = [
    {
      title: "CRM Control Desk",
      items: [
        { id: "admin-telemetry", label: "Control Dashboard", icon: <GaugeIcon size={16} /> },
        { id: "admin-users", label: "User Manager", icon: <FingerprintIcon size={16} /> },
        { id: "admin-kyc", label: "KYC Requests", icon: <FingerprintIcon size={16} /> },
        { id: "admin-orders", label: "Orders Desk", icon: <ShoppingCartIcon size={16} /> },
        { id: "admin-plans", label: "Challenge Inventory", icon: <BriefcaseIcon size={16} /> },
        { id: "admin-pricing", label: "Sizes & Pricing Catalog", icon: <CreditCardIcon size={16} /> },
        { id: "admin-coupons", label: "Coupons Manager", icon: <IconTicket size={16} /> },
        { id: "admin-offers", label: "Offers Manager", icon: <IconGift size={16} /> },
      ],
    },
    {
      title: "Operations & Compliance",
      items: [
        { id: "admin-payouts", label: "Payouts Review", icon: <CreditCardIcon size={16} /> },
        { id: "admin-news-calendar", label: "News Calendar", icon: <NewspaperIcon size={16} /> },
        { id: "admin-collaborators", label: "Collaborator Sales", icon: <TrophyIcon size={16} /> },
        { id: "admin-affiliates", label: "Affiliates Desk", icon: <TrophyIcon size={16} /> },
        { id: "admin-promotions", label: "Email Promotions", icon: <NewspaperIcon size={16} /> },
        { id: "admin-trustpilot", label: "Trustpilot Invitations", icon: <IconStar size={16} /> },
        { id: "admin-notifications", label: "Alerts Broadcast", icon: <BellIcon size={16} /> },
        { id: "admin-pixel-events", label: "Pixel Events", icon: <ActivityIcon size={16} /> },
        { id: "admin-audit", label: "System Audit Logs", icon: <HistoryIcon size={16} /> },
      ],
    },
    {
      title: "Switch Portal",
      items: [
        { id: "go-trader", label: "Trader Dashboard", icon: <SlidersIcon size={16} /> },
      ],
    },
  ];

  const sections = isCrmPortal ? crmSections : traderSections;

  const SidebarContent = ({ collapsed = false }: { collapsed?: boolean }) => (
    <div className="relative z-20 flex h-full flex-shrink-0 select-none p-3">
      <div
        className={`flex h-full flex-col overflow-hidden rounded-2xl border border-white/10 text-white ${
          collapsed ? "w-[84px]" : "w-[min(272px,82vw)] md:w-[256px]"
        }`}
        style={{
          background:
            "radial-gradient(circle at center top, rgba(168, 85, 247, 0.16) 0%, transparent 30%), linear-gradient(rgb(18, 10, 34) 0%, rgb(23, 13, 43) 48%, rgb(31, 18, 56) 100%)",
        }}
      >
        {/* Brand */}
        <div className={`flex h-[72px] shrink-0 items-center ${collapsed ? "justify-center px-3" : "justify-between gap-3 px-5"}`}>
          <Logo
            size="md"
            asLink
            className={`flex items-center ${collapsed ? "justify-center [&_span]:hidden" : ""}`}
          />
          {canCollapse && (
            <button
              type="button"
              onClick={toggleCollapsed}
              title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
              aria-label={collapsed ? "Expand admin sidebar" : "Collapse admin sidebar"}
              aria-expanded={!collapsed}
              className="hidden h-8 w-8 shrink-0 items-center justify-center rounded-lg text-white/50 hover:bg-white/[0.06] hover:text-white md:inline-flex"
            >
              {collapsed ? <IconChevronRight size={18} /> : <IconChevronLeft size={18} />}
            </button>
          )}
          <button
            onClick={() => setMobileOpen(false)}
            aria-label="Close menu"
            className="shrink-0 rounded-lg p-2 text-white/60 hover:bg-white/[0.06] hover:text-white md:hidden"
          >
            <XIcon size={16} />
          </button>
        </div>

        {/* Nav */}
        <nav className={`custom-scrollbar flex-1 space-y-5 overflow-y-auto overflow-x-hidden py-3 ${collapsed ? "px-3" : "px-3"}`}>
          {sections.map((section) => (
            <div key={section.title}>
              {!collapsed && (
                <h3 className="mb-1.5 px-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-white/40">
                  {section.title}
                </h3>
              )}
              <ul className="space-y-1">
                {section.items.map((item) => {
                  const isActive = activeTab === item.id;
                  return (
                    <li key={item.id}>
                      <button
                        onClick={() => {
                          if (item.id === "go-trader") {
                            const locale = window.location.pathname.split("/")[1] || "en";
                            window.location.href = `/${locale}/dashboard`;
                            return;
                          }
                          setActiveTab(item.id);
                          setMobileOpen(false);
                        }}
                        onMouseEnter={item.id === "buy" ? prefetchBuyCatalog : undefined}
                        onFocus={item.id === "buy" ? prefetchBuyCatalog : undefined}
                        title={collapsed ? item.label : undefined}
                        aria-label={collapsed ? item.label : undefined}
                        aria-current={isActive ? "page" : undefined}
                        className={`relative flex w-full cursor-pointer items-center rounded-xl border py-2.5 text-sm font-medium text-white ${
                          collapsed ? "justify-center px-2" : "justify-between gap-3 px-3"
                        } ${isActive ? "dash-nav-active" : "border-transparent hover:bg-white/[0.05]"}`}
                      >
                        <span className={`flex min-w-0 items-center ${collapsed ? "justify-center" : "gap-3"}`}>
                          <span className="shrink-0 text-white">{item.icon}</span>
                          <span className={collapsed ? "sr-only" : "truncate"}>{item.label}</span>
                        </span>
                        {item.badge !== undefined && (
                          <span
                            className={
                              collapsed
                                ? "absolute right-2 top-2 h-2.5 w-2.5 rounded-full bg-brand-primary"
                                : "flex h-5 min-w-5 items-center justify-center rounded-full bg-brand-primary px-1.5 text-[11px] font-bold text-button-text"
                            }
                          >
                            {!collapsed && item.badge}
                          </span>
                        )}
                        {item.dot && item.badge === undefined && (
                          <span
                            aria-label="Action needed"
                            className={`h-2 w-2 rounded-full bg-amber-400 ${collapsed ? "absolute right-2 top-2" : ""}`}
                          />
                        )}
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>

        {!isCrmPortal && (
          <div className="shrink-0 space-y-1 p-3">
            {!collapsed && (
              <div
                className="relative mb-2 overflow-hidden rounded-xl border p-4"
                style={{
                  backgroundImage: "linear-gradient(155deg, rgb(58, 24, 104) 0%, rgb(30, 14, 56) 100%)",
                  borderColor: "rgba(168, 85, 247, 0.3)",
                }}
              >
                <div
                  className="pointer-events-none absolute inset-0"
                  style={{ backgroundImage: "radial-gradient(circle at 88% 14%, rgba(147, 51, 234, 0.5) 0%, transparent 52%)" }}
                />
                <div className="relative">
                  <h3 className="mb-2 text-sm font-semibold text-white">Ready to conquer?</h3>
                  <button
                    type="button"
                    onClick={() => {
                      setActiveTab("buy");
                      setMobileOpen(false);
                    }}
                    onMouseEnter={prefetchBuyCatalog}
                    className="dash-cta w-full"
                  >
                    Start Challenge
                  </button>
                </div>
              </div>
            )}
            <a
              href={DISCORD_INVITE_URL}
              target="_blank"
              rel="noopener noreferrer"
              title={collapsed ? "Join our Discord" : undefined}
              aria-label="Join our Discord community"
              className={`flex items-center rounded-xl py-2.5 text-sm font-medium text-white hover:bg-white/[0.05] ${
                collapsed ? "justify-center px-2" : "gap-3 px-3"
              }`}
            >
              <IconBrandDiscord size={20} className="shrink-0 text-[#8b95ff]" />
              {!collapsed && <span>Join our Discord</span>}
            </a>
            <button
              type="button"
              onClick={() => void handleLogout()}
              title={collapsed ? "Log out" : undefined}
              aria-label="Log out"
              className={`flex w-full items-center rounded-xl py-2.5 text-sm font-medium text-rose-400 hover:bg-rose-500/10 ${
                collapsed ? "justify-center px-2" : "gap-3 px-3"
              }`}
            >
              <IconLogout size={20} className="shrink-0" />
              {!collapsed && <span>Log out</span>}
            </button>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <div className="hidden md:block h-full">
        <SidebarContent collapsed={canCollapse && isCollapsed} />
      </div>

      {/* Mobile Drawer Overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          {/* Backdrop */}
          <div
            onClick={() => setMobileOpen(false)}
            className="absolute inset-0 bg-black/80"
          />
          {/* Sidebar Panel */}
          <div className="relative z-10 flex h-full shadow-2xl">
            <SidebarContent />
          </div>
        </div>
      )}
    </>
  );
}
