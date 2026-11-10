import { NextRequest, NextResponse } from "next/server";
import { createNotification, NotificationRole, NotificationType } from "@/lib/notification-store";
import {
  sendOrderConfirmationSms,
  sendDriverDispatchSms,
  sendDeliveryCompletedSms,
  sendRewardEarnedSms,
  sendDriverAssignedSms,
  sendLowInventoryAlertSms,
  sendTamperAlertSms,
} from "@/lib/mnotify";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      userId,
      role,
      title,
      message,
      type,
      linkUrl,
      metadata,
      sendSms,
      smsType,
      recipientPhone,
    } = body;

    if (!title || !message) {
      return NextResponse.json(
        { success: false, error: "Title and message are required" },
        { status: 400 }
      );
    }

    // 1. Create in-app notification
    const notification = await createNotification({
      userId: userId || null,
      role: (role as NotificationRole) || null,
      title,
      message,
      type: (type as NotificationType) || "SYSTEM",
      linkUrl: linkUrl || null,
      metadata,
    });

    // 2. Dispatch SMS if requested and recipient phone provided
    let smsResult = null;
    if (sendSms && recipientPhone) {
      switch (smsType) {
        case "ORDER_CONFIRMATION":
          smsResult = await sendOrderConfirmationSms(
            recipientPhone,
            metadata?.orderNumber || "NEW",
            metadata?.totalAmount || 0
          );
          break;
        case "DELIVERY_DISPATCH":
          smsResult = await sendDriverDispatchSms(
            recipientPhone,
            metadata?.driverName || "Fleet Driver",
            metadata?.orderNumber || "NEW"
          );
          break;
        case "DELIVERY_COMPLETED":
          smsResult = await sendDeliveryCompletedSms(
            recipientPhone,
            metadata?.orderNumber || "NEW",
            metadata?.bottlesDelivered || 1
          );
          break;
        case "REWARD_EARNED":
          smsResult = await sendRewardEarnedSms(
            recipientPhone,
            metadata?.customerName || "Customer",
            metadata?.freeBottleBalance || 1
          );
          break;
        case "DRIVER_ASSIGNMENT":
          smsResult = await sendDriverAssignedSms(
            recipientPhone,
            metadata?.orderNumber || "NEW",
            metadata?.deliveryAddress || "Accra"
          );
          break;
        case "INVENTORY_ALERT":
          smsResult = await sendLowInventoryAlertSms(
            recipientPhone,
            metadata?.bottleCount || 0
          );
          break;
        case "TAMPER_ALERT":
          smsResult = await sendTamperAlertSms(
            recipientPhone,
            metadata?.serialNumber || "UNKNOWN",
            metadata?.location || "Customer Location"
          );
          break;
        default:
          break;
      }
    }

    return NextResponse.json({
      success: true,
      notification,
      smsDispatched: Boolean(smsResult),
      smsResult,
    });
  } catch (error) {
    console.error("[api/notifications/dispatch POST] Error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to dispatch notification" },
      { status: 500 }
    );
  }
}
