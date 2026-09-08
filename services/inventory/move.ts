import "server-only";

import { BusinessRuleError } from "@/lib/errors";
import {
  BottleState,
  InventoryMovementType,
  StockHolderType,
} from "@/lib/generated/prisma/enums";
import type { Prisma } from "@/lib/generated/prisma/client";
import { movementReference } from "@/lib/utils/reference";

export type StockLocation = {
  state: BottleState;
  holderType: StockHolderType;
  holderId?: string;
};

type MoveInput = {
  productId: string;
  quantity: number;
  movementType: InventoryMovementType;
  from?: StockLocation;
  to?: StockLocation;
  driverId?: string | null;
  customerId?: string | null;
  orderId?: string | null;
  deliveryId?: string | null;
  performedByUserId?: string | null;
  reason: string;
};

function holderId(location: StockLocation): string {
  return location.holderId ?? "";
}

/**
 * Moves stock between two materialized positions inside a transaction.
 *
 * A movement that would drive a position negative is rejected rather than
 * clamped — clamping would hide the underlying error.
 */
export async function applyStockMove(
  tx: Prisma.TransactionClient,
  input: MoveInput,
): Promise<void> {
  if (input.quantity <= 0) {
    throw new BusinessRuleError("Movement quantity must be greater than zero.");
  }

  if (input.from) {
    const updated = await tx.bottleStockPosition.updateMany({
      where: {
        productId: input.productId,
        state: input.from.state,
        holderType: input.from.holderType,
        holderId: holderId(input.from),
        quantity: { gte: input.quantity },
      },
      data: {
        quantity: { decrement: input.quantity },
        version: { increment: 1 },
      },
    });

    if (updated.count !== 1) {
      throw new BusinessRuleError(
        "There is not enough stock in the source position for this movement.",
      );
    }
  }

  if (input.to) {
    await tx.bottleStockPosition.upsert({
      where: {
        productId_state_holderType_holderId: {
          productId: input.productId,
          state: input.to.state,
          holderType: input.to.holderType,
          holderId: holderId(input.to),
        },
      },
      create: {
        productId: input.productId,
        state: input.to.state,
        holderType: input.to.holderType,
        holderId: holderId(input.to),
        quantity: input.quantity,
      },
      update: {
        quantity: { increment: input.quantity },
        version: { increment: 1 },
      },
    });
  }

  await tx.inventoryMovement.create({
    data: {
      reference: movementReference(),
      movementType: input.movementType,
      productId: input.productId,
      quantity: input.quantity,
      fromState: input.from?.state,
      toState: input.to?.state,
      driverId: input.driverId ?? null,
      customerId: input.customerId ?? null,
      orderId: input.orderId ?? null,
      deliveryId: input.deliveryId ?? null,
      performedByUserId: input.performedByUserId ?? null,
      reason: input.reason,
    },
  });
}

export async function warehouseFilledQuantity(
  tx: Prisma.TransactionClient,
  productId: string,
): Promise<number> {
  const position = await tx.bottleStockPosition.findUnique({
    where: {
      productId_state_holderType_holderId: {
        productId,
        state: BottleState.FILLED_WAREHOUSE,
        holderType: StockHolderType.WAREHOUSE,
        holderId: "",
      },
    },
    select: { quantity: true },
  });

  return position?.quantity ?? 0;
}
