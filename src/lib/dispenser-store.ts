import { prisma } from "@/lib/prisma";
import { isDatabaseConnected, getUserById } from "@/lib/auth-store";
import { getCustomerProfile } from "@/lib/customer-store";
import { DispenserStatusType } from "@/lib/inventory-store";
import { createNotification } from "@/lib/notification-store";
import { sendTamperAlertSms } from "@/lib/mnotify";

export interface DispenserCatalogModel {
  id: string;
  name: string;
  tagline: string;
  totalCost: number; // in GH₵
  initialDeposit: number; // in GH₵
  monthlyDue: number; // in GH₵
  installmentsCount: number; // 10 months
  features: string[];
  specs: {
    coolingCapacity: string;
    heatingCapacity: string;
    tankType: string;
    dimensions: string;
  };
}

export interface StoredDispenserPlan {
  id: string;
  userId: string;
  customerProfileId: string;
  customerName: string;
  customerPhone: string;
  dispenserId: string;
  serialNumber: string;
  modelName: string;
  totalCost: number;
  initialDeposit: number;
  amountPaid: number;
  outstandingBalance: number;
  monthlyDue: number;
  installmentsPaidCount: number;
  totalInstallmentsCount: number;
  nextPaymentDate: string;
  isFullyPaid: boolean;
  ownershipTransferred: boolean;
  deliveryAddressText: string;
  installedDate: string;
  // IoT Telemetry
  waterLevelPercent: number;
  dailyUsageLiters: number;
  batteryPercent: number;
  isOnline: boolean;
  tamperAlert: boolean;
  locationName: string;
  lastPingAt: string;
}

export interface StoredDispenserPayment {
  id: string;
  planId: string;
  userId: string;
  amount: number;
  paymentMethod: "MOBILE_MONEY" | "CARD" | "BANK_TRANSFER";
  momoNetwork?: "MTN" | "TELECEL" | "AT";
  momoPhone?: string;
  referenceCode: string;
  paidAt: string;
}

export interface StoredDispenserFault {
  id: string;
  dispenserId: string;
  serialNumber: string;
  userId: string;
  customerName: string;
  customerPhone: string;
  issueType:
    | "COOLING_FAILURE"
    | "HEATING_FAILURE"
    | "LEAKAGE"
    | "PUMP_NOISE"
    | "SENSOR_ERROR"
    | "OTHER";
  description: string;
  urgency: "LOW" | "NORMAL" | "HIGH";
  status: "OPEN" | "IN_PROGRESS" | "RESOLVED";
  createdAt: string;
}

