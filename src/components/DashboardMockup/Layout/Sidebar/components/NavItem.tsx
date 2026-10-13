"use client";

import React from "react";
import { SidebarItem, Route } from "../types";

interface NavItemProps {
  item: SidebarItem;
  isActive: boolean;
  onClick: (route: Route) => void;
}

export function NavItem({ item, isActive, onClick }: NavItemProps) {
  return (
    <div
      onClick={() => onClick(item.route)}
      className={`
        flex items-center gap-3 py-2.5 px-5 text-sm cursor-pointer
        bg-neutral-950
        ${
          isActive
            ? "font-medium bg-brand-surface/40 text-text-primary hover:bg-brand-surface/50 hover:text-white"
            : "text-text-body hover:bg-brand-surface/30 hover:text-text-primary"
        }
      `}
    >
      {item.icon}
      <span className="flex-1">{item.label}</span>
      {item.badge && (
        <span
          className={`
            px-2 py-0.5 rounded-full text-xs font-medium
            ${
              isActive
                ? "bg-brand-surface/40 text-text-primary"
                : "bg-brand-border/50 text-text-body"
            }
          `}
        >
          {item.badge}
        </span>
      )}
    </div>
  );
}
