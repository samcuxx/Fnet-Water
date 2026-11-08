import { prisma } from "@/lib/prisma";
import { isDatabaseConnected } from "@/lib/auth-store";
import { getOrderById, updateOrderStatus, StoredOrder, OrderStatus } from "@/lib/order-store";
import { getCustomerProfile, updateCustomerProfileData } from "@/lib/customer-store";
import { syncDeliveryExchangeToInventory } from "@/lib/inventory-store";

export interface DriverProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  vanNumber: string;
  licensePlate: string;
  activeStopsCount: number;
  completedStopsCount: number;
  isAvailable: boolean;
}

export interface DeliveryStop {
  id: string;
  orderId: string;
  orderNumber: string;
  customerName: string;
  customerPhone: string;
  deliveryAddress: string;
  digitalAddress: string;
  deliverySlot: string;
  bottlesDelivering: number;
  expectedEmpty: number;
  hasEmptyBottleExchange: boolean;
  status: OrderStatus;
  driverId?: string;
  driverName?: string;
  vanNumber?: string;
  amount: number;
  paymentMethod: string;
  paymentStatus: string;
  deliveryInstructions?: string;
  assignedAt?: string;
  startedAt?: string;
  completedAt?: string;
  createdAt: string;
}

export interface BottleExchangeRecord {
  id: string;
  deliveryId: string;
  orderId: string;
  driverId: string;
  customerId: string;
  filledDelivered: number;
  emptyCollected: number;
  damagedCount: number;
  lostCount: number;
  cashCollected: number;
  customerNotes?: string;
  createdAt: string;
}

const DEFAULT_DRIVERS: DriverProfile[] = [
  {
    id: "usr_driver_001",
    name: "Kwame Asante",
    email: "driver@fnetwater.com",
    phone: "0241000003",
    vanNumber: "Van 01",
    licensePlate: "GT-4421-23",
    activeStopsCount: 2,
    completedStopsCount: 5,
    isAvailable: true,
  },
  {
    id: "usr_driver_002",
    name: "Kojo Mensah",
    email: "driver2@fnetwater.com",
    phone: "0208112233",
    vanNumber: "Van 02",
    licensePlate: "GN-8910-24",
    activeStopsCount: 1,
    completedStopsCount: 6,
    isAvailable: true,
  },
  {
    id: "usr_driver_003",
    name: "Yaw Boateng",
    email: "driver3@fnetwater.com",
    phone: "0559001122",
    vanNumber: "Van 03",
    licensePlate: "GE-3312-25",
    activeStopsCount: 0,
    completedStopsCount: 4,
    isAvailable: true,
  },
];

const DEFAULT_STOPS: DeliveryStop[] = [
  {
    id: "stop_001",
    orderId: "ord_001",
    orderNumber: "FNW-8821",
    customerName: "Ama Osei",
    customerPhone: "0241000005",
    deliveryAddress: "House 14, Boundary Road, East Legon",
    digitalAddress: "GA-492-1029",
    deliverySlot: "Morning (8am - 12pm)",
    bottlesDelivering: 4,
    expectedEmpty: 4,
    hasEmptyBottleExchange: true,
    status: "DELIVERED",
    driverId: "usr_driver_001",
    driverName: "Kwame Asante",
    vanNumber: "Van 01 (GT-4421-23)",
    amount: 100.0,
    paymentMethod: "MOBILE_MONEY",
    paymentStatus: "PAID",
    deliveryInstructions: "Call gate phone on arrival",
    assignedAt: new Date(Date.now() - 14400000).toISOString(),
    completedAt: new Date(Date.now() - 7200000).toISOString(),
    createdAt: new Date(Date.now() - 18000000).toISOString(),
  },
  {
    id: "stop_002",
    orderId: "ord_002",
    orderNumber: "FNW-8823",
    customerName: "Dr. Mensah Clinic",
    customerPhone: "0208112233",
    deliveryAddress: "Near Shell Station, Osu",
    digitalAddress: "GA-041-8821",
    deliverySlot: "Morning (8am - 12pm)",
    bottlesDelivering: 6,
    expectedEmpty: 6,
    hasEmptyBottleExchange: true,
    status: "OUT_FOR_DELIVERY",
    driverId: "usr_driver_001",
    driverName: "Kwame Asante",
    vanNumber: "Van 01 (GT-4421-23)",
    amount: 150.0,
    paymentMethod: "MOBILE_MONEY",
    paymentStatus: "PAID",
    deliveryInstructions: "Deliver to medical reception",
    assignedAt: new Date(Date.now() - 7200000).toISOString(),
    startedAt: new Date(Date.now() - 1800000).toISOString(),
    createdAt: new Date(Date.now() - 14400000).toISOString(),
  },
  {
    id: "stop_003",
    orderId: "ord_003",
    orderNumber: "FNW-8824",
    customerName: "Grace Osei",
    customerPhone: "0277998877",
    deliveryAddress: "Plot 8, Roman Ridge",
    digitalAddress: "GA-112-9904",
    deliverySlot: "Afternoon (12pm - 4pm)",
    bottlesDelivering: 2,
    expectedEmpty: 2,
    hasEmptyBottleExchange: true,
    status: "ASSIGNED",
    driverId: "usr_driver_001",
    driverName: "Kwame Asante",
    vanNumber: "Van 01 (GT-4421-23)",
    amount: 50.0,
    paymentMethod: "CASH_ON_DELIVERY",
    paymentStatus: "UNPAID",
    deliveryInstructions: "Ring top bell",
    assignedAt: new Date(Date.now() - 3600000).toISOString(),
    createdAt: new Date(Date.now() - 7200000).toISOString(),
  },
  {
    id: "stop_004",
    orderId: "ord_004",
    orderNumber: "FNW-8825",
    customerName: "Kwesi Appiah",
    customerPhone: "0244123456",
    deliveryAddress: "Floor 3, Silicon Accra Hub, Dzorwulu",
    digitalAddress: "GA-183-9021",
    deliverySlot: "Afternoon (12pm - 4pm)",
    bottlesDelivering: 5,
    expectedEmpty: 5,
    hasEmptyBottleExchange: true,
    status: "PENDING",
    amount: 125.0,
    paymentMethod: "MOBILE_MONEY",
    paymentStatus: "PAID",
    deliveryInstructions: "Leave with security desk",
    createdAt: new Date(Date.now() - 3600000).toISOString(),
  },
];

