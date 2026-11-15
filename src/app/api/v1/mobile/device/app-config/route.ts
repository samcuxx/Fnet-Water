import { mobileSuccess } from "@/lib/mobile-auth";

export async function GET() {
  return mobileSuccess(
    {
      appName: "F Net Water Hub",
      environment: process.env.NODE_ENV || "development",
      maintenanceMode: false,
      minSupportedVersion: "1.0.0",
      latestVersion: "1.0.0",
      supportHotline: "+233241234567",
      supportWhatsApp: "+233241234567",
      supportEmail: "support@fnetwater.com",
      pricing: {
        currency: "GHS",
        currencySymbol: "GH₵",
        refillPrice: 18.0,
        bottleDepositFee: 35.0,
        freeBottleReferralThreshold: 5,
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
