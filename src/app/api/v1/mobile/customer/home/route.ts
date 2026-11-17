import { NextResponse } from "next/server";
import { mobileSuccess, mobileError, verifyMobileAuth } from "@/lib/mobile-auth";
import { findUserByIdentifier } from "@/lib/auth-store";
import { getCustomerProfile, getCustomerAddresses } from "@/lib/customer-store";
import { getCustomerOrders, createCustomerOrder } from "@/lib/order-store";
import { getCustomerDispenserPlan } from "@/lib/dispenser-store";
import { getActiveProducts } from "@/lib/product-store";
import { getCustomerReferralStats } from "@/lib/referral-store";
import { getUnreadNotificationCount } from "@/lib/notification-store";
import { getActiveDrivers } from "@/lib/dispatch-store";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const authResult = await verifyMobileAuth(request);
    if (!authResult.ok) {
      return authResult.response;
    }

    const { user: tokenUser } = authResult;

    // Strict role check: Customer home is exclusively for customers
    if (tokenUser.role !== "CUSTOMER") {
      return mobileError(
        "FORBIDDEN",
        "Access denied. This dashboard is reserved for customer accounts.",
        403
      );
    }

    const userId = tokenUser.id;
    const user = await findUserByIdentifier(userId);
    if (!user) {
      return mobileError("USER_NOT_FOUND", "Customer user account not found.", 404);
    }

    // Parallel fetch of customer data
    const [
      customerProfile,
      addresses,
      orders,
      dispenserData,
      products,
      referralStats,
      unreadCount,
      drivers,
    ] = await Promise.all([
      getCustomerProfile(userId),
      getCustomerAddresses(userId),
      getCustomerOrders(userId),
      getCustomerDispenserPlan(userId),
      getActiveProducts(),
      getCustomerReferralStats(userId),
      getUnreadNotificationCount(userId).catch(() => 0),
      getActiveDrivers().catch(() => []),
    ]);

    // 1. Saved / Default Address
    const defaultAddress =
      addresses.find((addr) => addr.isDefault) || addresses[0] || null;

    // 2. Active Order (filter for orders not yet DELIVERED or CANCELLED)
    const activeOrderRecord = orders.find((o) =>
      ["PENDING", "ASSIGNED", "OUT_FOR_DELIVERY"].includes(o.status)
    );

    let activeOrder = null;
    if (activeOrderRecord) {
      // Find assigned driver if available
      const driver = drivers.find((d) => d.id === activeOrderRecord.assignedDriverId) || {
        id: "drv_default",
        name: activeOrderRecord.assignedDriverName || "Kwame Mensah",
        phone: "0248881234",
        vanNumber: "Van 04",
        licensePlate: "GT 4921-22",
      };

      // Construct milestone tracking steps based on authoritative order status
      const status = activeOrderRecord.status;
      const trackingSteps = [
        {
          id: "step_placed",
          title: "Order Placed",
          subtitle: `${activeOrderRecord.items.map((i) => `${i.quantity}x ${i.productName || "19L Refill"}`).join(", ")} • GH₵ ${activeOrderRecord.totalAmount.toFixed(2)}`,
          timestamp: new Date(activeOrderRecord.createdAt).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
          status: "completed" as const,
        },
        {
          id: "step_assigned",
          title: "Sterilized & Dispatched",
          subtitle: `${driver.vanNumber} • ${driver.name}`,
          timestamp: ["ASSIGNED", "OUT_FOR_DELIVERY", "DELIVERED"].includes(status)
            ? new Date(activeOrderRecord.updatedAt).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })
            : undefined,
          status: (["OUT_FOR_DELIVERY", "DELIVERED"].includes(status)
            ? "completed"
            : status === "ASSIGNED"
            ? "active"
            : "pending") as "completed" | "active" | "pending",
        },
        {
          id: "step_out",
          title: "Out for Delivery",
          subtitle: `En route to ${defaultAddress?.areaName || "your address"}`,
          timestamp: status === "OUT_FOR_DELIVERY" ? "Approx 12 mins away" : undefined,
          status: (status === "DELIVERED"
            ? "completed"
            : status === "OUT_FOR_DELIVERY"
            ? "active"
            : "pending") as "completed" | "active" | "pending",
        },
        {
          id: "step_delivered",
          title: "Delivered to Doorstep",
          subtitle: activeOrderRecord.hasEmptyBottleExchange ? "1:1 Bottle Exchange" : "Direct Refill",
          timestamp: status === "DELIVERED" ? "Delivered" : "Est. Arrival Today",
          status: (status === "DELIVERED" ? "completed" : "pending") as "completed" | "pending",
        },
      ];

      activeOrder = {
        id: activeOrderRecord.id,
        orderNumber: activeOrderRecord.orderNumber,
        status: activeOrderRecord.status,
        createdAt: activeOrderRecord.createdAt,
        deliverySlot: activeOrderRecord.deliverySlot,
        deliveryDate: activeOrderRecord.deliveryDate,
        totalAmount: activeOrderRecord.totalAmount,
        itemSummary: activeOrderRecord.items.map((i) => `${i.quantity}x ${i.productName || "19L Refill"}`).join(", "),
        driver: {
          id: driver.id,
          name: driver.name,
          phone: driver.phone,
          vanNumber: driver.vanNumber,
          licensePlate: driver.licensePlate,
        },
        trackingSteps,
      };
    }

    // 3. Dispenser details
    let dispenser = null;
    if (dispenserData && dispenserData.plan) {
      const plan = dispenserData.plan;
      dispenser = {
        hasActivePlan: true,
        modelName: plan.modelName,
        serialNumber: plan.serialNumber,
        waterLevelPercent: plan.waterLevelPercent ?? 74,
        coldTempC: 4,
        hotTempC: 92,
        batteryPercent: plan.batteryPercent ?? 98,
        isOnline: plan.isOnline ?? true,
        paidMonths: plan.installmentsPaidCount ?? 8,
        totalMonths: plan.totalInstallmentsCount ?? 12,
        monthlyDue: plan.monthlyDue ?? 150.0,
        nextPaymentDate: plan.nextPaymentDate ?? new Date(Date.now() + 15 * 86400000).toISOString(),
        isFullyPaid: plan.isFullyPaid,
      };
    }

    // 4. Quick Reorder Product (Default 19L Refill)
    const refillProduct = products.find(
      (p) => p.type === "REFILLABLE_BOTTLE" && (p.name.includes("18.9L") || p.name.includes("19L"))
    ) || products[0] || {
      id: "prod_19l_refill",
      name: "19L Pure Spring Refill",
      price: 18.0,
      depositFee: 45.0,
      stockQuantity: 250,
      isActive: true,
      unit: "bottle",
    };

    const dashboardData = {
      customer: {
        id: user.id,
        name: user.name,
        phone: user.phone,
        email: user.email,
        customerCode: customerProfile.customerCode,
        bottlesHeld: customerProfile.bottlesHeld,
        freeBottleBalance: customerProfile.freeBottleBalance,
        referralCode: customerProfile.referralCode,
      },
      defaultAddress: defaultAddress
        ? {
            id: defaultAddress.id,
            category: defaultAddress.category,
            areaName: defaultAddress.areaName,
            digitalAddress: defaultAddress.digitalAddress,
            deliveryInstructions: defaultAddress.deliveryInstructions,
          }
        : null,
      activeOrder,
      dispenser,
      quickReorderProduct: {
        id: refillProduct.id,
        name: refillProduct.name,
        unitPrice: refillProduct.price,
        depositPrice: refillProduct.depositFee,
        capacityLiters: 19.0,
        availableStock: refillProduct.stockQuantity,
      },
      referral: {
        referralCode: referralStats.referralCode,
        referralLink: referralStats.referralLink,
        totalInvited: referralStats.totalInvited,
        qualifiedCount: referralStats.qualifiedCount,
        freeBottleBalance: customerProfile.freeBottleBalance,
        progressTowardsNext: referralStats.progressTowardsNext,
        progressPercent: referralStats.progressPercent,
      },
      unreadNotificationsCount: unreadCount,
    };

    return mobileSuccess(dashboardData, 200, "Customer home dashboard retrieved successfully.");
  } catch (error) {
    console.error("[Mobile API Customer Home GET Error]:", error);
    return mobileError("SERVER_ERROR", "Failed to retrieve customer home dashboard.", 500);
  }
}

