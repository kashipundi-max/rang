import type { Metadata } from "next";
import Script from "next/script";
import "@/styles/globals.css";
import Layout from "@/components/shared/layout";
import { NextIntlClientProvider, hasLocale } from "next-intl";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";
import { getMessages, setRequestLocale } from "next-intl/server";
import Providers from "./providers";
import { TrustpilotScript } from "@/components/analytics/TrustpilotScript";
import { ZenTryWidget } from "@/components/analytics/ZenTryWidget";
import { skinFontVariables } from "@/styles/bgFonts";

export const metadata: Metadata = {
  title: "Range4ex | Simulated Trading Evaluation Programs",
  description:
    "Build trading discipline through Range4ex simulated trading challenges, skill-based prop firm evaluations, and educational performance programs.",
  keywords: [
    "Range4ex",
    "trading challenge",
    "prop firm evaluation",
    "trader skills assessment",
    "forex evaluation program",
    "simulated trading account",
    "skill-based trading program",
  ],
  authors: [{ name: "Range4ex" }],
  creator: "Range4ex",
  publisher: "Range4ex",
  icons: {
    icon: [{ url: "/favicon-32.png", type: "image/png", sizes: "32x32" }],
    shortcut: "/favicon-32.png",
    apple: "/logo-180.png",
  },
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL || "https://range4ex.com"
  ),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Range4ex | Simulated Trading Evaluation Programs",
    description:
      "Build trading discipline through simulated trading challenges and skill-based prop firm evaluations from Range4ex.",
    url: "/",
    siteName: "Range4ex",
    images: [
      {
        url: "/meta_image.webp",
        width: 1200,
        height: 630,
        alt: "Range4ex trading evaluation platform",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Range4ex | Simulated Trading Evaluation Programs",
    description:
      "Explore simulated trading challenges and skill-based prop firm evaluations from Range4ex.",
    images: ["/meta_image.webp"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  category: "education",
};

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

type Props = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

export default async function LocaleLayout({ children, params }: Props) {
  const { locale } = await params;

  // Ensure that the incoming `locale` is valid
  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  // Enable static rendering
  setRequestLocale(locale);

  // Get messages for client components
  const messages = await getMessages();

  // Determine text direction based on locale
  const dir = locale === "ar" ? "rtl" : "ltr";

  return (
    <html lang={locale} dir={dir} suppressHydrationWarning>
      <head>
        <link
          rel="preload"
          href="/font/clash-display/ClashDisplay-Variable.woff2"
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        />
        <link rel="preconnect" href="https://chat-system-wabd.vercel.app" />
        <link rel="dns-prefetch" href="https://chat-system-wabd.vercel.app" />
        <TrustpilotScript />
        <ZenTryWidget />
      </head>
      <body className={`antialiased bg-bg-dark ${skinFontVariables}`}>
        <NextIntlClientProvider messages={messages}>
          <Providers defaultTheme="purple">
            <Layout>{children}</Layout>
          </Providers>
        </NextIntlClientProvider>
        {/* Chatify Live Chat Support */}
        <Script
          id="chatify-widget"
          src="https://chat-system-wabd.vercel.app/widget.js"
          data-workspace-id="47345f70-4895-4ff6-bcf8-153034225cae"
          strategy="lazyOnload"
        />
      </body>
    </html>
  );
}
