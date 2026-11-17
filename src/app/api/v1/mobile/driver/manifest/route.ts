import {
  getAllBottleExchanges,
  getDriverProfile,
  getDriverStops,
} from "@/lib/dispatch-store";
import { getUnreadNotificationCount } from "@/lib/notification-store";
import { mobileError, mobileSuccess, verifyMobileAuth } from "@/lib/mobile-auth";

export async function GET(request: Request) {
  try {
    const authResult = await verifyMobileAuth(request, ["DRIVER"]);
    if (!authResult.ok) return authResult.response;

    const driverId = authResult.user.id;
    const [driverProfile, stops, unreadNotifications] = await Promise.all([
      getDriverProfile(driverId),
      getDriverStops(driverId),
      getUnreadNotificationCount(driverId, "DRIVER"),
    ]);

    const exchanges = getAllBottleExchanges().filter((e) => e.driverId === driverId);

    const activeStops = stops.filter((s) => s.status !== "DELIVERED");
    const completedStops = stops.filter((s) => s.status === "DELIVERED");

    const totalBottlesDelivered = completedStops.reduce(
      (acc, s) => acc + s.bottlesDelivering,
      0
    );
    const totalEmptyCollected = exchanges.reduce((acc, e) => acc + e.emptyCollected, 0);
    const totalDamaged = exchanges.reduce((acc, e) => acc + e.damagedCount, 0);
    const cashToCollect = activeStops
      .filter((s) => s.paymentMethod === "CASH_ON_DELIVERY")
      .reduce((acc, s) => acc + s.amount, 0);
    const cashCollected = completedStops
      .filter((s) => s.paymentMethod === "CASH_ON_DELIVERY")
      .reduce((acc, s) => acc + s.amount, 0);

    return mobileSuccess(
      {
        shiftDate: new Date().toISOString().split("T")[0],
        driver: {
          id: authResult.dbUser.id,
          name: authResult.dbUser.name,
          phone: authResult.dbUser.phone,
          vanNumber: driverProfile?.vanNumber || "Van 01",
          licensePlate: driverProfile?.licensePlate || "GT-4421-23",
          isAvailable: driverProfile?.isAvailable ?? true,
        },
        unreadNotifications,
        metrics: {
          totalStops: stops.length,
          pendingStops: activeStops.length,
          completedStops: completedStops.length,
          bottlesDelivered: totalBottlesDelivered,
          emptyCollected: totalEmptyCollected,
          damagedBottles: totalDamaged,
          cashToCollect,
          cashCollected,
        },
        stops,
        exchanges,
      },
      200,
      "Driver delivery manifest loaded successfully."
    );
  } catch (error) {
    console.error("[Mobile API driver/manifest GET error]:", error);
    return mobileError("SERVER_ERROR", "Failed to load driver delivery manifest.", 500);
  }
}
