import "server-only";

import { prisma } from "@/lib/db";
import { BusinessRuleError, NotFoundError } from "@/lib/errors";
import { parseOrThrow, addressSchema, updateProfileSchema } from "@/lib/validation";
import { AUDIT_ACTIONS, record as recordAudit } from "@/services/audit";
import { getDelivery } from "@/services/admin/deliveries";
import { getOrder } from "@/services/admin/orders";
import { getDispenser } from "@/services/admin/dispensers";

export async function listCustomerOrders(customerId: string) {
  return prisma.order.findMany({
    where: { customerId },
    orderBy: { createdAt: "desc" },
    take: 50,
    select: {
      id: true,
      orderNumber: true,
      status: true,
      paymentStatus: true,
      total: true,
      expectedEmptyBottles: true,
      createdAt: true,
      _count: { select: { items: true } },
    },
  });
}

export async function getCustomerOrder(customerId: string, orderId: string) {
  const order = await getOrder(orderId);
  if (!order || order.customer.id !== customerId) return null;
  return order;
}

export async function listCustomerDeliveries(customerId: string) {
  return prisma.delivery.findMany({
    where: { order: { customerId } },
    orderBy: { createdAt: "desc" },
    take: 50,
    include: {
      driver: {
        select: { driverCode: true, user: { select: { fullName: true, phone: true } } },
      },
      order: { select: { id: true, orderNumber: true } },
    },
  });
}

export async function getCustomerDelivery(customerId: string, deliveryId: string) {
  const delivery = await getDelivery(deliveryId);
  if (!delivery || delivery.order.customer.id !== customerId) return null;
  return delivery;
}

export async function getCustomerBottles(customerId: string) {
  const [balance, ledger] = await Promise.all([
    prisma.customerBottleBalance.findUnique({ where: { customerId } }),
    prisma.customerBottleLedger.findMany({
      where: { customerId },
      orderBy: { createdAt: "desc" },
      take: 40,
      include: { performedByUser: { select: { fullName: true } } },
    }),
  ]);

  return { balance, ledger };
}

export async function listCustomerDispensers(customerId: string) {
  return prisma.dispenser.findMany({
    where: { customerId },
    orderBy: { createdAt: "desc" },
    include: {
      paymentPlans: {
        orderBy: { createdAt: "desc" },
        take: 1,
        include: {
          installments: { orderBy: { sequence: "asc" } },
        },
      },
      trackerDevice: {
        select: {
          deviceCode: true,
          isOnline: true,
          waterLevelPercent: true,
          batteryPercent: true,
        },
      },
    },
  });
}

export async function getCustomerDispenser(customerId: string, dispenserId: string) {
  const dispenser = await getDispenser(dispenserId);
  if (!dispenser || dispenser.customer?.id !== customerId) return null;
  return dispenser;
}

export async function listCustomerPayments(customerId: string) {
  return prisma.payment.findMany({
    where: { customerId },
    orderBy: { createdAt: "desc" },
    take: 50,
    include: {
      order: { select: { id: true, orderNumber: true } },
    },
  });
}

export async function getCustomerRewards(customerId: string) {
  const [balance, ledger, redemptions] = await Promise.all([
    prisma.customerRewardBalance.findUnique({ where: { customerId } }),
    prisma.rewardLedger.findMany({
      where: { customerId },
      orderBy: { createdAt: "desc" },
      take: 40,
    }),
    prisma.rewardRedemption.findMany({
      where: { customerId },
      orderBy: { createdAt: "desc" },
      include: {
        order: { select: { id: true, orderNumber: true } },
        product: { select: { name: true, sku: true } },
      },
    }),
  ]);

  return { balance, ledger, redemptions };
}

export async function getCustomerReferrals(customerId: string) {
  const [profile, made] = await Promise.all([
    prisma.customerProfile.findUnique({
      where: { id: customerId },
      select: { referralCode: true },
    }),
    prisma.referral.findMany({
      where: { referrerCustomerId: customerId },
      orderBy: { createdAt: "desc" },
      include: {
        referredCustomer: {
          select: { customerCode: true, user: { select: { fullName: true } } },
        },
        qualifyingOrder: { select: { orderNumber: true } },
      },
    }),
  ]);

  return { referralCode: profile?.referralCode ?? "", made };
}

