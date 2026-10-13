import type { Metadata } from "next";
import "@/styles/globals.css";
import { TrustpilotScript } from "@/components/analytics/TrustpilotScript";
import { ZenTryWidget } from "@/components/analytics/ZenTryWidget";

export const metadata: Metadata = {
  title: "Checkout | Range4ex",
  robots: { index: false, follow: false },
};

export default function PayLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" dir="ltr" suppressHydrationWarning>
      <head>
        <TrustpilotScript />
        <ZenTryWidget />
      </head>
      <body className="antialiased bg-bg-dark">{children}</body>
    </html>
  );
}
