import { NextResponse, type NextRequest } from "next/server";

import { canAccessPathname, ROLE_HOME } from "@/lib/permissions";
import { SESSION_COOKIE, verifySessionCookie } from "@/lib/auth/session";

/**
 * Proxy (formerly "middleware" — renamed in Next.js 16, and always Node.js
 * runtime here).
 *
 * This performs *optimistic* gating only: it verifies the session cookie's
 * signature and redirects on that basis. It intentionally performs no database
 * work, because the proxy runs on every request including link prefetches.
 *
 * It is not a security boundary. Real authorization happens in lib/auth/dal.ts
 * next to the data, which also covers Server Functions — those are POSTs to
 * whichever route declares them, so proxy coverage can shift when a matcher or
 * a file location changes.
 */

const AUTH_ROUTES = ["/login", "/register", "/forgot-password"];

const PROTECTED_PREFIXES = [
  "/admin",
  "/manager",
  "/agent",
  "/driver",
  "/customer",
  // Shared by every signed-in role, so it has no entry in ROLE_ROUTE_PREFIX.
  "/notifications",
];

export async function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  const session = await verifySessionCookie(
    request.cookies.get(SESSION_COOKIE)?.value,
  );

  const isAuthRoute = AUTH_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`),
  );
  const isProtected = PROTECTED_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );

  // Unauthenticated visitor reaching a portal: send to login, remembering
  // where they wanted to go.
  if (isProtected && !session) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("next", `${pathname}${search}`);
    return NextResponse.redirect(loginUrl);
  }

  if (session) {
    // Already signed in: the auth pages are pointless, go to their portal.
    if (isAuthRoute) {
      return NextResponse.redirect(
        new URL(ROLE_HOME[session.role] ?? "/", request.url),
      );
    }

    // Signed in but browsing another role's portal. The DAL would reject this
    // anyway; redirecting is simply a better experience than a 403 page.
    if (isProtected && !canAccessPathname(session.role, pathname)) {
      return NextResponse.redirect(
        new URL(ROLE_HOME[session.role] ?? "/", request.url),
      );
    }
  }

  return NextResponse.next();
}

export const config = {
  // Skip static assets and image optimization. API routes are excluded because
  // they authorize themselves and return JSON rather than redirects.
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