const globalForDispatch = globalThis as unknown as {
  memoryDrivers?: Map<string, DriverProfile>;
  memoryStops?: Map<string, DeliveryStop>;
  memoryExchanges?: Map<string, BottleExchangeRecord>;
};

const memoryDrivers: Map<string, DriverProfile> = (() => {
  if (globalForDispatch.memoryDrivers) return globalForDispatch.memoryDrivers;
  const map = new Map<string, DriverProfile>(DEFAULT_DRIVERS.map((d) => [d.id, { ...d }]));
  if (process.env.NODE_ENV !== "production") globalForDispatch.memoryDrivers = map;
  return map;
})();

const memoryStops: Map<string, DeliveryStop> = (() => {
  if (globalForDispatch.memoryStops) return globalForDispatch.memoryStops;
  const map = new Map<string, DeliveryStop>(DEFAULT_STOPS.map((s) => [s.orderId, { ...s }]));
  if (process.env.NODE_ENV !== "production") globalForDispatch.memoryStops = map;
  return map;
})();

const memoryExchanges: Map<string, BottleExchangeRecord> = (() => {
  if (globalForDispatch.memoryExchanges) return globalForDispatch.memoryExchanges;
  const map = new Map<string, BottleExchangeRecord>();
  if (process.env.NODE_ENV !== "production") globalForDispatch.memoryExchanges = map;
  return map;
})();

/**
 * Get active fleet drivers
 */
export async function getActiveDrivers(): Promise<DriverProfile[]> {
  const dbOnline = await isDatabaseConnected();
  if (dbOnline) {
    try {
      const drivers = await prisma.user.findMany({
        where: { role: "DRIVER", status: "ACTIVE" },
      });
      if (drivers.length > 0) {
        return drivers.map((d, idx) => ({
          id: d.id,
          name: d.name,
          email: d.email,
          phone: d.phone,
          vanNumber: `Van 0${idx + 1}`,
          licensePlate: `GT-${4420 + idx}-23`,
          activeStopsCount: Array.from(memoryStops.values()).filter(
            (s) => s.driverId === d.id && s.status !== "DELIVERED"
          ).length,
          completedStopsCount: Array.from(memoryStops.values()).filter(
            (s) => s.driverId === d.id && s.status === "DELIVERED"
          ).length,
          isAvailable: true,
        }));
      }
    } catch {
      // Memory fallback
    }
  }

  // Recalculate counts
  for (const driver of memoryDrivers.values()) {
    const stops = Array.from(memoryStops.values()).filter((s) => s.driverId === driver.id);
    driver.activeStopsCount = stops.filter((s) => s.status !== "DELIVERED").length;
    driver.completedStopsCount = stops.filter((s) => s.status === "DELIVERED").length;
  }

  return Array.from(memoryDrivers.values());
}

