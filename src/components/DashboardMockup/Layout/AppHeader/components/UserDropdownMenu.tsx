"use client";

import React from "react";
import {
  IconUser,
  IconMail,
  IconSettings2,
  IconLogout,
} from "@tabler/icons-react";

interface UserDropdownMenuProps {
  userName: string;
  userEmail: string;
}

export function UserDropdownMenu({
  userName,
  userEmail,
}: UserDropdownMenuProps) {
  return (
    <div
      className="absolute right-0 z-[100] mt-2 w-48 bg-syntask-bg rounded-md shadow-2xl border border-border-primary py-1"
      style={{ backdropFilter: "none" }}
      role="menu"
      aria-label="User menu"
    >
      {/* User Info */}
      <div className="px-4 py-2 border-b border-border-primary bg-syntask-bg">
        <div className="font-medium text-text-primary">{userName}</div>
        <div className="text-sm text-text-body">{userEmail}</div>
      </div>

      {/* Menu Items */}
      <div className="py-1 bg-syntask-bg">
        <button
          className="flex items-center gap-2 w-full px-4 py-2 text-sm text-text-body hover:bg-surface-hover"
          role="menuitem"
          aria-label="View user profile"
        >
          <IconUser size={16} />
          Profile
        </button>
        <button
          className="flex items-center gap-2 w-full px-4 py-2 text-sm text-text-body hover:bg-surface-hover"
          role="menuitem"
          aria-label="Open messages"
        >
          <IconMail size={16} />
          Messages
        </button>
        <button
          className="flex items-center gap-2 w-full px-4 py-2 text-sm text-text-body hover:bg-surface-hover"
          role="menuitem"
          aria-label="Open settings"
        >
          <IconSettings2 size={16} />
          Settings
        </button>
      </div>

      {/* Logout */}
      <div className="border-t border-border-primary py-1 bg-syntask-bg">
        <button
          className="flex items-center gap-2 w-full px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-900/20"
          role="menuitem"
          aria-label="Log out"
        >
          <IconLogout size={16} />
          Logout
        </button>
      </div>
    </div>
  );
}
