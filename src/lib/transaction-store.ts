import { prisma } from "./prisma";
import { isDatabaseConnected } from "./auth-store";
import { PaymentStatus, PaymentMethod } from "./order-store";

export type PaymentChannel =
  | "MTN_MOMO"
  | "TELECEL_CASH"
  | "AT_MONEY"
  | "CARD"
  | "CASH_ON_DELIVERY"
  | "BANK_TRANSFER";

export type TransactionType =
  | "WATER_ORDER"
  | "DISPENSER_INSTALLMENT"
  | "DISPENSER_DEPOSIT"
  | "TAKEAWAY_BOTTLES";

export interface StoredTransaction {
  id: string;
  reference: string;
  orderId?: string;
  orderNumber?: string;
  planId?: string;
  customerProfileId: string;
  customerName: string;
  customerPhone: string;
  amount: number; // in GH₵
  currency: string; // "GHS"
  channel: PaymentChannel;
  type: TransactionType;
  status: PaymentStatus;
  paystackPayload?: Record<string, unknown>;
  metadata?: Record<string, unknown>;
  paidAt: string;
  createdAt: string;
}

// In-memory memory ledger with realistic Ghana seed transactions
const memoryTransactions = new Map<string, StoredTransaction>();

// Seed initial transactions
const initialTransactions: StoredTransaction[] = [
  {
    id: "tx_001",
    reference: "FNW-TX-1731050001",
    orderId: "ord_001",
    orderNumber: "FNW-2026-1042",
    customerProfileId: "prof_customer_001",
    customerName: "Kwesi Appiah",
    customerPhone: "0241000005",
    amount: 150.0,
    currency: "GHS",
    channel: "MTN_MOMO",
    type: "DISPENSER_INSTALLMENT",
    status: "PAID",
    metadata: { planId: "disp_plan_001", month: "November 2026" },
    paidAt: new Date(Date.now() - 3600000 * 2).toISOString(),
    createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
  },
  {
    id: "tx_002",
    reference: "FNW-TX-1731050002",
    orderId: "ord_002",
    orderNumber: "FNW-2026-1041",
    customerProfileId: "prof_customer_002",
    customerName: "Dr. Mensah Clinic",
    customerPhone: "0208112233",
    amount: 150.0,
    currency: "GHS",
    channel: "MTN_MOMO",
    type: "WATER_ORDER",
    status: "PAID",
    metadata: { bottles: 6, area: "Osu" },
    paidAt: new Date(Date.now() - 3600000 * 4).toISOString(),
    createdAt: new Date(Date.now() - 3600000 * 4).toISOString(),
  },
  {
    id: "tx_003",
    reference: "FNW-TX-1731050003",
    orderId: "ord_003",
    orderNumber: "FNW-2026-1040",
    customerProfileId: "prof_customer_003",
    customerName: "Grace Osei",
    customerPhone: "0277998877",
    amount: 50.0,
    currency: "GHS",
    channel: "TELECEL_CASH",
    type: "WATER_ORDER",
    status: "PAID",
    metadata: { bottles: 2, area: "Airport Residential" },
    paidAt: new Date(Date.now() - 3600000 * 24).toISOString(),
    createdAt: new Date(Date.now() - 3600000 * 24).toISOString(),
  },
  {
    id: "tx_004",
    reference: "FNW-TX-1731050004",
    customerProfileId: "prof_customer_004",
    customerName: "Zenith Bank Head Office",
    customerPhone: "0244112233",
    amount: 300.0,
    currency: "GHS",
    channel: "CARD",
    type: "DISPENSER_DEPOSIT",
    status: "PAID",
    metadata: { dispenserModel: "Aquamaster Pro 3000" },
    paidAt: new Date(Date.now() - 3600000 * 28).toISOString(),
    createdAt: new Date(Date.now() - 3600000 * 28).toISOString(),
  },
  {
    id: "tx_005",
    reference: "FNW-TX-1731050005",
    orderId: "ord_005",
    orderNumber: "FNW-2026-1039",
    customerProfileId: "prof_customer_005",
    customerName: "Kofi Owusu-Ansah",
    customerPhone: "0245667788",
    amount: 100.0,
    currency: "GHS",
    channel: "MTN_MOMO",
    type: "WATER_ORDER",
    status: "PAID",
    metadata: { bottles: 4, area: "East Legon" },
    paidAt: new Date(Date.now() - 3600000 * 48).toISOString(),
    createdAt: new Date(Date.now() - 3600000 * 48).toISOString(),
  },
];

