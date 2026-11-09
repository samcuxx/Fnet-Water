import crypto from "crypto";

/**
 * Paystack Ghana Gateway Service
 * Handles live payment initialization in GHS pesewas and HMAC SHA512 webhook verification.
 */

const PAYSTACK_SECRET_KEY =
  process.env.PAYSTACK_SECRET_KEY || "sk_test_e3dc4308aa829bb13669f66be490fadc1d120778";
const NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY =
  process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY || "pk_test_eb0b32c0bf50b5e00420d9d175e41a082e601be4";

export interface InitializePaymentParams {
  email: string;
  amount: number; // in GHS (e.g. 50.00)
  reference?: string;
  callbackUrl?: string;
  metadata?: Record<string, unknown>;
  channels?: string[]; // ["mobile_money", "card", "bank_transfer", "qr", "ussd"]
}

export interface PaystackInitResponse {
  status: boolean;
  message: string;
  data?: {
    authorization_url: string;
    access_code: string;
    reference: string;
  };
}

export interface PaystackVerifyResponse {
  status: boolean;
  message: string;
  data?: {
    id: number;
    status: string; // "success" | "failed" | "abandoned"
    reference: string;
    amount: number; // in pesewas
    gateway_response: string;
    paid_at: string | null;
    created_at: string;
    channel: string; // "mobile_money" | "card" | "bank" | "ussd" | "qr"
    currency: string;
    ip_address?: string;
    metadata?: Record<string, unknown>;
    customer?: {
      id: number;
      email: string;
      customer_code?: string;
      phone?: string | null;
    };
    authorization?: {
      authorization_code?: string;
      bin?: string;
      last4?: string;
      exp_month?: string;
      exp_year?: string;
      channel?: string;
      card_type?: string;
      bank?: string;
      brand?: string;
    };
  };
}

/**
 * Initializes a live transaction with Paystack API in Ghanaian Cedis (GHS)
 */
export async function initializePaystackPayment(
  params: InitializePaymentParams
): Promise<PaystackInitResponse> {
  const reference = params.reference || `FNW-TX-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
  // Paystack expects amount in pesewas (1 GHS = 100 pesewas)
  const amountInPesewas = Math.round(params.amount * 100);

  const payload = {
    email: params.email,
    amount: amountInPesewas,
    currency: "GHS",
    reference,
    callback_url: params.callbackUrl,
    metadata: params.metadata,
    channels: params.channels || ["mobile_money", "card", "bank_transfer", "qr", "ussd"],
  };

  try {
    const response = await fetch("https://api.paystack.co/transaction/initialize", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();
    if (!response.ok || !data.status) {
      console.error("[Paystack Init Error]:", data.message || "Failed response from Paystack");
      return {
        status: false,
        message: data.message || "Paystack initialization failed.",
      };
    }

    return {
      status: true,
      message: data.message || "Authorization URL created",
      data: {
        authorization_url: data.data.authorization_url,
        access_code: data.data.access_code,
        reference: data.data.reference || reference,
      },
    };
  } catch (error) {
    console.error("[Paystack Connection Error]:", error);
    return {
      status: false,
      message: error instanceof Error ? error.message : "Unable to connect to Paystack payment gateway.",
    };
  }
}

/**
 * Verifies a transaction on Paystack via reference directly from Paystack API
 */
export async function verifyPaystackTransaction(
  reference: string
): Promise<PaystackVerifyResponse | null> {
  try {
    const response = await fetch(
      `https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
        },
      }
    );

    const data = await response.json();
    return data as PaystackVerifyResponse;
  } catch (error) {
    console.error("[Paystack Verify Error]:", error);
    return null;
  }
}

/**
 * Validates HMAC SHA512 signature from Paystack webhook headers
 */
export function verifyPaystackWebhookSignature(
  rawBody: string,
  signatureHeader: string | null
): boolean {
  if (!signatureHeader) return false;
  try {
    const hash = crypto
      .createHmac("sha512", PAYSTACK_SECRET_KEY)
      .update(rawBody)
      .digest("hex");
    return hash === signatureHeader;
  } catch (error) {
    console.error("[Paystack Webhook Signature Error]:", error);
    return false;
  }
}

/**
 * Helper to compute valid webhook signature for testing
 */
export function computePaystackWebhookSignature(rawBody: string): string {
  return crypto
    .createHmac("sha512", PAYSTACK_SECRET_KEY)
    .update(rawBody)
    .digest("hex");
}

export { NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY, PAYSTACK_SECRET_KEY };
