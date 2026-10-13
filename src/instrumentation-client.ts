import { trackMetaEvent } from "@/lib/metaPixel";

const originalFetch = window.fetch.bind(window);

function getRequestUrl(input: RequestInfo | URL) {
  if (typeof input === "string") return input;
  if (input instanceof URL) return input.href;
  return input.url;
}

function getRequestMethod(input: RequestInfo | URL, init?: RequestInit) {
  if (init?.method) return init.method.toUpperCase();
  if (input instanceof Request) return input.method.toUpperCase();
  return "GET";
}

window.fetch = (async (
  input: RequestInfo | URL,
  init?: RequestInit,
): Promise<Response> => {
  const response = await originalFetch(input, init);

  try {
    const url = new URL(getRequestUrl(input), window.location.origin);
    const method = getRequestMethod(input, init);

    if (
      method === "POST" &&
      url.pathname === "/api/auth/signup" &&
      response.ok
    ) {
      const result = await response.clone().json();

      if (result.success) {
        trackMetaEvent(
          "CompleteRegistration",
          {
            content_name: "Range4ex trader account",
            status: true,
          },
          result.user?.id
            ? { eventID: `registration_${result.user.id}` }
            : undefined,
        );
      }
    }
  } catch (error) {
    console.error("Meta conversion tracking error:", error);
  }

  return response;
}) as typeof window.fetch;

export function onRouterTransitionStart() {
  trackMetaEvent("PageView");
}
