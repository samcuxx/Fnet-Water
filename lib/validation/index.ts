import * as z from "zod";

import { ValidationError, type FieldErrors } from "@/lib/errors";

export * from "./common";
export * from "./auth";

/**
 * Parses input against a schema and throws a `ValidationError` carrying
 * per-field messages on failure. Used by services so an invalid payload can
 * never reach the database.
 */
export function parseOrThrow<S extends z.ZodType>(
  schema: S,
  input: unknown,
): z.output<S> {
  const result = schema.safeParse(input);

  if (!result.success) {
    throw new ValidationError(
      "Please correct the highlighted fields.",
      toFieldErrors(result.error),
    );
  }

  return result.data;
}

/** Flattens a Zod error into the shape form components render. */
export function toFieldErrors(error: z.ZodError): FieldErrors {
  // On a ZodError of unknown output type, Zod cannot infer the field keys, so
  // the flattened shape is widened here rather than at every call site.
  const flattened = z.flattenError(error) as {
    formErrors: string[];
    fieldErrors: Record<string, string[] | undefined>;
  };

  const fieldErrors: FieldErrors = {};

  for (const [field, messages] of Object.entries(flattened.fieldErrors)) {
    if (messages && messages.length > 0) {
      fieldErrors[field] = messages;
    }
  }

  if (flattened.formErrors.length > 0) {
    fieldErrors._form = flattened.formErrors;
  }

  return fieldErrors;
}

/** Converts `FormData` into a plain object suitable for `safeParse`. */
export function formDataToObject(formData: FormData): Record<string, unknown> {
  const result: Record<string, unknown> = {};

  for (const [key, value] of formData.entries()) {
    if (value instanceof File) {
      result[key] = value;
      continue;
    }

    const existing = result[key];

    // Repeated keys (checkbox groups, multi-selects) collapse into an array.
    if (existing === undefined) {
      result[key] = value;
    } else if (Array.isArray(existing)) {
      existing.push(value);
    } else {
      result[key] = [existing, value];
    }
  }

  return result;
}
