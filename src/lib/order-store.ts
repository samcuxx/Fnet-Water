import { prisma } from "@/lib/prisma";
import { isDatabaseConnected } from "@/lib/auth-store";
import { getProductById } from "@/lib/product-store";
import { getCustomerProfile, updateCustomerProfileData } from "@/lib/customer-store";

export type OrderStatus =
  | "PENDING"
  | "ASSIGNED"
  | "OUT_FOR_DELIVERY"
  | "DELIVERED"
  | "CANCELLED";

export type PaymentMethod =
  | "MOBILE_MONEY"
  | "CARD"
  | "CASH_ON_DELIVERY"
  | "BANK_TRANSFER";

export type PaymentStatus = "UNPAID" | "PAID" | "PARTIALLY_PAID" | "REFUNDED";

export interface StoredOrderItem {
  id: string;
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  depositPrice: number;
  totalPrice: number;
}

export interface StoredOrder {
  id: string;
  orderNumber: string; // e.g. FNW-2026-1042
  userId: string;
  customerName: string;
  customerPhone: string;
  deliveryAddressId: string;
  deliveryAddressText: string;
  deliveryDigitalAddress: string;
  deliverySlot: "Morning (8am - 12pm)" | "Afternoon (12pm - 4pm)" | "Evening (4pm - 7pm)";
  deliveryDate: string;
  deliveryInstructions?: string;
  hasEmptyBottleExchange: boolean;
  subtotal: number;
  depositFee: number;
  deliveryFee: number;
  discountAmount: number;
  totalAmount: number;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  paymentMethod: PaymentMethod;
  paymentReference?: string;
  freeBottlesRedeemed: number;
  assignedDriverId?: string;
  assignedDriverName?: string;
  items: StoredOrderItem[];
  createdAt: string;
  updatedAt: string;
}

const DEFAULT_SEED_ORDERS: StoredOrder[] = [
  {
    id: "ord_001",
    orderNumber: "FNW-8821",
    userId: "usr_customer_001",
    customerName: "Ama Osei",
    customerPhone: "0241000005",
    deliveryAddressId: "addr_001",
    deliveryAddressText: "House 14, Boundary Road, East Legon",
    deliveryDigitalAddress: "GA-492-1029",
    deliverySlot: "Morning (8am - 12pm)",
    deliveryDate: new Date().toISOString(),
    deliveryInstructions: "Call gate phone on arrival",
    hasEmptyBottleExchange: true,
    subtotal: 100.0,
    depositFee: 0.0,
    deliveryFee: 0.0,
    discountAmount: 0.0,
    totalAmount: 100.0,
    status: "DELIVERED",
    paymentStatus: "PAID",
    paymentMethod: "MOBILE_MONEY",
    paymentReference: "PAY-MM-8821",
    freeBottlesRedeemed: 0,
    assignedDriverId: "usr_driver_001",
    assignedDriverName: "Kwame Asante (Fleet Driver)",
    items: [
      {
        id: "item_001",
        productId: "prod_001",
        productName: "18.9L Pure Refill Bottle",
        quantity: 4,
        unitPrice: 25.0,
        depositPrice: 0.0,
        totalPrice: 100.0,
      },
    ],
    createdAt: new Date(Date.now() - 3600000 * 4).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 2).toISOString(),
  },
  {
    id: "ord_002",
    orderNumber: "FNW-8823",
    userId: "usr_customer_001",
    customerName: "Ama Osei",
    customerPhone: "0241000005",
    deliveryAddressId: "addr_001",
    deliveryAddressText: "House 14, Boundary Road, East Legon",
    deliveryDigitalAddress: "GA-492-1029",
    deliverySlot: "Afternoon (12pm - 4pm)",
    deliveryDate: new Date(Date.now() - 86400000).toISOString(),
    hasEmptyBottleExchange: true,
    subtotal: 50.0,
    depositFee: 0.0,
    deliveryFee: 10.0,
    discountAmount: 0.0,
    totalAmount: 60.0,
    status: "DELIVERED",
    paymentStatus: "PAID",
    paymentMethod: "MOBILE_MONEY",
    paymentReference: "PAY-MM-8823",
    freeBottlesRedeemed: 0,
    assignedDriverId: "usr_driver_001",
    assignedDriverName: "Kwame Asante (Fleet Driver)",
    items: [
      {
        id: "item_002",
        productId: "prod_001",
        productName: "18.9L Pure Refill Bottle",
        quantity: 2,
        unitPrice: 25.0,
        depositPrice: 0.0,
        totalPrice: 50.0,
      },
    ],
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 86400000).toISOString(),
  },
];

