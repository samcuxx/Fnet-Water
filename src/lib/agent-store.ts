import { prisma } from "@/lib/prisma";
import {
  findUserByIdentifier,
  isDatabaseConnected,
  registerNewUser,
  getUserById,
} from "@/lib/auth-store";
import {
  createCustomerAddress,
  getCustomerAddresses,
  updateCustomerProfileData,
} from "@/lib/customer-store";
import { createCustomerOrder, type StoredOrder } from "@/lib/order-store";
import { getAgentStats, recordReferralSignup } from "@/lib/referral-store";
import { normalizeGhanaPhone } from "@/lib/mnotify";

export const OPERATIONAL_ZONES = [
  "All Zones",
  "East Legon & Adjiringanor",
  "Spintex Road & Sakumono",
  "Osu, Cantonments & Ridge",
  "Airport Residential & Dzorwulu",
  "Tema & Ashaiman",
] as const;

export type OperationalZone = (typeof OPERATIONAL_ZONES)[number];

export interface StoredZoneCustomer {
  id: string;
  userId: string;
  agentId: string;
  customerName: string;
  customerCode: string;
  phone: string;
  email: string;
  zone: string;
  deliveryArea: string;
  digitalAddress: string;
  bottlesHeld: number;
  dispenserStatus: "Smart Rent-to-Own" | "Customer Owned" | "None (Refill Only)";
  status: "ACTIVE" | "NEEDS_REFILL" | "PENDING";
  refillsCount: number;
  lastOrderDate: string;
  createdAt: string;
}

const DEFAULT_ZONE_CUSTOMERS: StoredZoneCustomer[] = [
  {
    id: "zc_001",
    userId: "usr_customer_001",
    agentId: "usr_agent_001",
    customerName: "Ama Osei",
    customerCode: "CUST-2041",
    phone: "0241000005",
    email: "customer@fnetwater.com",
    zone: "East Legon & Adjiringanor",
    deliveryArea: "House 14, Boundary Road",
    digitalAddress: "GA-492-1029",
    bottlesHeld: 4,
    dispenserStatus: "Smart Rent-to-Own",
    status: "ACTIVE",
    refillsCount: 16,
    lastOrderDate: "Today",
    createdAt: "2026-02-20T12:00:00.000Z",
  },
  {
    id: "zc_002",
    userId: "usr_customer_002",
    agentId: "usr_agent_001",
    customerName: "Kwabena Appiah",
    customerCode: "CUST-4119",
    phone: "0241000008",
    email: "kwabena@example.com",
    zone: "Osu, Cantonments & Ridge",
    deliveryArea: "Embassy Gardens, Cantonments",
    digitalAddress: "GA-041-8821",
    bottlesHeld: 2,
    dispenserStatus: "Customer Owned",
    status: "NEEDS_REFILL",
    refillsCount: 24,
    lastOrderDate: "2 days ago",
    createdAt: "2026-02-25T15:10:00.000Z",
  },
  {
    id: "zc_003",
    userId: "usr_customer_003",
    agentId: "usr_agent_001",
    customerName: "Nana Yeboah",
    customerCode: "CUST-6892",
    phone: "0241000009",
    email: "nana@example.com",
    zone: "Airport Residential & Dzorwulu",
    deliveryArea: "Villaggio Vista, Airport",
    digitalAddress: "GA-183-9021",
    bottlesHeld: 5,
    dispenserStatus: "Smart Rent-to-Own",
    status: "ACTIVE",
    refillsCount: 38,
    lastOrderDate: "Yesterday",
    createdAt: "2026-03-01T09:00:00.000Z",
  },
  {
    id: "zc_004",
    userId: "usr_customer_004",
    agentId: "usr_agent_001",
    customerName: "Grace Darko",
    customerCode: "CUST-1033",
    phone: "0241000010",
    email: "grace@example.com",
    zone: "Spintex Road & Sakumono",
    deliveryArea: "Near Shell Station, Spintex",
    digitalAddress: "GZ-192-8819",
    bottlesHeld: 3,
    dispenserStatus: "None (Refill Only)",
    status: "ACTIVE",
    refillsCount: 12,
    lastOrderDate: "Nov 8, 2026",
    createdAt: "2026-03-05T13:40:00.000Z",
  },
  {
    id: "zc_005",
    userId: "usr_customer_005",
    agentId: "usr_agent_001",
    customerName: "Samuel Annan",
    customerCode: "CUST-5510",
    phone: "0241000011",
    email: "samuel@example.com",
    zone: "Tema & Ashaiman",
    deliveryArea: "Community 25 Estate, Tema",
    digitalAddress: "GT-220-4410",
    bottlesHeld: 1,
    dispenserStatus: "Smart Rent-to-Own",
    status: "NEEDS_REFILL",
    refillsCount: 9,
    lastOrderDate: "Nov 5, 2026",
    createdAt: "2026-03-10T17:20:00.000Z",
  },
  {
    id: "zc_006",
    userId: "usr_customer_006",
    agentId: "usr_agent_001",
    customerName: "Abena Serwaa",
    customerCode: "CUST-7721",
    phone: "0242111002",
    email: "abena.serwaa@example.com",
    zone: "East Legon & Adjiringanor",
    deliveryArea: "Adjiringanor Road, Near Galaxy",
    digitalAddress: "GA-514-3310",
    bottlesHeld: 4,
    dispenserStatus: "Smart Rent-to-Own",
    status: "ACTIVE",
    refillsCount: 29,
    lastOrderDate: "Today",
    createdAt: "2026-03-12T10:15:00.000Z",
  },
  {
    id: "zc_007",
    userId: "usr_customer_007",
    agentId: "usr_agent_001",
    customerName: "Samuel Quaye",
    customerCode: "CUST-9012",
    phone: "0242111007",
    email: "samuel.quaye@example.com",
    zone: "Osu, Cantonments & Ridge",
    deliveryArea: "Ringway Estate, Osu",
    digitalAddress: "GA-074-9902",
    bottlesHeld: 2,
    dispenserStatus: "None (Refill Only)",
    status: "PENDING",
    refillsCount: 3,
    lastOrderDate: "Pending First Order",
    createdAt: "2026-03-15T14:30:00.000Z",
  },
];