export async function listCustomerAddresses(customerId: string) {
  return prisma.address.findMany({
    where: { customerId, isActive: true },
    orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }],
  });
}

export async function upsertCustomerAddress(
  customerId: string,
  input: unknown,
  actorId: string,
) {
  const parsed = parseOrThrow(addressSchema, input);

  return prisma.$transaction(async (tx) => {
    if (parsed.isDefault) {
      await tx.address.updateMany({
        where: { customerId, isDefault: true },
        data: { isDefault: false },
      });
    }

    if (parsed.id) {
      const existing = await tx.address.findUnique({ where: { id: parsed.id } });
      if (!existing || existing.customerId !== customerId) {
        throw new NotFoundError("Address");
      }

      return tx.address.update({
        where: { id: parsed.id },
        data: {
          label: parsed.label,
          type: parsed.type,
          contactName: parsed.contactName || null,
          contactPhone: parsed.contactPhone || null,
          ghanaDigitalAddress: parsed.ghanaDigitalAddress,
          addressLine: parsed.addressLine,
          city: parsed.city,
          region: parsed.region || null,
          landmark: parsed.landmark || null,
          instruction: parsed.instruction,
          instructionNotes: parsed.instructionNotes,
          isDefault: parsed.isDefault ?? existing.isDefault,
        },
      });
    }

    const count = await tx.address.count({
      where: { customerId, isActive: true },
    });

    return tx.address.create({
      data: {
        customerId,
        label: parsed.label,
        type: parsed.type,
        contactName: parsed.contactName || null,
        contactPhone: parsed.contactPhone || null,
        ghanaDigitalAddress: parsed.ghanaDigitalAddress,
        addressLine: parsed.addressLine,
        city: parsed.city,
        region: parsed.region || null,
        landmark: parsed.landmark || null,
        instruction: parsed.instruction,
        instructionNotes: parsed.instructionNotes,
        isDefault: parsed.isDefault || count === 0,
      },
    });
  }).then(async (address) => {
    await recordAudit({
      userId: actorId,
      action: AUDIT_ACTIONS.userUpdated,
      entityType: "Address",
      entityId: address.id,
      newValues: { label: address.label, city: address.city },
    });
    return address;
  });
}

export async function deactivateCustomerAddress(
  customerId: string,
  addressId: string,
  actorId: string,
) {
  const address = await prisma.address.findUnique({ where: { id: addressId } });
  if (!address || address.customerId !== customerId) {
    throw new NotFoundError("Address");
  }

  const remaining = await prisma.address.count({
    where: { customerId, isActive: true, id: { not: addressId } },
  });

  if (address.isDefault && remaining > 0) {
    throw new BusinessRuleError(
      "Set another address as default before removing this one.",
    );
  }

  await prisma.address.update({
    where: { id: addressId },
    data: { isActive: false, isDefault: false },
  });

  await recordAudit({
    userId: actorId,
    action: AUDIT_ACTIONS.userUpdated,
    entityType: "Address",
    entityId: addressId,
    reason: "Address deactivated",
  });
}

export async function updateCustomerProfile(
  customerId: string,
  userId: string,
  input: unknown,
) {
  const parsed = parseOrThrow(updateProfileSchema, input);

  const phoneTaken = await prisma.user.findFirst({
    where: { phone: parsed.phone, id: { not: userId } },
    select: { id: true },
  });

  if (phoneTaken) {
    throw new BusinessRuleError("That phone number is already in use.");
  }

  await prisma.$transaction(async (tx) => {
    await tx.user.update({
      where: { id: userId },
      data: { fullName: parsed.fullName, phone: parsed.phone },
    });
    await tx.customerProfile.update({
      where: { id: customerId },
      data: { ghanaDigitalAddress: parsed.ghanaDigitalAddress ?? null },
    });
    await recordAudit(
      {
        userId,
        action: AUDIT_ACTIONS.userUpdated,
        entityType: "User",
        entityId: userId,
        newValues: {
          fullName: parsed.fullName,
          ghanaDigitalAddress: parsed.ghanaDigitalAddress ?? null,
        },
      },
      tx,
    );
  });
}
