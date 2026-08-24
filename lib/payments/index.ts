import "server-only";

import { ProviderError } from "@/lib/errors";
import { PaymentMethod } from "@/lib/generated/prisma/enums";
import type { Money } from "@/lib/money";

/**
 * Payment provider abstraction.
 *
 * The financial system is deliberately not built around a single gateway. All
 * provider-specific behaviour sits behind this interface, so adding MTN Mobile
 * Money, Telecel Cash, AirtelTigo Money or a card processor means writing a
 * driver rather than editing the order and installment services.
 *
 * Phase 1 ships the `manual` driver, which fully supports cash, bank transfer
 * and staff-confirmed mobile money. Gateway drivers are registered but fail
 * loudly when unconfigured — a payment system that appears to succeed without
 * moving money is worse than one that refuses.
 */

export type InitiatePaymentRequest = {
  reference: string;
  amount: Money;
  currency: string;
  method: PaymentMethod;
  customerPhone: string;
  customerName: string;
  description: string;
};

export type InitiatePaymentResult = {
  /** Provider-side identifier, stored for reconciliation and idempotency. */
  providerReference: string | null;
  /** `pending` means an out-of-band confirmation step is expected. */
  status: "pending" | "successful" | "failed";
  /** Set when the customer must complete an authorization step. */
  redirectUrl?: string;
  message?: string;
};

export type VerifyPaymentResult = {
  status: "pending" | "successful" | "failed";
  providerReference: string | null;
  amount?: Money;
  message?: string;
};

export type RefundRequest = {
  providerReference: string;
  amount: Money;
  reason: string;
};

export type WebhookEvent = {
  providerReference: string;
  status: "pending" | "successful" | "failed";
  amount?: string;
  raw: unknown;
};

export type PaymentProvider = {
  readonly id: string;
  readonly label: string;
  /** Methods this driver can settle. */
  readonly supportedMethods: readonly PaymentMethod[];
  isConfigured(): boolean;
  initiate(request: InitiatePaymentRequest): Promise<InitiatePaymentResult>;
  verify(providerReference: string): Promise<VerifyPaymentResult>;
  refund(request: RefundRequest): Promise<{ providerReference: string | null }>;
  /** Verifies the signature and normalises the payload. */
  parseWebhook(
    body: string,
    headers: Record<string, string>,
  ): Promise<WebhookEvent>;
};

/**
 * Manual settlement.
 *
 * Covers cash on delivery, bank transfer, and mobile money that a staff member
 * confirms from the provider's own app or SMS. Nothing is auto-approved: a
 * payment enters `PENDING_RECONCILIATION` and a manager or administrator
 * confirms it, which is what makes cash collection auditable.
 */
const manualProvider: PaymentProvider = {
  id: "manual",
  label: "Manual / staff confirmed",
  supportedMethods: [
    PaymentMethod.CASH,
    PaymentMethod.BANK_TRANSFER,
    PaymentMethod.MTN_MOBILE_MONEY,
    PaymentMethod.TELECEL_CASH,
    PaymentMethod.AIRTELTIGO_MONEY,
  ],
  isConfigured: () => true,
  initiate: async () => ({
    providerReference: null,
    status: "pending",
    message: "Awaiting staff confirmation.",
  }),
  verify: async (providerReference) => ({
    status: "pending",
    providerReference,
    message: "Manual payments are confirmed by staff, not by the provider.",
  }),
  refund: async () => ({ providerReference: null }),
  parseWebhook: async () => {
    throw new ProviderError("The manual payment provider has no webhook.");
  },
};

/**
 * Registers a gateway that requires real credentials. Every method throws while
 * unconfigured so a missing integration can never masquerade as a completed
 * payment.
 */
function unconfiguredGateway(
  id: string,
  label: string,
  supportedMethods: readonly PaymentMethod[],
): PaymentProvider {
  const notConfigured = (): never => {
    throw new ProviderError(
      `The ${label} payment gateway is not configured. Set PAYMENT_PROVIDER=${id} ` +
        `together with PAYMENT_SECRET_KEY, PAYMENT_PUBLIC_KEY and PAYMENT_WEBHOOK_SECRET, ` +
        `and implement the driver in lib/payments.`,
    );
  };

  return {
    id,
    label,
    supportedMethods,
    isConfigured: () =>
      Boolean(process.env.PAYMENT_SECRET_KEY && process.env.PAYMENT_PUBLIC_KEY),
    initiate: async () => notConfigured(),
    verify: async () => notConfigured(),
    refund: async () => notConfigured(),
    parseWebhook: async () => notConfigured(),
  };
}

const registry: Record<string, PaymentProvider> = {
  manual: manualProvider,
  gateway: unconfiguredGateway("gateway", "Online payment", [
    PaymentMethod.CARD,
    PaymentMethod.MTN_MOBILE_MONEY,
    PaymentMethod.TELECEL_CASH,
    PaymentMethod.AIRTELTIGO_MONEY,
  ]),
};

export function getProvider(id?: string): PaymentProvider {
  const key = id ?? process.env.PAYMENT_PROVIDER ?? "manual";
  const provider = registry[key];

  if (!provider) {
    throw new ProviderError(
      `Unknown payment provider "${key}". Available: ${Object.keys(registry).join(", ")}.`,
    );
  }

  return provider;
}

export function availableProviders(): PaymentProvider[] {
  return Object.values(registry);
}

/** Methods the active provider can settle, for rendering the payment step. */
export function supportedMethods(): readonly PaymentMethod[] {
  return getProvider().supportedMethods;
}

/** Human labels for the payment methods named in the requirements. */
export const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
  [PaymentMethod.MTN_MOBILE_MONEY]: "MTN Mobile Money",
  [PaymentMethod.TELECEL_CASH]: "Telecel Cash",
  [PaymentMethod.AIRTELTIGO_MONEY]: "AirtelTigo Money",
  [PaymentMethod.BANK_TRANSFER]: "Bank transfer",
  [PaymentMethod.CASH]: "Cash",
  [PaymentMethod.CARD]: "Debit / credit card",
};
