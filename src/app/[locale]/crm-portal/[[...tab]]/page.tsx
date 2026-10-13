"use client";

import DashboardContainer from "@/features/dashboard";

export default function CrmPortalPage() {
  return <DashboardContainer initialTab="admin-telemetry" isCrmPortal={true} />;
}
