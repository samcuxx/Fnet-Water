import { mobileSuccess } from "@/lib/mobile-auth";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const platform = searchParams.get("platform") || "android";

  const storeUrl =
    platform === "ios"
      ? "https://apps.apple.com/app/fnet-water-hub/id6813049684"
      : "https://play.google.com/store/apps/details?id=com.fnetwater.mobile";

  return mobileSuccess(
    {
      latestVersion: "1.0.0",
      latestVersionCode: 1,
      minVersion: "1.0.0",
      forceUpdate: false,
      title: "New Update Available",
      message:
        "A new version of F-Net Water Hub is available with delivery tracking improvements and performance enhancements.",
      storeUrl,
      enabled: true,
      platform,
      checkedAt: new Date().toISOString(),
    },
    200,
    "App update configuration retrieved successfully."
  );
}
