import React from "react";

export type Route =
    | "Overview"
    | "Accounts"
    | "Performance"
    | "Notifications"
    | "Payouts"
    | "Settings"
    | "Rules"
    | "Support"
    | "History";

export interface SidebarItem {
    type: "item";
    icon: React.ReactNode;
    label: string;
    route: Route;
    badge?: string;
}

export interface SidebarSection {
    type: "section";
    title: string;
}

export type NavElement = SidebarItem | SidebarSection;

export interface SidebarProps {
    currentRoute: Route;
    onNavigate: (route: Route) => void;
}
