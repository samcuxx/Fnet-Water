import "server-only";

import { BusinessRuleError, NotFoundError } from "@/lib/errors";
import {
  NotificationCategory,
  NotificationSeverity,
  OrderSource,
  OrderStatus,
  ProductType,
  RewardLedgerType,
} from "@/lib/generated/prisma/enums";
import { add, clampAtZero, multiply, toAmountString, ZERO } from "@/lib/money";
import { notify } from "@/lib/notifications";
import {
  SETTING_KEYS,
  getMoneySetting,
  getStringSetting,
} from "@/lib/settings";
import { orderNumber } from "@/lib/utils/reference";
import { parseOrThrow, placeOrderSchema } from "@/lib/validation";
import { AUDIT_ACTIONS, record as recordAudit } from "@/services/audit";
import { prisma } from "@/lib/db";
import { warehouseFilledQuantity } from "@/services/inventory/move";

const ORDERABLE_TYPES: ProductType[] = [
  ProductType.REFILLABLE_BOTTLE,
  ProductType.TAKEAWAY_BOTTLE,
  ProductType.BULK_WATER,
];

export async function listOrderableProducts() {
  return prisma.product.findMany({
    where: { isActive: true, type: { in: ORDERABLE_TYPES } },
    orderBy: { sortOrder: "asc" },
  });
}

export async function placeOrder(input: {
  customerId: string;
  addressId: string;
  items: { productId: string; quantity: number }[];
  redeemReward?: boolean;
  scheduledFor?: Date | string;
  instruction?: string;
  instructionNotes?: string;
  placedByUserId: string;
  source: OrderSource;
}) {
  const parsed = parseOrThrow(placeOrderSchema, input);

  const [customer, address, products, deliveryFee, rewardSku] =
    await Promise.all([
      prisma.customerProfile.findUnique({
        where: { id: parsed.customerId },
        select: {
          id: true,
          userId: true,
          rewardBalance: { select: { available: true, version: true } },
        },
      }),
      prisma.address.findUnique({
        where: { id: parsed.addressId },
      }),
      prisma.product.findMany({
        where: {
          id: { in: parsed.items.map((item) => item.productId) },
          isActive: true,
          type: { in: ORDERABLE_TYPES },
        },
      }),
      getMoneySetting(SETTING_KEYS.orderDefaultDeliveryFee),
      getStringSetting(SETTING_KEYS.referralRewardProductSku),
    ]);

  if (!customer) throw new NotFoundError("Customer");
  if (!address || address.customerId !== customer.id) {
    throw new BusinessRuleError("Choose a delivery address that belongs to this customer.");
  }
  if (products.length !== parsed.items.length) {
    throw new BusinessRuleError("One or more products are no longer available.");
  }

  const productById = new Map(products.map((product) => [product.id, product]));

  return prisma.$transaction(async (tx) => {
    const lines = [];

    for (const item of parsed.items) {
      const product = productById.get(item.productId);
      if (!product) {
        throw new BusinessRuleError("A selected product could not be found.");
      }

      if (product.requiresBottleExchange) {
        const available = await warehouseFilledQuantity(tx, product.id);
        if (available < item.quantity) {
          throw new BusinessRuleError(
            `Not enough filled ${product.name} in the warehouse (${available} available).`,
          );
        }
      }

      const lineTotal = multiply(product.unitPrice, item.quantity);
      lines.push({
        productId: product.id,
        productName: product.name,
        quantity: item.quantity,
        unitPrice: product.unitPrice,
        lineTotal,
        isRewardItem: false,
        requiresBottleExchange: product.requiresBottleExchange,
      });
    }

    if (parsed.redeemReward) {
      const balance = await tx.customerRewardBalance.findUnique({
        where: { customerId: customer.id },
      });

      if (!balance || balance.available < 1) {
        throw new BusinessRuleError("This customer has no reward bottles to redeem.");
      }

      const rewardProduct = await tx.product.findUnique({
        where: { sku: rewardSku },
      });

      if (!rewardProduct || !rewardProduct.isActive) {
        throw new BusinessRuleError("The reward product is not available right now.");
      }

      lines.push({
        productId: rewardProduct.id,
        productName: rewardProduct.name,
        quantity: 1,
        unitPrice: ZERO,
        lineTotal: ZERO,
        isRewardItem: true,
        requiresBottleExchange: rewardProduct.requiresBottleExchange,
      });
    }

    const subtotal = lines.reduce(
      (total, line) => add(total, line.lineTotal),
      ZERO,
    );
    const total = clampAtZero(add(subtotal, deliveryFee));
    const expectedEmptyBottles = lines
      .filter((line) => line.requiresBottleExchange)
      .reduce((sum, line) => sum + line.quantity, 0);

    const order = await tx.order.create({
      data: {
        orderNumber: orderNumber(),
        customerId: customer.id,
        addressId: address.id,
        status: OrderStatus.PENDING,
        source: input.source,
        placedByUserId: input.placedByUserId,
        subtotal: toAmountString(subtotal),
        deliveryFee: toAmountString(deliveryFee),
        discountTotal: toAmountString(ZERO),
        total: toAmountString(total),
        expectedEmptyBottles,
        scheduledFor: parsed.scheduledFor,
        instruction: parsed.instruction ?? address.instruction,
        instructionNotes: parsed.instructionNotes ?? address.instructionNotes,
        items: {
          create: lines.map((line) => ({
            productId: line.productId,
            productName: line.productName,
            quantity: line.quantity,
            unitPrice: toAmountString(line.unitPrice),
            lineTotal: toAmountString(line.lineTotal),
            isRewardItem: line.isRewardItem,
            requiresBottleExchange: line.requiresBottleExchange,
          })),
        },
        statusHistory: {
          create: {
            toStatus: OrderStatus.PENDING,
            changedByUserId: input.placedByUserId,
            reason: "Order placed",
          },
        },
      },
    });

    if (parsed.redeemReward) {
      const redeemed = await tx.customerRewardBalance.updateMany({
        where: { customerId: customer.id, available: { gte: 1 } },
        data: {
          redeemed: { increment: 1 },
          available: { decrement: 1 },
          version: { increment: 1 },
        },
      });

      if (redeemed.count !== 1) {
        throw new BusinessRuleError("The reward could not be reserved for this order.");
      }

      const rewardLine = lines.find((line) => line.isRewardItem);
      const redemption = await tx.rewardRedemption.create({
        data: {
          customerId: customer.id,
          orderId: order.id,
          productId: rewardLine!.productId,
          quantity: 1,
        },
      });

      await tx.rewardLedger.create({
        data: {
          customerId: customer.id,
          type: RewardLedgerType.REDEEMED,
          quantity: -1,
          orderId: order.id,
          redemptionId: redemption.id,
          performedByUserId: input.placedByUserId,
          reason: "Redeemed against a new order",
        },
      });
    }

    await recordAudit(
      {
        userId: input.placedByUserId,
        action: AUDIT_ACTIONS.orderCreated,
        entityType: "Order",
        entityId: order.id,
        newValues: {
          orderNumber: order.orderNumber,
          total: toAmountString(total),
          source: input.source,
        },
      },
      tx,
    );

    await notify(
      {
        userId: customer.userId,
        category: NotificationCategory.ORDER,
        severity: NotificationSeverity.SUCCESS,
        title: "Order placed",
        body: `${order.orderNumber} has been received and is awaiting confirmation.`,
        entityType: "Order",
        entityId: order.id,
        actionUrl: `/customer/orders/${order.id}`,
      },
      tx,
    );

    return order;
  });
}