// Dispenser Catalog Data (Ghanaian Cedis)
export const DISPENSER_CATALOG: DispenserCatalogModel[] = [
  {
    id: "mod_aquamaster_pro",
    name: "Aquamaster Pro Hot/Cold",
    tagline: "Commercial grade floor-standing dispenser with UV-C auto-sanitization",
    totalCost: 1800.0,
    initialDeposit: 300.0,
    monthlyDue: 150.0,
    installmentsCount: 10,
    features: [
      "Dual taps for piping hot and chilled pure water",
      "Automatic UV-C sterilization cycle every 4 hours",
      "Built-in smart IoT sensor tracking remaining water level",
      "Child safety lock on hot faucet",
      "Energy-saving nocturnal sleep mode",
    ],
    specs: {
      coolingCapacity: "2.5 L/hr (4°C - 10°C)",
      heatingCapacity: "5.0 L/hr (85°C - 95°C)",
      tankType: "Food-grade SUS304 stainless steel",
      dimensions: "310 x 360 x 1040 mm",
    },
  },
  {
    id: "mod_hydropure_floor",
    name: "HydroPure Floor Standing",
    tagline: "Bottom-loading ergonomic dispenser with no heavy lifting required",
    totalCost: 1600.0,
    initialDeposit: 250.0,
    monthlyDue: 135.0,
    installmentsCount: 10,
    features: [
      "Bottom-load bottle cabinet for effortless replacement",
      "LED indicator alerts when bottle is empty",
      "High-efficiency quiet cooling compressor",
      "Heavy duty spill tray with drainage",
    ],
    specs: {
      coolingCapacity: "2.0 L/hr (5°C - 10°C)",
      heatingCapacity: "4.0 L/hr (85°C - 92°C)",
      tankType: "Stainless steel dual reservoir",
      dimensions: "310 x 340 x 1030 mm",
    },
  },
  {
    id: "mod_ecostream_tabletop",
    name: "EcoStream Tabletop",
    tagline: "Compact countertop hot/cold dispenser for kitchens and apartments",
    totalCost: 1200.0,
    initialDeposit: 200.0,
    monthlyDue: 100.0,
    installmentsCount: 10,
    features: [
      "Compact footprint fitting modern kitchen counters",
      "Rapid heating and cooling thermoelectric system",
      "Detachable drip tray for easy cleaning",
      "Compatible with all standard 18.9L bottles",
    ],
    specs: {
      coolingCapacity: "1.2 L/hr (8°C - 12°C)",
      heatingCapacity: "3.5 L/hr (85°C - 90°C)",
      tankType: "Anti-bacterial food-grade polymer",
      dimensions: "300 x 310 x 520 mm",
    },
  },
];

// Seeded Customer Dispenser Plan (for demo customer: Kwesi Appiah / usr_customer_001)
const initialPlans: StoredDispenserPlan[] = [
  {
    id: "plan_demo_001",
    userId: "usr_customer_001",
    customerProfileId: "prof_cust_001",
    customerName: "Kwesi Appiah",
    customerPhone: "0241000005",
    dispenserId: "dsp_003",
    serialNumber: "DSP-GH-0103",
    modelName: "Aquamaster Pro Hot/Cold",
    totalCost: 1800.0,
    initialDeposit: 300.0,
    amountPaid: 900.0,
    outstandingBalance: 900.0,
    monthlyDue: 150.0,
    installmentsPaidCount: 4, // Deposit (300) + 4 payments of 150 = 900
    totalInstallmentsCount: 10,
    nextPaymentDate: new Date(Date.now() + 604800000).toISOString(), // 7 days from now
    isFullyPaid: false,
    ownershipTransferred: false,
    deliveryAddressText: "Near East Legon Police Station, East Legon",
    installedDate: "2026-01-10",
    waterLevelPercent: 78,
    dailyUsageLiters: 14.5,
    batteryPercent: 96,
    isOnline: true,
    tamperAlert: false,
    locationName: "East Legon, Accra",
    lastPingAt: new Date().toISOString(),
  },
];

const initialPayments: StoredDispenserPayment[] = [
  {
    id: "dpay_001",
    planId: "plan_demo_001",
    userId: "usr_customer_001",
    amount: 300.0,
    paymentMethod: "MOBILE_MONEY",
    momoNetwork: "MTN",
    momoPhone: "0241000005",
    referenceCode: "DSP-PAY-8801",
    paidAt: "2026-01-10T10:00:00.000Z",
  },
  {
    id: "dpay_002",
    planId: "plan_demo_001",
    userId: "usr_customer_001",
    amount: 150.0,
    paymentMethod: "MOBILE_MONEY",
    momoNetwork: "MTN",
    momoPhone: "0241000005",
    referenceCode: "DSP-PAY-8802",
    paidAt: "2026-02-10T11:30:00.000Z",
  },
  {
    id: "dpay_003",
    planId: "plan_demo_001",
    userId: "usr_customer_001",
    amount: 150.0,
    paymentMethod: "MOBILE_MONEY",
    momoNetwork: "MTN",
    momoPhone: "0241000005",
    referenceCode: "DSP-PAY-8803",
    paidAt: "2026-03-10T09:15:00.000Z",
  },
  {
    id: "dpay_004",
    planId: "plan_demo_001",
    userId: "usr_customer_001",
    amount: 150.0,
    paymentMethod: "MOBILE_MONEY",
    momoNetwork: "MTN",
    momoPhone: "0241000005",
    referenceCode: "DSP-PAY-8804",
    paidAt: "2026-04-10T14:20:00.000Z",
  },
  {
    id: "dpay_005",
    planId: "plan_demo_001",
    userId: "usr_customer_001",
    amount: 150.0,
    paymentMethod: "MOBILE_MONEY",
    momoNetwork: "MTN",
    momoPhone: "0241000005",
    referenceCode: "DSP-PAY-8805",
    paidAt: "2026-05-10T08:45:00.000Z",
  },
];

