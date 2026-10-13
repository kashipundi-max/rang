"use client";

import React from "react";
import { IconLogout } from "@tabler/icons-react";

export function LogoutButton() {
  return (
    <div>
      <button
        className="w-full flex items-center gap-3 p-4 text-sm bg-neutral-950 text-text-body rounded-bl-[20px] hover:text-red-600 dark:hover:text-red-400"
        aria-label="Log out of your account"
      >
        <IconLogout size={20} className="shrink-0" />
        <span className="font-medium">Logout</span>
      </button>
    </div>
  );
}