const globalForOrders = globalThis as unknown as {
  memoryOrders?: Map<string, StoredOrder>;
};

const memoryOrders: Map<string, StoredOrder> = (() => {
  if (globalForOrders.memoryOrders) {
    for (const ord of DEFAULT_SEED_ORDERS) {
      if (!globalForOrders.memoryOrders.has(ord.id)) {
        globalForOrders.memoryOrders.set(ord.id, { ...ord });
      }
    }
    return globalForOrders.memoryOrders;
  }
  const map = new Map<string, StoredOrder>(DEFAULT_SEED_ORDERS.map((o) => [o.id, { ...o }]));
  if (process.env.NODE_ENV !== "production") {
    globalForOrders.memoryOrders = map;
  }
  return map;
})();

/**
 * Calculate pricing details for order
 */
export async function calculateOrderPricing(
  items: Array<{ productId: string; quantity: number }>,
  hasEmptyBottleExchange: boolean,
  redeemFreeRefill: boolean,
  freeBottleBalance: number
): Promise<{
  subtotal: number;
  depositFee: number;
  deliveryFee: number;
  discountAmount: number;
  totalAmount: number;
  canRedeem: boolean;
  orderItems: StoredOrderItem[];
}> {
  let subtotal = 0;
  let depositFee = 0;
  let totalRefillBottles = 0;
  const orderItems: StoredOrderItem[] = [];

  for (const item of items) {
    if (item.quantity <= 0) continue;
    const prod = await getProductById(item.productId);
    if (!prod) continue;

    const lineSubtotal = prod.price * item.quantity;
    subtotal += lineSubtotal;

    let lineDeposit = 0;
    if (prod.type === "REFILLABLE_BOTTLE") {
      totalRefillBottles += item.quantity;
      if (!hasEmptyBottleExchange) {
        lineDeposit = prod.depositFee * item.quantity;
        depositFee += lineDeposit;
      }
    }

    orderItems.push({
      id: `item_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      productId: prod.id,
      productName: prod.name,
      quantity: item.quantity,
      unitPrice: prod.price,
      depositPrice: lineDeposit,
      totalPrice: lineSubtotal + lineDeposit,
    });
  }

  // Free delivery if subtotal >= GH₵ 100 or >= 3 refill bottles, else GH₵ 10.00 (0 for empty cart)
  const deliveryFee = subtotal === 0 || subtotal >= 100 || totalRefillBottles >= 3 ? 0.0 : 10.0;

  // Free refill discount
  let discountAmount = 0;
  const canRedeem = freeBottleBalance > 0 && totalRefillBottles > 0;
  if (redeemFreeRefill && canRedeem) {
    discountAmount = 25.0; // 1 free 19L refill discount
  }

  const totalAmount = Math.max(0, subtotal + depositFee + deliveryFee - discountAmount);

  return {
    subtotal,
    depositFee,
    deliveryFee,
    discountAmount,
    totalAmount,
    canRedeem,
    orderItems,
  };
}

/**
 * Creates a new customer order
 */
export async function createCustomerOrder(data: {
  userId: string;
  customerName: string;
  customerPhone: string;
  deliveryAddressId: string;
  deliveryAddressText: string;
  deliveryDigitalAddress: string;
  deliverySlot: "Morning (8am - 12pm)" | "Afternoon (12pm - 4pm)" | "Evening (4pm - 7pm)";
  deliveryDate: string;
  deliveryInstructions?: string;
  hasEmptyBottleExchange: boolean;
  redeemFreeRefill: boolean;
  paymentMethod: PaymentMethod;
  paymentStatus?: PaymentStatus;
  items: Array<{ productId: string; quantity: number }>;
}): Promise<StoredOrder> {
  const profile = await getCustomerProfile(data.userId);

  const pricing = await calculateOrderPricing(
    data.items,
    data.hasEmptyBottleExchange,
    data.redeemFreeRefill,
    profile.freeBottleBalance
  );

  const randNum = Math.floor(1000 + Math.random() * 9000);
  const orderNumber = `FNW-${new Date().getFullYear()}-${randNum}`;
  const orderId = `ord_${Date.now()}_${randNum}`;

  const freeBottlesRedeemed = pricing.discountAmount > 0 ? 1 : 0;

  const newOrder: StoredOrder = {
    id: orderId,
    orderNumber,
    userId: data.userId,
    customerName: data.customerName,
    customerPhone: data.customerPhone,
    deliveryAddressId: data.deliveryAddressId,
    deliveryAddressText: data.deliveryAddressText,
    deliveryDigitalAddress: data.deliveryDigitalAddress,
    deliverySlot: data.deliverySlot,
    deliveryDate: data.deliveryDate,
    deliveryInstructions: data.deliveryInstructions?.trim(),
    hasEmptyBottleExchange: data.hasEmptyBottleExchange,
    subtotal: pricing.subtotal,
    depositFee: pricing.depositFee,
    deliveryFee: pricing.deliveryFee,
    discountAmount: pricing.discountAmount,
    totalAmount: pricing.totalAmount,
    status: "PENDING",
    paymentStatus: data.paymentStatus || (data.paymentMethod === "CASH_ON_DELIVERY" ? "UNPAID" : "PAID"),
    paymentMethod: data.paymentMethod,
    paymentReference: `PAY-${data.paymentMethod.slice(0, 4)}-${randNum}`,
    freeBottlesRedeemed,
    items: pricing.orderItems,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  // If free bottle was redeemed, decrement balance
  if (freeBottlesRedeemed > 0) {
    await updateCustomerProfileData(data.userId, {
      freeBottleBalance: Math.max(0, profile.freeBottleBalance - 1),
    });
  }

  // Update customer's held bottles count if 19L refills ordered
  const refillQty = data.items.reduce((acc, it) => {
    return it.productId === "prod_001" ? acc + it.quantity : acc;
  }, 0);

  if (refillQty > 0 && !data.hasEmptyBottleExchange) {
    // New bottles purchased
    await updateCustomerProfileData(data.userId, {
      bottlesHeld: (profile.bottlesHeld || 0) + refillQty,
    });
  }

  const dbOnline = await isDatabaseConnected();
  if (dbOnline) {
    try {
      // Prisma order creation
      const dbProfile = await prisma.customerProfile.findUnique({
        where: { userId: data.userId },
      });
      if (dbProfile) {
        const created = await prisma.order.create({
          data: {
            orderNumber,
            customerProfileId: dbProfile.id,
            deliveryAddressId: data.deliveryAddressId,
            deliveryDate: new Date(data.deliveryDate),
            deliverySlot: data.deliverySlot,
            deliveryInstructions: data.deliveryInstructions,
            subtotal: pricing.subtotal,
            depositFee: pricing.depositFee,
            deliveryFee: pricing.deliveryFee,
            discountAmount: pricing.discountAmount,
            totalAmount: pricing.totalAmount,
            status: "PENDING",
            paymentStatus: data.paymentStatus || (data.paymentMethod === "CASH_ON_DELIVERY" ? "UNPAID" : "PAID"),
            paymentMethod: data.paymentMethod === "MOBILE_MONEY" ? "PAYSTACK_MOMO" : data.paymentMethod === "CARD" ? "PAYSTACK_CARD" : "CASH_ON_DELIVERY",
            freeBottlesRedeemed,
            items: {
              create: pricing.orderItems.map((oi) => ({
                productId: oi.productId,
                quantity: oi.quantity,
                unitPrice: oi.unitPrice,
                depositPrice: oi.depositPrice,
                totalPrice: oi.totalPrice,
              })),
            },
          },
        });
        newOrder.id = created.id;
      }
    } catch {
      // Memory fallback active
    }
  }

  memoryOrders.set(newOrder.id, newOrder);
  return newOrder;
}

/**
 * Get customer orders list
 */
export async function getCustomerOrders(userId: string): Promise<StoredOrder[]> {
  const dbOnline = await isDatabaseConnected();
  if (dbOnline) {
    try {
      const dbProfile = await prisma.customerProfile.findUnique({
        where: { userId },
      });
      if (dbProfile) {
        const orders = await prisma.order.findMany({
          where: { customerProfileId: dbProfile.id },
          include: {
            items: { include: { product: true } },
            deliveryAddress: true,
            delivery: { include: { driver: true } },
          },
          orderBy: { createdAt: "desc" },
        });

        if (orders.length > 0) {
          return orders.map((o) => ({
            id: o.id,
            orderNumber: o.orderNumber,
            userId,
            customerName: "Customer",
            customerPhone: "",
            deliveryAddressId: o.deliveryAddressId,
            deliveryAddressText: o.deliveryAddress?.areaName || "East Legon",
            deliveryDigitalAddress: o.deliveryAddress?.digitalAddress || "GA-492-1029",
            deliverySlot: (o.deliverySlot as StoredOrder["deliverySlot"]) || "Morning (8am - 12pm)",
            deliveryDate: o.deliveryDate ? o.deliveryDate.toISOString() : o.createdAt.toISOString(),
            deliveryInstructions: o.deliveryInstructions || undefined,
            hasEmptyBottleExchange: o.depositFee === 0,
            subtotal: o.subtotal,
            depositFee: o.depositFee,
            deliveryFee: o.deliveryFee,
            discountAmount: o.discountAmount,
            totalAmount: o.totalAmount,
            status: o.status as OrderStatus,
            paymentStatus: o.paymentStatus as PaymentStatus,
            paymentMethod: (o.paymentMethod === "PAYSTACK_MOMO" ? "MOBILE_MONEY" : o.paymentMethod === "PAYSTACK_CARD" ? "CARD" : "CASH_ON_DELIVERY") as PaymentMethod,
            paymentReference: o.paymentReference || undefined,
            freeBottlesRedeemed: o.freeBottlesRedeemed,
            assignedDriverId: o.delivery?.driverId || undefined,
            assignedDriverName: o.delivery?.driver?.name || undefined,
            items: o.items.map((it) => ({
              id: it.id,
              productId: it.productId,
              productName: it.product?.name || "Pure Water Refill",
              quantity: it.quantity,
              unitPrice: it.unitPrice,
              depositPrice: it.depositPrice,
              totalPrice: it.totalPrice,
            })),
            createdAt: o.createdAt.toISOString(),
            updatedAt: o.updatedAt.toISOString(),
          }));
        }
      }
    } catch {
      // Fallback
    }
  }

  const list = Array.from(memoryOrders.values()).filter((o) => o.userId === userId);
  return list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

/**
 * Get all orders across the entire platform (for Admin and Manager)
 */
export async function getAllOrders(): Promise<StoredOrder[]> {
  const dbOnline = await isDatabaseConnected();
  if (dbOnline) {
    try {
      const orders = await prisma.order.findMany({
        include: {
          items: { include: { product: true } },
          customerProfile: { include: { user: true } },
          deliveryAddress: true,
          delivery: { include: { driver: true } },
        },
        orderBy: { createdAt: "desc" },
      });
      if (orders && orders.length > 0) {
        return orders.map((o) => ({
          id: o.id,
          orderNumber: o.orderNumber,
          userId: o.customerProfile.userId,
          customerName: o.customerProfile.user.name,
          customerPhone: o.customerProfile.user.phone,
          deliveryAddressId: o.deliveryAddressId,
          deliveryAddressText: o.deliveryAddress.areaName,
          deliveryDigitalAddress: o.deliveryAddress.digitalAddress,
          deliveryDate: o.deliveryDate?.toISOString() || new Date().toISOString(),
          deliverySlot: (o.deliverySlot as StoredOrder["deliverySlot"]) || "Morning (8am - 12pm)",
          deliveryInstructions: o.deliveryInstructions || undefined,
          items: o.items.map((it) => ({
            id: it.id,
            productId: it.productId,
            productName: it.product.name,
            quantity: it.quantity,
            unitPrice: it.unitPrice,
            depositPrice: it.depositPrice,
            totalPrice: it.totalPrice,
          })),
          hasEmptyBottleExchange: o.depositFee === 0,
          subtotal: o.subtotal,
          depositFee: o.depositFee,
          deliveryFee: o.deliveryFee,
          discountAmount: o.discountAmount,
          totalAmount: o.totalAmount,
          status: o.status as OrderStatus,
          paymentStatus: o.paymentStatus as PaymentStatus,
          paymentMethod: (o.paymentMethod === "PAYSTACK_MOMO" ? "MOBILE_MONEY" : o.paymentMethod === "PAYSTACK_CARD" ? "CARD" : "CASH_ON_DELIVERY") as PaymentMethod,
          paymentReference: o.paymentReference || undefined,
          freeBottlesRedeemed: o.freeBottlesRedeemed,
          assignedDriverId: o.delivery?.driverId || undefined,
          assignedDriverName: o.delivery?.driver?.name || undefined,
          createdAt: o.createdAt.toISOString(),
          updatedAt: o.updatedAt.toISOString(),
        }));
      }
    } catch {
      // Fallback
    }
  }

  return Array.from(memoryOrders.values()).sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

/**
 * Get order by ID or orderNumber
 */
export async function getOrderById(idOrNumber: string): Promise<StoredOrder | null> {
  const dbOnline = await isDatabaseConnected();
  if (dbOnline) {
    try {
      const o = await prisma.order.findFirst({
        where: {
          OR: [{ id: idOrNumber }, { orderNumber: idOrNumber }],
        },
        include: {
          items: { include: { product: true } },
          deliveryAddress: true,
          delivery: { include: { driver: true } },
        },
      });

      if (o) {
        return {
          id: o.id,
          orderNumber: o.orderNumber,
          userId: o.customerProfileId,
          customerName: "Customer",
          customerPhone: "",
          deliveryAddressId: o.deliveryAddressId,
          deliveryAddressText: o.deliveryAddress?.areaName || "East Legon",
          deliveryDigitalAddress: o.deliveryAddress?.digitalAddress || "GA-492-1029",
          deliverySlot: (o.deliverySlot as StoredOrder["deliverySlot"]) || "Morning (8am - 12pm)",
          deliveryDate: o.deliveryDate ? o.deliveryDate.toISOString() : o.createdAt.toISOString(),
          deliveryInstructions: o.deliveryInstructions || undefined,
          hasEmptyBottleExchange: o.depositFee === 0,
          subtotal: o.subtotal,
          depositFee: o.depositFee,
          deliveryFee: o.deliveryFee,
          discountAmount: o.discountAmount,
          totalAmount: o.totalAmount,
          status: o.status as OrderStatus,
          paymentStatus: o.paymentStatus as PaymentStatus,
          paymentMethod: (o.paymentMethod === "PAYSTACK_MOMO" ? "MOBILE_MONEY" : o.paymentMethod === "PAYSTACK_CARD" ? "CARD" : "CASH_ON_DELIVERY") as PaymentMethod,
          paymentReference: o.paymentReference || undefined,
          freeBottlesRedeemed: o.freeBottlesRedeemed,
          assignedDriverId: o.delivery?.driverId || undefined,
          assignedDriverName: o.delivery?.driver?.name || undefined,
          items: o.items.map((it) => ({
            id: it.id,
            productId: it.productId,
            productName: it.product?.name || "Pure Water Refill",
            quantity: it.quantity,
            unitPrice: it.unitPrice,
            depositPrice: it.depositPrice,
            totalPrice: it.totalPrice,
          })),
          createdAt: o.createdAt.toISOString(),
          updatedAt: o.updatedAt.toISOString(),
        };
      }
    } catch {
      // Fallback
    }
  }

  for (const ord of memoryOrders.values()) {
    if (ord.id === idOrNumber || ord.orderNumber === idOrNumber) {
      return ord;
    }
  }

  return null;
}

/**
 * Updates an order's status (for dispatch/driver/admin workflows)
 */
export async function updateOrderStatus(
  orderId: string,
  status: OrderStatus,
  driverId?: string,
  driverName?: string
): Promise<StoredOrder | null> {
  const ord = await getOrderById(orderId);
  if (!ord) return null;

  ord.status = status;
  ord.updatedAt = new Date().toISOString();

  if (driverId) ord.assignedDriverId = driverId;
  if (driverName) ord.assignedDriverName = driverName;

  if (status === "DELIVERED") {
    ord.paymentStatus = "PAID";
  }

  memoryOrders.set(ord.id, { ...ord });
  return ord;
}

/**
 * Updates an order's payment status (e.g. from Paystack webhook)
 */
export async function updateOrderPaymentStatus(
  orderId: string,
  paymentStatus: PaymentStatus,
  paymentReference?: string
): Promise<StoredOrder | null> {
  const ord = await getOrderById(orderId);
  if (!ord) return null;

  ord.paymentStatus = paymentStatus;
  if (paymentReference) ord.paymentReference = paymentReference;
  ord.updatedAt = new Date().toISOString();

  const dbOnline = await isDatabaseConnected();
  if (dbOnline) {
    try {
      await prisma.order.update({
        where: { id: ord.id },
        data: {
          paymentStatus,
          paymentReference: paymentReference || undefined,
        },
      });
    } catch {
      // Fallback
    }
  }

  memoryOrders.set(ord.id, { ...ord });
  return ord;
}

/**
 * Get an order by its payment reference
 */
export async function getOrderByReference(reference: string): Promise<StoredOrder | null> {
  for (const ord of memoryOrders.values()) {
    if (ord.paymentReference === reference) return ord;
  }

  const dbOnline = await isDatabaseConnected();
  if (dbOnline) {
    try {
      const o = await prisma.order.findFirst({
        where: { paymentReference: reference },
        include: {
          items: { include: { product: true } },
          deliveryAddress: true,
          customerProfile: { include: { user: true } },
        },
      });
      if (o) {
        return {
          id: o.id,
          orderNumber: o.orderNumber,
          userId: o.customerProfile.userId,
          customerName: o.customerProfile.user.name,
          customerPhone: o.customerProfile.user.phone,
          deliveryAddressId: o.deliveryAddressId,
          deliveryAddressText: o.deliveryAddress?.areaName || "Delivery Location",
          deliveryDigitalAddress: o.deliveryAddress?.digitalAddress || "GA-000-0000",
          deliverySlot: o.deliverySlot as any,
          deliveryDate: o.deliveryDate ? o.deliveryDate.toISOString() : new Date().toISOString(),
          deliveryInstructions: o.deliveryInstructions || undefined,
          hasEmptyBottleExchange: true,
          subtotal: o.subtotal,
          depositFee: o.depositFee,
          deliveryFee: o.deliveryFee,
          discountAmount: o.discountAmount,
          totalAmount: o.totalAmount,
          status: o.status as any,
          paymentStatus: o.paymentStatus as any,
          paymentMethod: (o.paymentMethod === "PAYSTACK_MOMO" ? "MOBILE_MONEY" : o.paymentMethod === "PAYSTACK_CARD" ? "CARD" : "CASH_ON_DELIVERY") as PaymentMethod,
          paymentReference: o.paymentReference || undefined,
          freeBottlesRedeemed: o.freeBottlesRedeemed,
          items: o.items.map((i) => ({
            id: i.id,
            productId: i.productId,
            productName: i.product.name,
            quantity: i.quantity,
            unitPrice: i.unitPrice,
            depositPrice: i.depositPrice,
            totalPrice: i.totalPrice,
          })),
          createdAt: o.createdAt.toISOString(),
          updatedAt: o.updatedAt.toISOString(),
        };
      }
    } catch {
      // Fallback
    }
  }

  return null;
}
