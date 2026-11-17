import {
  buildMobileUserPayload,
  getRequestOrigin,
  mobileError,
  mobileSuccess,
  verifyMobileAuth,
} from "@/lib/mobile-auth";

export async function GET(request: Request) {
  try {
    const authResult = await verifyMobileAuth(request);
    if (!authResult.ok) {
      return authResult.response;
    }

    const enrichedUser = await buildMobileUserPayload(
      authResult.dbUser,
      getRequestOrigin(request)
    );

    return mobileSuccess(enrichedUser, 200, "User profile retrieved successfully.");
  } catch (error) {
    console.error("[Mobile API auth/me error]:", error);
    return mobileError("SERVER_ERROR", "Failed to retrieve user profile.", 500);
  }
}
