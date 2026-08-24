/**
 * Domain error types.
 *
 * Services throw these; the transport layer (Server Actions, Route Handlers)
 * maps them to user-readable messages and HTTP status codes. Raw Prisma errors,
 * stack traces, and connection details never reach a client response.
 */

export type FieldErrors = Record<string, string[]>;

export class AppError extends Error {
  readonly code: string;
  readonly status: number;
  /** Safe to show a user. Internal detail goes in `cause` and the server log. */
  readonly userMessage: string;

  constructor(
    code: string,
    status: number,
    userMessage: string,
    options?: { cause?: unknown },
  ) {
    super(userMessage, options);
    this.name = new.target.name;
    this.code = code;
    this.status = status;
    this.userMessage = userMessage;
  }
}

export class ValidationError extends AppError {
  readonly fieldErrors: FieldErrors;

  constructor(
    userMessage = "Please correct the highlighted fields.",
    fieldErrors: FieldErrors = {},
  ) {
    super("VALIDATION_ERROR", 400, userMessage);
    this.fieldErrors = fieldErrors;
  }
}

export class NotFoundError extends AppError {
  constructor(resource = "Record") {
    super("NOT_FOUND", 404, `${resource} could not be found.`);
  }
}

export class ForbiddenError extends AppError {
  constructor(userMessage = "You do not have permission to perform this action.") {
    super("FORBIDDEN", 403, userMessage);
  }
}

export class UnauthorizedError extends AppError {
  constructor(userMessage = "Please sign in to continue.") {
    super("UNAUTHORIZED", 401, userMessage);
  }
}

/** A uniqueness or concurrent-modification conflict. */
export class ConflictError extends AppError {
  constructor(userMessage = "This action conflicts with the current state of the record.") {
    super("CONFLICT", 409, userMessage);
  }
}

/**
 * A business rule refused the operation — an illegal status transition, an
 * insufficient reward balance, stock that would go negative.
 */
export class BusinessRuleError extends AppError {
  constructor(userMessage: string, options?: { cause?: unknown }) {
    super("BUSINESS_RULE", 422, userMessage, options);
  }
}

/** An external provider is unavailable or not configured. */
export class ProviderError extends AppError {
  constructor(userMessage = "An external service is currently unavailable.", options?: { cause?: unknown }) {
    super("PROVIDER_ERROR", 502, userMessage, options);
  }
}

export function isAppError(error: unknown): error is AppError {
  return error instanceof AppError;
}

/**
 * Reduces any thrown value to something safe to display.
 *
 * Unexpected errors are logged server-side with a correlation id and reported
 * generically, so internal details are never leaked to a client.
 */
export function toSafeError(error: unknown): {
  code: string;
  status: number;
  message: string;
  fieldErrors?: FieldErrors;
  correlationId?: string;
} {
  if (error instanceof ValidationError) {
    return {
      code: error.code,
      status: error.status,
      message: error.userMessage,
      fieldErrors: error.fieldErrors,
    };
  }

  if (isAppError(error)) {
    return {
      code: error.code,
      status: error.status,
      message: error.userMessage,
    };
  }

  const correlationId = crypto.randomUUID();

  console.error(`[${correlationId}] Unhandled error:`, error);

  return {
    code: "INTERNAL_ERROR",
    status: 500,
    message:
      "Something went wrong on our side. Please try again, and quote reference " +
      correlationId.slice(0, 8) +
      " if the problem persists.",
    correlationId,
  };
}
