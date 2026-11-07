import crypto from "crypto";

/**
 * Paystack Ghana Gateway Service
 * Handles payment initialization in GHS pesewas and webhook HMAC signature verification.
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
  channels?: string[]; // ["mobile_money", "card", "bank"]
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

/**
 * Initializes a transaction on Paystack
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
    channels: params.channels || ["mobile_money", "card", "bank_transfer"],
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
    return data as PaystackInitResponse;
  } catch (error) {
    console.error("[Paystack] Initialization error:", error);
    return {
      status: false,
      message: error instanceof Error ? error.message : "Failed to connect to Paystack",
    };
  }
}

/**
 * Verifies a transaction on Paystack via reference
 */
export async function verifyPaystackTransaction(reference: string) {
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
    return await response.json();
  } catch (error) {
    console.error("[Paystack] Verification error:", error);
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
    console.error("[Paystack] Signature verification error:", error);
    return false;
  }
}

export { NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY, PAYSTACK_SECRET_KEY };