initialTransactions.forEach((tx) => memoryTransactions.set(tx.reference, tx));

/**
 * Record a new transaction (from checkout initiation or Paystack webhook)
 */
export async function recordTransaction(data: {
  reference: string;
  orderId?: string;
  orderNumber?: string;
  planId?: string;
  customerProfileId: string;
  customerName: string;
  customerPhone: string;
  amount: number;
  currency?: string;
  channel: PaymentChannel;
  type: TransactionType;
  status: PaymentStatus;
  paystackPayload?: Record<string, unknown>;
  metadata?: Record<string, unknown>;
  paidAt?: string;
}): Promise<StoredTransaction> {
  const transaction: StoredTransaction = {
    id: `tx_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
    reference: data.reference,
    orderId: data.orderId,
    orderNumber: data.orderNumber,
    planId: data.planId,
    customerProfileId: data.customerProfileId,
    customerName: data.customerName,
    customerPhone: data.customerPhone,
    amount: data.amount,
    currency: data.currency || "GHS",
    channel: data.channel,
    type: data.type,
    status: data.status,
    paystackPayload: data.paystackPayload,
    metadata: data.metadata,
    paidAt: data.paidAt || new Date().toISOString(),
    createdAt: new Date().toISOString(),
  };

  memoryTransactions.set(transaction.reference, transaction);

  const dbOnline = await isDatabaseConnected();
  if (dbOnline) {
    try {
      await prisma.paymentTransaction.upsert({
        where: { reference: transaction.reference },
        update: {
          status: transaction.status,
          paystackPayload: transaction.paystackPayload
            ? JSON.stringify(transaction.paystackPayload)
            : undefined,
          paidAt: new Date(transaction.paidAt),
        },
        create: {
          id: transaction.id,
          reference: transaction.reference,
          orderId: transaction.orderId,
          customerProfileId: transaction.customerProfileId,
          amount: transaction.amount,
          currency: transaction.currency,
          channel: transaction.channel,
          status: transaction.status,
          paystackPayload: transaction.paystackPayload
            ? JSON.stringify(transaction.paystackPayload)
            : undefined,
          paidAt: new Date(transaction.paidAt),
          createdAt: new Date(transaction.createdAt),
        },
      });
    } catch {
      // Fallback to memory
    }
  }

  return transaction;
}

/**
 * Update transaction status via Paystack webhook or verify callback
 */
export async function updateTransactionStatus(
  reference: string,
  status: PaymentStatus,
  paystackPayload?: Record<string, unknown>
): Promise<StoredTransaction | null> {
  const existing = memoryTransactions.get(reference);
  if (existing) {
    existing.status = status;
    if (paystackPayload) {
      existing.paystackPayload = paystackPayload;
    }
    if (status === "PAID") {
      existing.paidAt = new Date().toISOString();
    }
    memoryTransactions.set(reference, existing);
  }

  const dbOnline = await isDatabaseConnected();
  if (dbOnline) {
    try {
      await prisma.paymentTransaction.updateMany({
        where: { reference },
        data: {
          status,
          paystackPayload: paystackPayload ? JSON.stringify(paystackPayload) : undefined,
          paidAt: status === "PAID" ? new Date() : undefined,
        },
      });
    } catch {
      // Fallback
    }
  }

  return existing || null;
}

/**
 * Find transaction by reference
 */
export async function getTransactionByReference(
  reference: string
): Promise<StoredTransaction | null> {
  const dbOnline = await isDatabaseConnected();
  if (dbOnline) {
    try {
      const tx = await prisma.paymentTransaction.findUnique({
        where: { reference },
        include: {
          order: true,
          customerProfile: { include: { user: true } },
        },
      });
      if (tx) {
        return {
          id: tx.id,
          reference: tx.reference,
          orderId: tx.orderId || undefined,
          orderNumber: tx.order?.orderNumber || undefined,
          customerProfileId: tx.customerProfileId,
          customerName: tx.customerProfile.user.name,
          customerPhone: tx.customerProfile.user.phone,
          amount: tx.amount,
          currency: tx.currency,
          channel: (tx.channel as PaymentChannel) || "MTN_MOMO",
          type: tx.orderId ? "WATER_ORDER" : "DISPENSER_INSTALLMENT",
          status: tx.status as PaymentStatus,
          paystackPayload: tx.paystackPayload ? JSON.parse(tx.paystackPayload) : undefined,
          paidAt: tx.paidAt.toISOString(),
          createdAt: tx.createdAt.toISOString(),
        };
      }
    } catch {
      // Fallback
    }
  }

  return memoryTransactions.get(reference) || null;
}

/**
 * Get all transactions with optional filters (for Admin and Manager)
 */
export async function getAllTransactions(filter?: {
  channel?: string;
  type?: string;
  status?: string;
  search?: string;
}): Promise<StoredTransaction[]> {
  const dbOnline = await isDatabaseConnected();
  if (dbOnline) {
    try {
      const transactions = await prisma.paymentTransaction.findMany({
        include: {
          order: true,
          customerProfile: { include: { user: true } },
        },
        orderBy: { createdAt: "desc" },
      });

      if (transactions && transactions.length > 0) {
        let mapped: StoredTransaction[] = transactions.map((tx: any) => ({
          id: tx.id,
          reference: tx.reference,
          orderId: tx.orderId || undefined,
          orderNumber: tx.order?.orderNumber || undefined,
          customerProfileId: tx.customerProfileId,
          customerName: tx.customerProfile.user.name,
          customerPhone: tx.customerProfile.user.phone,
          amount: tx.amount,
          currency: tx.currency,
          channel: (tx.channel as PaymentChannel) || "MTN_MOMO",
          type: (tx.orderId ? "WATER_ORDER" : "DISPENSER_INSTALLMENT") as TransactionType,
          status: tx.status as PaymentStatus,
          paystackPayload: tx.paystackPayload ? JSON.parse(tx.paystackPayload) : undefined,
          paidAt: tx.paidAt.toISOString(),
          createdAt: tx.createdAt.toISOString(),
        }));

        if (filter?.channel && filter.channel !== "ALL") {
          mapped = mapped.filter((t: StoredTransaction) => t.channel === filter.channel);
        }
        if (filter?.type && filter.type !== "ALL") {
          mapped = mapped.filter((t: StoredTransaction) => t.type === filter.type);
        }
        if (filter?.status && filter.status !== "ALL") {
          mapped = mapped.filter((t: StoredTransaction) => t.status === filter.status);
        }
        if (filter?.search) {
          const q = filter.search.toLowerCase();
          mapped = mapped.filter(
            (t: StoredTransaction) =>
              t.reference.toLowerCase().includes(q) ||
              t.customerName.toLowerCase().includes(q) ||
              t.customerPhone.includes(q) ||
              (t.orderNumber && t.orderNumber.toLowerCase().includes(q))
          );
        }
        return mapped;
      }
    } catch {
      // Fallback
    }
  }

  let list = Array.from(memoryTransactions.values()).sort(
    (a, b) => new Date(b.paidAt).getTime() - new Date(a.paidAt).getTime()
  );

  if (filter?.channel && filter.channel !== "ALL") {
    list = list.filter((t) => t.channel === filter.channel);
  }
  if (filter?.type && filter.type !== "ALL") {
    list = list.filter((t) => t.type === filter.type);
  }
  if (filter?.status && filter.status !== "ALL") {
    list = list.filter((t) => t.status === filter.status);
  }
  if (filter?.search) {
    const q = filter.search.toLowerCase();
    list = list.filter(
      (t) =>
        t.reference.toLowerCase().includes(q) ||
        t.customerName.toLowerCase().includes(q) ||
        t.customerPhone.includes(q) ||
        (t.orderNumber && t.orderNumber.toLowerCase().includes(q))
    );
  }

  return list;
}

/**
 * Calculate financial totals and KPI metrics
 */
export async function getTransactionMetrics() {
  const list = await getAllTransactions();
  const successful = list.filter((t) => t.status === "PAID");

  const totalRevenue = successful.reduce((sum, t) => sum + t.amount, 0);

  const momoRevenue = successful
    .filter((t) => ["MTN_MOMO", "TELECEL_CASH", "AT_MONEY"].includes(t.channel))
    .reduce((sum, t) => sum + t.amount, 0);

  const cardRevenue = successful
    .filter((t) => t.channel === "CARD")
    .reduce((sum, t) => sum + t.amount, 0);

  const todayStr = new Date().toISOString().split("T")[0];
  const todayRevenue = successful
    .filter((t) => t.paidAt.startsWith(todayStr))
    .reduce((sum, t) => sum + t.amount, 0);

  return {
    totalRevenue,
    momoRevenue,
    cardRevenue,
    todayRevenue,
    totalTransactions: list.length,
    successfulCount: successful.length,
  };
}