const initialFaults: StoredDispenserFault[] = [
  {
    id: "flt_001",
    dispenserId: "dsp_007",
    serialNumber: "DSP-GH-0107",
    userId: "usr_customer_002",
    customerName: "Dr. Mensah Clinic",
    customerPhone: "0208112233",
    issueType: "COOLING_FAILURE",
    description: "Water is only dispensing at room temperature. Cooling compressor does not kick on.",
    urgency: "HIGH",
    status: "IN_PROGRESS",
    createdAt: new Date(Date.now() - 86400000).toISOString(),
  },
];

// In-Memory Maps
const memoryPlans = new Map<string, StoredDispenserPlan>(
  initialPlans.map((p) => [p.userId, p])
);
const memoryPayments = new Map<string, StoredDispenserPayment[]>();
memoryPayments.set("plan_demo_001", [...initialPayments]);

const memoryFaults = new Map<string, StoredDispenserFault>(
  initialFaults.map((f) => [f.id, f])
);

/**
 * Retrieve dispenser models catalog
 */
export function getDispenserCatalog(): DispenserCatalogModel[] {
  return DISPENSER_CATALOG;
}

/**
 * Retrieve active dispenser plan for a customer
 */
export async function getCustomerDispenserPlan(
  userId: string
): Promise<{
  plan: StoredDispenserPlan | null;
  payments: StoredDispenserPayment[];
  catalog: DispenserCatalogModel[];
}> {
  const plan = memoryPlans.get(userId);
  const planCopy = plan ? { ...plan } : null;
  const payments = plan ? [...(memoryPayments.get(plan.id) || [])] : [];
  return {
    plan: planCopy,
    payments,
    catalog: DISPENSER_CATALOG,
  };
}

/**
 * Apply for a new rent-to-own dispenser plan
 */
