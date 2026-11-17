import { getCustomerAddresses, getCustomerProfile } from "@/lib/customer-store";
import { getCustomerDispenserPlan } from "@/lib/dispenser-store";
import { getCustomerOrders } from "@/lib/order-store";
import { getCustomerReferralStats } from "@/lib/referral-store";
import { getUnreadNotificationCount } from "@/lib/notification-store";
import {
  getRequestOrigin,
  mobileError,
  mobileSuccess,
  verifyMobileAuth,
} from "@/lib/mobile-auth";

export async function GET(request: Request) {
  try {
    const authResult = await verifyMobileAuth(request, ["CUSTOMER"]);
    if (!authResult.ok) return authResult.response;

    const userId = authResult.user.id;
    const origin = getRequestOrigin(request);

    const [profile, addresses, orders, dispenserData, referralStats, unreadNotifications] =
      await Promise.all([
        getCustomerProfile(userId),
        getCustomerAddresses(userId),
        getCustomerOrders(userId),
        getCustomerDispenserPlan(userId),
        getCustomerReferralStats(userId, origin),
        getUnreadNotificationCount(userId, "CUSTOMER"),
      ]);

    const defaultAddress = addresses.find((a) => a.isDefault) || addresses[0] || null;

    // Active order (most recent non-terminal order)
    const activeOrder =
      orders.find(
        (o) =>
          o.status === "OUT_FOR_DELIVERY" ||
          o.status === "ASSIGNED" ||
          o.status === "PENDING"
      ) || null;

    // Build dynamic 6-month consumption series from real orders
    const now = new Date();
    const months: Array<{ label: string; key: string; bottles: number }> = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      const label = d.toLocaleDateString("en-US", { month: "short" });
      months.push({ label, key, bottles: 0 });
    }

    for (const ord of orders) {
      if (ord.status === "CANCELLED") continue;
      const d = new Date(ord.createdAt);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      const bucket = months.find((m) => m.key === key);
      if (bucket) {
        const bottleQty = ord.items.reduce((sum, item) => sum + item.quantity, 0);
        bucket.bottles += bottleQty;
      }
    }

    const totalSixMonthBottles = months.reduce((sum, m) => sum + m.bottles, 0);
    const averageMonthlyBottles = Number((totalSixMonthBottles / 6).toFixed(1));

    const plan = dispenserData.plan;
    const dispenserSummary = plan
      ? {
          hasPlan: true,
          id: plan.id,
          serialNumber: plan.serialNumber,
          modelName: plan.modelName,
          amountPaid: plan.amountPaid,
          totalCost: plan.totalCost,
          outstandingBalance: plan.outstandingBalance,
          monthlyDue: plan.monthlyDue,
          installmentsPaidCount: plan.installmentsPaidCount,
          totalInstallmentsCount: plan.totalInstallmentsCount,
          percentPaid: Math.min(100, Math.round((plan.amountPaid / plan.totalCost) * 100)),
          nextPaymentDate: plan.nextPaymentDate,
          isFullyPaid: plan.isFullyPaid,
          waterLevelPercent: plan.waterLevelPercent,
          isOnline: plan.isOnline,
          tamperAlert: plan.tamperAlert,
        }
      : {
          hasPlan: false,
          paidMonths: profile.dispenserPaidMonths,
          totalMonths: profile.dispenserTotalMonths,
          percentPaid: 0,
        };

    return mobileSuccess(
      {
        customer: {
          id: authResult.dbUser.id,
          name: authResult.dbUser.name,
          phone: authResult.dbUser.phone,
          email: authResult.dbUser.email,
          customerCode: profile.customerCode,
          bottlesHeld: profile.bottlesHeld,
          freeBottleBalance: profile.freeBottleBalance,
          referralCode: profile.referralCode,
        },
        defaultAddress,
        addressesCount: addresses.length,
        unreadNotifications,
        activeOrder,
        dispenser: dispenserSummary,
        rewards: {
          referralCode: referralStats.referralCode,
          referralLink: referralStats.referralLink,
          totalInvited: referralStats.totalInvited,
          qualifiedCount: referralStats.qualifiedCount,
          freeBottleBalance: referralStats.freeBottleBalance,
          progressTowardsNext: referralStats.progressTowardsNext,
          targetReferrals: 5,
        },
        consumptionHistory: {
          months: months.map(({ label, bottles }) => ({ label, bottles })),
          averageMonthlyBottles,
        },
        recentOrders: orders.slice(0, 5),
      },
      200,
      "Customer dashboard loaded successfully."
    );
  } catch (error) {
    console.error("[Mobile API customer/home GET error]:", error);
    return mobileError("SERVER_ERROR", "Failed to load customer dashboard.", 500);
  }
}
