"use client";

import React from "react";
import { SidebarProps, NavElement } from "./types";
import { navElements } from "./config";
import { BrandHeader, NavItem, SectionTitle, LogoutButton } from "./components";

export type {
  Route,
  NavElement,
  SidebarItem,
  SidebarSection,
  SidebarProps,
} from "./types";

export default function Sidebar({ currentRoute, onNavigate }: SidebarProps) {
  const renderNavElement = (element: NavElement) => {
    if (element.type === "section") {
      return <SectionTitle key={element.title} title={element.title} />;
    } else {
      return (
        <NavItem
          key={element.route}
          item={element}
          isActive={currentRoute === element.route}
          onClick={onNavigate}
        />
      );
    }
  };

  return (
    <div className="w-[200px] flex flex-col z-5 bg-neutral-950 rounded-tl-[20px] rounded-bl-[20px]">
      {/* Brand Header */}
      <BrandHeader />

      {/* Sidebar Content */}
      <div className="flex flex-1 flex-col gap-2 bg-neutral-950">
        {navElements.map((element) => renderNavElement(element))}
      </div>

      {/* Footer with logout button */}
      <LogoutButton />
    </div>
  );
}
