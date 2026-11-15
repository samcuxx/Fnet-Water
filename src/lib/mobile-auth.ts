import jwt from "jsonwebtoken";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { normalizeGhanaPhone } from "@/lib/mnotify";
import { findUserByIdentifier } from "@/lib/auth-store";

const JWT_SECRET = process.env.NEXTAUTH_SECRET || "fnet-water-mobile-secret-dev-2026-very-secure";
const ACCESS_TOKEN_TTL = "1d"; // 24 hours access token for seamless mobile experience
const REFRESH_TOKEN_TTL = "30d"; // 30 days refresh token

export interface MobileJwtPayload {
  sub: string;
  id: string;
  role: "CUSTOMER" | "DRIVER" | "AGENT" | "ADMIN" | "MANAGER";
  phone: string;
  name: string;
  email?: string;
  type?: "access" | "refresh";
}

/**
 * Standard Success Envelope
 */
export function mobileSuccess<T = unknown>(
  data: T,
  statusCode = 200,
  message = "Operation completed successfully."
) {
  return NextResponse.json(
    {
      success: true,
      statusCode,
      message,
      data,
    },
    { status: statusCode }
  );
}

/**
 * Standard Error Envelope
 */
export function mobileError(
  error: string,
  message: string,
  statusCode = 400,
  details?: unknown
) {
  return NextResponse.json(
    {
      success: false,
      statusCode,
      error,
      message,
      ...(details !== undefined ? { details } : {}),
    },
    { status: statusCode }
  );
}

/**
 * Sign Mobile Access Token (JWT)
 */
export function signMobileAccessToken(user: {
  id: string;
  role: string;
  phone: string;
  name: string;
  email?: string;
}): string {
  const payload: MobileJwtPayload = {
    sub: user.id,
    id: user.id,
    role: user.role as MobileJwtPayload["role"],
    phone: user.phone,
    name: user.name,
    email: user.email,
    type: "access",
  };

  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: ACCESS_TOKEN_TTL,
  });
}

/**
 * Sign Mobile Refresh Token (JWT)
 */
export function signMobileRefreshToken(user: { id: string }): string {
  return jwt.sign(
    {
      sub: user.id,
      id: user.id,
      type: "refresh",
    },
    JWT_SECRET,
    {
      expiresIn: REFRESH_TOKEN_TTL,
    }
  );
}

/**
 * Verify and decode a JWT token
 */
export function verifyMobileToken(token: string): MobileJwtPayload | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as MobileJwtPayload;
    return decoded;
  } catch {
    return null;
  }
}

/**
 * Guard utility for Next.js Route Handlers
 * Extracts Bearer token, verifies signature, and checks role permissions.
 */
export async function verifyMobileAuth(
  req: Request,
  allowedRoles?: Array<"CUSTOMER" | "DRIVER" | "AGENT" | "ADMIN" | "MANAGER">
): Promise<
  | { ok: true; user: MobileJwtPayload }
  | { ok: false; response: NextResponse }
> {
  const authHeader = req.headers.get("authorization") || req.headers.get("Authorization");

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return {
      ok: false,
      response: mobileError(
        "UNAUTHORIZED",
        "Missing or malformed Authorization header. Bearer token required.",
        401
      ),
    };
  }

  const token = authHeader.substring(7).trim();
  const payload = verifyMobileToken(token);

  if (!payload || payload.type !== "access") {
    return {
      ok: false,
      response: mobileError(
        "INVALID_TOKEN",
        "Access token is invalid or has expired. Please refresh your session.",
        401
      ),
    };
  }

  // Check role authorization
  if (allowedRoles && allowedRoles.length > 0) {
    if (!allowedRoles.includes(payload.role)) {
      return {
        ok: false,
        response: mobileError(
          "FORBIDDEN",
          `Access denied. Role '${payload.role}' is not authorized for this action.`,
          403
        ),
      };
    }
  }

  return { ok: true, user: payload };
}
