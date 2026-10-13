import {
  IconLayoutDashboard,
  IconWallet,
  IconChartLine,
  IconBell,
  IconCash,
  IconSettings,
  IconFileCheck,
  IconLifebuoy,
  IconHistory,
} from "@tabler/icons-react";
import { NavElement } from "../types";

export const navElements: NavElement[] = [
  // Main section
  { type: "section", title: "Trading" },
  {
    type: "item",
    icon: <IconLayoutDashboard size={20} />,
    label: "Overview",
    route: "Overview",
  },
  {
    type: "item",
    icon: <IconWallet size={20} />,
    label: "Accounts",
    route: "Accounts",
    badge: "3",
  },
  {
    type: "item",
    icon: <IconChartLine size={20} />,
    label: "Performance",
    route: "Performance",
  },

  // Management section
  { type: "section", title: "Account" },
  {
    type: "item",
    icon: <IconBell size={20} />,
    label: "Notifications",
    route: "Notifications",
    badge: "9",
  },
  {
    type: "item",
    icon: <IconCash size={20} />,
    label: "Payouts",
    route: "Payouts",
  },
  {
    type: "item",
    icon: <IconSettings size={20} />,
    label: "Settings",
    route: "Settings",
  },

  // Resources section
  { type: "section", title: "Resources" },
  {
    type: "item",
    icon: <IconFileCheck size={20} />,
    label: "Rules",
    route: "Rules",
  },
  {
    type: "item",
    icon: <IconLifebuoy size={20} />,
    label: "Support",
    route: "Support",
  },
  {
    type: "item",
    icon: <IconHistory size={20} />,
    label: "History",
    route: "History",
  },
];
