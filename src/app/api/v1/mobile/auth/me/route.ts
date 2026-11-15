import { mobileSuccess, mobileError, verifyMobileAuth } from "@/lib/mobile-auth";
import { findUserByIdentifier } from "@/lib/auth-store";

export async function GET(request: Request) {
  try {
    const authResult = await verifyMobileAuth(request);
    if (!authResult.ok) {
      return authResult.response;
    }

    const { user: tokenUser } = authResult;
    const user = await findUserByIdentifier(tokenUser.id);

    if (!user) {
      return mobileError("USER_NOT_FOUND", "User profile not found.", 404);
    }

    return mobileSuccess(
      {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        status: user.status,
        customerProfile:
          user.role === "CUSTOMER"
            ? {
                customerCode: user.customerCode || "CUST-001",
                bottlesHeld: user.bottlesHeld ?? 0,
                freeBottleBalance: 0,
                referralCode: `FNET-${user.phone.slice(-4)}`,
              }
            : undefined,
      },
      200,
      "User profile retrieved successfully."
    );
  } catch (error) {
    console.error("[Mobile API auth/me error]:", error);
    return mobileError("SERVER_ERROR", "Failed to retrieve user profile.", 500);
  }
}