export async function applyForDispenserPlan(
  userId: string,
  data: {
    modelName: string;
    deliveryAddressText: string;
    paymentMethod: "MOBILE_MONEY" | "CARD";
    momoNetwork?: "MTN" | "TELECEL" | "AT";
    momoPhone?: string;
  }
): Promise<StoredDispenserPlan> {
  const existing = memoryPlans.get(userId);
  if (existing && !existing.isFullyPaid) {
    throw new Error("You already have an active dispenser rent-to-own plan.");
  }

  const model = DISPENSER_CATALOG.find(
    (m) => m.name.toLowerCase() === data.modelName.toLowerCase()
  ) || DISPENSER_CATALOG[0];

  const profile = await getCustomerProfile(userId);
  const user = await getUserById(userId);
  const serialNumber = `DSP-GH-${String(100 + memoryPlans.size + 1).padStart(4, "0")}`;
  const planId = `plan_${Date.now()}`;

  const newPlan: StoredDispenserPlan = {
    id: planId,
    userId,
    customerProfileId: profile.id,
    customerName: user?.name || "Customer",
    customerPhone: user?.phone || "0240000000",
    dispenserId: `dsp_${Date.now()}`,
    serialNumber,
    modelName: model.name,
    totalCost: model.totalCost,
    initialDeposit: model.initialDeposit,
    amountPaid: model.initialDeposit,
    outstandingBalance: model.totalCost - model.initialDeposit,
    monthlyDue: model.monthlyDue,
    installmentsPaidCount: 0,
    totalInstallmentsCount: model.installmentsCount,
    nextPaymentDate: new Date(Date.now() + 30 * 86400000).toISOString(),
    isFullyPaid: false,
    ownershipTransferred: false,
    deliveryAddressText: data.deliveryAddressText,
    installedDate: new Date().toISOString().split("T")[0],
    waterLevelPercent: 100,
    dailyUsageLiters: 12.0,
    batteryPercent: 100,
    isOnline: true,
    tamperAlert: false,
    locationName: data.deliveryAddressText,
    lastPingAt: new Date().toISOString(),
  };

  memoryPlans.set(userId, newPlan);

  // Record initial deposit payment
  const depositPayment: StoredDispenserPayment = {
    id: `dpay_${Date.now()}`,
    planId,
    userId,
    amount: model.initialDeposit,
    paymentMethod: data.paymentMethod,
    momoNetwork: data.momoNetwork || "MTN",
    momoPhone: data.momoPhone || user?.phone,
    referenceCode: `DSP-DEP-${Date.now().toString().slice(-4)}`,
    paidAt: new Date().toISOString(),
  };

  const userPayments = memoryPayments.get(planId) || [];
  userPayments.push(depositPayment);
  memoryPayments.set(planId, userPayments);

  return { ...newPlan };
}

/**
 * Make monthly installment payment on active plan
 */
export async function recordInstallmentPayment(
  userId: string,
  data: {
    amount: number;
    paymentMethod: "MOBILE_MONEY" | "CARD";
    momoNetwork?: "MTN" | "TELECEL" | "AT";
    momoPhone?: string;
    referenceCode?: string;
  }
): Promise<{
  plan: StoredDispenserPlan;
  payment: StoredDispenserPayment;
  ownershipCelebration: boolean;
}> {
  const plan = memoryPlans.get(userId);
  if (!plan) {
    throw new Error("No active dispenser plan found for this account.");
  }

  // Idempotency check: if this reference was already recorded, avoid double-charging
  const planPayments = memoryPayments.get(plan.id) || [];
  if (data.referenceCode) {
    const existingPayment = planPayments.find((p) => p.referenceCode === data.referenceCode);
    if (existingPayment) {
      return {
        plan,
        payment: existingPayment,
        ownershipCelebration: plan.isFullyPaid,
      };
    }
  }

  if (plan.isFullyPaid) {
    throw new Error("This dispenser has already been fully paid off. It is now 100% customer owned!");
  }
  if (data.amount <= 0) {
    throw new Error("Payment amount must be greater than GH₵ 0.00.");
  }

  const payAmount = Math.min(data.amount, plan.outstandingBalance);
  plan.amountPaid += payAmount;
  plan.outstandingBalance = Math.max(0, plan.totalCost - plan.amountPaid);
  plan.installmentsPaidCount += 1;

  let ownershipCelebration = false;
  if (plan.outstandingBalance === 0 || plan.amountPaid >= plan.totalCost) {
    plan.isFullyPaid = true;
    plan.ownershipTransferred = true;
    ownershipCelebration = true;
  } else {
    // Advance next payment date by 30 days
    plan.nextPaymentDate = new Date(
      new Date(plan.nextPaymentDate).getTime() + 30 * 86400000
    ).toISOString();
  }

  memoryPlans.set(userId, plan);

  // Record Payment
  const payment: StoredDispenserPayment = {
    id: `dpay_${Date.now()}`,
    planId: plan.id,
    userId,
    amount: payAmount,
    paymentMethod: data.paymentMethod,
    momoNetwork: data.momoNetwork || "MTN",
    momoPhone: data.momoPhone,
    referenceCode: data.referenceCode || `DSP-INST-${Date.now().toString().slice(-4)}`,
    paidAt: new Date().toISOString(),
  };

  planPayments.unshift(payment);
  memoryPayments.set(plan.id, planPayments);

  return {
    plan,
    payment,
    ownershipCelebration,
  };
}

