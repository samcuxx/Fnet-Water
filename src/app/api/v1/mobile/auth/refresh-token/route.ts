import { z } from "zod";
import { getUserById } from "@/lib/auth-store";
import {
  ACCESS_TOKEN_TTL_SECONDS,
  isMobileAllowedRole,
  mobileError,
  mobileSuccess,
  signMobileAccessToken,
  signMobileRefreshToken,
  verifyMobileToken,
} from "@/lib/mobile-auth";

const refreshTokenSchema = z.object({
  refreshToken: z.string().min(10, "Refresh token is required"),
});

export async function POST(request: Request) {
  try {
    const rawBody = await request.json().catch(() => null);
    if (!rawBody) {
      return mobileError("BAD_REQUEST", "Invalid JSON payload.", 400);
    }

    const parseResult = refreshTokenSchema.safeParse(rawBody);
    if (!parseResult.success) {
      return mobileError(
        "VALIDATION_ERROR",
        parseResult.error.issues[0]?.message || "Invalid refresh token format.",
        422
      );
    }

    const { refreshToken } = parseResult.data;
    const payload = verifyMobileToken(refreshToken);

    if (!payload || payload.type !== "refresh") {
      return mobileError(
        "INVALID_REFRESH_TOKEN",
        "The refresh token is invalid or has expired. Please sign in again.",
        401
      );
    }

    const user = await getUserById(payload.sub || payload.id);
    if (!user || user.status === "INACTIVE") {
      return mobileError(
        "USER_NOT_FOUND",
        "User account associated with this token is invalid or deactivated.",
        403
      );
    }

    if (!isMobileAllowedRole(user.role)) {
      return mobileError(
        "ROLE_NOT_ALLOWED_ON_MOBILE",
        "Admin and Manager accounts must use the web portal.",
        403
      );
    }

    const newAccessToken = signMobileAccessToken({
      id: user.id,
      role: user.role,
      phone: user.phone,
      name: user.name,
      email: user.email,
    });

    const newRefreshToken = signMobileRefreshToken({ id: user.id });

    return mobileSuccess(
      {
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
        expiresIn: ACCESS_TOKEN_TTL_SECONDS,
      },
      200,
      "Session tokens refreshed successfully."
    );
  } catch (error) {
    console.error("[Mobile API refresh-token error]:", error);
    return mobileError("SERVER_ERROR", "Failed to refresh token.", 500);
  }
}