const globalForAgent = globalThis as unknown as {
  memoryZoneCustomers?: Map<string, StoredZoneCustomer>;
};

const memoryZoneCustomers: Map<string, StoredZoneCustomer> = (() => {
  if (globalForAgent.memoryZoneCustomers) {
    for (const zc of DEFAULT_ZONE_CUSTOMERS) {
      if (!globalForAgent.memoryZoneCustomers.has(zc.id)) {
        globalForAgent.memoryZoneCustomers.set(zc.id, { ...zc });
      }
    }
    return globalForAgent.memoryZoneCustomers;
  }
  const map = new Map<string, StoredZoneCustomer>(
    DEFAULT_ZONE_CUSTOMERS.map((z) => [z.id, { ...z }])
  );
  if (process.env.NODE_ENV !== "production") {
    globalForAgent.memoryZoneCustomers = map;
  }
  return map;
})();

/**
 * Retrieve zone customers managed by an agent with optional zone & search filtering
 */
export async function getAgentZoneCustomers(
  agentId: string,
  filters?: { zone?: string; search?: string }
): Promise<StoredZoneCustomer[]> {
  let list = Array.from(memoryZoneCustomers.values()).filter(
    (c) => c.agentId === agentId || agentId === "usr_agent_001"
  );

  // Merge any DB-persisted onboarded customers if DB online
  if (await isDatabaseConnected()) {
    try {
      const dbProfiles = await prisma.customerProfile.findMany({
        where: { onboardedByAgentId: agentId },
        include: {
          user: true,
          deliveryAddresses: { take: 1, orderBy: { isDefault: "desc" } },
          orders: true,
          dispenserPlans: { take: 1 },
        },
        orderBy: { createdAt: "desc" },
      });

      const knownUserIds = new Set(list.map((c) => c.userId));
      for (const p of dbProfiles) {
        if (!knownUserIds.has(p.userId)) {
          list.unshift({
            id: `zc_${p.id}`,
            userId: p.userId,
            agentId,
            customerName: p.user.name,
            customerCode: p.customerCode,
            phone: p.user.phone,
            email: p.user.email,
            zone: p.zone || "East Legon & Adjiringanor",
            deliveryArea: p.deliveryAddresses[0]?.areaName || "Greater Accra",
            digitalAddress: p.deliveryAddresses[0]?.digitalAddress || "GA-492-1029",
            bottlesHeld: p.bottlesHeld,
            dispenserStatus: p.dispenserPlans[0]
              ? p.dispenserPlans[0].isFullyPaid
                ? "Customer Owned"
                : "Smart Rent-to-Own"
              : "None (Refill Only)",
            status: p.orders.length > 0 ? "ACTIVE" : "PENDING",
            refillsCount: p.orders.length,
            lastOrderDate: p.orders[0]
              ? p.orders[0].createdAt.toISOString().split("T")[0]
              : "Just Registered",
            createdAt: p.createdAt.toISOString(),
          });
        }
      }
    } catch {
      // Fallback to memory list
    }
  }

  if (filters?.zone && filters.zone !== "All Zones") {
    list = list.filter((c) => c.zone.toLowerCase() === filters.zone!.toLowerCase());
  }

  if (filters?.search && filters.search.trim()) {
    const q = filters.search.trim().toLowerCase();
    list = list.filter(
      (c) =>
        c.customerName.toLowerCase().includes(q) ||
        c.phone.toLowerCase().includes(q) ||
        c.customerCode.toLowerCase().includes(q) ||
        c.deliveryArea.toLowerCase().includes(q) ||
        c.zone.toLowerCase().includes(q)
    );
  }

  return list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

/**
 * Compute full Agent / Zone Supervisor dashboard payload
 */
export async function getAgentDashboardPayload(
  agentUserId: string,
  selectedZone = "All Zones",
  originUrl?: string
) {
  const [stats, allCustomers, agentUser] = await Promise.all([
    getAgentStats(agentUserId, originUrl),
    getAgentZoneCustomers(agentUserId),
    getUserById(agentUserId),
  ]);

  const filtered =
    selectedZone && selectedZone !== "All Zones"
      ? allCustomers.filter((c) => c.zone === selectedZone)
      : allCustomers;

  const zoneCustomerCount = filtered.length;
  const zoneTotalRefills = filtered.reduce((acc, c) => acc + c.refillsCount, 0);
  const zoneDispensersCount = filtered.filter(
    (c) => c.dispenserStatus === "Smart Rent-to-Own"
  ).length;
  const zoneCommissionGHS = zoneTotalRefills * 5.0;

  // Dynamic chart datasets computed directly from real zone customer records
  const shortLabels: Record<string, string> = {
    "East Legon & Adjiringanor": "East Legon",
    "Spintex Road & Sakumono": "Spintex",
    "Osu, Cantonments & Ridge": "Osu / Ridge",
    "Airport Residential & Dzorwulu": "Airport",
    "Tema & Ashaiman": "Tema",
  };

  const zoneBreakdown = OPERATIONAL_ZONES.filter((z) => z !== "All Zones").map((zoneName) => {
    const inZone = allCustomers.filter((c) => c.zone === zoneName);
    const refills = inZone.reduce((acc, c) => acc + c.refillsCount, 0);
    return {
      zone: zoneName,
      shortLabel: shortLabels[zoneName] || zoneName,
      customerCount: inZone.length,
      refillsCount: refills,
      commissionGHS: refills * 5.0,
    };
  });

  return {
    agent: {
      id: agentUserId,
      name: agentUser?.name || stats.agentName,
      phone: agentUser?.phone || "0241000004",
      email: agentUser?.email || "agent@fnetwater.com",
      agentCode: stats.agentCode,
      referralLink: stats.referralLink,
      commissionRatePerRefillGHS: 5.0,
    },
    selectedZone,
    operationalZones: [...OPERATIONAL_ZONES],
    metrics: {
      zoneCustomerCount,
      zoneTotalRefills,
      zoneDispensersCount,
      zoneCommissionGHS,
      totalOnboarded: Math.max(stats.totalOnboarded, allCustomers.length),
      activeCustomers: Math.max(
        stats.activeCustomers,
        allCustomers.filter((c) => c.status === "ACTIVE").length
      ),
      freeBottlesEarned: stats.freeBottlesEarned,
    },
    charts: {
      refillsByZone: zoneBreakdown.map((z) => ({
        label: z.shortLabel,
        zone: z.zone,
        value: z.refillsCount,
      })),
      distributionByZone: zoneBreakdown.map((z) => ({
        label: z.shortLabel,
        zone: z.zone,
        value: z.customerCount,
      })),
    },
    recentCustomers: filtered.slice(0, 10),
  };
}

/**
 * Field-onboard a new customer under an operational zone
 */
export async function onboardZoneCustomer(
  agentUserId: string,
  input: {
    name: string;
    phone: string;
    email: string;
    zone: string;
    deliveryArea: string;
    digitalAddress?: string;
    gpsLatitude?: number;
    gpsLongitude?: number;
    ghanaCardNumber?: string;
    dispenserStatus?: "Smart Rent-to-Own" | "Customer Owned" | "None (Refill Only)";
  }
): Promise<{ success: boolean; customer?: StoredZoneCustomer; temporaryPassword?: string; error?: string }> {
  const normalizedPhone = normalizeGhanaPhone(input.phone);
  const cleanEmail = input.email.trim().toLowerCase();

  const existingByEmail = await findUserByIdentifier(cleanEmail);
  if (existingByEmail) {
    return { success: false, error: "A customer with this email address already exists." };
  }
  const existingByPhone = await findUserByIdentifier(normalizedPhone);
  if (existingByPhone) {
    return { success: false, error: "A customer with this phone number already exists." };
  }

  const agentStats = await getAgentStats(agentUserId);
  const temporaryPassword = `Water${normalizedPhone.slice(-4)}!`;

  const newUser = await registerNewUser({
    name: input.name.trim(),
    email: cleanEmail,
    phone: normalizedPhone,
    password: temporaryPassword,
    role: "CUSTOMER",
    deliveryArea: `${input.zone} - ${input.deliveryArea.trim()}`,
    referralCode: agentStats.agentCode,
  });

  if (input.ghanaCardNumber) {
    await updateCustomerProfileData(newUser.id, {
      ghanaCardNumber: input.ghanaCardNumber.trim().toUpperCase(),
    });
  }

  // Persist zone & agent link in DB if online
  if (await isDatabaseConnected()) {
    try {
      await prisma.customerProfile.updateMany({
        where: { userId: newUser.id },
        data: {
          zone: input.zone,
          onboardedByAgentId: agentUserId,
        },
      });
    } catch {
      // Non-fatal
    }
  }

  const digitalCode = (input.digitalAddress || "GA-492-1029").trim().toUpperCase();
  await createCustomerAddress(newUser.id, {
    category: "HOME",
    areaName: input.deliveryArea.trim(),
    digitalAddress: digitalCode,
    gpsLatitude: input.gpsLatitude,
    gpsLongitude: input.gpsLongitude,
    isDefault: true,
  });

  await recordReferralSignup(newUser.id, newUser.name, newUser.phone, agentStats.agentCode);

  const zoneCustomer: StoredZoneCustomer = {
    id: `zc_${Date.now()}`,
    userId: newUser.id,
    agentId: agentUserId,
    customerName: newUser.name,
    customerCode: newUser.customerCode || `CUST-${Math.floor(1000 + Math.random() * 9000)}`,
    phone: newUser.phone,
    email: newUser.email,
    zone: input.zone,
    deliveryArea: input.deliveryArea.trim(),
    digitalAddress: digitalCode,
    bottlesHeld: 0,
    dispenserStatus: input.dispenserStatus || "None (Refill Only)",
    status: "ACTIVE",
    refillsCount: 0,
    lastOrderDate: "Just Registered",
    createdAt: new Date().toISOString(),
  };

  memoryZoneCustomers.set(zoneCustomer.id, zoneCustomer);

  return {
    success: true,
    customer: zoneCustomer,
    temporaryPassword,
  };
}

/**
 * Place a real refill order on behalf of a zone customer (persisted to order-store + dispatch-store)
 */
export async function createAgentQuickRefillOrder(
  agentUserId: string,
  input: {
    zoneCustomerId: string;
    quantity: number;
    hasEmptyBottleExchange?: boolean;
    deliverySlot?: "Morning (8am - 12pm)" | "Afternoon (12pm - 4pm)" | "Evening (4pm - 7pm)";
    deliveryInstructions?: string;
  }
): Promise<{ success: boolean; order?: StoredOrder; customer?: StoredZoneCustomer; error?: string }> {
  const customer =
    memoryZoneCustomers.get(input.zoneCustomerId) ||
    Array.from(memoryZoneCustomers.values()).find(
      (c) => c.userId === input.zoneCustomerId || c.customerCode === input.zoneCustomerId
    );

  if (!customer) {
    return { success: false, error: "Zone customer record not found." };
  }

  // Ensure customer has a delivery address ID
  let addresses = await getCustomerAddresses(customer.userId);
  let targetAddress = addresses.find((a) => a.isDefault) || addresses[0];

  if (!targetAddress) {
    targetAddress = await createCustomerAddress(customer.userId, {
      category: "HOME",
      areaName: customer.deliveryArea,
      digitalAddress: customer.digitalAddress || "GA-492-1029",
      isDefault: true,
    });
  }

  const order = await createCustomerOrder({
    userId: customer.userId,
    customerName: customer.customerName,
    customerPhone: customer.phone,
    deliveryAddressId: targetAddress.id,
    deliveryAddressText: `${customer.deliveryArea}, ${customer.zone}`,
    deliveryDigitalAddress: targetAddress.digitalAddress,
    deliverySlot: input.deliverySlot || "Morning (8am - 12pm)",
    deliveryDate: new Date().toISOString(),
    deliveryInstructions:
      input.deliveryInstructions || `Ordered via Zone Supervisor (${agentUserId})`,
    hasEmptyBottleExchange: input.hasEmptyBottleExchange ?? true,
    redeemFreeRefill: false,
    paymentMethod: "CASH_ON_DELIVERY",
    paymentStatus: "UNPAID",
    items: [{ productId: "prod_001", quantity: Math.max(1, input.quantity) }],
  });

  // Update zone customer stats in real time
  customer.refillsCount += Math.max(1, input.quantity);
  customer.lastOrderDate = "Today";
  customer.status = "ACTIVE";
  memoryZoneCustomers.set(customer.id, { ...customer });

  return {
    success: true,
    order,
    customer,
  };
}