/**
 * Report a dispenser issue or fault
 */
export async function reportDispenserFault(
  userId: string,
  data: {
    issueType: StoredDispenserFault["issueType"];
    description: string;
    urgency: "LOW" | "NORMAL" | "HIGH";
  }
): Promise<StoredDispenserFault> {
  const plan = memoryPlans.get(userId);
  const user = await getUserById(userId);

  if (!data.description || data.description.trim().length < 5) {
    throw new Error("Please provide a description of the issue (at least 5 characters).");
  }

  const fault: StoredDispenserFault = {
    id: `flt_${Date.now()}`,
    dispenserId: plan?.dispenserId || "dsp_unknown",
    serialNumber: plan?.serialNumber || "DSP-GH-0103",
    userId,
    customerName: user?.name || "Customer",
    customerPhone: user?.phone || "0240000000",
    issueType: data.issueType,
    description: data.description.trim(),
    urgency: data.urgency,
    status: "OPEN",
    createdAt: new Date().toISOString(),
  };

  memoryFaults.set(fault.id, fault);
  return fault;
}

/**
 * Retrieve all fault reports (for Manager)
 */
export function getDispenserFaults(): StoredDispenserFault[] {
  return Array.from(memoryFaults.values()).sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

/**
 * Retrieve all dispenser plans with telemetry (for Manager IoT fleet view)
 */
export function getAllDispensersWithTelemetry(): StoredDispenserPlan[] {
  return Array.from(memoryPlans.values());
}

/**
 * Simulator for IoT Telemetry triggers (Low Water, Tamper, Offline, Reset)
 */
export function simulateDispenserIoT(
  userId: string,
  event: "LOW_WATER" | "TAMPER" | "OFFLINE" | "RESET"
): StoredDispenserPlan {
  const plan = memoryPlans.get(userId);
  if (!plan) {
    throw new Error(`No dispenser plan found for user ${userId}`);
  }

  if (event === "LOW_WATER") {
    plan.waterLevelPercent = 12; // Below 15% threshold
    plan.lastPingAt = new Date().toISOString();

    createNotification({
      userId,
      role: "CUSTOMER",
      title: `Low Water Alert: Dispenser #${plan.serialNumber}`,
      message: `Your dispenser bottle has dropped to ${plan.waterLevelPercent}%. Reorder a replacement refill bottle to avoid running out.`,
      type: "DISPENSER",
      linkUrl: "/customer/dispenser",
      metadata: { serialNumber: plan.serialNumber, userId },
    }).catch(() => {});
  } else if (event === "TAMPER") {
    plan.tamperAlert = true;
    plan.lastPingAt = new Date().toISOString();

    createNotification({
      role: "ADMIN",
      title: `Tamper Alert: Dispenser #${plan.serialNumber}`,
      message: `Dispenser #${plan.serialNumber} at ${plan.deliveryAddressText} reported an irregular tilt or physical sensor movement.`,
      type: "DISPENSER",
      linkUrl: "/admin/dispensers",
      metadata: { serialNumber: plan.serialNumber, userId },
    }).catch(() => {});

    sendTamperAlertSms("0241000001", plan.serialNumber, plan.deliveryAddressText).catch(() => {});
  } else if (event === "OFFLINE") {
    plan.isOnline = false;
  } else if (event === "RESET") {
    plan.waterLevelPercent = 85;
    plan.tamperAlert = false;
    plan.isOnline = true;
    plan.batteryPercent = 95;
    plan.lastPingAt = new Date().toISOString();
  }

  memoryPlans.set(userId, plan);
  return plan;
}
