import * as z from "zod";

import {
  AddressType,
  DeliveryFailureReason,
  DeliveryInstruction,
  PaymentMethod,
} from "@/lib/generated/prisma/enums";

import {
  ghanaDigitalAddressSchema,
  idSchema,
  nonNegativeIntSchema,
  optionalNotesSchema,
  phoneSchema,
  quantitySchema,
  reasonSchema,
} from "./common";

export const placeOrderSchema = z.object({
  customerId: idSchema,
  addressId: idSchema,
  redeemReward: z
    .union([z.literal("on"), z.literal("true"), z.boolean()])
    .optional()
    .transform((value) => value === true || value === "on" || value === "true"),
  scheduledFor: z
    .string()
    .trim()
    .optional()
    .transform((value) => (value ? new Date(value) : undefined)),
  instruction: z.enum(DeliveryInstruction).optional(),
  instructionNotes: optionalNotesSchema,
  items: z
    .array(
      z.object({
        productId: idSchema,
        quantity: quantitySchema,
      }),
    )
    .min(1, { error: "Add at least one product." }),
});

export type PlaceOrderInput = z.infer<typeof placeOrderSchema>;

export const cancelOrderSchema = z.object({
  orderId: idSchema,
  reason: reasonSchema,
});

export const assignDriverSchema = z.object({
  orderId: idSchema,
  driverId: idSchema,
  scheduledFor: z
    .string()
    .trim()
    .min(1, { error: "Choose a delivery slot." })
    .transform((value) => new Date(value)),
});

export const completeDeliverySchema = z.object({
  deliveryId: idSchema,
  bottlesDelivered: nonNegativeIntSchema,
  emptyBottlesCollected: nonNegativeIntSchema,
  damagedBottlesReturned: nonNegativeIntSchema,
  cashCollected: z
    .string()
    .trim()
    .optional()
    .transform((value) => (value ? value : undefined)),
  remarks: optionalNotesSchema,
});

export const failDeliverySchema = z.object({
  deliveryId: idSchema,
  failureReason: z.enum(DeliveryFailureReason),
  failureNotes: optionalNotesSchema,
});

export const reconcileDeliverySchema = z.object({
  deliveryId: idSchema,
  reason: reasonSchema,
});

export const addressSchema = z.object({
  id: idSchema.optional(),
  label: z.string().trim().min(2).max(80),
  type: z.enum(AddressType),
  contactName: z.string().trim().max(120).optional().or(z.literal("")),
  contactPhone: phoneSchema.optional().or(z.literal("")),
  ghanaDigitalAddress: ghanaDigitalAddressSchema.optional().or(
    z.literal("").transform(() => undefined),
  ),
  addressLine: z.string().trim().min(4).max(240),
  city: z.string().trim().min(2).max(80),
  region: z.string().trim().max(80).optional().or(z.literal("")),
  landmark: z.string().trim().max(160).optional().or(z.literal("")),
  instruction: z.enum(DeliveryInstruction).optional(),
  instructionNotes: optionalNotesSchema,
  isDefault: z
    .union([z.literal("on"), z.literal("true"), z.boolean()])
    .optional()
    .transform((value) => value === true || value === "on" || value === "true"),
});

export type AddressInput = z.infer<typeof addressSchema>;

export const recordPaymentSchema = z.object({
  orderId: idSchema.optional(),
  amount: z
    .string()
    .trim()
    .refine((value) => /^-?\d{1,12}(\.\d{1,2})?$/.test(value), {
      error: "Enter an amount with up to two decimal places.",
    }),
  method: z.enum(PaymentMethod),
  notes: optionalNotesSchema,
});
