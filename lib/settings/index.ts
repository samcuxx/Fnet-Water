import "server-only";

import { cache } from "react";

import { prisma } from "@/lib/db";
import { money, type Money } from "@/lib/money";
import { SettingValueType } from "@/lib/generated/prisma/enums";

/**
 * Configurable business values.
 *
 * The requirements ask that rules such as "5 successful referrals = 1 free
 * bottle" not be hard-coded throughout the codebase (§21, §29.23). Every such
 * value lives in the `system_settings` table and is read through this module,
 * so an administrator can change it without a deployment.
 *
 * `DEFAULTS` is both the seed source and the fallback when a row is missing, so
 * a fresh or partially-seeded database still behaves sensibly.
 */

export const SETTING_KEYS = {
  referralRequiredForReward: "referral.successful_required_for_reward",
  referralRewardProductSku: "referral.reward_product_sku",
  referralQualifyingMinOrderTotal: "referral.qualifying_min_order_total",

  bottleShortageChargePerUnit: "bottle.shortage_charge_per_unit",
  bottleShortageGraceDays: "bottle.shortage_grace_days",
  bottleAutoChargeShortage: "bottle.auto_charge_shortage",

  orderCancellationAllowedStatuses: "order.cancellation_allowed_statuses",
  orderDefaultDeliveryFee: "order.default_delivery_fee",

  dispenserInstallmentFrequencyDefault: "dispenser.installment_frequency_default",
  dispenserOverdueGraceDays: "dispenser.overdue_grace_days",
  dispenserDueSoonDays: "dispenser.due_soon_days",
  dispenserOwnershipRequiresApproval: "dispenser.ownership_requires_approval",

  inventoryAdjustmentAdminThreshold: "inventory.adjustment_admin_threshold",
  inventoryLowStockThreshold: "inventory.low_stock_threshold",

  paymentCodEnabled: "payment.cod_enabled",
  agentCommissionRate: "agent.commission_rate",

  trackerLowWaterLevelPercent: "tracker.low_water_level_percent",
} as const;

export type SettingKey = (typeof SETTING_KEYS)[keyof typeof SETTING_KEYS];

type SettingDefinition = {
  value: unknown;
  valueType: SettingValueType;
  category: string;
  label: string;
  description: string;
  isEditable?: boolean;
};

