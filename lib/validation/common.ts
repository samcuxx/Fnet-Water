import * as z from "zod";

/**
 * Shared validation primitives.
 *
 * These schemas are the single definition of a payload's shape and are used by
 * both Server Actions and Route Handlers. Client-side validation exists for
 * feedback only; incoming data is never trusted.
 */

/** Prisma `cuid()` identifiers. */
export const idSchema = z
  .string()
  .trim()
  .min(1, { error: "Required." })
  .max(64, { error: "Invalid identifier." })
  .regex(/^[a-z0-9]+$/i, { error: "Invalid identifier." });

export const emailSchema = z
  .email({ error: "Enter a valid email address." })
  .trim()
  .toLowerCase()
  .max(254, { error: "Email address is too long." });

/**
 * Ghanaian phone numbers, accepted as `0XXXXXXXXX` or `+233XXXXXXXXX` and
 * normalised to the local `0` form so lookups and uniqueness are consistent.
 */
export const phoneSchema = z
  .string()
  .trim()
  .transform((value) => value.replace(/[\s()-]/g, ""))
  .refine((value) => /^(?:\+233|233|0)[235][0-9]{8}$/.test(value), {
    error: "Enter a valid Ghanaian phone number, e.g. 0244123456.",
  })
  .transform((value) => {
    if (value.startsWith("+233")) return `0${value.slice(4)}`;
    if (value.startsWith("233")) return `0${value.slice(3)}`;
    return value;
  });

/**
 * Password policy: at least 8 characters with a letter, a number, and a
 * symbol, matching the guidance in the bundled Next.js auth docs.
 */
export const passwordSchema = z
  .string()
  .min(8, { error: "Use at least 8 characters." })
  .max(128, { error: "Password is too long." })
  .regex(/[a-zA-Z]/, { error: "Include at least one letter." })
  .regex(/[0-9]/, { error: "Include at least one number." })
  .regex(/[^a-zA-Z0-9]/, { error: "Include at least one symbol." });

export const fullNameSchema = z
  .string()
  .trim()
  .min(2, { error: "Enter the full name." })
  .max(120, { error: "Name is too long." });

/**
 * Ghana Digital Address (GhanaPostGPS), e.g. `GA-183-4567`.
 *
 * Format-checked only. There is no verification against the national registry,
 * because no paid third-party API is in Phase 1 scope, so an unrecognised but
 * well-formed code is accepted rather than rejected.
 */
export const ghanaDigitalAddressSchema = z
  .string()
  .trim()
  .toUpperCase()
  .regex(/^[A-Z]{2}-[0-9]{3,4}-[0-9]{3,4}$/, {
    error: "Use the GhanaPostGPS format, e.g. GA-183-4567.",
  });

export const latitudeSchema = z
  .number()
  .min(-90, { error: "Latitude must be between -90 and 90." })
  .max(90, { error: "Latitude must be between -90 and 90." });

export const longitudeSchema = z
  .number()
  .min(-180, { error: "Longitude must be between -180 and 180." })
  .max(180, { error: "Longitude must be between -180 and 180." });

/**
 * Monetary input. Accepts a string or number and keeps it as a string so no
 * precision is lost before it reaches `Prisma.Decimal`.
 */
export const moneySchema = z
  .union([z.string(), z.number()])
  .transform((value) => String(value).trim())
  .refine((value) => /^-?\d{1,12}(\.\d{1,2})?$/.test(value), {
    error: "Enter an amount with up to two decimal places.",
  });

export const positiveMoneySchema = moneySchema.refine(
  (value) => Number.parseFloat(value) > 0,
  { error: "Amount must be greater than zero." },
);

export const nonNegativeMoneySchema = moneySchema.refine(
  (value) => Number.parseFloat(value) >= 0,
  { error: "Amount cannot be negative." },
);

export const quantitySchema = z
  .coerce
  .number({ error: "Enter a quantity." })
  .int({ error: "Quantity must be a whole number." })
  .min(1, { error: "Quantity must be at least 1." })
  .max(10_000, { error: "Quantity is unreasonably large." });

export const nonNegativeIntSchema = z
  .coerce
  .number({ error: "Enter a number." })
  .int({ error: "Must be a whole number." })
  .min(0, { error: "Cannot be negative." })
  .max(1_000_000, { error: "Value is unreasonably large." });

export const optionalNotesSchema = z
  .string()
  .trim()
  .max(1000, { error: "Keep this under 1000 characters." })
  .optional()
  .or(z.literal("").transform(() => undefined));

export const reasonSchema = z
  .string()
  .trim()
  .min(5, { error: "Give a reason of at least 5 characters." })
  .max(500, { error: "Keep the reason under 500 characters." });

/** Server-side pagination. Page size is capped to bound query cost. */
export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
});

export type Pagination = z.infer<typeof paginationSchema>;

/** Reports require an explicit range so no query is unbounded. */
export const dateRangeSchema = z
  .object({
    from: z.coerce.date({ error: "Choose a start date." }),
    to: z.coerce.date({ error: "Choose an end date." }),
  })
  .refine(({ from, to }) => from <= to, {
    error: "The start date must fall on or before the end date.",
    path: ["from"],
  });

export const searchSchema = z
  .string()
  .trim()
  .max(120, { error: "Search term is too long." })
  .optional();

/** Upload constraints. Enforced server-side before the object is accepted. */
export const MAX_UPLOAD_BYTES = 5 * 1024 * 1024;

export const ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
] as const;

export const ALLOWED_DOCUMENT_TYPES = [
  ...ALLOWED_IMAGE_TYPES,
  "application/pdf",
] as const;

export const fileUploadSchema = z.object({
  name: z.string().trim().min(1).max(255),
  size: z
    .number()
    .int()
    .min(1, { error: "The file is empty." })
    .max(MAX_UPLOAD_BYTES, { error: "Files must be 5 MB or smaller." }),
  type: z.string().trim().min(1),
});