/**
 * Get all dispatch delivery orders
 */
export async function getAllDispatchStops(statusFilter?: string): Promise<DeliveryStop[]> {
  const stops = Array.from(memoryStops.values());
  const filtered = statusFilter && statusFilter !== "ALL"
    ? stops.filter((s) => s.status === statusFilter)
    : stops;

  return filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

/**
 * Assign an order to a driver
 */
export async function assignOrderToDriver(
  orderId: string,
  driverId: string,
  vanNumber?: string,
  notes?: string
): Promise<DeliveryStop | null> {
  const driver = memoryDrivers.get(driverId);
  const driverName = driver ? driver.name : "Kwame Asante";
  const driverVan = vanNumber || (driver ? `${driver.vanNumber} (${driver.licensePlate})` : "Van 01 (GT-4421-23)");

  // Update order in order-store
  await updateOrderStatus(orderId, "ASSIGNED", driverId, driverName);

  // Update in memory stops
  let stop = memoryStops.get(orderId);
  if (!stop) {
    const ord = await getOrderById(orderId);
    if (!ord) return null;
    stop = {
      id: `stop_${Date.now()}`,
      orderId: ord.id,
      orderNumber: ord.orderNumber,
      customerName: ord.customerName,
      customerPhone: ord.customerPhone,
      deliveryAddress: ord.deliveryAddressText,
      digitalAddress: ord.deliveryDigitalAddress,
      deliverySlot: ord.deliverySlot,
      bottlesDelivering: ord.items.reduce((acc, it) => acc + it.quantity, 0),
      expectedEmpty: ord.hasEmptyBottleExchange ? ord.items.reduce((acc, it) => acc + it.quantity, 0) : 0,
      hasEmptyBottleExchange: ord.hasEmptyBottleExchange,
      status: "ASSIGNED",
      driverId,
      driverName,
      vanNumber: driverVan,
      amount: ord.totalAmount,
      paymentMethod: ord.paymentMethod,
      paymentStatus: ord.paymentStatus,
      deliveryInstructions: notes || ord.deliveryInstructions,
      assignedAt: new Date().toISOString(),
      createdAt: ord.createdAt,
    };
  } else {
    stop.status = "ASSIGNED";
    stop.driverId = driverId;
    stop.driverName = driverName;
    stop.vanNumber = driverVan;
    stop.assignedAt = new Date().toISOString();
    if (notes) stop.deliveryInstructions = notes;
  }

  memoryStops.set(orderId, stop);

  // Prisma integration
  const dbOnline = await isDatabaseConnected();
  if (dbOnline) {
    try {
      await prisma.order.update({
        where: { id: orderId },
        data: { status: "ASSIGNED" },
      });
      await prisma.delivery.upsert({
        where: { orderId },
        create: {
          orderId,
          driverId,
          status: "ASSIGNED",
          assignedAt: new Date(),
          notes,
        },
        update: {
          driverId,
          status: "ASSIGNED",
          assignedAt: new Date(),
          notes,
        },
      });
    } catch {
      // Memory fallback
    }
  }

  return stop;
}

/**
 * Get assigned stops for a specific driver
 */
export async function getDriverStops(driverId: string): Promise<DeliveryStop[]> {
  const stops = Array.from(memoryStops.values()).filter(
    (s) => s.driverId === driverId || !s.driverId || driverId === "usr_driver_001"
  );
  return stops.sort((a, b) => {
    // Pending/Assigned first, Delivered last
    if (a.status === "DELIVERED" && b.status !== "DELIVERED") return 1;
    if (a.status !== "DELIVERED" && b.status === "DELIVERED") return -1;
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });
}

/**
 * Driver marks stop as OUT_FOR_DELIVERY (started route)
 */
export async function startDeliveryRoute(orderId: string): Promise<DeliveryStop | null> {
  await updateOrderStatus(orderId, "OUT_FOR_DELIVERY");
  const stop = memoryStops.get(orderId);
  if (stop) {
    stop.status = "OUT_FOR_DELIVERY";
    stop.startedAt = new Date().toISOString();
    memoryStops.set(orderId, stop);
  }

  const dbOnline = await isDatabaseConnected();
  if (dbOnline) {
    try {
      await prisma.order.update({
        where: { id: orderId },
        data: { status: "OUT_FOR_DELIVERY" },
      });
      await prisma.delivery.updateMany({
        where: { orderId },
        data: { status: "OUT_FOR_DELIVERY", startedAt: new Date() },
      });
    } catch {
      // Memory fallback
    }
  }

  return stop || null;
}

/**
 * Driver completes stop with Point-of-Delivery Bottle Exchange
 */
export async function completeStopBottleExchange(data: {
  orderId: string;
  driverId: string;
  filledDelivered: number;
  emptyCollected: number;
  damagedCount: number;
  cashCollected: number;
  customerNotes?: string;
}): Promise<{ stop: DeliveryStop; exchange: BottleExchangeRecord }> {
  // 1. Update Order status in order-store
  await updateOrderStatus(data.orderId, "DELIVERED");

  // 2. Update Stop
  let stop = memoryStops.get(data.orderId);
  if (!stop) {
    const ord = await getOrderById(data.orderId);
    stop = {
      id: `stop_${Date.now()}`,
      orderId: data.orderId,
      orderNumber: ord?.orderNumber || "FNW-8821",
      customerName: ord?.customerName || "Customer",
      customerPhone: ord?.customerPhone || "0241000005",
      deliveryAddress: ord?.deliveryAddressText || "East Legon",
      digitalAddress: ord?.deliveryDigitalAddress || "GA-492-1029",
      deliverySlot: ord?.deliverySlot || "Morning (8am - 12pm)",
      bottlesDelivering: data.filledDelivered,
      expectedEmpty: data.emptyCollected,
      hasEmptyBottleExchange: data.emptyCollected > 0,
      status: "DELIVERED",
      driverId: data.driverId,
      amount: ord?.totalAmount || 100.0,
      paymentMethod: ord?.paymentMethod || "MOBILE_MONEY",
      paymentStatus: "PAID",
      completedAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
    };
  } else {
    stop.status = "DELIVERED";
    stop.paymentStatus = "PAID";
    stop.completedAt = new Date().toISOString();
  }
  memoryStops.set(data.orderId, stop);

  // 3. Create Bottle Exchange Record
  const exchange: BottleExchangeRecord = {
    id: `bx_${Date.now()}`,
    deliveryId: stop.id,
    orderId: data.orderId,
    driverId: data.driverId,
    customerId: "usr_customer_001",
    filledDelivered: data.filledDelivered,
    emptyCollected: data.emptyCollected,
    damagedCount: data.damagedCount,
    lostCount: 0,
    cashCollected: data.cashCollected,
    customerNotes: data.customerNotes,
    createdAt: new Date().toISOString(),
  };
  memoryExchanges.set(exchange.id, exchange);

  // 4. Update Customer held bottles count
  try {
    const ord = await getOrderById(data.orderId);
    const userId = ord?.userId || "usr_customer_001";
    const profile = await getCustomerProfile(userId);
    const updatedHeld = Math.max(0, (profile.bottlesHeld || 0) + data.filledDelivered - data.emptyCollected);
    await updateCustomerProfileData(userId, { bottlesHeld: updatedHeld });
  } catch {
    // Non-fatal
  }

  // 4b. Sync Inventory (Warehouse filled decreases, empties returned increase, damaged logged)
  try {
    await syncDeliveryExchangeToInventory({
      filledDelivered: data.filledDelivered,
      emptyCollected: data.emptyCollected,
      damagedCount: data.damagedCount,
      orderNumber: stop.orderNumber,
    });
  } catch {
    // Non-fatal
  }

  // 5. Prisma DB Sync
  const dbOnline = await isDatabaseConnected();
  if (dbOnline) {
    try {
      await prisma.order.update({
        where: { id: data.orderId },
        data: { status: "DELIVERED", paymentStatus: "PAID" },
      });
      const delivery = await prisma.delivery.findUnique({
        where: { orderId: data.orderId },
      });
      if (delivery) {
        await prisma.delivery.update({
          where: { id: delivery.id },
          data: { status: "DELIVERED", completedAt: new Date() },
        });
        await prisma.bottleExchange.create({
          data: {
            deliveryId: delivery.id,
            driverId: data.driverId,
            customerId: "usr_customer_001",
            filledDelivered: data.filledDelivered,
            emptyCollected: data.emptyCollected,
            damagedCount: data.damagedCount,
            cashCollected: data.cashCollected,
            customerNotes: data.customerNotes,
          },
        });
      }
    } catch {
      // Memory fallback
    }
  }

  return { stop, exchange };
}

/**
 * Retrieve all point-of-delivery bottle exchange records
 */
export function getAllBottleExchanges(): BottleExchangeRecord[] {
  return Array.from(memoryExchanges.values()).sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}
