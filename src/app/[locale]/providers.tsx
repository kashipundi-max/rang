"use client";

import { useEffect } from "react";
import dynamic from "next/dynamic";
import { usePathname } from "next/navigation";
import { initClientDb } from "@/lib/clientDb";
import { ProgressProvider } from "@bprogress/next/app";
import { ThemeColorProvider } from "@/Demo/ThemeColorSwitcher/ThemeColorProvider";

const ThemeColorSwitcher = dynamic(
  () =>
    import("@/Demo/ThemeColorSwitcher/ThemeColorSwitcher").then(
      (module) => module.ThemeColorSwitcher
    ),
  { ssr: false }
);

import { Toaster, toast } from "sonner";

interface ProvidersProps {
  children: React.ReactNode;
  defaultTheme?: string;
}

function AdminThemeColorSwitcher() {
  const pathname = usePathname();
  const isAdminPortal = pathname.split("/").includes("crm-portal");

  return isAdminPortal ? <ThemeColorSwitcher /> : null;
}

/**
 * Client-side providers wrapper
 * Includes:
 * - BProgress for page navigation progress bar
 * - ThemeColorProvider for dynamic theme colors
 */
export default function Providers({
  children,
  defaultTheme = "purple",
}: ProvidersProps) {
  useEffect(() => {
    if (typeof window === "undefined") return;
    initClientDb();

    // Override global window.alert with premium Sonner toasts
    window.alert = (message: any) => {
      const msg = String(message || "");
      const lower = msg.toLowerCase();
      const isError = lower.includes("error") || 
                      lower.includes("fail") || 
                      lower.includes("invalid") || 
                      lower.includes("denied") || 
                      lower.includes("forbidden") ||
                      lower.includes("rejected");
      const isSuccess = lower.includes("success") || 
                        lower.includes("confirm") || 
                        lower.includes("approve") || 
                        lower.includes("delivered") || 
                        lower.includes("granted") ||
                        lower.includes("paid");
      
      if (isError) {
        toast.error(msg, { duration: 4000 });
      } else if (isSuccess) {
        toast.success(msg, { duration: 4000 });
      } else {
        toast.info(msg, { duration: 4000 });
      }
    };
  }, []);

  return (
    <ProgressProvider
      height="2px"
      color="var(--color-brand-primary)"
      options={{ showSpinner: false }}
      shallowRouting
    >
      <ThemeColorProvider defaultTheme={defaultTheme}>
        {children}
        <Toaster theme="dark" closeButton position="top-right" richColors />

        <AdminThemeColorSwitcher />
      </ThemeColorProvider>
    </ProgressProvider>
  );
}
