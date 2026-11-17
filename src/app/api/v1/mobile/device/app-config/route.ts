import { mobileSuccess } from "@/lib/mobile-auth";
import { NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY } from "@/lib/paystack";

export async function GET() {
  return mobileSuccess(
    {
      appName: "F Net Water Hub",
      environment: process.env.NODE_ENV || "development",
      maintenanceMode: false,
      minSupportedVersion: "1.0.0",
      latestVersion: "1.0.0",
      supportHotline: "+233241000005",
      supportWhatsApp: "+233241000005",
      supportEmail: "support@fnetwater.com",
      webPortalUrl: process.env.NEXTAUTH_URL || "http://localhost:3000",
      paystackPublicKey: NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY,
      pricing: {
        currency: "GHS",
        currencySymbol: "GH₵",
        refillPrice: 25.0,
        nonRefillPrice: 105.0,
        bottleDepositFee: 80.0,
        deliveryFee: 10.0,
        freeDeliverySubtotal: 100.0,
        freeDeliveryBottleCount: 3,
        freeBottleDiscount: 25.0,
        freeBottleReferralThreshold: 5,
        agentCommissionPerRefill: 5.0,
      },
      features: {
        rentToOwnEnabled: true,
        referralProgramEnabled: true,
        offlineSyncEnabled: true,
        biometricLoginEnabled: true,
      },
    },
    200,
    "App configuration retrieved successfully."
  );
}
