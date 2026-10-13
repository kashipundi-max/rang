"use client";

import React, { useState, useRef, useEffect } from "react";
import { Account, NotificationItem } from "../index";
import { Logo } from "@/components/Logo";
import { IconLogout } from "@tabler/icons-react";
import {
  MenuIcon,
  BellIcon,
  ChevronDownIcon,
  WalletIcon,
  UserIcon,
  CircleCheckIcon,
  AlertTriangleIcon,
  IconShoppingCart,
} from "./Icons";

interface HeaderProps {
  accounts: Account[];
  activeAccountId: string;
  onSwitchAccount: (accountId: string) => void;
  notifications: NotificationItem[];
  onMarkAllRead: () => void;
  profileName: string;
  profileEmail: string;
  onNavigateSettings: () => void;
  onNavigateNotifications: () => void;
  onNavigateBuyChallenge: () => void;
  mobileMenuOpen: boolean;
  setMobileMenuOpen: (open: boolean) => void;
  /** Name of the open page, shown at the top left. */
  title?: string;
}

export default function Header({
  accounts,
  activeAccountId,
  onSwitchAccount,
  notifications,
  onMarkAllRead,
  profileName,
  profileEmail,
  onNavigateSettings,
  onNavigateNotifications,
  onNavigateBuyChallenge,
  mobileMenuOpen,
  setMobileMenuOpen,
  title,
}: HeaderProps) {
  const [accountDropdownOpen, setAccountDropdownOpen] = useState(false);
  const [notificationDropdownOpen, setNotificationDropdownOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);

  const accountRef = useRef<HTMLDivElement>(null);
  const notificationRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  const activeAccount = accounts.find((a) => a.id === activeAccountId) || accounts[0];
  const unreadNotifications = notifications.filter((n) => !n.read);

  // Click outside to close dropdowns
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (accountRef.current && !accountRef.current.contains(event.target as Node)) {
        setAccountDropdownOpen(false);
      }
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setNotificationDropdownOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setProfileDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    setProfileDropdownOpen(false);

    try {
      await fetch("/api/auth/signout", { method: "POST" });
    } catch (error) {
      console.error("Failed to sign out cleanly:", error);
    } finally {
      const locale = window.location.pathname.split("/")[1] || "en";
      window.location.href = `/${locale}/auth/signin`;
    }
  };
  const displayName = profileName?.trim() || profileEmail?.split("@")[0] || "Trader";
  const initials =
    displayName
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join("") || "U";

  const menuPanel =
    "absolute z-50 mt-2 overflow-hidden rounded-2xl border border-white/10 bg-[#150b26] shadow-[0_18px_50px_rgba(0,0,0,0.7)]";

  return (
    <header className="relative z-40 flex min-h-14 flex-shrink-0 select-none items-center justify-between gap-3 bg-transparent px-3 lg:min-h-16">
      {/* Left: mobile menu + account switcher */}
      <div className="flex min-w-0 items-center gap-2 sm:gap-3">
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Open menu"
          className="-ml-1 cursor-pointer p-1.5 text-text-primary hover:text-white md:hidden"
        >
          <MenuIcon size={22} />
        </button>
        <Logo size="sm" asLink className="flex items-center md:hidden" />
        {title && <h1 className="hidden text-lg font-semibold text-white md:block">{title}</h1>}

        {accounts.length > 0 && (
          <div className="relative hidden md:block" ref={accountRef}>
            <button
              onClick={() => setAccountDropdownOpen(!accountDropdownOpen)}
              className="flex h-11 cursor-pointer items-center gap-3 rounded-xl border border-white/10 bg-white/[0.04] px-3.5 text-left hover:bg-white/[0.07]"
            >
              <WalletIcon size={18} className="text-brand-primary" />
              <div className="leading-tight">
                <div className="text-[15px] font-semibold text-white">
                  {activeAccount ? `${activeAccount.type} · $${Number(activeAccount.size || 0).toLocaleString()}` : "No account"}
                </div>
                <div className="text-[12px] text-text-muted">
                  {activeAccount?.orderId ? `Order #${activeAccount.orderId}` : activeAccount ? `#${activeAccount.id}` : ""}
                </div>
              </div>
              <ChevronDownIcon size={16} className="text-text-muted" />
            </button>

            {accountDropdownOpen && (
              <div className={`${menuPanel} left-0 w-80`}>
                <div className="border-b border-white/[0.08] px-4 py-3 text-[12px] font-semibold uppercase tracking-[0.2em] text-text-muted">
                  Switch account
                </div>
                <div className="custom-scrollbar max-h-72 overflow-y-auto">
                  {accounts.map((acc) => (
                    <button
                      key={acc.id}
                      onClick={() => {
                        onSwitchAccount(acc.id);
                        setAccountDropdownOpen(false);
                      }}
                      className={`flex w-full cursor-pointer items-center justify-between gap-3 border-b border-white/[0.06] px-4 py-3.5 text-left last:border-b-0 hover:bg-white/[0.05] ${
                        acc.id === activeAccountId ? "bg-brand-primary/[0.08]" : ""
                      }`}
                    >
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 text-[15px] font-semibold text-white">
                          #{acc.id}
                          {acc.status === "Funded" && (
                            <span className="rounded-md border border-emerald-500/30 bg-emerald-500/10 px-1.5 py-0.5 text-[11px] font-semibold text-emerald-400">
                              Funded
                            </span>
                          )}
                          {acc.status === "Passed" && (
                            <span className="rounded-md border border-sky-500/30 bg-sky-500/10 px-1.5 py-0.5 text-[11px] font-semibold text-sky-300">
                              Passed
                            </span>
                          )}
                        </div>
                        <div className="mt-0.5 text-[13px] text-text-muted">
                          {acc.type} · {acc.platform}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-[15px] font-bold text-white">${acc.balance.toLocaleString()}</div>
                        <div className="mt-0.5 text-[12px] text-text-muted">Equity ${acc.equity.toLocaleString()}</div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Right: buy, alerts, profile */}
      <div className="flex shrink-0 items-center gap-2 sm:gap-3">
        <button
          type="button"
          onClick={onNavigateBuyChallenge}
          className="dash-cta hidden items-center gap-2 lg:flex"
        >
          <IconShoppingCart size={17} strokeWidth={2} />
          <span>Start Challenge</span>
        </button>

        <div className="relative hidden sm:block" ref={notificationRef}>
          <button
            onClick={() => setNotificationDropdownOpen(!notificationDropdownOpen)}
            aria-label="Notifications"
            className="relative flex h-10 w-10 cursor-pointer items-center justify-center rounded-lg text-white/60 hover:bg-white/10 hover:text-white"
          >
            <BellIcon size={19} />
            {unreadNotifications.length > 0 && (
              <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-brand-primary" />
            )}
          </button>

          {notificationDropdownOpen && (
            <div className={`${menuPanel} -right-16 w-[min(22rem,calc(100vw-1.5rem))] sm:right-0`}>
              <div className="flex items-center justify-between border-b border-white/[0.08] px-4 py-3">
                <span className="text-[14px] font-bold text-white">
                  Notifications {unreadNotifications.length > 0 && <span className="text-brand-primary">({unreadNotifications.length})</span>}
                </span>
                {unreadNotifications.length > 0 && (
                  <button
                    onClick={() => {
                      onMarkAllRead();
                      setNotificationDropdownOpen(false);
                    }}
                    className="cursor-pointer text-[13px] font-semibold text-text-secondary hover:text-white"
                  >
                    Mark all read
                  </button>
                )}
              </div>
              <div className="custom-scrollbar max-h-80 overflow-y-auto">
                {notifications.slice(0, 5).map((notif) => (
                  <div
                    key={notif.id}
                    className={`flex gap-3 border-b border-white/[0.06] px-4 py-3.5 last:border-b-0 ${!notif.read ? "bg-brand-primary/[0.05]" : ""}`}
                  >
                    <div className="mt-0.5 flex-shrink-0">
                      {notif.type === "success" && <CircleCheckIcon size={18} className="text-emerald-400" />}
                      {notif.type === "warning" && <AlertTriangleIcon size={18} className="text-amber-400" />}
                      {notif.type === "error" && <AlertTriangleIcon size={18} className="text-rose-400" />}
                      {notif.type === "info" && <AlertTriangleIcon size={18} className="text-sky-400" />}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-[14px] font-semibold leading-snug text-white">{notif.title}</p>
                        <span className="shrink-0 text-[12px] text-text-muted">{String(notif.date || "").split(" ")[1] || notif.date}</span>
                      </div>
                      <p className="mt-1 line-clamp-2 text-[13px] text-text-secondary">{notif.message}</p>
                    </div>
                  </div>
                ))}
                {notifications.length === 0 && (
                  <div className="py-10 text-center text-[14px] text-text-muted">No new alerts.</div>
                )}
              </div>
              <button
                onClick={() => {
                  onNavigateNotifications();
                  setNotificationDropdownOpen(false);
                }}
                className="w-full cursor-pointer border-t border-white/[0.08] py-3 text-center text-[14px] font-semibold text-text-secondary hover:bg-white/[0.04] hover:text-white"
              >
                See all notifications
              </button>
            </div>
          )}
        </div>

        <div className="relative" ref={profileRef}>
          <button
            onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
            className="flex cursor-pointer items-center gap-2 rounded-lg p-1.5 hover:bg-white/5"
          >
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-primary text-[15px] font-bold text-white md:h-10 md:w-10 md:text-lg">
              {initials}
            </span>
            <span className="hidden max-w-[160px] truncate text-sm font-medium text-white md:block">{displayName}</span>
            <ChevronDownIcon size={16} className="text-white/60" />
          </button>

          {profileDropdownOpen && (
            <div className={`${menuPanel} right-0 top-full w-64`}>
              <div className="border-b border-white/[0.08] px-4 py-3.5">
                <span className="block text-[15px] font-bold text-white">{displayName}</span>
                <span className="mt-0.5 block truncate text-[13px] text-text-muted">{profileEmail}</span>
              </div>
              <button
                type="button"
                onClick={() => {
                  onNavigateSettings();
                  setProfileDropdownOpen(false);
                }}
                className="flex w-full cursor-pointer items-center gap-3 px-4 py-3.5 text-left text-[14px] font-medium text-text-primary hover:bg-white/[0.05]"
              >
                <UserIcon size={17} className="text-text-muted" />
                <span>Profile & settings</span>
              </button>
              <button
                type="button"
                onClick={() => void handleLogout()}
                className="flex w-full cursor-pointer items-center gap-3 border-t border-white/[0.08] px-4 py-3.5 text-left text-[14px] font-medium text-rose-400 hover:bg-rose-500/10"
              >
                <IconLogout size={17} />
                <span>Log out</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
