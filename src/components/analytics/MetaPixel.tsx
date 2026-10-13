"use client";

import Script from "next/script";
import { usePathname, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useRef } from "react";
import { META_PIXEL_ID, trackMetaEvent } from "@/lib/metaPixel";

const PURCHASE_STORAGE_PREFIX = "range4ex_meta_purchase_";
const PURCHASE_POLL_INTERVAL_MS = 5_000;
const PURCHASE_POLL_LIMIT = 12;

type Order = {
  id: string;
  planId?: string;
  planName?: string;
  amountPaid?: number;
  status?: string;
};

function MetaPageViewTracker() {
  const pathname = usePathname();
  const previousPathname = useRef(pathname);

  useEffect(() => {
    if (previousPathname.current !== pathname) {
      trackMetaEvent("PageView");
      previousPathname.current = pathname;
    }
  }, [pathname]);

  return null;
}

function MetaPurchaseTracker() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("orderId");
  const isPaymentReturn =
    searchParams.get("payment") === "success" ||
    searchParams.get("success") === "1";

  useEffect(() => {
    if (!isPaymentReturn || !orderId) return;

    const storageKey = `${PURCHASE_STORAGE_PREFIX}${orderId}`;
    if (window.localStorage.getItem(storageKey)) return;

    let cancelled = false;
    let attempts = 0;
    let timeoutId: ReturnType<typeof setTimeout> | undefined;

    const confirmAndTrackPurchase = async () => {
      attempts += 1;

      try {
        const response = await fetch("/api/orders", {
          credentials: "same-origin",
          cache: "no-store",
        });

        if (!response.ok) return;

        const result = await response.json();
        const order = (result.orders as Order[] | undefined)?.find(
          (item) => item.id === orderId,
        );

        if (!order) {
          return;
        }

        const tracked = trackMetaEvent(
          "Purchase",
          {
            value: Number(order.amountPaid || 0),
            currency: "USD",
            content_ids: order.planId ? [order.planId] : undefined,
            content_name: order.planName || "Trading challenge",
            content_type: "product",
          },
          { eventID: `purchase_${order.id}` },
        );

        if (tracked) {
          window.localStorage.setItem(storageKey, new Date().toISOString());
          cancelled = true;
        }
      } catch (error) {
        console.error("Meta purchase tracking error:", error);
      } finally {
        if (!cancelled && attempts < PURCHASE_POLL_LIMIT) {
          timeoutId = setTimeout(
            confirmAndTrackPurchase,
            PURCHASE_POLL_INTERVAL_MS,
          );
        }
      }
    };

    void confirmAndTrackPurchase();

    return () => {
      cancelled = true;
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [isPaymentReturn, orderId]);

  return null;
}

export function MetaPixel() {
  return (
    <>
      <Script id="meta-pixel" strategy="afterInteractive">
        {`
          !function(f,b,e,v,n,t,s)
          {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
          n.callMethod.apply(n,arguments):n.queue.push(arguments)};
          if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
          n.queue=[];t=b.createElement(e);t.async=!0;
          t.src=v;s=b.getElementsByTagName(e)[0];
          s.parentNode.insertBefore(t,s)}(window, document,'script',
          'https://connect.facebook.net/en_US/fbevents.js');
          fbq('init', '${META_PIXEL_ID}');
          fbq('track', 'PageView');
        `}
      </Script>
      <noscript
        dangerouslySetInnerHTML={{
          __html: `<img height="1" width="1" style="display:none" src="https://www.facebook.com/tr?id=${META_PIXEL_ID}&ev=PageView&noscript=1" alt="" />`,
        }}
      />
      <MetaPageViewTracker />
      <Suspense fallback={null}>
        <MetaPurchaseTracker />
      </Suspense>
    </>
  );
}
