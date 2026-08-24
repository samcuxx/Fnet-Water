import * as z from "zod";

import { UserRole } from "@/lib/generated/prisma/enums";

import {
  emailSchema,
  fullNameSchema,
  ghanaDigitalAddressSchema,
  passwordSchema,
  phoneSchema,
} from "./common";

export const loginSchema = z.object({
  identifier: z
    .string()
    .trim()
    .min(1, { error: "Enter your email address or phone number." })
    .max(254),
  password: z.string().min(1, { error: "Enter your password." }),
  next: z.string().trim().max(512).optional(),
});

export type LoginInput = z.infer<typeof loginSchema>;

/**
 * Customer self-registration.
 *
 * The role is not accepted from the client: self-registration always creates a
 * CUSTOMER. Staff accounts are created by an administrator.
 */
export const registerSchema = z
  .object({
    fullName: fullNameSchema,
    email: emailSchema,
    phone: phoneSchema,
    password: passwordSchema,
    confirmPassword: z.string(),
    ghanaDigitalAddress: ghanaDigitalAddressSchema.optional().or(
      z.literal("").transform(() => undefined),
    ),
    referralCode: z
      .string()
      .trim()
      .toUpperCase()
      .max(32)
      .optional()
      .or(z.literal("").transform(() => undefined)),
    acceptTerms: z
      .union([z.literal("on"), z.literal("true"), z.boolean()])
      .transform(() => true),
  })
  .refine((data) => data.password === data.confirmPassword, {
    error: "Both passwords must match.",
    path: ["confirmPassword"],
  });

export type RegisterInput = z.infer<typeof registerSchema>;

/** Administrator-created staff accounts. CUSTOMER is excluded deliberately. */
export const createStaffSchema = z.object({
  fullName: fullNameSchema,
  email: emailSchema,
  phone: phoneSchema,
  password: passwordSchema,
  role: z.enum([
    UserRole.ADMINISTRATOR,
    UserRole.MANAGER,
    UserRole.AGENT,
    UserRole.DRIVER,
  ]),
  department: z.string().trim().max(80).optional(),
  jobTitle: z.string().trim().max(80).optional(),
  licenseNumber: z.string().trim().max(60).optional(),
  vehicleRegistration: z.string().trim().max(40).optional(),
  vehicleType: z.string().trim().max(60).optional(),
  region: z.string().trim().max(80).optional(),
});

export type CreateStaffInput = z.infer<typeof createStaffSchema>;

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, { error: "Enter your current password." }),
    newPassword: passwordSchema,
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    error: "Both passwords must match.",
    path: ["confirmPassword"],
  })
  .refine((data) => data.currentPassword !== data.newPassword, {
    error: "Choose a password you have not used before.",
    path: ["newPassword"],
  });

export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;

export const updateProfileSchema = z.object({
  fullName: fullNameSchema,
  phone: phoneSchema,
  ghanaDigitalAddress: ghanaDigitalAddressSchema.optional().or(
    z.literal("").transform(() => undefined),
  ),
});

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