export const DEFAULTS: Record<SettingKey, SettingDefinition> = {
  [SETTING_KEYS.referralRequiredForReward]: {
    value: 5,
    valueType: SettingValueType.NUMBER,
    category: "referrals",
    label: "Successful referrals per reward",
    description:
      "How many successful referrals earn one free water bottle. The approved rule is 5.",
  },
  [SETTING_KEYS.referralRewardProductSku]: {
    value: "RB-18L",
    valueType: SettingValueType.STRING,
    category: "referrals",
    label: "Reward product",
    description: "SKU of the product issued as the free-bottle reward.",
  },
  [SETTING_KEYS.referralQualifyingMinOrderTotal]: {
    value: "0.00",
    valueType: SettingValueType.DECIMAL,
    category: "referrals",
    label: "Minimum qualifying order total",
    description:
      "Minimum paid order total before a referral counts as successful.",
  },

  [SETTING_KEYS.bottleShortageChargePerUnit]: {
    value: "80.00",
    valueType: SettingValueType.DECIMAL,
    category: "bottles",
    label: "Bottle shortage charge",
    description:
      "Amount charged per unreturned refillable bottle when management converts a shortage into a charge.",
  },
  [SETTING_KEYS.bottleShortageGraceDays]: {
    value: 14,
    valueType: SettingValueType.NUMBER,
    category: "bottles",
    label: "Shortage follow-up window (days)",
    description:
      "Days an outstanding bottle shortage may age before it is flagged for follow-up.",
  },
  [SETTING_KEYS.bottleAutoChargeShortage]: {
    value: false,
    valueType: SettingValueType.BOOLEAN,
    category: "bottles",
    label: "Automatically charge shortages",
    description:
      "When off, staff decide explicitly whether an unreturned bottle becomes a charge. Off by default so the system never invents a debt.",
  },

  [SETTING_KEYS.orderCancellationAllowedStatuses]: {
    value: ["PENDING", "CONFIRMED", "PROCESSING"],
    valueType: SettingValueType.JSON,
    category: "orders",
    label: "Customer-cancellable statuses",
    description:
      "Order statuses a customer may cancel from. Delivered orders can never be cancelled.",
  },
  [SETTING_KEYS.orderDefaultDeliveryFee]: {
    value: "0.00",
    valueType: SettingValueType.DECIMAL,
    category: "orders",
    label: "Default delivery fee",
    description: "Delivery fee applied to new orders.",
  },

  [SETTING_KEYS.dispenserInstallmentFrequencyDefault]: {
    value: "MONTHLY",
    valueType: SettingValueType.STRING,
    category: "dispensers",
    label: "Default installment frequency",
    description: "Payment cadence applied to new dispenser payment plans.",
  },
  [SETTING_KEYS.dispenserOverdueGraceDays]: {
    value: 3,
    valueType: SettingValueType.NUMBER,
    category: "dispensers",
    label: "Overdue grace period (days)",
    description:
      "Days past the due date before an installment is marked overdue.",
  },
  [SETTING_KEYS.dispenserDueSoonDays]: {
    value: 5,
    valueType: SettingValueType.NUMBER,
    category: "dispensers",
    label: "Due-soon lead time (days)",
    description: "How far ahead an upcoming installment is flagged as due soon.",
  },
  [SETTING_KEYS.dispenserOwnershipRequiresApproval]: {
    value: true,
    valueType: SettingValueType.BOOLEAN,
    category: "dispensers",
    label: "Ownership transfer requires approval",
    description:
      "When on, a fully paid dispenser becomes eligible for ownership transfer but an authorized user must approve it. On by default: the system will not transfer an asset on arithmetic alone.",
  },

  [SETTING_KEYS.inventoryAdjustmentAdminThreshold]: {
    value: 50,
    valueType: SettingValueType.NUMBER,
    category: "inventory",
    label: "Administrator approval threshold",
    description:
      "Stock adjustments larger than this magnitude require administrator authorization.",
  },
  [SETTING_KEYS.inventoryLowStockThreshold]: {
    value: 100,
    valueType: SettingValueType.NUMBER,
    category: "inventory",
    label: "Low stock alert level",
    description: "Filled-bottle level that raises a manager alert.",
  },

  [SETTING_KEYS.paymentCodEnabled]: {
    value: true,
    valueType: SettingValueType.BOOLEAN,
    category: "payments",
    label: "Cash on delivery enabled",
    description: "Whether customers may choose to pay the driver on delivery.",
  },
  [SETTING_KEYS.agentCommissionRate]: {
    value: "0.0000",
    valueType: SettingValueType.DECIMAL,
    category: "agents",
    label: "Default agent commission rate",
    description:
      "Fraction of order value credited to the registering agent. Zero by default because no rate is defined in the approved requirements.",
  },

  [SETTING_KEYS.trackerLowWaterLevelPercent]: {
    value: 20,
    valueType: SettingValueType.NUMBER,
    category: "trackers",
    label: "Low water level alert (%)",
    description: "Water level below which a tracker raises a low-level alert.",
  },
};

/**
 * Loads every setting once per request. React `cache()` deduplicates the query
 * across all components in a single render pass.
 */
const loadAll = cache(async (): Promise<Map<string, unknown>> => {
  const rows = await prisma.systemSetting.findMany({
    select: { key: true, value: true },
  });

  return new Map(rows.map((row) => [row.key, row.value]));
});

async function raw(key: SettingKey): Promise<unknown> {
  const all = await loadAll();
  return all.has(key) ? all.get(key) : DEFAULTS[key].value;
}

export async function getNumberSetting(key: SettingKey): Promise<number> {
  const value = await raw(key);
  const parsed = Number(value);

  return Number.isFinite(parsed) ? parsed : Number(DEFAULTS[key].value);
}

export async function getMoneySetting(key: SettingKey): Promise<Money> {
  const value = await raw(key);

  try {
    return money(value as string | number);
  } catch {
    return money(DEFAULTS[key].value as string);
  }
}

export async function getBooleanSetting(key: SettingKey): Promise<boolean> {
  const value = await raw(key);

  if (typeof value === "boolean") return value;
  if (typeof value === "string") return value === "true";

  return Boolean(DEFAULTS[key].value);
}

export async function getStringSetting(key: SettingKey): Promise<string> {
  const value = await raw(key);
  return typeof value === "string" ? value : String(DEFAULTS[key].value);
}

export async function getStringArraySetting(
  key: SettingKey,
): Promise<string[]> {
  const value = await raw(key);

  if (Array.isArray(value)) {
    return value.filter((entry): entry is string => typeof entry === "string");
  }

  return DEFAULTS[key].value as string[];
}
