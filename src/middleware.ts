import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const path = req.nextUrl.pathname;
    const role = token?.role as string | undefined;
    const status = token?.status as string | undefined;

    // Check 1: Deactivated accounts are barred from all protected portals
    if (status === "INACTIVE") {
      const loginUrl = new URL("/login", req.url);
      loginUrl.searchParams.set("error", "Your account has been deactivated. Please contact administration.");
      return NextResponse.redirect(loginUrl);
    }

    // Check 2: Already authenticated users visiting login/register get redirected to their portal
    if (path === "/login" || path === "/register") {
      if (token) {
        const dest = getRoleDashboard(role);
        return NextResponse.redirect(new URL(dest, req.url));
      }
      return NextResponse.next();
    }

    // Check 3: RBAC Guards
    // Rule A: /admin/* -> strictly ADMIN (Reports accessible to MANAGER)
    if (path.startsWith("/admin") && role !== "ADMIN") {
      if (path.startsWith("/admin/reports") && role === "MANAGER") {
        // Allow managers to access operational & business reports
      } else {
        const redirectUrl = getRoleDashboard(role);
        return NextResponse.redirect(new URL(redirectUrl, req.url));
      }
    }

    // Rule B: /manager/* -> MANAGER or ADMIN
    if (path.startsWith("/manager") && role !== "MANAGER" && role !== "ADMIN") {
      const redirectUrl = getRoleDashboard(role);
      return NextResponse.redirect(new URL(redirectUrl, req.url));
    }

    // Rule C: /driver/* -> strictly DRIVER
    if (path.startsWith("/driver") && role !== "DRIVER") {
      const redirectUrl = getRoleDashboard(role);
      return NextResponse.redirect(new URL(redirectUrl, req.url));
    }

    // Rule D: /agent/* -> strictly AGENT
    if (path.startsWith("/agent") && role !== "AGENT") {
      const redirectUrl = getRoleDashboard(role);
      return NextResponse.redirect(new URL(redirectUrl, req.url));
    }

    // Rule E: /customer/* -> strictly CUSTOMER
    if (path.startsWith("/customer") && role !== "CUSTOMER") {
      const redirectUrl = getRoleDashboard(role);
      return NextResponse.redirect(new URL(redirectUrl, req.url));
    }

    // Hardened Response with anti-cache headers (prevents bfcache back-button leaks)
    const response = NextResponse.next();
    response.headers.set(
      "Cache-Control",
      "no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0"
    );
    response.headers.set("Pragma", "no-cache");
    response.headers.set("Expires", "0");
    response.headers.set("Surrogate-Control", "no-store");

    return response;
  },
  {
    callbacks: {
      authorized: ({ req, token }) => {
        const path = req.nextUrl.pathname;
        // Allow unauthenticated access to login, register, reset-password
        if (
          path === "/login" ||
          path === "/register" ||
          path.startsWith("/reset-password") ||
          path === "/"
        ) {
          return true;
        }
        // Protected paths require a valid token
        return !!token;
      },
    },
    pages: {
      signIn: "/login",
    },
  }
);

function getRoleDashboard(role?: string): string {
  switch (role) {
    case "ADMIN":
      return "/admin";
    case "MANAGER":
      return "/manager";
    case "DRIVER":
      return "/driver";
    case "AGENT":
      return "/agent";
    case "CUSTOMER":
      return "/customer";
    default:
      return "/login";
  }
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/manager/:path*",
    "/driver/:path*",
    "/agent/:path*",
    "/customer/:path*",
    "/profile/:path*",
    "/profile",
    "/login",
    "/register",
  ],
};
