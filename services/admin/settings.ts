import "server-only";

import { prisma } from "@/lib/db";
import { SettingValueType } from "@/lib/generated/prisma/enums";
import type { Prisma } from "@/lib/generated/prisma/client";
import { AUDIT_ACTIONS, record } from "@/services/audit";

export async function listSettings() {
  return prisma.systemSetting.findMany({
    orderBy: [{ category: "asc" }, { label: "asc" }],
    include: {
      updatedByUser: { select: { fullName: true } },
    },
  });
}

export function parseSettingValue(
  raw: string,
  type: SettingValueType,
): Prisma.InputJsonValue {
  switch (type) {
    case SettingValueType.BOOLEAN:
      return raw === "true" || raw === "on";
    case SettingValueType.NUMBER: {
      const value = Number(raw);
      if (!Number.isFinite(value)) {
        throw new Error("Enter a valid number.");
      }
      return value;
    }
    case SettingValueType.DECIMAL:
      if (!raw.trim() || Number.isNaN(Number(raw))) {
        throw new Error("Enter a valid decimal amount.");
      }
      return raw.trim();
    case SettingValueType.JSON:
      return JSON.parse(raw) as Prisma.InputJsonValue;
    default:
      return raw;
  }
}

export async function updateSetting(input: {
  id: string;
  rawValue: string;
  actorId: string;
}) {
  const current = await prisma.systemSetting.findUnique({
    where: { id: input.id },
  });

  if (!current) {
    throw new Error("Setting not found.");
  }

  if (!current.isEditable) {
    throw new Error("This setting cannot be edited.");
  }

  const value = parseSettingValue(input.rawValue, current.valueType);

  await prisma.$transaction(async (tx) => {
    await tx.systemSetting.update({
      where: { id: current.id },
      data: {
        value,
        updatedByUserId: input.actorId,
      },
    });

    await record(
      {
        userId: input.actorId,
        action: AUDIT_ACTIONS.settingUpdated,
        entityType: "SystemSetting",
        entityId: current.id,
        previousValues: { key: current.key, value: current.value },
        newValues: { key: current.key, value },
        reason: "Administrator updated a system setting",
      },
      tx,
    );
  });
}