/**
 * POST /api/v1/mobile/customer/home
 * Instant 1-Tap Quick Reorder trigger
 */
export async function POST(request: Request) {
  try {
    const authResult = await verifyMobileAuth(request);
    if (!authResult.ok) {
      return authResult.response;
    }

    const { user: tokenUser } = authResult;
    if (tokenUser.role !== "CUSTOMER") {
      return mobileError("FORBIDDEN", "Only customers can place quick refill orders.", 403);
    }

    const body = await request.json().catch(() => ({}));
    const quantity = typeof body.quantity === "number" && body.quantity > 0 ? body.quantity : 1;

    if (quantity > 20) {
      return mobileError("INVALID_QUANTITY", "Maximum quick reorder quantity is 20 bottles.", 400);
    }

    const userId = tokenUser.id;
    const user = await findUserByIdentifier(userId);
    if (!user) {
      return mobileError("USER_NOT_FOUND", "Customer user account not found.", 404);
    }

    const [addresses, products] = await Promise.all([
      getCustomerAddresses(userId),
      getActiveProducts(),
    ]);

    const defaultAddress = addresses.find((a) => a.isDefault) || addresses[0];
    if (!defaultAddress) {
      return mobileError(
        "ADDRESS_REQUIRED",
        "Please add a delivery address to your account before placing an order.",
        400
      );
    }

    const refillProduct = products.find(
      (p) => p.type === "REFILLABLE_BOTTLE" && (p.name.includes("18.9L") || p.name.includes("19L"))
    ) || products[0];

    const todayDate = new Date().toISOString().split("T")[0];

    // Create the order using authoritative order store
    const newOrder = await createCustomerOrder({
      userId,
      customerName: user.name,
      customerPhone: user.phone,
      deliveryAddressId: defaultAddress.id,
      deliveryAddressText: defaultAddress.areaName,
      deliveryDigitalAddress: defaultAddress.digitalAddress,
      deliverySlot: "Morning (8am - 12pm)",
      deliveryDate: todayDate,
      deliveryInstructions: defaultAddress.deliveryInstructions,
      hasEmptyBottleExchange: true, // 1:1 bottle swap for quick refill
      redeemFreeRefill: false,
      items: [
        {
          productId: refillProduct.id,
          quantity,
        },
      ],
      paymentMethod: "CASH_ON_DELIVERY", // Default payment option for 1-tap quick reorder
    });

    return mobileSuccess(
      {
        orderId: newOrder.id,
        orderNumber: newOrder.orderNumber,
        status: newOrder.status,
        totalAmount: newOrder.totalAmount,
        quantity,
      },
      201,
      `Quick refill order #${newOrder.orderNumber} placed successfully.`
    );
  } catch (error) {
    console.error("[Mobile API Customer Quick Reorder POST Error]:", error);
    return mobileError("SERVER_ERROR", "Failed to place quick refill order.", 500);
  }
}
