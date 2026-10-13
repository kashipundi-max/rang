import createMiddleware from "next-intl/middleware";
import { NextResponse, type NextRequest } from "next/server";
import { routing } from "./i18n/routing";

// help.range4ex.com is a Vercel domain on this project. Requests for that host
// are proxied to the hosted Help Center so the branded subdomain stays in the
// address bar. The `/` path maps to the specific help article; every other path
// passes straight through so the page's own assets/links resolve. Static assets
// (paths with a dot, `/_next`, …) are excluded from this middleware by `config`
// below, so those are handled by the matching `beforeFiles` rewrite in
// next.config.ts instead.
const HELP_HOST = "help.range4ex.com";
const HELP_ORIGIN = "https://chat-system-wabd.vercel.app";
const HELP_ROOT_PATH = "/help/range4ex";

const intlMiddleware = createMiddleware(routing);

export default function proxy(request: NextRequest) {
  const host = request.headers.get("host")?.split(":")[0].toLowerCase();

  if (host === HELP_HOST) {
    const { pathname, search } = request.nextUrl;
    const upstreamPath = pathname === "/" ? HELP_ROOT_PATH : pathname;
    return NextResponse.rewrite(new URL(`${upstreamPath}${search}`, HELP_ORIGIN));
  }

  return intlMiddleware(request);
}

export const config = {
  // Match all pathnames except for
  // - … if they start with `/api`, `/trpc`, `/_next`, `/_vercel` or `/pay`
  // - … the ones containing a dot (e.g. `favicon.ico`)
  // `/pay` is excluded so the standalone checkout gateway page stays locale-free.
  matcher: "/((?!api|trpc|_next|_vercel|pay|.*\\..*).*)",
};
