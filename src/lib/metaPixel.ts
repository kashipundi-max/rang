"use client";

export const META_PIXEL_ID =
  process.env.NEXT_PUBLIC_META_PIXEL_ID || "1821879545473321";

type MetaEventParameters = Record<
  string,
  string | number | boolean | string[] | undefined
>;

type MetaEventOptions = {
  eventID?: string;
};

declare global {
  interface Window {
    fbq?: (
      command: "track" | "trackCustom",
      eventName: string,
      parameters?: MetaEventParameters,
      options?: MetaEventOptions,
    ) => void;
  }
}

// Conversion-relevant events we also mirror to the admin pixel-events log.
// PageView is deliberately excluded — it fires on every route change and would
// bury the events that matter.
const MIRRORED_EVENTS = new Set([
  "Purchase",
  "InitiateCheckout",
  "AddToCart",
  "AddPaymentInfo",
  "CompleteRegistration",
  "Lead",
  "Subscribe",
  "StartTrial",
]);

function mirrorPixelEventToAdmin(
  eventName: string,
  parameters: MetaEventParameters,
  options?: MetaEventOptions,
) {
  if (!MIRRORED_EVENTS.has(eventName)) return;
  try {
    const body = JSON.stringify({
      eventName,
      eventId: options?.eventID,
      value: typeof parameters.value === "number" ? parameters.value : undefined,
      currency:
        typeof parameters.currency === "string"
          ? parameters.currency
          : undefined,
      contentName:
        typeof parameters.content_name === "string"
          ? parameters.content_name
          : undefined,
      contentIds: Array.isArray(parameters.content_ids)
        ? parameters.content_ids.join(",")
        : undefined,
      eventSourceUrl: window.location.href,
    });
    void fetch("/api/pixel-events", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body,
      keepalive: true,
    }).catch(() => {});
  } catch {
    /* logging must never break tracking */
  }
}

export function trackMetaEvent(
  eventName: string,
  parameters: MetaEventParameters = {},
  options?: MetaEventOptions,
) {
  if (typeof window === "undefined" || typeof window.fbq !== "function") {
    return false;
  }

  window.fbq("track", eventName, parameters, options);
  mirrorPixelEventToAdmin(eventName, parameters, options);
  return true;
}
